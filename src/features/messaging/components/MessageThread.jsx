import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { IconCheck, IconDotsVertical, IconEdit, IconMessageCircle, IconPaperclip, IconSend, IconX } from '@tabler/icons-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useMessages } from '../hooks/useMessages';
import { formatRelativeDate } from '@/lib/utils';
import { connectSocket, socket } from '@/lib/socket';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/shared/EmptyState';
import { toast } from 'sonner';
import ErrorState from '@/components/shared/ErrorState';

const THREAD_CSS = `
  .message-thread { display: flex; flex-direction: column; gap: var(--space-12); }
  .message-thread--expanded { height: 100%; min-height: 0; }
  .message-thread-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-12);
    max-height: 320px;
    overflow-y: auto;
    padding-right: var(--space-4);
  }
  .message-thread--expanded .message-thread-list { flex: 1; max-height: none; min-height: 0; }
  .message-thread-row { display: flex; flex-direction: column; max-width: 78%; position: relative; }
  .message-thread-row.mine { align-self: flex-end; align-items: flex-end; }
  .message-thread-row.theirs { align-self: flex-start; align-items: flex-start; }
  .message-thread-bubble {
    position: relative;
    font-size: var(--text-body-sm-size);
    line-height: 1.55;
    padding: var(--space-12) var(--space-12);
    border-radius: var(--radius-lg);
    word-break: break-word;
  }
  .message-thread-row.mine .message-thread-bubble {
    background: var(--purple-600);
    color: var(--purple-foreground);
    border-radius: var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg);
  }
  .message-thread-row.theirs .message-thread-bubble {
    background: var(--page-bg);
    color: var(--black);
    border-radius: var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm);
  }
  .message-thread-meta { display: flex; align-items: center; gap: var(--space-4); margin-top: var(--space-4); }
  .message-thread-time, .message-thread-edited { font-size: var(--text-caption-size); color: var(--grey-400); }
  .message-thread-status { display: inline-flex; align-items: center; color: var(--grey-400); }
  .message-thread-status.seen { color: #34B7F1; }
  .message-thread-status-double { display: inline-flex; align-items: center; }
  .message-thread-status-double svg + svg { margin-left: calc(-1 * var(--space-4)); }
  .message-thread-actions { position: absolute; top: 0; right: calc(100% + var(--space-4)); z-index: 1; }
  .message-thread-actions-trigger { opacity: 0; transition: opacity var(--transition-fast); }
  .message-thread-row:hover .message-thread-actions-trigger,
  .message-thread-actions-trigger:focus-visible { opacity: 1; }
  .message-thread-edit-menu { position: absolute; right: 0; top: calc(100% + var(--space-4)); z-index: 2; min-width: 120px; padding: var(--space-4); background: var(--white); border: 0.5px solid var(--grey-200); border-radius: var(--radius-md); box-shadow: var(--shadow-md); }
  .message-thread-menu-item { display: flex; align-items: center; gap: var(--space-8); width: 100%; padding: var(--space-8) var(--space-12); color: var(--black); background: none; border: none; border-radius: var(--radius-sm); text-align: left; cursor: pointer; }
  .message-thread-menu-item:hover { background: var(--grey-50); }
  .message-thread-edit-form { display: flex; align-items: center; gap: var(--space-8); }
  .message-thread-edit-input { min-width: 0; flex: 1; color: inherit; background: transparent; border: 0; outline: none; }
  .message-thread-edit-action { display: inline-flex; padding: var(--space-4); color: inherit; background: transparent; border: 0; cursor: pointer; }
  @media (hover: none) { .message-thread-actions-trigger { opacity: 1; } }
  .message-thread-attachment {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    font-size: 11px;
    margin-top: var(--space-8);
    text-decoration: underline;
  }
  .message-thread-composer { display: flex; gap: var(--space-8); }
`;

function updateMessageStatus(cache, messageId, status) {
  const targetId = String(messageId);
  const updateMessages = (messages) => messages.map((message) =>
    message.id != null && String(message.id) === targetId ? { ...message, status } : message
  );

  if (Array.isArray(cache)) return updateMessages(cache);
  if (Array.isArray(cache?.messages)) return { ...cache, messages: updateMessages(cache.messages) };
  return cache;
}

/**
 * Real-time-ish chat thread (15s poll, per useMessages). One enquiry = one
 * thread for its whole lifecycle - threadId is the enquiry's own id.
 * @param {string|number} threadId
 */
export default function MessageThread({ threadId, expanded = false }) {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const { messages, isLoading, error, refetch, send, isSending, uploadAttachment, isUploading, editMessage, isEditing } =
    useMessages(threadId);

  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [menuMessageId, setMenuMessageId] = useState(null);
  const fileInputRef = useRef(null);
  const listRef = useRef(null);
  const handledIncomingIds = useRef(new Set());
  const handledSeenIds = useRef(new Set());
  const socketErrorShown = useRef(false);

  useEffect(() => {
    handledIncomingIds.current.clear();
    handledSeenIds.current.clear();
    setEditingId(null);
    setMenuMessageId(null);
  }, [threadId]);

  useEffect(() => {
    const handleStatusUpdated = (payload = {}) => {
      const messageId = payload.messageId ?? payload.id ?? payload.message?.id;
      const status = payload.status ?? payload.message?.status;
      if (messageId == null || !status) return;
      queryClient.setQueryData(['messages', threadId], (cache) =>
        updateMessageStatus(cache, messageId, status)
      );
    };
    const handleConnect = () => { socketErrorShown.current = false; };
    const handleConnectError = () => {
      if (socketErrorShown.current) return;
      socketErrorShown.current = true;
      toast.error('Real-time chat connection failed. Message updates may be delayed.');
    };

    socket.on('message-status-updated', handleStatusUpdated);
    socket.on('connect', handleConnect);
    socket.on('connect_error', handleConnectError);
    if (!connectSocket(token)) {
      socket.off('message-status-updated', handleStatusUpdated);
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleConnectError);
      return undefined;
    }

    return () => {
      socket.off('message-status-updated', handleStatusUpdated);
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleConnectError);
      socket.disconnect();
    };
  }, [queryClient, threadId, token]);

  useEffect(() => {
    const myId = user?.brandId ?? user?.id;
    messages.forEach((message) => {
      const isMine = myId != null && message.senderId != null
        ? message.senderId === myId
        : message.from === user?.role;
      if (isMine || message.id == null) return;

      const id = message.id;
      if (!handledIncomingIds.current.has(id)) {
        handledIncomingIds.current.add(id);
        socket.emit('message-delivered', id);
      }

      const isSeen = String(message.status ?? '').toLowerCase() === 'seen'
        || message.seenAt != null
        || message.seen_at != null;
      if (!isSeen && !handledSeenIds.current.has(id)) {
        handledSeenIds.current.add(id);
        socket.emit('message-seen', id);
      }
    });
  }, [messages, user?.brandId, user?.id, user?.role]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;
    send({ text: trimmed });
    setText('');
  };

  const handleAttach = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const { url: attachmentUrl } = await uploadAttachment(file);
      send({ text: text.trim() || undefined, attachmentUrl });
      setText('');
    } catch {
      // The upload mutation shows the error toast.
    }
  };

  return (
    <div className={`message-thread${expanded ? ' message-thread--expanded' : ''}`}>
      <style>{THREAD_CSS}</style>

      <div className="message-thread-list" ref={listRef}>
        {isLoading ? (
          <>
            <div className="message-thread-row theirs"><Skeleton width={160} height={36} style={{ borderRadius: 'var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)' }} /></div>
            <div className="message-thread-row mine"><Skeleton width={120} height={30} style={{ borderRadius: 'var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg)' }} /></div>
            <div className="message-thread-row theirs"><Skeleton width={190} height={44} style={{ borderRadius: 'var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)' }} /></div>
          </>
        ) : error && messages.length === 0 ? (
          <ErrorState
            size="sm"
            title="Couldn't load messages"
            description={error.message || 'The conversation could not be loaded. Try again.'}
            onRetry={refetch}
          />
        ) : messages.length === 0 ? (
          <EmptyState
            size="sm"
            icon={<IconMessageCircle />}
            title="No messages yet"
            description="Say hello to get the conversation started."
          />
        ) : (
          messages.map((m, i) => {
            // A brand teammate's messages are stored under the brand account, so a brand
            // compares against the brand it acts for (user.brandId), not its own login.
            const myId = user?.brandId ?? user?.id;
            const isMine = myId != null && m.senderId != null
              ? String(m.senderId) === String(myId)
              : m.from === user?.role;
            const status = String(m.status ?? '').toLowerCase();
            const isEditingMessage = editingId === m.id;

            return (
              <div key={m.id ?? i} className={`message-thread-row ${isMine ? 'mine' : 'theirs'}`}>
                {isMine && (
                  <div className="message-thread-actions">
                    <button
                      type="button"
                      className="btn btn-square btn-icon-style message-thread-actions-trigger"
                      title="Message options"
                      aria-label="Message options"
                      aria-expanded={menuMessageId === m.id}
                      onClick={() => setMenuMessageId((current) => current === m.id ? null : m.id)}
                    >
                      <IconDotsVertical className="icon-sm" aria-hidden="true" />
                    </button>
                    {menuMessageId === m.id && (
                      <div className="message-thread-edit-menu">
                        <button
                          type="button"
                          className="message-thread-menu-item"
                          onClick={() => {
                            setEditingId(m.id);
                            setEditText(m.text ?? '');
                            setMenuMessageId(null);
                          }}
                        >
                          <IconEdit className="icon-sm" aria-hidden="true" />Edit
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <div className="message-thread-bubble">
                  {isEditingMessage ? (
                    <form
                      className="message-thread-edit-form"
                      onSubmit={(event) => {
                        event.preventDefault();
                        const trimmed = editText.trim();
                        if (!trimmed || isEditing) return;
                        editMessage({ id: m.id, text: trimmed }, {
                          onSuccess: () => setEditingId(null),
                        });
                      }}
                    >
                      <input
                        className="message-thread-edit-input"
                        aria-label="Edit message"
                        value={editText}
                        onChange={(event) => setEditText(event.target.value)}
                        autoFocus
                      />
                      <button className="message-thread-edit-action" type="submit" aria-label="Save edited message" disabled={isEditing || !editText.trim()}>
                        <IconCheck className="icon-sm" aria-hidden="true" />
                      </button>
                      <button className="message-thread-edit-action" type="button" aria-label="Cancel editing" onClick={() => setEditingId(null)}>
                        <IconX className="icon-sm" aria-hidden="true" />
                      </button>
                    </form>
                  ) : m.text}
                  {m.attachmentUrl && (
                    <a
                      className="message-thread-attachment"
                      href={m.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'inherit' }}
                    >
                      <IconPaperclip className="icon-xs" /> Attachment
                    </a>
                  )}
                </div>
                <div className="message-thread-meta">
                  <span className="message-thread-time">{formatRelativeDate(m.createdAt ?? m.timestamp ?? m.sentAt)}</span>
                  {(m.is_edited || m.isEdited) && <span className="message-thread-edited">(edited)</span>}
                  {isMine && status && (
                    <span className={`message-thread-status${status === 'seen' ? ' seen' : ''}`} aria-label={`Message ${status}`}>
                      {status === 'sent' ? (
                        <IconCheck className="icon-xs" aria-hidden="true" />
                      ) : status === 'delivered' || status === 'seen' ? (
                        <span className="message-thread-status-double" aria-hidden="true">
                          <IconCheck className="icon-xs" />
                          <IconCheck className="icon-xs" />
                        </span>
                      ) : null}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="message-thread-composer">
        <input
          ref={fileInputRef}
          type="file"
          hidden
          onChange={handleAttach}
        />
        <button
          type="button"
          className="btn btn-square btn-icon-style"
          title="Attach file"
          aria-label="Attach file"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <IconPaperclip className="icon-sm" aria-hidden="true" />
        </button>
        <input
          className="input input-md"
          style={{ flex: 1 }}
          placeholder="Write a message…"
          aria-label="Message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          type="button"
          className="btn btn-square btn-icon-style"
          onClick={handleSend}
          disabled={isSending || !text.trim()}
          title="Send"
          aria-label="Send message"
        >
          <IconSend className="icon-sm" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
