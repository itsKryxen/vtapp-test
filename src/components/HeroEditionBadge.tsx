export default function HeroEditionBadge({ className = '' }: { className?: string }) {
  return (
    <div
      className={`hero-edition-chip hero-edition-enter ${className}`}
      aria-label="4th Edition"
      role="img"
    >
      <span className="hero-edition-chip-rule" aria-hidden="true" />
      <span className="hero-edition-chip-num" aria-hidden="true"><span>04</span></span>
      <span className="hero-edition-chip-div" aria-hidden="true" />
      <span className="hero-edition-chip-label" aria-hidden="true">EDITION</span>
    </div>
  );
}
