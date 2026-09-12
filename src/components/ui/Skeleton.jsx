// shadcn primitive / thin wrapper
// Skeleton.jsx
//
// Single shimmering placeholder block, built on the shared .skeleton class
// (index.css). Compose several of these to match the shape of whatever's
// loading - a text line, an avatar circle, a table row, a card.
export default function Skeleton({ width = '100%', height = 14, circle = false, className = '', style = {} }) {
  return (
    <div
      className={`skeleton ${className}`.trim()}
      style={{
        width,
        height,
        borderRadius: circle ? '50%' : undefined,
        flexShrink: 0,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}
