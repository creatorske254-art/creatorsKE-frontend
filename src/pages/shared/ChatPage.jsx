import ChatPage from '@/components/chat/ChatPage';
import { usePageMeta } from '@/lib/usePageMeta';

export default function SharedChatPage() {
  usePageMeta('Chat', 'Creators KE conversation and invoice flow');
  return <ChatPage />;
}
