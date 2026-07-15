import { Globe, Instagram, Send, Phone, Youtube } from './Icons'

export default function About() {
  return (
    <div className="page about-page">
      <h1 style={{fontFamily:'var(--font-serif)',fontSize:36,fontWeight:400,fontStyle:'italic',marginBottom:24}}>О нас</h1>

      <div className="glass" style={{padding:24,borderRadius:'var(--radius-lg)',marginBottom:24}}>
        <div style={{fontSize:24,fontWeight:800,marginBottom:12}}>IRSHAD</div>
        <div className="about-desc">
          Официальный филиал канала "ar-rad channel", вещающий исключительно аудио материалы.
        </div>
        <div style={{fontSize:14,color:'var(--color-text-muted)',lineHeight:1.8,marginBottom:16}}>
          👍 Посмотрел, поделись с другом<br/>
          🔥 Нажми рассказать друзьям
        </div>
        <div className="glass" style={{padding:16,borderRadius:'var(--radius-md)',marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:700,color:'var(--color-accent)',marginBottom:8}}>➕ БЛАГОЕ ДЕЛО В ТВОЮ КОПИЛКУ</div>
          <div style={{fontSize:13,color:'var(--color-text-muted)',lineHeight:1.6}}>
            🎉 Как всё просто. Указал на благое - получил награду, подобно совершившему благое дело.
          </div>
        </div>
        <div style={{fontSize:13,color:'var(--color-text-muted)',fontStyle:'italic',padding:'12px 0',borderTop:'1px solid var(--color-border)',borderBottom:'1px solid var(--color-border)',marginBottom:16}}>
          «Указавшему на благое (полагается) такая же награда как и совершившему его». (Муслим 1893)
        </div>
        <div style={{fontSize:13,color:'var(--color-gold)'}}>🔸 https://t.me/arradru</div>
      </div>

      <h2 style={{fontSize:18,fontWeight:700,marginBottom:16}}>Ссылки</h2>
      <div className="about-links">
        <a className="about-link" href="https://ar-rad.ru" target="_blank" rel="noopener">
          <span className="about-link-icon"><Globe size={20} /></span>
          <div>
            <div className="about-link-text">Сайт AR-RAD</div>
            <div className="about-link-url">ar-rad.ru</div>
          </div>
        </a>
        <a className="about-link" href="https://instagram.com/ar_rad.ua" target="_blank" rel="noopener">
          <span className="about-link-icon"><Instagram size={20} /></span>
          <div>
            <div className="about-link-text">Инстаграм</div>
            <div className="about-link-url">instagram.com/ar_rad.ua</div>
          </div>
        </a>
        <a className="about-link" href="https://t.me/arradru" target="_blank" rel="noopener">
          <span className="about-link-icon"><Send size={20} /></span>
          <div>
            <div className="about-link-text">Телеграм</div>
            <div className="about-link-url">t.me/arradru</div>
          </div>
        </a>
        <a className="about-link" href="https://vk.com/ar_rad_ru" target="_blank" rel="noopener">
          <span className="about-link-icon"><Phone size={20} /></span>
          <div>
            <div className="about-link-text">Вконтакте</div>
            <div className="about-link-url">vk.com/ar_rad_ru</div>
          </div>
        </a>
        <a className="about-link" href="https://www.youtube.com/@IRSHAD_info" target="_blank" rel="noopener">
          <span className="about-link-icon"><Youtube size={20} /></span>
          <div>
            <div className="about-link-text">YouTube</div>
            <div className="about-link-url">youtube.com/@IRSHAD_info</div>
          </div>
        </a>
      </div>
    </div>
  )
}
