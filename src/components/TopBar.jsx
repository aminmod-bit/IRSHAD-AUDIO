export default function TopBar({ theme, onToggleTheme }) {
  return (
    <div className="sb-header">
      <div className="sb-logo">
        <svg width="32" height="32" viewBox="0 0 512 512" fill="none">
          <rect width="512" height="512" rx="96" fill="url(#lg)"/>
          <defs><linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#1a1a2e"/><stop offset="100%" stopColor="#0a0a0c"/></linearGradient></defs>
          <text x="256" y="230" textAnchor="middle" fontFamily="Georgia,serif" fontStyle="italic" fontSize="200" fill="#d4a574">I</text>
          <text x="256" y="380" textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight="700" fontSize="72" fill="#fff" letterSpacing="12">IRSHAD</text>
        </svg>
        <div className="sb-logo-text">IRSHAD</div>
      </div>
      <div className="sb-actions">
        <button className="sb-btn" onClick={onToggleTheme} title="Сменить тему">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <a className="sb-btn" href="https://t.me/IRSHAD_info" target="_blank" rel="noopener" title="Telegram">
          ✈️
        </a>
      </div>
    </div>
  )
}
