import TopBar from './TopBar'
import { Home, Music, Search, Heart, Info } from './Icons'

const NAV = [
  { id: 'home', icon: Home, label: 'Главная' },
  { id: 'playlists', icon: Music, label: 'Плейлисты' },
  { id: 'search', icon: Search, label: 'Поиск' },
  { id: 'favorites', icon: Heart, label: 'Избранное' },
  { id: 'about', icon: Info, label: 'О нас' },
]

export default function Sidebar({ view, onNavigate, theme, onToggleTheme }) {
  return (
    <aside className="sidebar">
      <TopBar theme={theme} onToggleTheme={onToggleTheme} />
      <nav className="sb-nav">
        <div className="sb-section">Навигация</div>
        {NAV.map(n => (
          <button key={n.id} className={`sb-item ${view === n.id ? 'active' : ''}`} onClick={() => onNavigate(n.id)}>
            <span className="sb-icon"><n.icon size={18} /></span>
            <span>{n.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}
