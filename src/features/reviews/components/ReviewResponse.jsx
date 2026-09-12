import { useState } from 'react';
import { IconMessageCircle } from '@tabler/icons-react';

/**
 * ReviewResponse — a creator's single public reply to one review. Read-only
 * when `review.reply` already exists; otherwise, if `canReply` is true (the
 * viewer is the reviewed creator), shows a compose form calling
 * onSubmit(text). POST /reviews/:id/reply doesn't exist on the backend yet
 * (see the production-readiness plan's backend spec) — onSubmit's mutation
 * degrades to a toast until it does.
 */
export default function ReviewResponse({ review, canReply = false, onSubmit, isSubmitting = false }) {
  const [text, setText] = useState('');
  const [composing, setComposing] = useState(false);

  if (review.reply) {
    return (
      <div style={{ marginTop: 10, paddingLeft: 12, borderLeft: '2px solid var(--purple-200)' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--purple-600)', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
          <IconMessageCircle size={12} /> Creator's reply
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--grey-600)', lineHeight: 1.6, margin: 0 }}>{review.reply}</p>
      </div>
    );
  }

  if (!canReply) return null;

  if (!composing) {
    return (
      <button className="btn btn-ghost btn-xs" style={{ marginTop: 8 }} onClick={() => setComposing(true)}>
        <IconMessageCircle size={12} /> Reply
      </button>
    );
  }

  return (
    <div style={{ marginTop: 10 }}>
      <textarea
        className="input input-md"
        rows={2}
        placeholder="Write a public reply…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ marginBottom: 8, resize: 'vertical' }}
      />
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          className="btn btn-purple btn-xs"
          disabled={!text.trim() || isSubmitting}
          onClick={() => onSubmit(text.trim())}
        >
          {isSubmitting ? 'Posting…' : 'Post reply'}
        </button>
        <button className="btn btn-ghost btn-xs" onClick={() => { setComposing(false); setText(''); }}>Cancel</button>
      </div>
    </div>
  );
}
