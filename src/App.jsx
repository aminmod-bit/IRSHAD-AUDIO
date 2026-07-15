import { useState, useEffect } from 'react'
import { useAudio } from './hooks/useAudio'
import Sidebar from './components/Sidebar'
import Home from './components/Home'
import Playlists from './components/Playlists'
import PlaylistDetail from './components/PlaylistDetail'
import Search from './components/Search'
import Favorites from './components/Favorites'
import About from './components/About'
import Player from './components/Player'
import FullPlayer from './components/FullPlayer'

export default function App() {
  const [view, setView] = useState('home')
  const [viewData, setViewData] = useState(null)
  const [theme, setTheme] = useState(() => localStorage.getItem('ir_theme') || 'dark')
  const [expanded, setExpanded] = useState(false)
  const [showQueue, setShowQueue] = useState(false)

  const audio = useAudio()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('ir_theme', theme)
  }, [theme])

  // Telegram Web App init
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready()
      window.Telegram.WebApp.expand()
      window.Telegram.WebApp.setHeaderColor('#0a0a0c')
      window.Telegram.WebApp.setBackgroundColor('#0a0a0c')
    }
  }, [])

  const navigate = (v, data = null) => {
    setView(v)
    setViewData(data)
    setExpanded(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const playTrack = (track, list) => {
    audio.play(track, list)
  }

  const selectedPlaylist = viewData ? audio.playlists.find(p => p.id === viewData) : null

  const renderView = () => {
    switch (view) {
      case 'home':
        return <Home playlists={audio.playlists} onNavigate={navigate} onPlayTrack={playTrack} currentTrack={audio.currentTrack} playing={audio.playing} />
      case 'playlists':
        return <Playlists playlists={audio.playlists} onNavigate={navigate} />
      case 'playlist':
        return <PlaylistDetail playlist={selectedPlaylist} onBack={() => navigate('playlists')} onPlayTrack={playTrack} currentTrack={audio.currentTrack} playing={audio.playing} favorites={audio.favorites} onToggleFav={audio.toggleFav} />
      case 'search':
        return <Search playlists={audio.playlists} onPlayTrack={playTrack} currentTrack={audio.currentTrack} favorites={audio.favorites} onToggleFav={audio.toggleFav} />
      case 'favorites':
        return <Favorites playlists={audio.playlists} favorites={audio.favorites} onToggleFav={audio.toggleFav} onPlayTrack={playTrack} currentTrack={audio.currentTrack} />
      case 'about':
        return <About />
      default:
        return <Home playlists={audio.playlists} onNavigate={navigate} onPlayTrack={playTrack} currentTrack={audio.currentTrack} playing={audio.playing} />
    }
  }

  return (
    <div className="app">
      <Sidebar view={view} onNavigate={navigate} theme={theme} onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} />

      <main className="main">
        <div className="main-scroll" key={view + (viewData || '')}>
          {renderView()}
        </div>
      </main>

      <Player
        currentTrack={audio.currentTrack}
        playing={audio.playing}
        toggle={audio.toggle}
        prev={audio.prev}
        next={audio.next}
        seek={audio.seek}
        progress={audio.progress}
        duration={audio.duration}
        pct={audio.pct}
        speed={audio.speed}
        setSpeed={audio.setSpeed}
        volume={audio.volume}
        setVolume={audio.setVolume}
        repeat={audio.repeat}
        setRepeat={audio.setRepeat}
        onExpand={() => setExpanded(true)}
        showQueue={showQueue}
        setShowQueue={setShowQueue}
      />

      {expanded && (
        <FullPlayer
          currentTrack={audio.currentTrack}
          playing={audio.playing}
          toggle={audio.toggle}
          prev={audio.prev}
          next={audio.next}
          seek={audio.seek}
          progress={audio.progress}
          duration={audio.duration}
          pct={audio.pct}
          speed={audio.speed}
          setSpeed={audio.setSpeed}
          volume={audio.volume}
          setVolume={audio.setVolume}
          repeat={audio.repeat}
          setRepeat={audio.setRepeat}
          onClose={() => setExpanded(false)}
          queue={audio.queue}
          queueIdx={audio.queueIdx}
        />
      )}

      <nav className="bnav">
        {[
          { id: 'home', icon: '🏠', label: 'Главная' },
          { id: 'playlists', icon: '🎵', label: 'Плейлисты' },
          { id: 'search', icon: '🔍', label: 'Поиск' },
          { id: 'favorites', icon: '❤️', label: 'Избранное' },
          { id: 'about', icon: 'ℹ️', label: 'О нас' },
        ].map(n => (
          <button key={n.id} className={`bnav-item ${view === n.id ? 'active' : ''}`} onClick={() => navigate(n.id)}>
            <span className="bnav-ic">{n.icon}</span>
            <span>{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
