import { formatTime } from '../utils'

export default function Home({ playlists, onNavigate, onPlayTrack, currentTrack, playing }) {
  return (
    <div className="page">
      <div className="hero-banner">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="hero-title">ВЕРНЫЙ ПУТЬ</div>
          <div className="hero-subtitle">Исламская аудио библиотека · Официальный филиал ar-rad channel</div>
        </div>
      </div>

      <section className="sec">
        <div className="sec-header">
          <h2 className="sec-title">Плейлисты</h2>
          <button className="sec-more" onClick={() => onNavigate('playlists')}>Все плейлисты →</button>
        </div>
        <div className="playlist-grid">
          {playlists.slice(0, 12).map(pl => (
            <div key={pl.id} className="playlist-card" onClick={() => onNavigate('playlist', pl.id)}>
              <div className="pc-cover" style={{background: `linear-gradient(135deg, ${pl.color}40, ${pl.color}15)`}}>
                <span>{pl.cover}</span>
                <span className="pc-badge">{pl.count} видео</span>
              </div>
              <div className="pc-body">
                <div className="pc-title">{pl.title}</div>
                <div className="pc-link">Посмотреть все плейлисты</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
