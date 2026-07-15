import TopBar from './TopBar'

const NAV = [
  { id: 'home', icon: '🏠', label: 'Главная' },
  { id: 'playlists', icon: '🎵', label: 'Плейлисты' },
  { id: 'search', icon: '🔍', label: 'Поиск' },
  { id: 'favorites', icon: '❤️', label: 'Избранное' },
  { id: 'about', icon: 'ℹ️', label: 'О нас' },
]

export default function Sidebar({ view, onNavigate, theme, onToggleTheme }) {
  return (
    <aside className="sidebar">
      <TopBar theme={theme} onToggleTheme={onToggleTheme} />
      <nav className="sb-nav">
        <div className="sb-section">Навигация</div>
        {NAV.map(n => (
          <button key={n.id} className={`sb-item ${view === n.id ? 'active' : ''}`} onClick={() => onNavigate(n.id)}>
            <span className="sb-icon">{n.icon}</span>
            <span>{n.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}
