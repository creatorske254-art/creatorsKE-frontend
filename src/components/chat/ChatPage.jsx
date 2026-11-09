import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { IconArrowLeft, IconPaperclip, IconSend } from '@tabler/icons-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import DisputeModal from '@/components/chat/DisputeModal';
import InvoiceCard from '@/components/chat/InvoiceCard';
import MessageBubble from '@/components/chat/MessageBubble';
import RateCard from '@/components/chat/RateCard';
import { mockInvoiceApi } from '@/components/chat/mockInvoiceApi';

const DEMO_CREATOR = {
  id: 'maya-k',
  name: 'Maya K.',
  handle: 'mayacreates',
  avatar: 'MK',
  online: true,
};

const DEMO_BRAND = {
  id: 'nia-brand',
  name: 'Nia K.',
  avatar: 'NK',
  online: true,
};

const DEMO_RATE_CARD = {
  creatorName: DEMO_CREATOR.name,
  selectedPackageId: 'tiktok-video',
  packages: [
    { id: 'tiktok-video', name: '1 TikTok Video', price: 5000, description: 'One short-form video' },
    { id: 'instagram-reel', name: '1 Reel', price: 8000, description: 'One Instagram Reel' },
    { id: 'event-appearance', name: 'Event Appearance', price: 15000, description: 'Up to 2 hours' },
  ],
};

const makeRateCardMessage = (rateCard, creator, chatId) => ({
  id: `rate-card-${chatId}`,
  senderId: creator.id,
  senderName: creator.name,
  text: 'Here is my rate card. Let me know what works for you.',
  rateCard,
  createdAt: Date.now(),
  seen: false,
});

function initials(name) {
  return String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || 'CK';
}

export default function ChatPage() {
  const { chatId = 'demo-chat' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role: signedInRole } = useAuth();
  const role = signedInRole === 'creator' ? 'creator' : 'brand';
  const routeState = location.state ?? {};
  const creator = useMemo(() => routeState.creator ?? DEMO_CREATOR, [routeState.creator]);
  const brand = useMemo(() => routeState.brand ?? {
    ...DEMO_BRAND,
    id: user?.brandId ?? user?.id ?? DEMO_BRAND.id,
    name: user?.companyName ?? user?.name ?? DEMO_BRAND.name,
    avatar: initials(user?.companyName ?? user?.name ?? DEMO_BRAND.name),
  }, [routeState.brand, user?.brandId, user?.companyName, user?.id, user?.name]);
  const otherUser = role === 'brand' ? creator : brand;
  const rateCard = useMemo(() => routeState.rateCard ?? DEMO_RATE_CARD, [routeState.rateCard]);
  const selectedPackage = rateCard.packages?.find(
    (item) => String(item.id) === String(rateCard.selectedPackageId)
  ) ?? rateCard.packages?.[0] ?? { name: 'Creator service', price: 5000 };

  const [rateCardCollapsed, setRateCardCollapsed] = useState(false);
  const [messages, setMessages] = useState(() => [makeRateCardMessage(rateCard, creator, chatId)]);
  const [invoice, setInvoice] = useState(null);
  const [draft, setDraft] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [expiredInvoiceId, setExpiredInvoiceId] = useState(null);
  const fileInputRef = useRef(null);
  const messageEndRef = useRef(null);

  useEffect(() => {
    setMessages([makeRateCardMessage(rateCard, creator, chatId)]);
    setInvoice(null);
    setExpiredInvoiceId(null);
    setDeliveryNote('');
    let active = true;

    mockInvoiceApi.getOrCreate(chatId, {
      service: selectedPackage.name,
      price: Number(selectedPackage.price) || 0,
    }).then((result) => {
      if (active) setInvoice(result);
    }).catch((error) => {
      if (active) toast.error(error?.message || 'Could not load the invoice.');
    });

    return () => { active = false; };
  }, [chatId, rateCard, creator, selectedPackage.name, selectedPackage.price]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, invoice]);

  const deadlineMs = invoice?.status === 'DELIVERED'
    ? new Date(invoice.deliveredAt).getTime() + 24 * 60 * 60 * 1000
    : null;
  const disputeAvailable = role === 'creator'
    && invoice?.status === 'DELIVERED'
    && (expiredInvoiceId === invoice.id || (deadlineMs && Date.now() >= deadlineMs));
  const currentUserId = role === 'creator'
    ? (user?.id ?? creator.id)
    : (user?.brandId ?? user?.id ?? brand.id);

  function appendMessage({ text, attachment }) {
    setMessages((current) => [...current, {
      id: `message-${Date.now()}`,
      senderId: user?.brandId ?? user?.id ?? (role === 'creator' ? creator.id : brand.id),
      senderName: user?.companyName ?? user?.name ?? (role === 'creator' ? creator.name : brand.name),
      text,
      attachmentName: attachment,
      createdAt: Date.now(),
      seen: false,
    }]);
  }

  function sendMessage(event) {
    event?.preventDefault();
    const text = draft.trim();
    if (!text && !attachmentName) return;
    appendMessage({ text, attachment: attachmentName || undefined });
    setDraft('');
    setAttachmentName('');
  }

  async function runInvoiceAction(action, successMessage) {
    setIsBusy(true);
    try {
      const updated = await action();
      setInvoice(updated);
      if (successMessage) toast.success(successMessage);
      return true;
    } catch (error) {
      toast.error(error?.message || 'That action could not be completed.');
      return false;
    } finally {
      setIsBusy(false);
    }
  }

  async function updatePrice(price, sendUpdatedPrice) {
    const saved = await runInvoiceAction(
      () => mockInvoiceApi.updatePrice(chatId, price),
      sendUpdatedPrice ? 'Updated price sent.' : 'Price saved.'
    );
    if (saved && sendUpdatedPrice) appendMessage({ text: `Updated price: KSh ${price.toLocaleString('en-KE')}` });
    return saved;
  }

  function markDelivered() {
    if (!deliveryNote.trim()) {
      toast.error('Add a link to the delivered content.');
      return;
    }
    try {
      const url = new URL(deliveryNote);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid URL');
    } catch {
      toast.error('Enter a valid http or https content link.');
      return;
    }
    runInvoiceAction(
      () => mockInvoiceApi.deliver(chatId, deliveryNote),
      'Delivery sent to the brand.'
    );
  }

  async function submitDispute(payload) {
    const submitted = await runInvoiceAction(
      () => mockInvoiceApi.dispute(chatId, payload),
      'Dispute submitted to Creators KE.'
    );
    if (submitted) appendMessage({ text: 'A dispute was raised. Creators KE is reviewing it.' });
    return submitted;
  }

  function chooseAttachment(event) {
    const file = event.target.files?.[0];
    if (file) setAttachmentName(file.name);
    event.target.value = '';
  }

  return (
    <div className="min-h-[100dvh] bg-[#F3F6F4] text-slate-900">
      <div className="mx-auto flex min-h-[100dvh] max-w-3xl flex-col bg-white shadow-sm sm:border-x sm:border-slate-200">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white px-3 py-3 sm:px-5">
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
            aria-label="Go back"
            onClick={() => navigate(-1)}
          >
            <IconArrowLeft className="icon-md" aria-hidden="true" />
          </button>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAF7EE] text-xs font-semibold text-[#008F45]">
            {otherUser.avatar || initials(otherUser.name)}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-semibold text-slate-900">{otherUser.name}</h1>
            <p className="flex items-center gap-1 text-[11px] text-slate-500">
              <span className="h-2 w-2 rounded-full bg-[#00A651]" aria-hidden="true" />
              {otherUser.online ? 'Online' : 'Usually replies soon'}
            </p>
          </div>
        </header>

        <div className="border-b border-slate-100 bg-white px-3 py-2 sm:px-5">
          <RateCard
            rateCard={{ ...rateCard, creatorName: rateCard.creatorName || creator.name }}
            collapsed={rateCardCollapsed}
            onToggle={() => setRateCardCollapsed((collapsed) => !collapsed)}
          />
        </div>

        <main className="flex min-h-0 flex-1 flex-col bg-[#F7F9F7]">
          <section aria-label="Chat messages" className="flex-1 overflow-y-auto px-3 py-4 sm:px-5">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isMine={message.senderId === currentUserId}
              />
            ))}

            {invoice && (
              <div className="my-4 flex justify-center">
                <InvoiceCard
                  invoice={invoice}
                  role={role}
                  onPay={() => runInvoiceAction(
                    () => mockInvoiceApi.pay(chatId),
                    'M-Pesa payment received. Your money is safe with Creators KE.'
                  )}
                  onApprove={() => runInvoiceAction(
                    () => mockInvoiceApi.approve(chatId),
                    'Approved. Payment released to the creator.'
                  )}
                  onRaiseDispute={() => setDisputeModalOpen(true)}
                  onMarkDelivered={markDelivered}
                  onUpdatePrice={updatePrice}
                  deliveryNote={deliveryNote}
                  onDeliveryNoteChange={setDeliveryNote}
                  deadlineMs={deadlineMs}
                  disputeAvailable={disputeAvailable}
                  isBusy={isBusy}
                  onCountdownComplete={() => setExpiredInvoiceId(invoice.id)}
                />
              </div>
            )}
            <div ref={messageEndRef} />
          </section>

          <form onSubmit={sendMessage} className="border-t border-slate-200 bg-white px-3 py-3 sm:px-4">
            {attachmentName && (
              <div className="mb-2 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <span className="truncate">{attachmentName}</span>
                <button type="button" className="ml-3 text-slate-500 underline" onClick={() => setAttachmentName('')}>Remove</button>
              </div>
            )}
            <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5">
              <input ref={fileInputRef} type="file" className="hidden" onChange={chooseAttachment} />
              <button
                type="button"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-200"
                aria-label="Attach a file"
                onClick={() => fileInputRef.current?.click()}
              >
                <IconPaperclip className="icon-md" aria-hidden="true" />
              </button>
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) sendMessage(event);
                }}
                rows={1}
                placeholder="Message…"
                aria-label="Message"
                className="max-h-28 min-h-10 flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00A651] text-white transition hover:bg-[#008F45] disabled:bg-slate-300"
                aria-label="Send message"
                disabled={!draft.trim() && !attachmentName}
              >
                <IconSend className="icon-sm" aria-hidden="true" />
              </button>
            </div>
          </form>
        </main>
      </div>

      <DisputeModal
        open={disputeModalOpen}
        onClose={() => setDisputeModalOpen(false)}
        onSubmit={submitDispute}
      />
    </div>
  );
}
