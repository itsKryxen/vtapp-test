export default function HeroWordmark({ className = '' }: { className?: string }) {
  return (
    <p className={`hero-wordmark-static hero-wordmark-enter ${className}`}>
      V-TAPP <span className="text-brand-400">26</span>
    </p>
  );
}
