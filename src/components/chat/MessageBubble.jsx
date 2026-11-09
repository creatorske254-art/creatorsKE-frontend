import { IconCheck, IconChecks } from '@tabler/icons-react';

export default function MessageBubble({ message, isMine, currentUserName }) {
  const bubbleClasses = isMine
    ? 'bg-[#00A651] text-white rounded-2xl rounded-br-md'
    : 'bg-white text-slate-900 rounded-2xl rounded-bl-md border border-slate-200';

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[80%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isMine && message.senderName && (
          <span className="mb-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
            {message.senderName}
          </span>
        )}

        <div className={`px-4 py-3 shadow-sm ${bubbleClasses}`}>
          {message.text && <p className="text-sm leading-6 whitespace-pre-wrap">{message.text}</p>}
          {message.invoice && (
            <div className="mt-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#00A651]">
                    Invoice
                  </p>
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-[#00A651]">
                    {message.invoice.status}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold">{message.invoice.title}</p>
                <p className="mt-1 text-xs text-slate-500">{message.invoice.service}</p>
                <p className="mt-3 text-lg font-bold text-slate-900">
                  KSh {Number(message.invoice.price).toLocaleString('en-KE')}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
          <span>{message.time}</span>
          {isMine && (
            <span className="inline-flex items-center" aria-label={message.seen ? 'Seen' : 'Sent'}>
              {message.seen ? <IconChecks size={12} className="text-sky-500" /> : <IconCheck size={12} />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
