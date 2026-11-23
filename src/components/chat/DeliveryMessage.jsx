import { IconPackageExport } from '@tabler/icons-react';

const DELIVERY_CSS = `
  .chat-delivery {
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
    background: var(--white);
    border: 0.5px solid var(--grey-100);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-sm);
    padding: var(--card-pad-sm);
    max-width: 380px;
  }
  .chat-delivery__eyebrow {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    font-size: var(--text-caption-size);
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--grey-500);
  }
  .chat-delivery__link {
    font-size: var(--text-body-sm-size);
    color: var(--purple-600);
    word-break: break-all;
  }
  .chat-delivery__link:hover { text-decoration: underline; }
  .chat-delivery__note { margin: 0; font-size: var(--text-body-sm-size); line-height: 1.6; color: var(--grey-600); white-space: pre-wrap; }
`;

/** A `delivery` chat message: the creator posted the work (link and optional note). */
export default function DeliveryMessage({ message }) {
  const link = message?.contentLink ?? message?.delivery?.contentLink ?? message?.deliveredContentLink ?? null;
  const note = message?.note ?? message?.delivery?.note ?? message?.text ?? '';

  return (
    <div className="chat-delivery">
      <style>{DELIVERY_CSS}</style>
      <div className="chat-delivery__eyebrow">
        <IconPackageExport className="icon-sm" aria-hidden="true" /> Work delivered
      </div>
      {link ? (
        <a className="chat-delivery__link" href={link} target="_blank" rel="noreferrer">
          {link}
        </a>
      ) : (
        <p className="chat-delivery__note">No link was attached to this delivery.</p>
      )}
      {note && <p className="chat-delivery__note">{note}</p>}
    </div>
  );
}
