import { useEffect, useRef, useState, useCallback } from 'react'
import { useContent } from '../../context/ContentContext'

/* ─── Shared button styles ─── */
const btnPrimary = {
  display:'inline-flex',alignItems:'center',justifyContent:'center',gap:'8px',
  padding:'13px 28px',borderRadius:'var(--r-pill)',border:'none',cursor:'pointer',
  background:'var(--cp)',
  color:'#fff',fontSize:'14px',fontWeight:700,
  boxShadow:'var(--sh-btn)',transition:'opacity .15s,transform .1s',
  fontFamily:'var(--font)',textDecoration:'none',
}
const btnOutline = {
  ...btnPrimary,
  background:'transparent',color:'var(--cp)',
  border:'2px solid var(--border)',boxShadow:'none',
}

/* ─── Fade-up hook ─── */
function useFadeUp() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('visible') },
      { threshold:0.1, rootMargin:'0px 0px -30px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

/* ══════════════════════════════════════════════════
   LIGHTBOX
══════════════════════════════════════════════════ */
function Lightbox({ items, startIdx, onClose }) {
  const [idx, setIdx] = useState(startIdx)
  const move = useCallback(d => setIdx(i => (i + d + items.length) % items.length), [items.length])

  useEffect(() => {
    const fn = e => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') move(-1)
      if (e.key === 'ArrowRight') move(1)
    }
    document.addEventListener('keydown', fn)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', fn); document.body.style.overflow = '' }
  }, [onClose, move])

  const s = {
    overlay:{ position:'fixed',inset:0,zIndex:1000,background:'rgba(15,5,15,.92)',
      backdropFilter:'blur(12px)',display:'flex',alignItems:'center',justifyContent:'center' },
    imgWrap:{ position:'relative',maxWidth:'min(90vw,700px)',maxHeight:'86dvh',
      display:'flex',alignItems:'center',justifyContent:'center' },
    img:{ maxWidth:'100%',maxHeight:'86dvh',borderRadius:'18px',objectFit:'contain',
      boxShadow:'0 24px 80px rgba(0,0,0,.5)' },
    caption:{ position:'absolute',bottom:-36,left:0,right:0,textAlign:'center',
      fontSize:'13px',fontWeight:700,color:'rgba(255,255,255,.7)' },
    arrowBtn:{ position:'fixed',top:'50%',transform:'translateY(-50%)',
      width:48,height:48,borderRadius:'50%',background:'rgba(255,255,255,.12)',
      backdropFilter:'blur(8px)',border:'1.5px solid rgba(255,255,255,.2)',
      color:'white',fontSize:22,cursor:'pointer',display:'flex',
      alignItems:'center',justifyContent:'center',zIndex:1001 },
    closeBtn:{ position:'fixed',top:16,right:16,width:44,height:44,borderRadius:'50%',
      background:'rgba(255,255,255,.12)',backdropFilter:'blur(8px)',
      border:'1.5px solid rgba(255,255,255,.2)',color:'white',fontSize:20,
      cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1001 },
    counter:{ position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',
      display:'flex',gap:6,zIndex:1001 },
    dot:i=>({ width:6,height:6,borderRadius:'50%',
      background:i===idx?'#fff':'rgba(255,255,255,.35)',
      transform:i===idx?'scale(1.4)':'scale(1)',transition:'all .2s' }),
  }

  const [touchX, setTouchX] = useState(0)

  return (
    <div style={s.overlay} onClick={e => e.target===e.currentTarget && onClose()}>
      <button style={s.closeBtn} onClick={onClose}>✕</button>
      <button style={{...s.arrowBtn,left:16}} onClick={()=>move(-1)}>‹</button>
      <div style={s.imgWrap}>
        <img src={items[idx]?.image||items[idx]} alt={items[idx]?.label||''} style={s.img}
          onTouchStart={e=>setTouchX(e.touches[0].clientX)}
          onTouchEnd={e=>{ const dx=e.changedTouches[0].clientX-touchX; if(Math.abs(dx)>50) move(dx<0?1:-1) }}
        />
        <div style={s.caption}>{items[idx]?.label||''}</div>
      </div>
      <button style={{...s.arrowBtn,right:16}} onClick={()=>move(1)}>›</button>
      <div style={s.counter}>
        {items.map((_,i)=><div key={i} style={s.dot(i)} />)}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════════ */
function Navbar({ studioName, whatsapp }) {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const wa = whatsapp || '5491100000000'

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // close menu on scroll
  useEffect(() => {
    if (!menuOpen) return
    const fn = () => setMenuOpen(false)
    window.addEventListener('scroll', fn, { passive:true })
    return () => window.removeEventListener('scroll', fn)
  }, [menuOpen])

  const links  = ['servicios','sobre-mi','galeria','precios','contacto']
  const labels = ['Servicios','Sobre mí','Galería','Precios','Contacto']
  const emojis = ['💅','🌸','📸','💰','📞']

  return (
    <>
      <style>{`
        .nav-root {
          position:fixed;top:0;left:0;right:0;z-index:100;
          display:flex;align-items:center;justify-content:space-between;
          padding:0 clamp(16px,5vw,64px);height:68px;
          background:rgba(255,248,240,0.92);
          backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);
          border-bottom:1px solid var(--border);
          transition:box-shadow .3s;
        }
        .nav-logo {
          display:flex;align-items:center;gap:10px;
          font-size:17px;font-weight:900;color:var(--cp);
          letter-spacing:-.3px;text-decoration:none;flex-shrink:0;
        }
        .nav-logo-img {
          width:38px;height:38px;border-radius:50%;
          object-fit:cover;border:2px solid var(--blush);
          box-shadow:0 3px 10px rgba(194,24,91,.25);
          flex-shrink:0;
        }
        .nav-logo-name { font-size:15px; }
        .nav-links {
          display:flex;gap:28px;list-style:none;
        }
        .nav-links a {
          font-size:13px;font-weight:600;color:var(--text);
          text-decoration:none;transition:color .2s;
        }
        .nav-links a:hover { color:var(--cp); }
        .nav-cta {
          display:inline-flex;align-items:center;gap:7px;
          padding:0 20px;height:42px;border-radius:var(--r-pill);
          background:var(--cp);
          color:#fff;font-size:13px;font-weight:700;
          text-decoration:none;border:none;cursor:pointer;
          box-shadow:var(--sh-btn);transition:opacity .15s,transform .1s;
          font-family:var(--font);
        }
        .nav-cta:hover { opacity:.9;transform:translateY(-1px); }

        /* hamburger */
        .nav-hamburger {
          display:none;flex-direction:column;justify-content:center;
          gap:5px;background:none;border:none;cursor:pointer;
          padding:8px;border-radius:10px;transition:background .2s;
          flex-shrink:0;
        }
        .nav-hamburger:hover { background:var(--cp-r); }
        .nav-hamburger span {
          display:block;width:22px;height:2.5px;
          background:var(--cp);border-radius:99px;
          transition:transform .3s, opacity .3s;
          transform-origin:center;
        }
        .nav-hamburger.open span:nth-child(1) { transform:translateY(7.5px) rotate(45deg); }
        .nav-hamburger.open span:nth-child(2) { opacity:0;transform:scaleX(0); }
        .nav-hamburger.open span:nth-child(3) { transform:translateY(-7.5px) rotate(-45deg); }

        /* mobile drawer */
        .nav-drawer {
          position:fixed;top:68px;left:0;right:0;
          background:rgba(255,248,240,.98);
          backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);
          border-bottom:1px solid var(--border);
          z-index:99;
          transform:translateY(-8px);opacity:0;pointer-events:none;
          transition:transform .25s ease,opacity .25s ease;
        }
        .nav-drawer.open {
          transform:translateY(0);opacity:1;pointer-events:auto;
        }
        .nav-drawer-inner {
          padding:16px 24px 24px;
          display:flex;flex-direction:column;
        }
        .nav-drawer-link {
          display:flex;align-items:center;gap:14px;
          padding:14px 4px;
          font-size:16px;font-weight:700;color:var(--ink);
          text-decoration:none;
          border-bottom:1px solid var(--div);
          transition:color .15s,padding-left .15s;
        }
        .nav-drawer-link:last-of-type { border-bottom:none; }
        .nav-drawer-link:hover { color:var(--cp);padding-left:8px; }
        .nav-drawer-link span.icon {
          width:36px;height:36px;border-radius:10px;
          background:var(--cp-r);display:flex;align-items:center;
          justify-content:center;font-size:16px;flex-shrink:0;
        }
        .nav-drawer-cta {
          margin-top:16px;
          display:flex;align-items:center;justify-content:center;gap:8px;
          padding:14px;border-radius:var(--r-pill);
          background:var(--cp);
          color:#fff;font-size:15px;font-weight:700;
          text-decoration:none;border:none;box-shadow:var(--sh-btn);
          font-family:var(--font);
        }

        @media(max-width:768px){
          .nav-links  { display:none !important; }
          .nav-cta    { display:none !important; }
          .nav-hamburger { display:flex !important; }
        }
      `}</style>

      <nav className="nav-root" style={{boxShadow: scrolled ? 'var(--sh)' : 'none'}}>
        {/* Logo */}
        <a href="#inicio" className="nav-logo">
          <img src="/logo.png" alt="Pinky" className="nav-logo-img" />
          <span className="nav-logo-name">{studioName || 'Pinky Nail Studio'}</span>
        </a>

        {/* Desktop links */}
        <ul className="nav-links">
          {links.map((l,i) => <li key={l}><a href={`#${l}`}>{labels[i]}</a></li>)}
        </ul>

        {/* Desktop CTA */}
        <a href={`https://wa.me/${wa}?text=Hola!%20Quiero%20reservar%20un%20turno%20%F0%9F%98%8A`}
          target="_blank" rel="noreferrer" className="nav-cta">
          💬 Reservar turno
        </a>

        {/* Hamburger */}
        <button
          className={`nav-hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Menú"
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile drawer */}
      <div className={`nav-drawer ${menuOpen ? 'open' : ''}`}>
        <div className="nav-drawer-inner">
          {links.map((l,i) => (
            <a key={l} href={`#${l}`} className="nav-drawer-link"
              onClick={() => setMenuOpen(false)}>
              <span className="icon">{emojis[i]}</span>
              {labels[i]}
            </a>
          ))}
          <a href={`https://wa.me/${wa}?text=Hola!%20Quiero%20reservar%20un%20turno%20%F0%9F%98%8A`}
            target="_blank" rel="noreferrer" className="nav-drawer-cta"
            onClick={() => setMenuOpen(false)}>
            💬 Reservar turno
          </a>
        </div>
      </div>
    </>
  )
}

/* ══════════════════════════════════════════════════
   HERO
══════════════════════════════════════════════════ */
function Hero({ data, whatsapp }) {
  const ref = useFadeUp()
  const wa = whatsapp || '5491100000000'
  return (
    <section id="inicio" style={{minHeight:'100dvh',display:'flex',alignItems:'center',padding:'68px clamp(16px,6vw,80px) 0',position:'relative',overflow:'hidden',background:'linear-gradient(145deg,var(--cp-50) 0%,#FFF0F8 40%,var(--cp-r) 100%)'}}>
      <div style={{position:'absolute',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(194,24,91,.08) 0%,transparent 70%)',top:-100,right:-150,pointerEvents:'none'}} />
      <div style={{maxWidth:1200,margin:'auto',width:'100%',display:'grid',gridTemplateColumns:'1fr 1fr',gap:60,alignItems:'center',padding:'80px 0 100px',position:'relative',zIndex:1}} className="hero-inner">
        <div ref={ref} className="fade-up">
          <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'6px 16px',borderRadius:'var(--r-pill)',background:'var(--card)',border:'1.5px solid var(--border)',fontSize:11,fontWeight:700,color:'var(--cp)',letterSpacing:'.5px',textTransform:'uppercase',boxShadow:'var(--sh)',marginBottom:24}}>{data.badge}</div>
          <h1 style={{fontSize:'clamp(38px,5.5vw,68px)',fontWeight:900,lineHeight:1.05,letterSpacing:'-2px',color:'var(--ink)',marginBottom:20}}>
            {data.title}<br/><span style={{color:'var(--cp)'}}>{data.accent}</span>
          </h1>
          <p style={{fontSize:'clamp(14px,1.6vw,17px)',color:'var(--text)',lineHeight:1.7,marginBottom:36,maxWidth:480}}>{data.subtitle}</p>
          <div style={{display:'flex',gap:14,flexWrap:'wrap',marginBottom:48}}>
            <a href={`https://wa.me/${wa}?text=Hola!%20Quiero%20reservar%20un%20turno%20%F0%9F%98%8A`} target="_blank" rel="noreferrer" style={btnPrimary}>💬 Reservar turno</a>
            <a href="#galeria" style={btnOutline}>Ver trabajos →</a>
          </div>
          <div style={{display:'flex',gap:32}}>
            {(data.stats||[]).map(s=>(
              <div key={s.label} style={{textAlign:'center'}}>
                <div style={{fontSize: s.num==='∞' ? 48 : 32,fontWeight:900,color:'var(--cp)',lineHeight:1,height:38,display:'flex',alignItems:'center',justifyContent:'center'}}>{s.num}</div>
                <div style={{fontSize:11,fontWeight:600,color:'var(--text-lt)',textTransform:'uppercase',letterSpacing:'.5px',marginTop:4}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{position:'relative',display:'flex',justifyContent:'center'}}>
          <div style={{width:'clamp(260px,38vw,480px)',aspectRatio:'3/4',borderRadius:40,overflow:'hidden',boxShadow:'0 24px 64px rgba(194,24,91,.2)',position:'relative'}}>
            <img src={data.image} alt="Pinky Nail Studio" style={{width:'100%',height:'100%',objectFit:'cover'}} />
          </div>
          <div className="hero-float-card" style={{position:'absolute',bottom:-24,left:-28,background:'var(--card)',borderRadius:'var(--r)',padding:'16px 20px',boxShadow:'var(--sh-lg)',border:'1.5px solid var(--border)',fontSize:13,fontWeight:700,color:'var(--ink)',display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:'#22c55e',boxShadow:'0 0 0 3px rgba(34,197,94,.2)'}} />
            {data.floatCard1}
          </div>
        </div>
      </div>
      <style>{`
        @media(max-width:900px){
          .hero-inner{grid-template-columns:1fr!important;text-align:center;gap:40px!important;padding:60px 0 80px!important}
          .hero-float-card{left:50%!important;transform:translateX(-50%)!important;white-space:nowrap;}
        }
      `}</style>
    </section>
  )
}

/* ══════════════════════════════════════════════════
   SERVICIOS
══════════════════════════════════════════════════ */
function ServicesCarousel({ data }) {
  const [idx, setIdx] = useState(0)
  const [touchX, setTouchX] = useState(0)
  const total = (data||[]).length

  function go(next) { setIdx((next + total) % total) }

  useEffect(() => {
    if (total <= 1) return
    const t = setInterval(() => setIdx(i => (i + 1) % total), 3800)
    return () => clearInterval(t)
  }, [total])

  if (!total) return null

  return (
    <div>
      <div style={{overflow:'hidden',borderRadius:'var(--r)'}}>
        <div
          style={{display:'flex',transform:`translateX(-${idx*100}%)`,transition:'transform .45s cubic-bezier(.4,0,.2,1)'}}
          onTouchStart={e => setTouchX(e.touches[0].clientX)}
          onTouchEnd={e => { const dx = e.changedTouches[0].clientX - touchX; if (Math.abs(dx) > 40) go(dx < 0 ? idx+1 : idx-1) }}
        >
          {(data||[]).map((s,i) => (
            <div key={i} style={{minWidth:'100%',padding:'0 2px',boxSizing:'border-box'}}>
              <ServiceCard s={s} noFade />
            </div>
          ))}
        </div>
      </div>

      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12,marginTop:20}}>
        <button onClick={() => go(idx-1)}
          style={{width:34,height:34,borderRadius:'50%',background:'var(--cp-r)',border:'1.5px solid var(--blush)',
            color:'var(--cp)',fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1,flexShrink:0}}>‹</button>
        <div style={{display:'flex',gap:6,alignItems:'center'}}>
          {(data||[]).map((_,i) => (
            <button key={i} onClick={() => go(i)}
              style={{width:i===idx?22:7,height:7,borderRadius:99,padding:0,border:'none',cursor:'pointer',
                background:i===idx?'var(--cp)':'var(--cp-r)',transition:'all .3s ease'}} />
          ))}
        </div>
        <button onClick={() => go(idx+1)}
          style={{width:34,height:34,borderRadius:'50%',background:'var(--cp-r)',border:'1.5px solid var(--blush)',
            color:'var(--cp)',fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1,flexShrink:0}}>›</button>
      </div>
      <div style={{textAlign:'center',marginTop:8,fontSize:12,fontWeight:600,color:'var(--text-lt)'}}>
        {idx+1} / {total}
      </div>
    </div>
  )
}

function Services({ data }) {
  return (
    <section id="servicios" style={{background:'var(--card)',padding:'clamp(60px,8vw,100px) clamp(16px,6vw,80px)'}}>
      <style>{`
        .svc-grid     { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:20px; }
        .svc-carousel { display:none; }
        @media(max-width:640px){
          .svc-grid     { display:none; }
          .svc-carousel { display:block; }
        }
      `}</style>
      <div style={{maxWidth:1200,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:52}}>
          <div style={{display:'inline-flex',padding:'6px 16px',borderRadius:'var(--r-pill)',background:'var(--cp-r)',color:'var(--cp)',fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:16}}>💅 Lo que hacemos</div>
          <h2 style={{fontSize:'clamp(26px,3.5vw,44px)',fontWeight:900,letterSpacing:'-1px',color:'var(--ink)',marginBottom:14}}>NUESTROS <span style={{color:'var(--cp)'}}>SERVICIOS</span></h2>
          <p style={{fontSize:15,color:'var(--text)',lineHeight:1.7,maxWidth:540,margin:'0 auto'}}>Desde una manicura clásica hasta los diseños más creativos. Cada servicio con productos de primera calidad.</p>
        </div>

        {/* Desktop: grilla */}
        <div className="svc-grid">
          {(data||[]).map((s,i) => <ServiceCard key={i} s={s} />)}
        </div>

        {/* Mobile: carrusel */}
        <div className="svc-carousel">
          <ServicesCarousel data={data} />
        </div>
      </div>
    </section>
  )
}

function ServiceCard({ s, noFade }) {
  const ref = useFadeUp()
  const [hover, setHover] = useState(false)
  return (
    <div ref={noFade ? null : ref} className={noFade ? '' : 'fade-up'}
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={{background:'var(--bg)',border:'1.5px solid var(--border)',borderRadius:'var(--r)',padding:'28px 24px',transition:'transform .2s,box-shadow .2s,border-color .2s',transform:hover?'translateY(-4px)':'none',boxShadow:hover?'var(--sh-lg)':'none',borderColor:hover?'var(--cp-r)':'var(--border)',cursor:'default',position:'relative',overflow:'hidden'}}>
      <div style={{width:52,height:52,borderRadius:14,background:hover?'linear-gradient(135deg,var(--cp),var(--cp-d))':'var(--cp-r)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:hover?20:24,marginBottom:18,transition:'all .2s'}}>{s.icon}</div>
      <div style={{fontSize:16,fontWeight:800,color:'var(--ink)',marginBottom:8}}>{s.name}</div>
      <div style={{fontSize:13,color:'var(--text)',lineHeight:1.6,marginBottom:18}}>{s.desc}</div>
      <a href="#precios" style={{display:'inline-flex',alignItems:'center',gap:4,fontSize:12,fontWeight:700,color:'var(--cp)',transition:'gap .2s'}}>Ver precio →</a>
    </div>
  )
}

/* ── Photo carousel for About section ── */
function PhotoCarousel({ photos }) {
  const [idx, setIdx] = useState(0)
  const total = photos.length

  function go(next) { setIdx((next + total) % total) }

  useEffect(() => {
    if (total <= 1) return
    const t = setInterval(() => setIdx(i => (i + 1) % total), 3800)
    return () => clearInterval(t)
  }, [total])

  if (!total) return <div style={{width:'100%',height:'100%',borderRadius:28,background:'var(--cp-r)'}} />

  return (
    <div style={{position:'relative',width:'100%',height:'100%',borderRadius:28,overflow:'hidden',boxShadow:'var(--sh-lg)'}}>
      <style>{`
        @keyframes ab-fade-in{from{opacity:0;transform:scale(1.05)}to{opacity:1;transform:scale(1)}}
        .ab-photo{animation:ab-fade-in .5s ease forwards}
      `}</style>
      <img key={idx} src={photos[idx]} alt={`foto ${idx+1}`}
        className="ab-photo"
        style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />

      {/* bottom gradient */}
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:'45%',
        background:'linear-gradient(to top,rgba(0,0,0,.55),transparent)',pointerEvents:'none'}} />

      {/* arrows */}
      {total > 1 && <>
        <button onClick={()=>go(idx-1)} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',
          width:38,height:38,borderRadius:'50%',background:'rgba(255,255,255,.2)',backdropFilter:'blur(8px)',
          border:'1.5px solid rgba(255,255,255,.35)',color:'#fff',fontSize:20,cursor:'pointer',
          display:'flex',alignItems:'center',justifyContent:'center',zIndex:2,lineHeight:1}}>‹</button>
        <button onClick={()=>go(idx+1)} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',
          width:38,height:38,borderRadius:'50%',background:'rgba(255,255,255,.2)',backdropFilter:'blur(8px)',
          border:'1.5px solid rgba(255,255,255,.35)',color:'#fff',fontSize:20,cursor:'pointer',
          display:'flex',alignItems:'center',justifyContent:'center',zIndex:2,lineHeight:1}}>›</button>
      </>}

      {/* dots */}
      {total > 1 && (
        <div style={{position:'absolute',bottom:14,left:'50%',transform:'translateX(-50%)',
          display:'flex',gap:6,zIndex:2}}>
          {photos.map((_,i)=>(
            <button key={i} onClick={()=>go(i)}
              style={{width:i===idx?22:7,height:7,borderRadius:99,padding:0,border:'none',cursor:'pointer',
                background:i===idx?'#fff':'rgba(255,255,255,.45)',transition:'all .3s ease'}} />
          ))}
        </div>
      )}

      {/* counter */}
      <div style={{position:'absolute',top:14,right:14,
        background:'rgba(0,0,0,.3)',backdropFilter:'blur(6px)',
        color:'#fff',fontSize:11,fontWeight:700,padding:'4px 10px',borderRadius:99,zIndex:2}}>
        {idx+1} / {total}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   SPOTIFY BANNER
══════════════════════════════════════════════════ */
function SpotifyBanner({ data }) {
  if (!data?.url || !data?.text) return null
  const bg     = data.bgColor     || '#FCE4EC'
  const accent = data.accentColor || '#C2185B'
  const ink    = data.textColor   || '#2D1B2E'
  const spotifySvg = (size) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={accent} style={{flexShrink:0,filter:`drop-shadow(0 2px 8px ${accent}55)`}}>
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.516 17.312a.75.75 0 01-1.032.249c-2.827-1.727-6.387-2.117-10.58-1.159a.75.75 0 01-.334-1.463c4.588-1.048 8.523-.597 11.697 1.34a.75.75 0 01.249 1.033zm1.472-3.27a.937.937 0 01-1.288.308c-3.234-1.988-8.164-2.564-11.99-1.404a.937.937 0 01-.543-1.79c4.37-1.326 9.8-.683 13.514 1.6a.937.937 0 01.307 1.286zm.127-3.408C15.32 8.39 9.374 8.2 5.595 9.348a1.125 1.125 0 01-.652-2.151c4.32-1.31 11.5-1.057 16.038 1.605a1.125 1.125 0 01-1.116 1.832z"/>
    </svg>
  )
  return (
    <section style={{background:bg,borderTop:`1px solid ${accent}22`,padding:'clamp(32px,5vw,56px) clamp(16px,6vw,80px)'}}>
      <style>{`
        .sp-inner{display:flex;flex-direction:column;align-items:center;text-align:center;gap:20px;max-width:800px;margin:0 auto;}
        .sp-top{display:flex;align-items:center;justify-content:center;gap:16px;}
        .sp-text{font-size:17px;font-weight:700;line-height:1.5;font-family:var(--font);}
        .sp-btn{display:inline-flex;align-items:center;gap:8px;padding:13px 28px;border-radius:var(--r-pill);color:#fff;font-size:14px;font-weight:800;text-decoration:none;white-space:nowrap;transition:opacity .15s,transform .1s;font-family:var(--font);box-shadow:0 4px 20px rgba(0,0,0,.15);}
        .sp-btn:hover{opacity:.88;transform:translateY(-2px);}
        .sp-logo-desktop{display:block;}
        .sp-logo-mobile{display:none;}
        @media(max-width:640px){
          .sp-top{flex-direction:column;gap:8px;}
          .sp-text{font-size:15px;}
          .sp-logo-desktop{display:none;}
          .sp-logo-mobile{display:block;}
        }
      `}</style>
      <div className="sp-inner">
        <div className="sp-top">
          <span className="sp-logo-desktop">{spotifySvg(48)}</span>
          <span className="sp-logo-mobile">{spotifySvg(30)}</span>
          <span className="sp-text" style={{color:ink}}>{data.text}</span>
        </div>
        <a href={data.url} target="_blank" rel="noreferrer" className="sp-btn" style={{background:accent}}>
          Escuchar playlist →
        </a>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════
   SOBRE MÍ
══════════════════════════════════════════════════ */
function About({ data, instagram }) {
  const ref1 = useFadeUp(), ref2 = useFadeUp()
  const ig     = (instagram||'').replace('@','')
  const photos = data.photos || []

  return (
    <section id="sobre-mi" style={{background:'var(--bg)',padding:'clamp(60px,8vw,100px) clamp(16px,6vw,80px)'}}>
      <div style={{maxWidth:1200,margin:'0 auto'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:72,alignItems:'center'}} className="about-inner">

          {/* carrusel */}
          <div ref={ref1} className="fade-up" style={{position:'relative',height:520}}>
            <PhotoCarousel photos={photos} />
            <div style={{position:'absolute',top:20,left:-16,zIndex:3,
              background:'var(--cp)',
              color:'#fff',borderRadius:16,padding:'14px 18px',
              boxShadow:'var(--sh-btn)',textAlign:'center'}}>
              <div style={{fontSize:28,lineHeight:1}}>{data.loveEmoji ?? '💜'}</div>
              <div style={{fontSize:10,opacity:.85,textTransform:'uppercase',letterSpacing:'.4px'}}>{data.loveText ?? 'Hecho con amor'}</div>
            </div>
          </div>

          {/* texto */}
          <div ref={ref2} className="fade-up">
            <div style={{display:'inline-flex',padding:'6px 16px',borderRadius:'var(--r-pill)',background:'var(--cp-r)',color:'var(--cp)',fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:16}}>🌸 Sobre el estudio</div>
            <h2 style={{fontSize:'clamp(26px,3.5vw,44px)',fontWeight:900,letterSpacing:'-1px',color:'var(--ink)',lineHeight:1.1,marginBottom:20}}>
              {data.title}<br/><span style={{color:'var(--cp)'}}>{data.accent}</span>
            </h2>
            <p style={{fontSize:15,color:'var(--text)',lineHeight:1.8,marginBottom:16}}>{data.p1}</p>
            <p style={{fontSize:15,color:'var(--text)',lineHeight:1.8,marginBottom:16}}>{data.p2}</p>
            <p style={{fontSize:15,color:'var(--text)',lineHeight:1.8,marginBottom:28}}>{data.p3}</p>
            <div style={{display:'flex',flexWrap:'wrap',gap:10,marginBottom:36}}>
              {(data.pills||[]).map((p,i)=><span key={i} style={{padding:'8px 18px',borderRadius:'var(--r-pill)',background:'var(--cp-r)',color:'var(--cp)',fontSize:12,fontWeight:700}}>{p}</span>)}
            </div>
            <a href={`https://www.instagram.com/${ig}/`} target="_blank" rel="noreferrer" style={btnPrimary}>Ver en Instagram →</a>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:900px){.about-inner{grid-template-columns:1fr!important;gap:40px!important}.about-inner>div:first-child{height:360px!important}}`}</style>
    </section>
  )
}

/* ══════════════════════════════════════════════════
   GALERÍA
══════════════════════════════════════════════════ */
function Gallery({ data, instagram }) {
  const ref = useFadeUp()
  const [lb, setLb] = useState(null)
  const [expanded, setExpanded] = useState(false)
  const btnRef = useRef(null)
  const ig = (instagram||'').replace('@','')
  const photos = data || []
  const INITIAL = 7
  const hasMore = photos.length > INITIAL
  const visible = expanded ? photos : photos.slice(0, INITIAL)

  function toggleExpand() {
    const collapsing = expanded
    setExpanded(!expanded)
    if (collapsing) {
      // al colapsar, mantener al usuario sobre el boton (sino el scroll queda mas abajo)
      requestAnimationFrame(() => btnRef.current?.scrollIntoView({ block:'center', behavior:'smooth' }))
    }
  }
  return (
    <section id="galeria" style={{background:'var(--card)',padding:'clamp(60px,8vw,100px) clamp(16px,6vw,80px)'}}>
      <div style={{maxWidth:1200,margin:'0 auto'}}>
        <div ref={ref} className="fade-up" style={{textAlign:'center',marginBottom:52}}>
          <div style={{display:'inline-flex',padding:'6px 16px',borderRadius:'var(--r-pill)',background:'var(--cp-r)',color:'var(--cp)',fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:16}}>📸 Nuestros trabajos</div>
          <h2 style={{fontSize:'clamp(26px,3.5vw,44px)',fontWeight:900,letterSpacing:'-1px',color:'var(--ink)',marginBottom:14}}>LA <span style={{color:'var(--cp)'}}>GALERÍA</span></h2>
          <p style={{fontSize:15,color:'var(--text)',lineHeight:1.7,maxWidth:540,margin:'0 auto'}}>Cada trabajo es único. Explorá algunos de nuestros diseños favoritos.</p>
        </div>
        <div className="gallery-grid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
          {visible.map((g,i)=>(
            <div key={i} onClick={()=>setLb(i)}
              className={i>=INITIAL?'g-reveal':undefined}
              style={{aspectRatio:'1',borderRadius:'var(--r)',overflow:'hidden',position:'relative',cursor:'pointer',
                ...(i===0?{gridColumn:'span 2',gridRow:'span 2',aspectRatio:'auto'}:{})}}>
              <img src={g.image} alt={g.label} loading="lazy"
                style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform .4s ease'}}
                onMouseEnter={e=>e.currentTarget.style.transform='scale(1.06)'}
                onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
              />
              <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(136,14,79,.5) 0%,transparent 60%)',opacity:0,transition:'opacity .3s',display:'flex',alignItems:'flex-end',padding:16}}
                onMouseEnter={e=>e.currentTarget.style.opacity='1'}
                onMouseLeave={e=>e.currentTarget.style.opacity='0'}>
                <span style={{color:'#fff',fontSize:12,fontWeight:700}}>{g.label}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap',marginTop:36}}>
          {hasMore && (
            <button ref={btnRef} onClick={toggleExpand} style={{...btnPrimary}}>
              {expanded ? '↑ Ver menos' : `Ver más fotos (+${photos.length-INITIAL})`}
            </button>
          )}
          <a href={`https://www.instagram.com/${ig}/`} target="_blank" rel="noreferrer" style={{...btnOutline,display:'inline-flex'}}>Ver más en Instagram →</a>
        </div>
      </div>
      {lb !== null && <Lightbox items={photos} startIdx={lb} onClose={()=>setLb(null)} />}
      <style>{`
        @media(max-width:900px){.gallery-grid{grid-template-columns:repeat(3,1fr)!important}}
        @media(max-width:600px){.gallery-grid{grid-template-columns:repeat(2,1fr)!important}}
        .g-reveal{animation:gReveal .45s ease both}
        @keyframes gReveal{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
      `}</style>
    </section>
  )
}

/* ══════════════════════════════════════════════════
   PRECIOS
══════════════════════════════════════════════════ */
function Pricing({ data, whatsapp }) {
  const ref = useFadeUp()
  const wa = whatsapp || '5491100000000'
  return (
    <section id="precios" style={{background:'var(--bg)',padding:'clamp(60px,8vw,100px) clamp(16px,6vw,80px)'}}>
      <div style={{maxWidth:1200,margin:'0 auto'}}>
        <div ref={ref} className="fade-up" style={{textAlign:'center',marginBottom:52}}>
          <div style={{display:'inline-flex',padding:'6px 16px',borderRadius:'var(--r-pill)',background:'var(--cp-r)',color:'var(--cp)',fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:16}}>💰 Lista de precios</div>
          <h2 style={{fontSize:'clamp(26px,3.5vw,44px)',fontWeight:900,letterSpacing:'-1px',color:'var(--ink)',marginBottom:14}}>PRECIOS <span style={{color:'var(--cp)'}}>CLAROS</span></h2>
          <p style={{fontSize:15,color:'var(--text)',lineHeight:1.7,maxWidth:540,margin:'0 auto'}}>Sin sorpresas. Precios incluyen materiales y dedicación total. Pagás con efectivo, transferencia o Mercado Pago.</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:20}}>
          {(data||[]).map((g,i) => <PriceGroup key={i} group={g} />)}
        </div>
        <div style={{textAlign:'center',marginTop:32}}>
          <a href={`https://wa.me/${wa}?text=Hola!%20Quer%C3%ADa%20consultar%20precios%20%F0%9F%98%8A`} target="_blank" rel="noreferrer" style={{...btnPrimary,display:'inline-flex'}}>💬 Consultar por WhatsApp</a>
          <p style={{fontSize:12,color:'var(--text-lt)',marginTop:14}}>💳 Efectivo · Transferencia · Mercado Pago</p>
        </div>
      </div>
    </section>
  )
}
function PriceGroup({ group }) {
  const ref = useFadeUp()
  return (
    <div ref={ref} className="fade-up" style={{background:'var(--card)',border:'1.5px solid var(--border)',borderRadius:'var(--r)',overflow:'hidden',boxShadow:'var(--sh)',transition:'transform .2s,box-shadow .2s'}}
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='var(--sh-lg)'}}
      onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='var(--sh)'}}>
      <div style={{padding:'14px 20px',background:'var(--cp-r)',fontSize:14,fontWeight:800,color:'var(--cp)',letterSpacing:'-.2px'}}>{group.category}</div>
      <div style={{padding:'8px 0'}}>
        {(group.items||[]).map((it,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',padding:'10px 20px',gap:10,borderBottom:i<group.items.length-1?'1px solid var(--div)':'none',transition:'background .15s'}}
            onMouseEnter={e=>e.currentTarget.style.background='var(--cp-50)'}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <div style={{flex:1,minWidth:0}}>
              <span style={{fontSize:13,fontWeight:700,color:'var(--ink)',display:'block',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{it.name}</span>
              {it.desc && <span style={{fontSize:11,color:'var(--text-lt)',marginTop:1,display:'block'}}>{it.desc}</span>}
            </div>
            <span style={{fontSize:15,fontWeight:900,color:'var(--cp)',whiteSpace:'nowrap',flexShrink:0}}>{it.price}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   RESEÑAS
══════════════════════════════════════════════════ */
function ReviewCard({ r }) {
  return (
    <div style={{background:'var(--bg)',border:'1.5px solid var(--border)',borderRadius:'var(--r)',padding:24,height:'100%',boxSizing:'border-box'}}>
      <div style={{display:'flex',gap:3,marginBottom:14,fontSize:16}}>{'⭐'.repeat(Math.min(5,r.stars||5))}</div>
      <div style={{fontSize:14,color:'var(--text)',lineHeight:1.7,marginBottom:18,fontStyle:'italic'}}>{r.text}</div>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div style={{width:40,height:40,borderRadius:'50%',background:'var(--cp-r)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{r.avatar}</div>
        <div>
          <div style={{fontSize:13,fontWeight:700,color:'var(--ink)'}}>{r.name}</div>
          <div style={{fontSize:11,color:'var(--text-lt)'}}>{r.date}</div>
        </div>
      </div>
    </div>
  )
}

function ReviewsCarousel({ data }) {
  const [idx, setIdx]     = useState(0)
  const [touchX, setTouchX] = useState(0)
  const total = (data||[]).length

  function go(next) { setIdx((next + total) % total) }

  // Auto-avance cada 4.5 s
  useEffect(() => {
    if (total <= 1) return
    const t = setInterval(() => setIdx(i => (i + 1) % total), 4500)
    return () => clearInterval(t)
  }, [total])

  if (!total) return null

  return (
    <div>
      {/* track deslizable */}
      <div style={{overflow:'hidden',borderRadius:'var(--r)'}}>
        <div
          style={{display:'flex',transform:`translateX(-${idx*100}%)`,transition:'transform .45s cubic-bezier(.4,0,.2,1)'}}
          onTouchStart={e => setTouchX(e.touches[0].clientX)}
          onTouchEnd={e => { const dx = e.changedTouches[0].clientX - touchX; if (Math.abs(dx) > 40) go(dx < 0 ? idx+1 : idx-1) }}
        >
          {(data||[]).map((r,i) => (
            <div key={i} style={{minWidth:'100%',padding:'0 2px',boxSizing:'border-box'}}>
              <ReviewCard r={r} />
            </div>
          ))}
        </div>
      </div>

      {/* flechas + dots */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12,marginTop:20}}>
        <button onClick={() => go(idx-1)}
          style={{width:34,height:34,borderRadius:'50%',background:'var(--cp-r)',border:'1.5px solid var(--blush)',
            color:'var(--cp)',fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1,flexShrink:0}}>‹</button>

        <div style={{display:'flex',gap:6,alignItems:'center'}}>
          {(data||[]).map((_,i) => (
            <button key={i} onClick={() => go(i)}
              style={{width:i===idx?22:7,height:7,borderRadius:99,padding:0,border:'none',cursor:'pointer',
                background:i===idx?'var(--cp)':'var(--cp-r)',transition:'all .3s ease'}} />
          ))}
        </div>

        <button onClick={() => go(idx+1)}
          style={{width:34,height:34,borderRadius:'50%',background:'var(--cp-r)',border:'1.5px solid var(--blush)',
            color:'var(--cp)',fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1,flexShrink:0}}>›</button>
      </div>

      {/* contador */}
      <div style={{textAlign:'center',marginTop:8,fontSize:12,fontWeight:600,color:'var(--text-lt)'}}>
        {idx+1} / {total}
      </div>
    </div>
  )
}

function Reviews({ data }) {
  const ref = useFadeUp()
  return (
    <section style={{background:'var(--card)',padding:'clamp(60px,8vw,100px) clamp(16px,6vw,80px)'}}>
      <style>{`
        .rv-grid     { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:20px; }
        .rv-carousel { display:none; }
        @media(max-width:640px){
          .rv-grid     { display:none; }
          .rv-carousel { display:block; }
        }
      `}</style>
      <div style={{maxWidth:1200,margin:'0 auto'}}>
        <div ref={ref} className="fade-up" style={{textAlign:'center',marginBottom:52}}>
          <div style={{display:'inline-flex',padding:'6px 16px',borderRadius:'var(--r-pill)',background:'var(--cp-r)',color:'var(--cp)',fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:16}}>💜 Lo que dicen</div>
          <h2 style={{fontSize:'clamp(26px,3.5vw,44px)',fontWeight:900,letterSpacing:'-1px',color:'var(--ink)'}}>CLIENTAS <span style={{color:'var(--cp)'}}>FELICES</span></h2>
        </div>

        {/* Desktop: grilla */}
        <div className="rv-grid">
          {(data||[]).map((r,i) => <ReviewCard key={i} r={r} />)}
        </div>

        {/* Mobile: carrusel */}
        <div className="rv-carousel">
          <ReviewsCarousel data={data} />
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════
   CONTACTO
══════════════════════════════════════════════════ */
function Contact({ data }) {
  const ref1 = useFadeUp(), ref2 = useFadeUp()
  const wa = data.whatsapp || '5491100000000'
  const ig = (data.instagram||'').replace('@','')
  return (
    <section id="contacto" style={{background:'linear-gradient(145deg,var(--cp-50) 0%,#FFF0F8 50%,var(--cp-r) 100%)',padding:'clamp(60px,8vw,100px) clamp(16px,6vw,80px)'}}>
      <div style={{maxWidth:1200,margin:'0 auto'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:64,alignItems:'center'}} className="contact-inner">
          <div ref={ref1} className="fade-up">
            <div style={{display:'inline-flex',padding:'6px 16px',borderRadius:'var(--r-pill)',background:'rgba(255,255,255,.7)',color:'var(--cp)',fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:16}}>📍 Encontranos</div>
            <h2 style={{fontSize:'clamp(26px,3.5vw,44px)',fontWeight:900,letterSpacing:'-1px',color:'var(--ink)',marginBottom:32}}>¿CÓMO<br/><span style={{color:'var(--cp)'}}>LLEGARNOS?</span></h2>
            {[
              {icon:'📍', title:'Ubicación', val:data.location?.replace(/\n/g,'\n')},
              {icon:'📱', title:'WhatsApp',  val:'Reservas y consultas por mensaje'},
              {icon:'📸', title:'Instagram', val:data.instagram},
              {icon:'🕐', title:'Horario',   val:data.hours},
            ].map(item=>(
              <div key={item.title} style={{display:'flex',alignItems:'flex-start',gap:16,marginBottom:24}}>
                <div style={{width:48,height:48,borderRadius:14,background:'var(--card)',boxShadow:'var(--sh)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{item.icon}</div>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:'var(--ink)'}}>{item.title}</div>
                  <div style={{fontSize:13,color:'var(--text)',marginTop:2,whiteSpace:'pre-line'}}>{item.val}</div>
                </div>
              </div>
            ))}
          </div>
          <div ref={ref2} className="fade-up" style={{background:'var(--card)',borderRadius:28,padding:'40px 36px',boxShadow:'var(--sh-lg)',border:'1.5px solid var(--border)',textAlign:'center'}}>
            <div style={{fontSize:52,marginBottom:8}}>💅</div>
            <h3 style={{fontSize:22,fontWeight:900,color:'var(--ink)',marginBottom:12}}>{data.ctaTitle}</h3>
            <p style={{fontSize:15,color:'var(--text)',lineHeight:1.7,marginBottom:28}}>{data.ctaText}</p>
            <a href={`https://wa.me/${wa}?text=Hola!%20Vi%20tu%20perfil%20y%20quiero%20reservar%20un%20turno%20%F0%9F%98%8A`} target="_blank" rel="noreferrer"
              style={{...btnPrimary,background:'#25D366',boxShadow:'0 4px 20px rgba(37,211,102,.35)',display:'inline-flex',justifyContent:'center',width:'100%',padding:'16px'}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Escribir por WhatsApp
            </a>
            <p style={{fontSize:12,color:'var(--text-lt)',marginTop:16}}>{data.replyTime}</p>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:900px){.contact-inner{grid-template-columns:1fr!important;gap:40px!important}}`}</style>
    </section>
  )
}

/* ══════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════ */
function Footer({ theme, instagram, whatsapp }) {
  const ig = (instagram||'').replace('@','')
  const wa = whatsapp || '5491100000000'
  return (
    <footer style={{background:'var(--ink)',color:'rgba(255,255,255,.8)',padding:'48px clamp(16px,6vw,80px) 32px'}}>
      <div style={{maxWidth:1200,margin:'0 auto',display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:48,paddingBottom:40,borderBottom:'1px solid rgba(255,255,255,.1)'}} className="footer-inner">
        <div>
          <div style={{display:'flex',alignItems:'center',gap:10,fontSize:17,fontWeight:800,color:'#fff',marginBottom:14}}>
            <div style={{width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,var(--cp),var(--cp-d))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:17}}>💅</div>
            {theme?.studioName || 'Pinky Nail Studio'}
          </div>
          <p style={{fontSize:13,lineHeight:1.7,maxWidth:280}}>Nail studio especializado en diseños únicos y personalizados. Uñas que enamoran, experiencias que se recuerdan.</p>
        </div>
        <div>
          <h4 style={{fontSize:13,fontWeight:700,color:'#fff',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:16}}>Servicios</h4>
          <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:10}}>
            {['Semipermanente','Kapping','Softgel','Nail Art','Pedicura'].map(s=><li key={s}><a href="#servicios" style={{fontSize:13,color:'rgba(255,255,255,.65)',transition:'color .2s'}} onMouseEnter={e=>e.target.style.color='var(--blush)'} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,.65)'}>{s}</a></li>)}
          </ul>
        </div>
        <div>
          <h4 style={{fontSize:13,fontWeight:700,color:'#fff',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:16}}>Seguinos</h4>
          <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:10}}>
            <li><a href={`https://www.instagram.com/${ig}/`} target="_blank" rel="noreferrer" style={{fontSize:13,color:'rgba(255,255,255,.65)'}} onMouseEnter={e=>e.target.style.color='var(--blush)'} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,.65)'}>📸 Instagram</a></li>
            <li><a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" style={{fontSize:13,color:'rgba(255,255,255,.65)'}} onMouseEnter={e=>e.target.style.color='var(--blush)'} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,.65)'}>💬 WhatsApp</a></li>
            <li><a href="#contacto" style={{fontSize:13,color:'rgba(255,255,255,.65)'}} onMouseEnter={e=>e.target.style.color='var(--blush)'} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,.65)'}>📍 Ubicación</a></li>
            <li><a href="#precios" style={{fontSize:13,color:'rgba(255,255,255,.65)'}} onMouseEnter={e=>e.target.style.color='var(--blush)'} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,.65)'}>💰 Precios</a></li>
          </ul>
        </div>
      </div>
      <div style={{maxWidth:1200,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:28,fontSize:12,color:'rgba(255,255,255,.4)',flexWrap:'wrap',gap:8}}>
        <span>© 2025 {theme?.studioName || 'Pinky Nail Studio'} · {instagram || '@_pinkynailstudio'} · Todos los derechos reservados</span>
        <span>{theme?.footerTagline || 'Hecho con 💜 en Buenos Aires'}</span>
      </div>
      <style>{`@media(max-width:768px){.footer-inner{grid-template-columns:1fr!important;gap:32px!important}}`}</style>
    </footer>
  )
}

/* ══════════════════════════════════════════════════
   BOTÓN FLOTANTE WHATSAPP (solo mobile, arrastrable)
══════════════════════════════════════════════════ */
function WhatsAppFAB({ whatsapp, config }) {
  const wa = (whatsapp || '5491100000000').replace(/\D/g, '')
  const enabled = config?.enabled !== false
  const color = config?.color || '#25D366'
  const [pos, setPos] = useState(null)          // {left, top} tras arrastrar; null = esquina por defecto
  const elRef = useRef(null)
  const drag = useRef({ active:false, moved:false, startX:0, startY:0, offX:0, offY:0 })

  useEffect(() => {
    try { const s = localStorage.getItem('pinky-wa-pos'); if (s) setPos(JSON.parse(s)) } catch {}
  }, [])

  if (!enabled) return null

  const SIZE = 56, MARGIN = 14

  function onDown(e) {
    const r = elRef.current.getBoundingClientRect()
    drag.current = { active:true, moved:false, startX:e.clientX, startY:e.clientY, offX:e.clientX - r.left, offY:e.clientY - r.top }
    elRef.current.setPointerCapture(e.pointerId)
  }
  function onMove(e) {
    const d = drag.current
    if (!d.active) return
    if (Math.abs(e.clientX - d.startX) > 6 || Math.abs(e.clientY - d.startY) > 6) d.moved = true
    if (!d.moved) return
    const left = Math.max(MARGIN, Math.min(window.innerWidth  - SIZE - MARGIN, e.clientX - d.offX))
    const top  = Math.max(MARGIN, Math.min(window.innerHeight - SIZE - MARGIN, e.clientY - d.offY))
    setPos({ left, top })
  }
  function onUp() {
    const d = drag.current
    d.active = false
    if (d.moved) {
      const r = elRef.current.getBoundingClientRect()
      const p = { left:r.left, top:r.top }
      setPos(p)
      try { localStorage.setItem('pinky-wa-pos', JSON.stringify(p)) } catch {}
    } else {
      window.open(`https://wa.me/${wa}?text=Hola!%20Quiero%20reservar%20un%20turno%20%F0%9F%98%8A`, '_blank', 'noopener')
    }
  }

  return (
    <>
      <div ref={elRef} className="wa-fab" aria-label="Escribinos por WhatsApp"
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp}
        style={{position:'fixed',zIndex:60,width:SIZE,height:SIZE,borderRadius:'50%',background:color,
          color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',
          touchAction:'none',userSelect:'none',boxShadow:'0 6px 22px rgba(0,0,0,.28)',
          ...(pos ? {left:pos.left,top:pos.top} : {right:MARGIN,bottom:MARGIN})}}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
          <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.519 5.256l-.999 3.648 3.97-1.003zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
        </svg>
      </div>
      <style>{`@media(min-width:769px){.wa-fab{display:none!important}}`}</style>
    </>
  )
}

/* ══════════════════════════════════════════════════
   SITE — main export
══════════════════════════════════════════════════ */
export default function Site() {
  const { content, loading } = useContent()

  if (loading) return (
    <div style={{minHeight:'100dvh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'linear-gradient(145deg,var(--cp-50),#fff,var(--cp-r))'}}>
      <style>{`
        @keyframes ld-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.08);opacity:.85} }
        @keyframes ld-bar   { 0%{width:0%} 100%{width:100%} }
        @keyframes ld-dot   { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }
      `}</style>
      <div style={{width:96,height:96,borderRadius:'50%',overflow:'hidden',boxShadow:'0 8px 32px rgba(194,24,91,.25)',marginBottom:24,animation:'ld-pulse 2s ease-in-out infinite',border:'3px solid var(--blush)'}}>
        <img src="/logo.png" alt="Pinky" style={{width:'100%',height:'100%',objectFit:'cover'}} />
      </div>
      <p style={{fontSize:13,fontWeight:700,color:'var(--cp)',letterSpacing:'.08em',textTransform:'uppercase',marginBottom:20}}>Pinky Nail Studio</p>
      <div style={{width:160,height:3,background:'var(--cp-r)',borderRadius:99,overflow:'hidden'}}>
        <div style={{height:'100%',background:'linear-gradient(90deg,var(--cp),var(--cp-d))',borderRadius:99,animation:'ld-bar 1.4s ease-in-out infinite'}} />
      </div>
    </div>
  )

  const { hero, services, gallery, about, pricing, reviews, contact, theme, spotify } = content
  const wa = contact?.whatsapp
  const ig = contact?.instagram

  return (
    <>
      <Navbar studioName={theme?.studioName} whatsapp={wa} instagram={ig} />
      <Hero data={hero} whatsapp={wa} />
      <Services data={services} />
      <SpotifyBanner data={spotify} />
      <About data={about} instagram={ig} />
      <Gallery data={gallery} instagram={ig} />
      <Pricing data={pricing} whatsapp={wa} />
      <Reviews data={reviews} />
      <Contact data={contact} />
      <Footer theme={theme} instagram={ig} whatsapp={wa} />
      <WhatsAppFAB whatsapp={wa} config={contact?.floatWa} />
    </>
  )
}
