import { useEffect, useRef, useState } from 'react';
import { IconPaperclip, IconSend } from '@tabler/icons-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useMessages } from '../hooks/useMessages';
import { formatRelativeDate } from '@/lib/utils';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/shared/EmptyState';

const THREAD_CSS = `
  .message-thread { display: flex; flex-direction: column; gap: var(--space-12); }
  .message-thread-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-12);
    max-height: 320px;
    overflow-y: auto;
    padding-right: var(--space-4);
  }
  .message-thread-row { display: flex; flex-direction: column; max-width: 78%; }
  .message-thread-row.mine { align-self: flex-end; align-items: flex-end; }
  .message-thread-row.theirs { align-self: flex-start; align-items: flex-start; }
  .message-thread-bubble {
    font-size: var(--text-body-sm-size);
    line-height: 1.55;
    padding: var(--space-10) var(--space-12);
    border-radius: var(--radius-lg);
    word-break: break-word;
  }
  .message-thread-row.mine .message-thread-bubble {
    background: var(--purple-600);
    color: var(--white);
    border-radius: var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg);
  }
  .message-thread-row.theirs .message-thread-bubble {
    background: var(--page-bg);
    color: var(--black);
    border-radius: var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm);
  }
  .message-thread-time { font-size: var(--text-caption-size); color: var(--grey-400); margin-top: var(--space-4); }
  .message-thread-attachment {
    display: flex;
    align-items: center;
    gap: var(--space-5);
    font-size: 11px;
    margin-top: var(--space-6);
    text-decoration: underline;
  }
  .message-thread-composer { display: flex; gap: var(--space-8); }
`;

/**
 * Real-time-ish chat thread (15s poll, per useMessages). One enquiry = one
 * thread for its whole lifecycle - threadId is the enquiry's own id.
 * @param {string|number} threadId
 */
export default function MessageThread({ threadId }) {
  const { user } = useAuth();
  const { messages, isLoading, send, isSending, uploadAttachment, isUploading } =
    useMessages(threadId);

  const [text, setText] = useState('');
  const fileInputRef = useRef(null);
  const listRef = useRef(null);

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
      const result = await uploadAttachment(file);
      // ASSUMPTION: response shape for the uploaded file's URL isn't documented.
      const attachmentUrl = result?.url ?? result?.data?.url;
      send({ text: text.trim() || undefined, attachmentUrl });
      setText('');
    } catch {
      // messageService/api.js already surfaces a toast via the interceptor's
      // normalized error - nothing further to do here.
    }
  };

  return (
    <div className="message-thread">
      <style>{THREAD_CSS}</style>

      <div className="message-thread-list" ref={listRef}>
        {isLoading ? (
          <>
            <div className="message-thread-row theirs"><Skeleton width={160} height={36} style={{ borderRadius: 'var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)' }} /></div>
            <div className="message-thread-row mine"><Skeleton width={120} height={30} style={{ borderRadius: 'var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg)' }} /></div>
            <div className="message-thread-row theirs"><Skeleton width={190} height={44} style={{ borderRadius: 'var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)' }} /></div>
          </>
        ) : messages.length === 0 ? (
          <EmptyState
            size="sm"
            icon={<i className="ti ti-message-circle" aria-hidden="true" />}
            title="No messages yet"
            description="Say hello to get the conversation started."
          />
        ) : (
          messages.map((m, i) => {
            // ASSUMPTION: message shape/field names aren't documented.
            const isMine = user?.id != null && m.senderId != null
              ? m.senderId === user.id
              : m.from === user?.role;

            return (
              <div key={m.id ?? i} className={`message-thread-row ${isMine ? 'mine' : 'theirs'}`}>
                <div className="message-thread-bubble">
                  {m.text}
                  {m.attachmentUrl && (
                    <a
                      className="message-thread-attachment"
                      href={m.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'inherit' }}
                    >
                      <IconPaperclip size={12} /> Attachment
                    </a>
                  )}
                </div>
                <div className="message-thread-time">
                  {formatRelativeDate(m.createdAt ?? m.timestamp ?? m.sentAt)}
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
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <IconPaperclip size={14} />
        </button>
        <input
          className="input input-md"
          style={{ flex: 1 }}
          placeholder="Write a message…"
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
        >
          <IconSend size={14} />
        </button>
      </div>
    </div>
  );
}
