import { Sun, Moon, Send } from './Icons'

export default function TopBar({ theme, onToggleTheme }) {
  return (
    <div className="sb-header">
      <div className="sb-logo">
        <svg width="36" height="36" viewBox="0 0 200 200" fill="none">
          <rect width="200" height="200" rx="40" fill="#0a0a0c"/>
          <rect x="1" y="1" width="198" height="198" rx="39" stroke="#d4a574" strokeWidth="1" opacity="0.3"/>
          <text x="100" y="115" textAnchor="middle" fontFamily="Georgia,serif" fontStyle="italic" fontSize="100" fill="#d4a574">I</text>
          <path d="M85 75 Q80 65 90 60 Q85 70 90 75 Q95 70 90 60" stroke="#4ade80" strokeWidth="1.5" fill="none" opacity="0.7"/>
          <text x="100" y="160" textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight="700" fontSize="28" fill="#fff" letterSpacing="4">IRSHAD</text>
        </svg>
        <div className="sb-logo-text">IRSHAD</div>
      </div>
      <div className="sb-actions">
        <button className="sb-btn" onClick={onToggleTheme} title="Сменить тему">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <a className="sb-btn" href="https://t.me/IRSHAD_info" target="_blank" rel="noopener" title="Telegram">
          <Send size={16} />
        </a>
      </div>
    </div>
  )
}
