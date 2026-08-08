export default function SiteReveal({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="vtapp-site-reveal"
      data-revealed="true"
      style={{ minHeight: '100dvh' }}
    >
      {children}
    </div>
  );
}
