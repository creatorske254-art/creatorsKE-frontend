import { IconPhoto } from '@tabler/icons-react';
import { formatCurrency } from '@/lib/utils';

const RATE_CARD_CSS = `
  .chat-ratecard {
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
    background: var(--purple-50);
    border: 0.5px solid var(--purple-200);
    border-radius: var(--radius-xl);
    padding: var(--card-pad-md);
    max-width: 380px;
  }
  .chat-ratecard__eyebrow {
    font-size: var(--text-caption-size);
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--purple-600);
  }
  .chat-ratecard__title { margin: 0; font-size: var(--text-body-size); font-weight: 600; color: var(--black); }
  .chat-ratecard__price { font-size: 20px; font-weight: 700; color: var(--purple-700); font-variant-numeric: tabular-nums; }
  .chat-ratecard__desc { margin: 0; font-size: var(--text-body-sm-size); line-height: 1.6; color: var(--grey-600); white-space: pre-wrap; }
`;

/**
 * A `ratecard` chat message: the card the brand opened the chat from, auto-posted
 * as the first message by the backend.
 */
export default function RateCardMessage({ message }) {
  const card = message?.rateCard ?? message?.card ?? message?.invoice ?? message ?? {};
  const title = card.serviceTitle ?? card.title ?? card.name ?? card.packageName ?? 'Rate card';
  const price = Number(card.price ?? card.amount ?? 0) || 0;
  const description = card.serviceDescription ?? card.description ?? card.desc ?? '';

  return (
    <div className="chat-ratecard">
      <style>{RATE_CARD_CSS}</style>
      <div className="chat-ratecard__eyebrow">
        <IconPhoto className="icon-xs" aria-hidden="true" /> Rate card
      </div>
      <h4 className="chat-ratecard__title">{title}</h4>
      {price > 0 && <div className="chat-ratecard__price">{formatCurrency(price)}</div>}
      {description && <p className="chat-ratecard__desc">{description}</p>}
    </div>
  );
}
