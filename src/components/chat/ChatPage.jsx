import { useState, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useEnquiry } from '@/features/enquiry';
import { formatCurrency } from '@/lib/utils';
import { getInitials } from '@/lib/utils';
import { MessageThread } from '@/features/messaging';
import { IconChevronUp, IconChevronDown } from '@tabler/icons-react';

const PAGE_CSS = `
  .chat-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--page-bg);
  }
  .chat-page__topbar {
    position: sticky;
    top: 0;
    z-index: 10;
    background: var(--white);
    border-bottom: 0.5px solid var(--grey-100);
    padding: 0 var(--gutter-dashboard);
  }
  .chat-page__topbar-row {
    display: flex;
    align-items: center;
    gap: var(--space-8);
    height: var(--navbar-height);
  }
  .chat-page__back {
    display: none;
    margin-right: var(--space-4);
  }
  .chat-page__partner {
    display: flex;
    align-items: center;
    gap: var(--space-8);
    flex: 1;
    min-width: 0;
  }
  .chat-page__avatar {
    flex: 0 0 40px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    background: var(--purple-100);
    display: grid;
    place-items: center;
    color: var(--purple-800);
    font-weight: 600;
    font-size: var(--text-body-size);
    text-align: center;
  }
  .chat-page__avatar img { width: 100%; height: 100%; object-fit: cover; }
  .chat-page__partner-info { min-width: 0; }
  .chat-page__partner-name {
    margin: 0;
    font-size: var(--text-body-size);
    font-weight: 600;
    color: var(--black);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .chat-page__partner-meta {
    margin-top: 2px;
    font-size: var(--text-caption-size);
    color: var(--grey-500);
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }
  .chat-page__online-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--status-success);
    display: inline-block;
  }
  .chat-page__topbar-actions {
    display: flex;
    align-items: center;
    gap: var(--space-8);
  }
  .chat-page__rate-card-toggle {
    display: flex;
    align-items: center;
    gap: var(--space-8);
    padding: var(--space-8) var(--space-12);
    background: var(--purple-50);
    border: 0.5px solid var(--purple-200);
    border-radius: var(--radius-lg);
    color: var(--purple-800);
    font-size: var(--text-body-sm-size);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
    width: 100%;
    text-align: left;
  }
  .chat-page__rate-card-toggle:hover {
    background: var(--purple-100);
  }
  .chat-page__rate-card-toggle .rc-icon {
    flex: 0 0 36px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    overflow: hidden;
    background: var(--white);
    display: grid;
    place-items: center;
    color: var(--purple-700);
    font-weight: 700;
    font-size: var(--text-body-size);
    text-align: center;
    border: 0.5px solid var(--purple-200);
  }
  .chat-page__rate-card-toggle .rc-icon img { width: 100%; height: 100%; object-fit: cover; }
  .chat-page__rate-card-toggle .rc-body { min-width: 0; }
  .chat-page__rate-card-toggle .rc-service {
    font-size: var(--text-caption-size);
    color: var(--purple-600);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .chat-page__rate-card-toggle .rc-price {
    font-size: 15px;
    font-weight: 700;
    color: var(--purple-700);
  }
  .chat-page__rate-card-toggle .rc-toggle-icon {
    margin-left: auto;
    color: var(--purple-600);
  }
  .chat-page__rate-card-panel {
    border-bottom: 0.5px solid var(--grey-100);
    padding: var(--space-16) var(--gutter-dashboard) var(--space-12);
    background: var(--white);
  }
  .chat-page__rate-card-panel-inner {
    max-width: 560px;
    margin: 0 auto;
    background: var(--page-bg);
    border: 0.5px solid var(--grey-100);
    border-radius: var(--radius-xl);
    padding: var(--card-pad-md);
  }
  .chat-page__rate-card-panel-title {
    margin: 0 0 var(--space-2);
    font-size: var(--text-caption-size);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--grey-500);
  }
  .chat-page__rate-card-panel-service {
    margin: 0 0 var(--space-2);
    font-size: var(--text-h4-size);
    font-weight: 600;
    color: var(--black);
  }
  .chat-page__rate-card-panel-price {
    font-size: 24px;
    font-weight: 700;
    color: var(--purple-600);
    margin-bottom: var(--space-4);
  }
  .chat-page__rate-card-panel-desc {
    margin: 0;
    font-size: var(--text-body-sm-size);
    color: var(--grey-600);
    line-height: 1.6;
    white-space: pre-wrap;
  }
  .chat-page__thread-wrap {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  .chat-page__thread {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  @media (max-width: 860px) {
    .chat-page__back { display: inline-flex; }
    .chat-page__rate-card-toggle { width: auto; }
  }
`;

export default function ChatPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const stateRateCard = location.state?.rateCard;
  const stateCreator = location.state?.creator;
  const stateBrand = location.state?.brand;

  const { data: enquiry, isLoading: enquiryLoading, error: enquiryError } =
    useEnquiry(chatId);

  const partner = stateCreator ?? (enquiry?.creator ? {
    name: enquiry.creatorName ?? enquiry.creator?.name,
    avatar: enquiry.creator?.avatar ?? enquiry.creator?.initials,
    online: true,
  } : null);

  const [rateCardCollapsed, setRateCardCollapsed] = useState(true);

  const firstPackage = enquiry?.packages?.[0] ?? null;
  const rateCard = useMemo(
    () =>
      stateRateCard ?? (firstPackage ? {
        id: firstPackage.id,
        name: firstPackage.name,
        price: firstPackage.price,
        description: firstPackage.description,
      } : null),
    [stateRateCard, firstPackage]
  );

  const partnerName = partner?.name ?? 'Partner';

  // The rate-card message itself is posted by the backend when the chat is created
  // (POST /chats/from-ratecard), so the page never posts an intro message of its own.

  return (
    <div className="chat-page">
      <style>{PAGE_CSS}</style>

      <header className="chat-page__topbar">
        <div className="chat-page__topbar-row">
          <button
            type="button"
            className="btn btn-square btn-icon-style chat-page__back"
            onClick={() => navigate(-1)}
            aria-label="Back"
          >
            <IconChevronUp className="icon-md" style={{ transform: 'rotate(-180deg)' }} />
          </button>

          <div className="chat-page__partner">
            <div className="chat-page__avatar" title={partnerName}>
              {partner?.avatar ? (
                <img src={partner.avatar} alt={partnerName} />
              ) : (
                getInitials(partnerName)
              )}
            </div>
            <div className="chat-page__partner-info">
              <p className="chat-page__partner-name">{partnerName}</p>
              <div className="chat-page__partner-meta">
                <span className="chat-page__online-dot" aria-hidden="true" />
                <span>Online</span>
              </div>
            </div>
          </div>

          <div className="chat-page__topbar-actions">
            {rateCard && (
              <button
                type="button"
                className="chat-page__rate-card-toggle"
                onClick={() => setRateCardCollapsed((v) => !v)}
                aria-expanded={!rateCardCollapsed}
              >
                <div className="rc-icon">
                  {partner?.avatar ? (
                    <img src={partner.avatar} alt="" />
                  ) : (
                    getInitials(partnerName)
                  )}
                </div>
                <div className="rc-body">
                  <div className="rc-service">{rateCard.name}</div>
                  <div className="rc-price">
                    {rateCard.price ? formatCurrency(rateCard.price) : 'Custom'}
                  </div>
                </div>
                <span className="rc-toggle-icon">
                  {rateCardCollapsed ? (
                    <IconChevronDown className="icon-sm" />
                  ) : (
                    <IconChevronUp className="icon-sm" />
                  )}
                </span>
              </button>
            )}
          </div>
        </div>

        {rateCard && !rateCardCollapsed && (
          <div className="chat-page__rate-card-panel">
            <div className="chat-page__rate-card-panel-inner">
              <p className="chat-page__rate-card-panel-title">Rate card</p>
              <p className="chat-page__rate-card-panel-service">{rateCard.name}</p>
              <p className="chat-page__rate-card-panel-price">
                {rateCard.price ? formatCurrency(rateCard.price) : 'Custom pricing'}
              </p>
              {rateCard.description && (
                <p className="chat-page__rate-card-panel-desc">{rateCard.description}</p>
              )}
            </div>
          </div>
        )}
      </header>

      <div className="chat-page__thread-wrap">
        {enquiryLoading ? (
          <div className="chat-page__thread" style={{ padding: 'var(--space-24)' }}>
            <div className="skeleton" style={{ height: 36, borderRadius: 'var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)' }} />
            <div className="skeleton" style={{ height: 30, borderRadius: 'var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg)', marginTop: 12 }} />
            <div className="skeleton" style={{ height: 44, borderRadius: 'var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)', marginTop: 12 }} />
          </div>
        ) : enquiryError ? (
          <div style={{ padding: 'var(--space-24)', textAlign: 'center' }}>
            <p style={{ color: 'var(--grey-600)', fontSize: 'var(--text-body-sm-size)' }}>
              Couldn&apos;t load this conversation.
            </p>
          </div>
        ) : (
          <div className="chat-page__thread">
            <MessageThread
              threadId={chatId}
              clientId={stateBrand?.id ?? enquiry?.brandId ?? enquiry?.clientId}
              expanded
            />
          </div>
        )}
      </div>
    </div>
  );
}
