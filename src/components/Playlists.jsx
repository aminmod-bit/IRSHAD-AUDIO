export default function Playlists({ playlists, onNavigate }) {
  return (
    <div className="page">
      <h1 style={{fontFamily:'var(--font-serif)',fontSize:36,fontWeight:400,fontStyle:'italic',marginBottom:24}}>Плейлисты</h1>
      <div className="playlist-grid">
        {playlists.map(pl => (
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
    </div>
  )
}
