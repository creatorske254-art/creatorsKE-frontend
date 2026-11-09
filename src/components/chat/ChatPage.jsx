import { useMemo, useState } from 'react';
import { IconArrowLeft, IconCheck, IconPaperclip, IconSend, IconShieldCheck, IconUpload } from '@tabler/icons-react';
import CreateInvoiceModal from '@/components/chat/CreateInvoiceModal';
import DisputeModal from '@/components/chat/DisputeModal';
import InvoiceCard from '@/components/chat/InvoiceCard';
import CountdownTimer from '@/components/chat/CountdownTimer';
import MessageBubble from '@/components/chat/MessageBubble';

const CHAT_USER = {
  id: 'brand-01',
  name: 'Nia K.',
  role: 'brand',
  online: true,
  avatar: 'NK',
};

const CREATOR_USER = {
  id: 'creator-01',
  name: 'Maya K.',
  role: 'creator',
  online: true,
  avatar: 'MK',
};

const initialMessages = [
  { id: 'm1', senderId: CREATOR_USER.id, senderName: CREATOR_USER.name, text: 'Hi! I can shoot a branded TikTok and appear at your event this weekend.', time: '09:10', seen: true },
  {
    id: 'invoice-1',
    senderId: CREATOR_USER.id,
    senderName: CREATOR_USER.name,
    invoice: {
      id: 'INV-9842',
      name: 'Maya K.',
      title: 'Invoice from Maya K.',
      service: '1 TikTok video + event appearance',
      price: 25000,
      status: 'PENDING',
      deliveredLink: '',
      reason: '',
      details: '',
      createdAt: Date.now(),
    },
    time: '09:12',
    seen: true,
  },
  { id: 'm2', senderId: CHAT_USER.id, senderName: CHAT_USER.name, text: 'Perfect. Please send the details and I will review it.', time: '09:14', seen: true },
];

// TODO: replace mock state with real /api/invoices requests and socket-backed messages.
const mockInvoiceApi = {
  createInvoice: async (payload) => ({ ok: true, invoice: { ...payload, id: `INV-${Date.now()}` } }),
  updateInvoice: async (invoiceId, updates) => ({ ok: true, invoice: { id: invoiceId, ...updates } }),
  disputeInvoice: async (invoiceId, payload) => ({ ok: true, dispute: { invoiceId, ...payload } }),
};

export default function ChatPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState('');
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const latestInvoice = useMemo(
    () => [...messages].reverse().find((message) => message.invoice)?.invoice ?? null,
    [messages]
  );

  const role = CHAT_USER.role;

  const addSystemMessage = (text) => {
    setMessages((current) => [
      ...current,
      {
        id: `system-${Date.now()}`,
        senderId: 'system',
        senderName: 'System',
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        seen: true,
      },
    ]);
  };

  const updateLatestInvoice = (updater) => {
    setMessages((current) => current.map((message) => {
      if (!message.invoice) return message;
      return {
        ...message,
        invoice: updater(message.invoice),
      };
    }));
  };

  const handleCreateInvoice = async ({ name, price, serviceDescription }) => {
    const newInvoice = {
      id: `INV-${Date.now()}`,
      name,
      title: `Invoice from ${name}`,
      service: serviceDescription,
      price,
      status: 'PENDING',
      deliveredLink: '',
      reason: '',
      details: '',
      createdAt: Date.now(),
    };

    setIsSubmitting(true);
    try {
      // TODO: call POST /api/invoices with { name, price, serviceDescription, status: 'PENDING' }
      await mockInvoiceApi.createInvoice({ name, price, serviceDescription, status: 'PENDING' });
      setMessages((current) => [
        ...current,
        {
          id: `invoice-${Date.now()}`,
          senderId: CHAT_USER.id,
          senderName: CHAT_USER.name,
          invoice: newInvoice,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          seen: true,
        },
      ]);
      addSystemMessage('Invoice sent. Waiting for payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = () => {
    if (!draft.trim()) return;
    setMessages((current) => [
      ...current,
      {
        id: `m-${Date.now()}`,
        senderId: CHAT_USER.id,
        senderName: CHAT_USER.name,
        text: draft.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        seen: true,
      },
    ]);
    setDraft('');
  };

  const handleAcceptAndPay = async () => {
    if (!latestInvoice) return;
    // TODO: POST /api/invoices/:id/pay
    await mockInvoiceApi.updateInvoice(latestInvoice.id, { status: 'PAID - HELD' });
    updateLatestInvoice((invoice) => ({ ...invoice, status: 'PAID - HELD' }));
    addSystemMessage('Payment received via M-Pesa STK. Funds are held by Creators KE.');
  };

  const handleMarkDelivered = async () => {
    if (!latestInvoice) return;
    // TODO: PATCH /api/invoices/:id/deliver
    await mockInvoiceApi.updateInvoice(latestInvoice.id, {
      status: 'DELIVERED',
      deliveredLink: deliveryNote || 'https://example.com/deliverable',
    });
    updateLatestInvoice((invoice) => ({
      ...invoice,
      status: 'DELIVERED',
      deliveredLink: deliveryNote || 'https://example.com/deliverable',
    }));
    setDeliveryNote('');
    addSystemMessage('Delivery uploaded. The brand can review and approve now.');
  };

  const handleApprove = async () => {
    if (!latestInvoice) return;
    // TODO: PATCH /api/invoices/:id/approve
    await mockInvoiceApi.updateInvoice(latestInvoice.id, { status: 'COMPLETED' });
    updateLatestInvoice((invoice) => ({ ...invoice, status: 'COMPLETED' }));
    addSystemMessage('Approved. Paid out to creator.');
  };

  const handleDisputeSubmit = async ({ reason, details }) => {
    if (!latestInvoice) return;
    // TODO: POST /api/invoices/:id/dispute
    await mockInvoiceApi.disputeInvoice(latestInvoice.id, { reason, details });
    updateLatestInvoice((invoice) => ({
      ...invoice,
      status: 'DISPUTED',
      reason,
      details,
    }));
    addSystemMessage('Dispute submitted. Under moderator review.');
  };

  const hasApprovalDeadline = latestInvoice && ['PAID - HELD', 'DELIVERED'].includes(latestInvoice.status);
  const deadlineMs = hasApprovalDeadline ? (Date.now() + 24 * 60 * 60 * 1000 - 1000 * 60 * 60 * 2) : null;

  return (
    <div className="min-h-screen bg-[#F5F7F5] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col border-x border-slate-200 bg-white shadow-sm">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 sm:hidden" aria-label="Back">
              <IconArrowLeft size={18} />
            </button>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#00A651] text-sm font-bold text-white">
              {CREATOR_USER.avatar}
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-900">{CREATOR_USER.name}</h1>
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Online
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setInvoiceModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#00A651] px-3 py-2 text-sm font-semibold text-white shadow-sm sm:px-4"
          >
            Create Invoice
          </button>
        </header>

        <main className="flex min-h-0 flex-1 flex-col bg-[#F7F8F7]">
          <section className="flex-1 space-y-4 overflow-y-auto px-3 py-4 sm:px-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} isMine={message.senderId === CHAT_USER.id} currentUserName={CHAT_USER.name} />
            ))}
          </section>

          {latestInvoice && ['PAID - HELD', 'DELIVERED', 'DISPUTED', 'COMPLETED'].includes(latestInvoice.status) && (
            <div className="border-t border-slate-200 bg-white px-4 py-3">
              <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <IconShieldCheck size={16} className="text-[#00A651]" />
                    <span>{latestInvoice.status === 'DELIVERED' ? 'Delivery uploaded' : latestInvoice.status === 'DISPUTED' ? 'Under review' : 'Escrow status'}</span>
                  </div>
                  {latestInvoice.status === 'DELIVERED' && role === 'creator' && (
                    <span className="text-xs font-semibold text-[#00A651]">Waiting for approval</span>
                  )}
                </div>
                {latestInvoice.status === 'DELIVERED' && role === 'creator' && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Brand has</span>
                    <CountdownTimer deadlineMs={deadlineMs} className="font-semibold text-[#00A651]" />
                    <span>left to approve</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {latestInvoice && (
            <div className="border-t border-slate-200 bg-white px-4 py-4">
              <InvoiceCard
                invoice={latestInvoice}
                role={role}
                onAcceptAndPay={handleAcceptAndPay}
                onApprove={handleApprove}
                onRaiseDispute={() => setDisputeModalOpen(true)}
                onMarkDelivered={handleMarkDelivered}
                onDeliveryNoteChange={setDeliveryNote}
                deliveryNote={deliveryNote}
              />
            </div>
          )}

          <div className="border-t border-slate-200 bg-white px-3 py-3 sm:px-4">
            <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
              <button type="button" className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-200" aria-label="Attach file">
                <IconPaperclip size={18} />
              </button>
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={1}
                placeholder="Type a message"
                className="max-h-28 min-h-[44px] flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={handleSendMessage}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00A651] text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={!draft.trim()}
                aria-label="Send message"
              >
                <IconSend size={18} />
              </button>
            </div>
          </div>
        </main>
      </div>

      <CreateInvoiceModal
        open={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        otherUserName={CREATOR_USER.name}
        onCreateInvoice={handleCreateInvoice}
      />

      <DisputeModal
        open={disputeModalOpen}
        onClose={() => setDisputeModalOpen(false)}
        onSubmit={handleDisputeSubmit}
      />
    </div>
  );
}
