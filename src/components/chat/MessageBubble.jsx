import { IconCheck, IconChecks, IconPaperclip } from '@tabler/icons-react';
import RateCard from '@/components/chat/RateCard';

function formatTime(value) {
  const date = value instanceof Date ? value : new Date(value ?? Date.now());
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function MessageBubble({ message, isMine }) {
  const bubbleClasses = isMine
    ? 'rounded-2xl rounded-br-md bg-[#00A651] text-white'
    : 'rounded-2xl rounded-bl-md border border-slate-200 bg-white text-slate-900';

  return (
    <div className={`mb-3 flex ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[88%] flex-col sm:max-w-[76%] ${isMine ? 'items-end' : 'items-start'}`}>
        {!isMine && message.senderName && (
          <span className="mb-1 px-1 text-[10px] font-medium text-slate-500">{message.senderName}</span>
        )}
        {message.rateCard ? (
          <div className={`w-full rounded-2xl p-2 shadow-sm ${bubbleClasses}`}>
            {message.text && <p className="px-2 pb-2 text-xs leading-5">{message.text}</p>}
            <RateCard rateCard={message.rateCard} compact />
          </div>
        ) : (
          <div className={`px-3 py-2.5 shadow-sm ${bubbleClasses}`}>
            {message.text && <p className="whitespace-pre-wrap text-sm leading-5">{message.text}</p>}
            {message.attachmentName && (
              <div className="mt-1 flex items-center gap-1 text-xs underline">
                <IconPaperclip className="icon-xs" aria-hidden="true" />
                {message.attachmentName}
              </div>
            )}
          </div>
        )}
        <div className="mt-1 flex items-center gap-1 px-1 text-[10px] text-slate-400">
          <span>{formatTime(message.createdAt ?? message.time)}</span>
          {isMine && (
            <span className="inline-flex" aria-label={message.seen ? 'Seen' : 'Sent'}>
              {message.seen
                ? <IconChecks className="icon-xs text-sky-500" aria-hidden="true" />
                : <IconCheck className="icon-xs" aria-hidden="true" />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
