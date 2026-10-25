import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { IconArrowLeft, IconMessageCircle, IconSearch } from '@tabler/icons-react';
import { MessageThread } from '@/features/messaging';
import { useEnquiries } from '@/features/enquiry';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatRelativeDate, getInitials } from '@/lib/utils';
import { usePageMeta } from '@/lib/usePageMeta';
import EmptyState from '@/components/shared/EmptyState';
import ErrorState from '@/components/shared/ErrorState';
import Skeleton from '@/components/ui/Skeleton';

const PAGE_CSS = `
  .messages-page { min-width: 0; }
  .messages-page__heading { margin-bottom: var(--space-20); }
  .messages-page__inbox {
    display: grid;
    grid-template-columns: minmax(260px, 340px) minmax(0, 1fr);
    min-height: 560px;
    height: min(720px, calc(100vh - 200px));
    overflow: hidden;
    background: var(--white);
    border: 0.5px solid var(--grey-100);
    border-radius: var(--radius-lg);
  }
  .messages-page__sidebar { display: flex; min-height: 0; flex-direction: column; border-right: 0.5px solid var(--grey-100); }
  .messages-page__sidebar-heading { display: flex; align-items: center; justify-content: space-between; padding: var(--space-20); border-bottom: 0.5px solid var(--grey-100); }
  .messages-page__list-title { margin: 0; font-size: var(--text-h4-size); line-height: var(--text-h4-lh); font-weight: 600; color: var(--black); }
  .messages-page__search { display: flex; align-items: center; gap: var(--space-8); margin: var(--space-12) var(--space-16); padding: var(--space-8) var(--space-12); color: var(--grey-500); background: var(--page-bg); border-radius: var(--radius-md); }
  .messages-page__search input { width: 100%; min-width: 0; padding: 0; color: var(--black); background: transparent; border: 0; outline: 0; font: inherit; }
  .messages-page__conversation-list { flex: 1; min-height: 0; overflow-y: auto; }
  .messages-page__conversation { display: flex; align-items: center; gap: var(--space-12); width: 100%; padding: var(--space-12) var(--space-16); color: var(--black); text-align: left; background: transparent; border: 0; cursor: pointer; }
  .messages-page__conversation:hover { background: var(--grey-50); }
  .messages-page__conversation.active { background: var(--purple-50); }
  .messages-page__avatar { display: grid; place-items: center; width: 44px; height: 44px; flex: 0 0 44px; overflow: hidden; color: var(--purple-700); background: var(--purple-100); border-radius: 50%; font-size: var(--text-body-size); font-weight: 600; }
  .messages-page__conversation-copy { min-width: 0; flex: 1; }
  .messages-page__conversation-top { display: flex; align-items: center; justify-content: space-between; gap: var(--space-8); }
  .messages-page__name { overflow: hidden; font-size: var(--text-body-size); font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
  .messages-page__time { flex-shrink: 0; color: var(--grey-400); font-size: var(--text-caption-size); }
  .messages-page__preview { overflow: hidden; margin-top: var(--space-4); color: var(--grey-500); font-size: var(--text-body-sm-size); text-overflow: ellipsis; white-space: nowrap; }
  .messages-page__conversation.active .messages-page__preview { color: var(--purple-700); }
  .messages-page__chat { display: flex; min-width: 0; min-height: 0; flex-direction: column; }
  .messages-page__chat-heading { display: flex; align-items: center; gap: var(--space-12); min-height: 72px; padding: var(--space-12) var(--space-20); border-bottom: 0.5px solid var(--grey-100); }
  .messages-page__chat-copy { min-width: 0; }
  .messages-page__chat-name { margin: 0; overflow: hidden; color: var(--black); font-size: var(--text-body-size); font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
  .messages-page__chat-subtitle { margin-top: var(--space-4); overflow: hidden; color: var(--grey-500); font-size: var(--text-caption-size); text-overflow: ellipsis; white-space: nowrap; }
  .messages-page__chat-body { min-height: 0; flex: 1; padding: var(--space-16) var(--space-20); }
  .messages-page__choose { display: grid; flex: 1; place-items: center; padding: var(--space-24); }
  .messages-page__back { display: none; }
  .messages-page__list-state { padding: var(--space-20); }
  @media (max-width: 760px) {
    .messages-page__inbox { display: block; height: calc(100vh - 190px); min-height: 440px; }
    .messages-page__sidebar, .messages-page__chat { height: 100%; }
    .messages-page__inbox:not(.has-thread) .messages-page__chat { display: none; }
    .messages-page__inbox.has-thread .messages-page__sidebar { display: none; }
    .messages-page__back { display: inline-flex; }
  }
`;

function getParticipant(enquiry, role) {
  const name = role === 'brand'
    ? enquiry.creator ?? enquiry.creatorName
    : enquiry.brand ?? enquiry.brandName;
  return name || 'Creatorske member';
}

function getPreview(enquiry) {
  const latest = enquiry.lastMessage ?? enquiry.latestMessage;
  if (typeof latest === 'string') return latest;
  if (latest && typeof latest === 'object' && typeof latest.text === 'string') return latest.text;
  return enquiry.message || 'Open conversation';
}

export default function MessagesPage() {
  usePageMeta('Messages', 'Chat with creators and brands on Creatorske.');
  const { role } = useAuth();
  const { enquiries, isLoading, error, refetch } = useEnquiries();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const selectedId = searchParams.get('thread');
  const selectedEnquiry = enquiries.find((enquiry) => String(enquiry.id) === selectedId) ?? null;

  const orderedEnquiries = useMemo(() => [...enquiries].sort((a, b) => {
    const aTime = Date.parse(a.lastMessageAt ?? a.updatedAt ?? a.createdAt ?? '') || 0;
    const bTime = Date.parse(b.lastMessageAt ?? b.updatedAt ?? b.createdAt ?? '') || 0;
    return bTime - aTime;
  }), [enquiries]);

  const filteredEnquiries = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return orderedEnquiries;
    return orderedEnquiries.filter((enquiry) =>
      `${getParticipant(enquiry, role)} ${enquiry.packageName ?? ''} ${getPreview(enquiry)}`
        .toLowerCase()
        .includes(normalizedSearch)
    );
  }, [orderedEnquiries, role, search]);

  const selectThread = (id) => setSearchParams({ thread: String(id) });
  const clearThread = () => setSearchParams({});
  const title = selectedEnquiry ? getParticipant(selectedEnquiry, role) : '';

  return (
    <div className="messages-page">
      <style>{PAGE_CSS}</style>
      <div className="messages-page__heading">
        <h1 className="page-title">Messages</h1>
        <p className="page-subtitle">Your conversations with creators and brands.</p>
      </div>

      <div className={`messages-page__inbox${selectedEnquiry ? ' has-thread' : ''}`}>
        <aside className="messages-page__sidebar" aria-label="Conversations">
          <div className="messages-page__sidebar-heading">
            <h2 className="messages-page__list-title">Inbox</h2>
            <span className="text-hint">{enquiries.length}</span>
          </div>
          <label className="messages-page__search">
            <IconSearch className="icon-sm" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search conversations"
              aria-label="Search conversations"
            />
          </label>
          <div className="messages-page__conversation-list">
            {isLoading ? (
              <div className="messages-page__list-state">
                {[0, 1, 2].map((item) => (
                  <div key={item} style={{ display: 'flex', gap: 'var(--space-12)', marginBottom: 'var(--space-16)' }}>
                    <Skeleton circle width={44} height={44} />
                    <div style={{ flex: 1, paddingTop: 'var(--space-4)' }}>
                      <Skeleton width="70%" height={12} />
                      <Skeleton width="90%" height={10} style={{ marginTop: 'var(--space-8)' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <ErrorState
                size="sm"
                title="Couldn't load conversations"
                description={error.message || 'Try loading your inbox again.'}
                onRetry={refetch}
              />
            ) : filteredEnquiries.length === 0 ? (
              <div className="messages-page__list-state">
                <EmptyState
                  size="sm"
                  icon={<IconMessageCircle />}
                  title={search ? 'No matches' : 'No conversations yet'}
                  description={search ? 'Try a different search.' : 'Conversations start when a brand sends or receives an enquiry.'}
                />
              </div>
            ) : filteredEnquiries.map((enquiry) => {
              const name = getParticipant(enquiry, role);
              const preview = getPreview(enquiry);
              const active = String(enquiry.id) === selectedId;

              return (
                <button
                  key={enquiry.id}
                  type="button"
                  className={`messages-page__conversation${active ? ' active' : ''}`}
                  aria-current={active ? 'true' : undefined}
                  onClick={() => selectThread(enquiry.id)}
                >
                  <span className="messages-page__avatar" aria-hidden="true">{getInitials(name)}</span>
                  <span className="messages-page__conversation-copy">
                    <span className="messages-page__conversation-top">
                      <span className="messages-page__name">{name}</span>
                      <span className="messages-page__time">{formatRelativeDate(enquiry.updatedAt ?? enquiry.createdAt)}</span>
                    </span>
                    <span className="messages-page__preview">{preview}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="messages-page__chat" aria-label={selectedEnquiry ? `Conversation with ${title}` : 'Chat'}>
          {selectedEnquiry ? (
            <>
              <header className="messages-page__chat-heading">
                <button
                  type="button"
                  className="btn btn-square btn-icon-style messages-page__back"
                  aria-label="Back to conversations"
                  onClick={clearThread}
                >
                  <IconArrowLeft className="icon-md" aria-hidden="true" />
                </button>
                <span className="messages-page__avatar" aria-hidden="true">{getInitials(title)}</span>
                <div className="messages-page__chat-copy">
                  <h2 className="messages-page__chat-name">{title}</h2>
                  <div className="messages-page__chat-subtitle">
                    {selectedEnquiry.packageName || 'Enquiry'} · {selectedEnquiry.status?.replaceAll('_', ' ') || 'Conversation'}
                  </div>
                </div>
              </header>
              <div className="messages-page__chat-body">
                <MessageThread threadId={selectedEnquiry.id} expanded />
              </div>
            </>
          ) : (
            <div className="messages-page__choose">
              <EmptyState
                icon={<IconMessageCircle />}
                title="Your messages"
                description="Choose a conversation to view messages and reply."
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
