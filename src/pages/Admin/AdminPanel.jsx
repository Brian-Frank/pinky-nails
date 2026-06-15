import { useState, useEffect, useRef } from 'react'
import { supabase, uploadImage } from '../../lib/supabase'
import { useContent, DEFAULT_LAYOUT } from '../../context/ContentContext'

/* ── tiny helpers ──────────────────────────────────────────── */
const cls = (...a) => a.filter(Boolean).join(' ')

function Spinner() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--bg)' }}>
      <div className="a-spin" />
    </div>
  )
}

function SaveBtn({ saving, onClick }) {
  return (
    <button className="a-btn-primary" onClick={onClick} disabled={saving}>
      {saving ? 'Guardando…' : '💾 Guardar cambios'}
    </button>
  )
}

function ImgPicker({ value, onChange, folder = 'general', label = 'Imagen' }) {
  const [uploading, setUploading] = useState(false)
  const ref = useRef()
  async function pick(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file, folder)
      onChange(url)
    } catch (err) {
      alert('Error al subir imagen: ' + err.message)
    } finally {
      setUploading(false)
    }
  }
  return (
    <div className="a-img-picker">
      {value && <img src={value} alt={label} className="a-img-preview" />}
      <button type="button" className="a-btn-outline" onClick={() => ref.current.click()} disabled={uploading}>
        {uploading ? '⏳ Subiendo…' : `📷 ${label}`}
      </button>
      <input ref={ref} type="file" accept="image/*" style={{ display:'none' }} onChange={pick} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   LOGIN
═══════════════════════════════════════════════════════════ */
function Login({ onLogin }) {
  const [user, setUser]       = useState('')
  const [pass, setPass]       = useState('')
  const [showPass, setShowPass] = useState(false)
  const [err,  setErr]        = useState('')
  const [busy, setBusy]       = useState(false)
  const [focused, setFocused] = useState('')

  async function submit(e) {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.trim(), password: pass }),
      })
      const data = await res.json()
      if (!res.ok) { setErr(data.error || 'Credenciales incorrectas'); setBusy(false); return }
      sessionStorage.setItem('pinky-admin-token', data.token)
      onLogin()
    } catch {
      setErr('Error de conexión. Intentá de nuevo.')
    }
    setBusy(false)
  }

  return (
    <>
      <style>{LOGIN_CSS}</style>
      <div className="lg-wrap">
        {/* animated blobs */}
        <div className="lg-blob lg-blob1" />
        <div className="lg-blob lg-blob2" />
        <div className="lg-blob lg-blob3" />

        <div className="lg-card">
          {/* logo */}
          <div className="lg-logo-wrap">
            <img src="/logo.png" alt="Pinky Nail Studio" className="lg-logo" />
          </div>

          <div className="lg-header">
            <h1 className="lg-title">Panel Admin</h1>
            <p className="lg-sub">Ingresá para gestionar tu sitio</p>
          </div>

          <form onSubmit={submit} className="lg-form">
            {/* usuario */}
            <div className={`lg-input-wrap ${focused==='user'?'lg-input-wrap--focus':''} ${user?'lg-input-wrap--filled':''}`}>
              <span className="lg-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              <input
                className="lg-input"
                value={user}
                onChange={e=>setUser(e.target.value)}
                onFocus={()=>setFocused('user')}
                onBlur={()=>setFocused('')}
                autoFocus
                autoComplete="username"
              />
              <label className="lg-label">Usuario</label>
            </div>

            {/* contraseña */}
            <div className={`lg-input-wrap ${focused==='pass'?'lg-input-wrap--focus':''} ${pass?'lg-input-wrap--filled':''}`}>
              <span className="lg-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                className="lg-input"
                type={showPass ? 'text' : 'password'}
                value={pass}
                onChange={e=>setPass(e.target.value)}
                onFocus={()=>setFocused('pass')}
                onBlur={()=>setFocused('')}
                autoComplete="current-password"
              />
              <label className="lg-label">Contraseña</label>
              <button type="button" className="lg-eye" onClick={()=>setShowPass(!showPass)} tabIndex={-1}>
                {showPass
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>

            {err && (
              <div className="lg-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {err}
              </div>
            )}

            <button type="submit" className="lg-btn" disabled={busy}>
              {busy
                ? <><span className="lg-btn-spinner"/>Ingresando…</>
                : <>Ingresar <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>
              }
            </button>
          </form>

          <a href="/" className="lg-back">← Volver al sitio</a>
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════
   HERO EDITOR
═══════════════════════════════════════════════════════════ */
function HeroEditor() {
  const { content, updateSection } = useContent()
  const [d, setD]       = useState(content.hero)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try { await updateSection('hero', d) } catch(e) { alert(e.message) }
    setSaving(false)
  }

  function setStat(i, key, val) {
    const stats = d.stats.map((s, idx) => idx===i ? {...s,[key]:val} : s)
    setD({...d, stats})
  }
  function addStat()    { setD({...d, stats:[...d.stats, {num:'', label:''}]}) }
  function removeStat(i){ setD({...d, stats:d.stats.filter((_,idx)=>idx!==i)}) }

  return (
    <div className="a-section">
      <h2 className="a-section-title">🏠 Inicio</h2>

      <div className="a-field"><label>Badge</label>
        <input value={d.badge} onChange={e=>setD({...d,badge:e.target.value})} /></div>

      <div className="a-row">
        <div className="a-field"><label>Título</label>
          <input value={d.title} onChange={e=>setD({...d,title:e.target.value})} /></div>
        <div className="a-field"><label>Acento (color)</label>
          <input value={d.accent} onChange={e=>setD({...d,accent:e.target.value})} /></div>
      </div>

      <div className="a-field"><label>Subtítulo</label>
        <textarea rows={3} value={d.subtitle} onChange={e=>setD({...d,subtitle:e.target.value})} /></div>

      <div className="a-row">
        <div className="a-field"><label>Texto tarjeta flotante</label>
          <input value={d.floatCard1} onChange={e=>setD({...d,floatCard1:e.target.value})} /></div>
        <div className="a-field"><label>Color del círculo (verde=disponible, rojo=lleno/vacaciones)</label>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <input type="color" value={d.floatCard1Color || '#22c55e'} onChange={e=>setD({...d,floatCard1Color:e.target.value})}
              style={{width:48,height:40,border:'none',cursor:'pointer',background:'none'}} />
            <input value={d.floatCard1Color || '#22c55e'} onChange={e=>setD({...d,floatCard1Color:e.target.value})}
              style={{flex:1}} placeholder="#22c55e" />
          </div>
        </div>
      </div>

      <div className="a-field">
        <label>Imagen principal</label>
        <ImgPicker value={d.image} onChange={url=>setD({...d,image:url})} folder="hero" label="Cambiar imagen" />
      </div>

      <div className="a-field">
        <label>Estadísticas</label>
        {d.stats.map((s,i)=>(
          <div key={i} className="a-list-row">
            <input value={s.num}   onChange={e=>setStat(i,'num',e.target.value)}   placeholder="5+" style={{width:80}} />
            <input value={s.label} onChange={e=>setStat(i,'label',e.target.value)} placeholder="Años de exp." />
            <button className="a-btn-del" onClick={()=>removeStat(i)}>✕</button>
          </div>
        ))}
        <button className="a-btn-add" onClick={addStat}>+ Agregar estadística</button>
      </div>

      <SaveBtn saving={saving} onClick={save} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   SERVICES EDITOR
═══════════════════════════════════════════════════════════ */
function ServicesEditor() {
  const { content, updateSection } = useContent()
  const [items, setItems]   = useState(content.services)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try { await updateSection('services', items) } catch(e) { alert(e.message) }
    setSaving(false)
  }

  function update(i, key, val) {
    setItems(items.map((s,idx)=>idx===i?{...s,[key]:val}:s))
  }
  function add()    { setItems([...items,{icon:'💅',name:'',desc:''}]) }
  function remove(i){ setItems(items.filter((_,idx)=>idx!==i)) }

  return (
    <div className="a-section">
      <h2 className="a-section-title">💅 Servicios</h2>
      {items.map((s,i)=>(
        <div key={i} className="a-card-row">
          <div className="a-row">
            <div className="a-field" style={{flex:'0 0 70px'}}>
              <label>Emoji</label>
              <input value={s.icon} onChange={e=>update(i,'icon',e.target.value)} style={{textAlign:'center'}} />
            </div>
            <div className="a-field">
              <label>Nombre</label>
              <input value={s.name} onChange={e=>update(i,'name',e.target.value)} />
            </div>
          </div>
          <div className="a-field">
            <label>Descripción</label>
            <input value={s.desc} onChange={e=>update(i,'desc',e.target.value)} />
          </div>
          <button className="a-btn-del-block" onClick={()=>remove(i)}>✕ Eliminar</button>
        </div>
      ))}
      <button className="a-btn-add" onClick={add}>+ Agregar servicio</button>
      <SaveBtn saving={saving} onClick={save} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   GALLERY EDITOR
═══════════════════════════════════════════════════════════ */
function GalleryEditor() {
  const { content, updateSection } = useContent()
  const [items, setItems]   = useState(content.gallery)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try { await updateSection('gallery', items) } catch(e) { alert(e.message) }
    setSaving(false)
  }

  function update(i, key, val) {
    setItems(items.map((g,idx)=>idx===i?{...g,[key]:val}:g))
  }
  function add()    { setItems([...items,{image:'',label:''}]) }
  function remove(i){ setItems(items.filter((_,idx)=>idx!==i)) }

  return (
    <div className="a-section">
      <h2 className="a-section-title">📸 Galería</h2>
      <p className="a-hint">La primera foto ocupa el espacio doble en la galería.</p>
      <div className="a-gallery-grid">
        {items.map((g,i)=>(
          <div key={i} className="a-gallery-card">
            <ImgPicker
              value={g.image}
              onChange={url=>update(i,'image',url)}
              folder="gallery"
              label={i===0 ? 'Foto principal' : 'Foto'}
            />
            <input
              className="a-gallery-label"
              value={g.label}
              onChange={e=>update(i,'label',e.target.value)}
              placeholder="Etiqueta…"
            />
            <button className="a-btn-del-block" onClick={()=>remove(i)}>✕</button>
          </div>
        ))}
      </div>
      <button className="a-btn-add" onClick={add}>+ Agregar foto</button>
      <SaveBtn saving={saving} onClick={save} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   ABOUT EDITOR
═══════════════════════════════════════════════════════════ */
function AboutEditor() {
  const { content, updateSection } = useContent()
  const [d, setD]       = useState(content.about)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try { await updateSection('about', d) } catch(e) { alert(e.message) }
    setSaving(false)
  }

  function setPill(i, val) {
    const pills = d.pills.map((p,idx)=>idx===i?val:p)
    setD({...d,pills})
  }
  function addPill()    { setD({...d,pills:[...d.pills,'✅ ']}) }
  function removePill(i){ setD({...d,pills:d.pills.filter((_,idx)=>idx!==i)}) }

  function setPhoto(i, url) {
    const photos = d.photos.map((p,idx)=>idx===i?url:p)
    setD({...d,photos})
  }
  function addPhoto()    { setD({...d,photos:[...d.photos,'']}) }
  function removePhoto(i){ setD({...d,photos:d.photos.filter((_,idx)=>idx!==i)}) }

  return (
    <div className="a-section">
      <h2 className="a-section-title">🌸 Sobre mí</h2>

      <div className="a-row">
        <div className="a-field"><label>Título</label>
          <input value={d.title} onChange={e=>setD({...d,title:e.target.value})} /></div>
        <div className="a-field"><label>Acento (color)</label>
          <input value={d.accent} onChange={e=>setD({...d,accent:e.target.value})} /></div>
      </div>

      <div className="a-field"><label>Párrafo 1</label>
        <textarea rows={3} value={d.p1} onChange={e=>setD({...d,p1:e.target.value})} /></div>
      <div className="a-field"><label>Párrafo 2</label>
        <textarea rows={3} value={d.p2} onChange={e=>setD({...d,p2:e.target.value})} /></div>
      <div className="a-field"><label>Párrafo 3</label>
        <textarea rows={3} value={d.p3} onChange={e=>setD({...d,p3:e.target.value})} /></div>

      <div className="a-row">
        <div className="a-field"><label>Emoji tarjeta "Hecho con amor"</label>
          <input value={d.loveEmoji ?? '💜'} onChange={e=>setD({...d,loveEmoji:e.target.value})} maxLength={4} /></div>
        <div className="a-field"><label>Texto tarjeta</label>
          <input value={d.loveText ?? 'Hecho con amor'} onChange={e=>setD({...d,loveText:e.target.value})} /></div>
      </div>

      <div className="a-field">
        <label>Etiquetas / Pills</label>
        {d.pills.map((p,i)=>(
          <div key={i} className="a-list-row">
            <input value={p} onChange={e=>setPill(i,e.target.value)} />
            <button className="a-btn-del" onClick={()=>removePill(i)}>✕</button>
          </div>
        ))}
        <button className="a-btn-add" onClick={addPill}>+ Agregar etiqueta</button>
      </div>

      <div className="a-field">
        <label>Fotos</label>
        <div className="a-gallery-grid">
          {d.photos.map((p,i)=>(
            <div key={i} className="a-gallery-card">
              <ImgPicker value={p} onChange={url=>setPhoto(i,url)} folder="about" label="Foto" />
              <button className="a-btn-del-block" onClick={()=>removePhoto(i)}>✕</button>
            </div>
          ))}
        </div>
        <button className="a-btn-add" onClick={addPhoto}>+ Agregar foto</button>
      </div>

      <SaveBtn saving={saving} onClick={save} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   PRICING EDITOR
═══════════════════════════════════════════════════════════ */
function PricingEditor() {
  const { content, updateSection } = useContent()
  const [cats, setCats]   = useState(content.pricing)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try { await updateSection('pricing', cats) } catch(e) { alert(e.message) }
    setSaving(false)
  }

  function setCatName(ci, val) {
    setCats(cats.map((c,i)=>i===ci?{...c,category:val}:c))
  }
  function removeCategory(ci) {
    setCats(cats.filter((_,i)=>i!==ci))
  }
  function addCategory() {
    setCats([...cats,{category:'🆕 Nueva categoría',items:[]}])
  }

  function setItem(ci, ii, key, val) {
    setCats(cats.map((c,i)=>{
      if(i!==ci) return c
      const items = c.items.map((it,j)=>j===ii?{...it,[key]:val}:it)
      return {...c,items}
    }))
  }
  function addItem(ci) {
    setCats(cats.map((c,i)=>i===ci?{...c,items:[...c.items,{name:'',desc:'',price:''}]}:c))
  }
  function removeItem(ci,ii) {
    setCats(cats.map((c,i)=>i===ci?{...c,items:c.items.filter((_,j)=>j!==ii)}:c))
  }

  return (
    <div className="a-section">
      <h2 className="a-section-title">💰 Precios</h2>

      {cats.map((cat,ci)=>(
        <div key={ci} className="a-price-cat">
          <div className="a-price-cat-header">
            <input
              className="a-price-cat-name"
              value={cat.category}
              onChange={e=>setCatName(ci,e.target.value)}
            />
            <button className="a-btn-del" onClick={()=>removeCategory(ci)}>✕ Cat.</button>
          </div>

          {cat.items.map((it,ii)=>(
            <div key={ii} className="a-price-item-row">
              <div className="a-field" style={{flex:2}}>
                <label>Nombre</label>
                <input value={it.name} onChange={e=>setItem(ci,ii,'name',e.target.value)} />
              </div>
              <div className="a-field" style={{flex:2}}>
                <label>Descripción</label>
                <input value={it.desc} onChange={e=>setItem(ci,ii,'desc',e.target.value)} placeholder="Opcional" />
              </div>
              <div className="a-field" style={{flex:'0 0 120px'}}>
                <label>Precio</label>
                <input value={it.price} onChange={e=>setItem(ci,ii,'price',e.target.value)} placeholder="$0.000" />
              </div>
              <button className="a-btn-del" style={{alignSelf:'flex-end',marginBottom:4}} onClick={()=>removeItem(ci,ii)}>✕</button>
            </div>
          ))}

          <button className="a-btn-add" onClick={()=>addItem(ci)}>+ Agregar ítem</button>
        </div>
      ))}

      <button className="a-btn-add a-btn-add-cat" onClick={addCategory}>+ Nueva categoría</button>
      <SaveBtn saving={saving} onClick={save} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   REVIEWS EDITOR
═══════════════════════════════════════════════════════════ */
function ReviewsEditor() {
  const { content, updateSection } = useContent()
  const [items, setItems]   = useState(content.reviews)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try { await updateSection('reviews', items) } catch(e) { alert(e.message) }
    setSaving(false)
  }

  function update(i, key, val) {
    setItems(items.map((r,idx)=>idx===i?{...r,[key]:val}:r))
  }
  function add()    { setItems([...items,{stars:5,text:'"…"',avatar:'👩',name:'',date:''}]) }
  function remove(i){ setItems(items.filter((_,idx)=>idx!==i)) }

  return (
    <div className="a-section">
      <h2 className="a-section-title">⭐ Reseñas</h2>
      {items.map((r,i)=>(
        <div key={i} className="a-card-row">
          <div className="a-row">
            <div className="a-field" style={{flex:'0 0 70px'}}>
              <label>Avatar</label>
              <input value={r.avatar} onChange={e=>update(i,'avatar',e.target.value)} style={{textAlign:'center'}} />
            </div>
            <div className="a-field">
              <label>Nombre</label>
              <input value={r.name} onChange={e=>update(i,'name',e.target.value)} />
            </div>
            <div className="a-field" style={{flex:'0 0 100px'}}>
              <label>Estrellas</label>
              <select value={r.stars} onChange={e=>update(i,'stars',Number(e.target.value))}>
                {[1,2,3,4,5].map(n=><option key={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div className="a-field">
            <label>Reseña</label>
            <textarea rows={2} value={r.text} onChange={e=>update(i,'text',e.target.value)} />
          </div>
          <div className="a-field">
            <label>Fecha / Tiempo</label>
            <input value={r.date} onChange={e=>update(i,'date',e.target.value)} placeholder="hace 2 semanas" />
          </div>
          <button className="a-btn-del-block" onClick={()=>remove(i)}>✕ Eliminar</button>
        </div>
      ))}
      <button className="a-btn-add" onClick={add}>+ Agregar reseña</button>
      <SaveBtn saving={saving} onClick={save} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   CONTACT EDITOR
═══════════════════════════════════════════════════════════ */
function ContactEditor() {
  const { content, updateSection } = useContent()
  const [d, setD]       = useState(content.contact)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try { await updateSection('contact', d) } catch(e) { alert(e.message) }
    setSaving(false)
  }

  return (
    <div className="a-section">
      <h2 className="a-section-title">📞 Contacto</h2>

      <div className="a-row">
        <div className="a-field">
          <label>WhatsApp (solo números)</label>
          <input value={d.whatsapp} onChange={e=>setD({...d,whatsapp:e.target.value})} placeholder="5491100000000" />
        </div>
        <div className="a-field">
          <label>Instagram</label>
          <input value={d.instagram} onChange={e=>setD({...d,instagram:e.target.value})} placeholder="@usuario" />
        </div>
      </div>

      <div className="a-field">
        <label>Ubicación</label>
        <textarea rows={2} value={d.location} onChange={e=>setD({...d,location:e.target.value})} />
      </div>

      <div className="a-field">
        <label>Horarios</label>
        <input value={d.hours} onChange={e=>setD({...d,hours:e.target.value})} />
      </div>

      <div className="a-field">
        <label>Título del CTA</label>
        <input value={d.ctaTitle} onChange={e=>setD({...d,ctaTitle:e.target.value})} />
      </div>

      <div className="a-field">
        <label>Texto del CTA</label>
        <textarea rows={3} value={d.ctaText} onChange={e=>setD({...d,ctaText:e.target.value})} />
      </div>

      <div className="a-field">
        <label>Tiempo de respuesta</label>
        <input value={d.replyTime} onChange={e=>setD({...d,replyTime:e.target.value})} />
      </div>

      <div className="a-row">
        <div className="a-field">
          <label>Botón flotante de WhatsApp (solo mobile)</label>
          <label style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',fontWeight:500,padding:'10px 0'}}>
            <input type="checkbox"
              checked={(d.floatWa?.enabled) !== false}
              onChange={e=>setD({...d, floatWa:{...(d.floatWa||{color:'#25D366'}), enabled:e.target.checked}})}
              style={{width:18,height:18,cursor:'pointer'}} />
            Mostrar el botón flotante
          </label>
        </div>
        <div className="a-field">
          <label>Color del botón</label>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <input type="color" value={d.floatWa?.color || '#25D366'}
              onChange={e=>setD({...d, floatWa:{...(d.floatWa||{enabled:true}), color:e.target.value}})}
              style={{width:48,height:40,border:'none',cursor:'pointer',background:'none'}} />
            <input value={d.floatWa?.color || '#25D366'}
              onChange={e=>setD({...d, floatWa:{...(d.floatWa||{enabled:true}), color:e.target.value}})}
              style={{flex:1}} placeholder="#25D366" />
          </div>
        </div>
      </div>

      <SaveBtn saving={saving} onClick={save} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   APPEARANCE EDITOR
═══════════════════════════════════════════════════════════ */
function AppearanceEditor() {
  const { content, updateSection } = useContent()
  const [d, setD]       = useState(content.theme)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try { await updateSection('theme', d) } catch(e) { alert(e.message) }
    setSaving(false)
  }

  return (
    <div className="a-section">
      <h2 className="a-section-title">🎨 Apariencia</h2>

      <div className="a-field">
        <label>Nombre del estudio</label>
        <input value={d.studioName} onChange={e=>setD({...d,studioName:e.target.value})} />
      </div>

      <div className="a-field">
        <label>Tagline del footer</label>
        <input value={d.footerTagline} onChange={e=>setD({...d,footerTagline:e.target.value})} />
      </div>

      <div className="a-row">
        <div className="a-field">
          <label>Color primario</label>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <input type="color" value={d.primaryColor} onChange={e=>setD({...d,primaryColor:e.target.value})}
              style={{width:48,height:40,border:'none',cursor:'pointer',background:'none'}} />
            <input value={d.primaryColor} onChange={e=>setD({...d,primaryColor:e.target.value})}
              style={{flex:1}} placeholder="#C2185B" />
          </div>
        </div>
        <div className="a-field">
          <label>Color oscuro (hover)</label>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <input type="color" value={d.darkColor} onChange={e=>setD({...d,darkColor:e.target.value})}
              style={{width:48,height:40,border:'none',cursor:'pointer',background:'none'}} />
            <input value={d.darkColor} onChange={e=>setD({...d,darkColor:e.target.value})}
              style={{flex:1}} placeholder="#880E4F" />
          </div>
        </div>
        <div className="a-field">
          <label>Color suave (fondos)</label>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <input type="color" value={d.softColor} onChange={e=>setD({...d,softColor:e.target.value})}
              style={{width:48,height:40,border:'none',cursor:'pointer',background:'none'}} />
            <input value={d.softColor} onChange={e=>setD({...d,softColor:e.target.value})}
              style={{flex:1}} placeholder="#FCE4EC" />
          </div>
        </div>
      </div>

      <div className="a-color-preview" style={{
        background:`linear-gradient(135deg, ${d.primaryColor}, ${d.darkColor})`,
        borderRadius:12, padding:'24px', color:'#fff', marginTop:8,
        display:'flex', alignItems:'center', gap:16,
      }}>
        <span style={{fontSize:32}}>💅</span>
        <div>
          <div style={{fontWeight:700,fontSize:18}}>{d.studioName}</div>
          <div style={{opacity:.85,fontSize:14}}>Vista previa del color</div>
        </div>
        <div style={{marginLeft:'auto',background:d.softColor,color:d.primaryColor,
          borderRadius:8,padding:'6px 16px',fontWeight:600,fontSize:13}}>
          Soft
        </div>
      </div>

      <SaveBtn saving={saving} onClick={save} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   SPOTIFY EDITOR
═══════════════════════════════════════════════════════════ */
function SpotifyEditor() {
  const { content, updateSection } = useContent()
  const [d, setD] = useState({
    bgColor:'#FCE4EC', accentColor:'#C2185B', textColor:'#2D1B2E',
    ...(content.spotify || {}),
  })
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try { await updateSection('spotify', d) } catch(e) { alert(e.message) }
    setSaving(false)
  }

  function colorField(label, key, placeholder) {
    return (
      <div className="a-field">
        <label>{label}</label>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <input type="color" value={d[key]} onChange={e=>setD({...d,[key]:e.target.value})}
            style={{width:48,height:40,border:'none',cursor:'pointer',background:'none'}} />
          <input value={d[key]} onChange={e=>setD({...d,[key]:e.target.value})}
            style={{flex:1}} placeholder={placeholder} />
        </div>
      </div>
    )
  }

  return (
    <div className="a-section">
      <h2 className="a-section-title">🎵 Spotify Banner</h2>

      <div className="a-field">
        <label>Frase del banner</label>
        <input value={d.text} onChange={e=>setD({...d,text:e.target.value})} placeholder="¿Querés saber qué canciones se escuchan en Pinky? 🎵" />
      </div>

      <div className="a-field">
        <label>Link de Spotify (playlist o perfil)</label>
        <input value={d.url} onChange={e=>setD({...d,url:e.target.value})} placeholder="https://open.spotify.com/playlist/..." />
      </div>

      <div className="a-row">
        {colorField('Color de fondo',  'bgColor',     '#FCE4EC')}
        {colorField('Color de acento', 'accentColor', '#C2185B')}
        {colorField('Color del texto', 'textColor',   '#2D1B2E')}
      </div>

      {/* Preview en tiempo real */}
      <div style={{background:d.bgColor,borderRadius:12,padding:'20px 24px',border:`2px solid ${d.accentColor}33`,display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,marginTop:8,flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill={d.accentColor} style={{flexShrink:0}}>
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.516 17.312a.75.75 0 01-1.032.249c-2.827-1.727-6.387-2.117-10.58-1.159a.75.75 0 01-.334-1.463c4.588-1.048 8.523-.597 11.697 1.34a.75.75 0 01.249 1.033zm1.472-3.27a.937.937 0 01-1.288.308c-3.234-1.988-8.164-2.564-11.99-1.404a.937.937 0 01-.543-1.79c4.37-1.326 9.8-.683 13.514 1.6a.937.937 0 01.307 1.286zm.127-3.408C15.32 8.39 9.374 8.2 5.595 9.348a1.125 1.125 0 01-.652-2.151c4.32-1.31 11.5-1.057 16.038 1.605a1.125 1.125 0 01-1.116 1.832z"/>
          </svg>
          <span style={{fontSize:14,fontWeight:700,color:d.textColor}}>{d.text || 'Frase del banner...'}</span>
        </div>
        <div style={{background:d.accentColor,color:'#fff',borderRadius:99,padding:'8px 18px',fontSize:12,fontWeight:800,flexShrink:0}}>
          Escuchar playlist →
        </div>
      </div>

      <SaveBtn saving={saving} onClick={save} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   PINTEREST EDITOR
═══════════════════════════════════════════════════════════ */
function PinterestEditor() {
  const { content, updateSection } = useContent()
  const [d, setD] = useState({
    bgColor:'#FFF0F5', accentColor:'#E60023', textColor:'#2D1B2E',
    ...(content.pinterest || {}),
  })
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try { await updateSection('pinterest', d) } catch(e) { alert(e.message) }
    setSaving(false)
  }

  function colorField(label, key, placeholder) {
    return (
      <div className="a-field">
        <label>{label}</label>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <input type="color" value={d[key]} onChange={e=>setD({...d,[key]:e.target.value})}
            style={{width:48,height:40,border:'none',cursor:'pointer',background:'none'}} />
          <input value={d[key]} onChange={e=>setD({...d,[key]:e.target.value})}
            style={{flex:1}} placeholder={placeholder} />
        </div>
      </div>
    )
  }

  return (
    <div className="a-section">
      <h2 className="a-section-title">📌 Pinterest Banner</h2>

      <div className="a-field">
        <label>Frase del banner</label>
        <input value={d.text} onChange={e=>setD({...d,text:e.target.value})} placeholder="¿No sabés qué diseño hacerte? Acá te dejo ideas de Pinterest 📌" />
      </div>

      <div className="a-field">
        <label>Link de Pinterest (tablero o perfil)</label>
        <input value={d.url} onChange={e=>setD({...d,url:e.target.value})} placeholder="https://pin.it/..." />
      </div>

      <div className="a-row">
        {colorField('Color de fondo',  'bgColor',     '#FFF0F5')}
        {colorField('Color de acento', 'accentColor', '#E60023')}
        {colorField('Color del texto', 'textColor',   '#2D1B2E')}
      </div>

      {/* Preview en tiempo real */}
      <div style={{background:d.bgColor,borderRadius:12,padding:'20px 24px',border:`2px solid ${d.accentColor}33`,display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,marginTop:8,flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill={d.accentColor} style={{flexShrink:0}}>
            <path d="M12 0C5.373 0 0 5.372 0 12c0 4.873 2.873 9.064 7.012 10.945-.097-.93-.184-2.357.038-3.374.2-.92 1.292-5.857 1.292-5.857s-.33-.66-.33-1.633c0-1.53.888-2.673 1.992-2.673.94 0 1.392.705 1.392 1.55 0 .944-.6 2.357-.91 3.667-.26 1.096.55 1.99 1.63 1.99 1.957 0 3.46-2.063 3.46-5.04 0-2.635-1.893-4.477-4.597-4.477-3.13 0-4.967 2.348-4.967 4.775 0 .945.364 1.96.82 2.51.09.11.103.207.077.318-.084.35-.27 1.096-.306 1.25-.048.2-.157.244-.362.147-1.35-.628-2.193-2.602-2.193-4.187 0-3.408 2.476-6.54 7.14-6.54 3.75 0 6.664 2.672 6.664 6.243 0 3.725-2.35 6.722-5.61 6.722-1.095 0-2.126-.57-2.478-1.243l-.674 2.572c-.244.94-.904 2.117-1.346 2.835C9.864 23.815 10.913 24 12 24c6.627 0 12-5.373 12-12C24 5.372 18.627 0 12 0z"/>
          </svg>
          <span style={{fontSize:14,fontWeight:700,color:d.textColor}}>{d.text || 'Frase del banner...'}</span>
        </div>
        <div style={{background:d.accentColor,color:'#fff',borderRadius:99,padding:'8px 18px',fontSize:12,fontWeight:800,flexShrink:0}}>
          Ver ideas en Pinterest →
        </div>
      </div>

      <SaveBtn saving={saving} onClick={save} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   LAYOUT / SECCIONES (reordenar + secciones personalizadas)
═══════════════════════════════════════════════════════════ */
const SECTION_LABELS = {
  hero:'🏠 Inicio', services:'💅 Servicios', spotify:'🎵 Spotify',
  about:'🌸 Sobre mí', pinterest:'📌 Pinterest', gallery:'📸 Galería',
  pricing:'💰 Precios', reviews:'⭐ Reseñas', contact:'📞 Contacto',
}

function LayoutEditor() {
  const { content, updateSection } = useContent()
  const [layout, setLayout] = useState(() =>
    (Array.isArray(content.layout) && content.layout.length) ? [...content.layout] : [...DEFAULT_LAYOUT])
  const [custom, setCustom] = useState(() => {
    const c = {}
    Object.keys(content).forEach(k => { if (k.startsWith('custom-')) c[k] = { ...content[k] } })
    return c
  })
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  function move(i, dir) {
    const j = i + dir
    if (j < 0 || j >= layout.length) return
    const nl = [...layout]
    ;[nl[i], nl[j]] = [nl[j], nl[i]]
    setLayout(nl)
  }
  function addCustom() {
    const id = 'custom-' + Math.random().toString(36).slice(2, 8)
    setCustom({ ...custom, [id]: {
      badge:'', title:'Nueva sección', accent:'', text:'Escribí acá el contenido de tu nueva sección.',
      image:'', buttonText:'', buttonUrl:'', bgColor:'#FFF0F5', textColor:'#2D1B2E', accentColor:'#C2185B',
    } })
    setLayout([...layout, id])
    setEditing(id)
  }
  function removeCustom(id) {
    if (!confirm('¿Borrar esta sección personalizada?')) return
    setLayout(layout.filter(k => k !== id))
    const c = { ...custom }; delete c[id]; setCustom(c)
    if (editing === id) setEditing(null)
  }
  function setField(id, f, v) { setCustom({ ...custom, [id]: { ...custom[id], [f]: v } }) }

  async function save() {
    setSaving(true)
    try {
      for (const id of layout) {
        if (id.startsWith('custom-') && custom[id]) await updateSection(id, custom[id])
      }
      await updateSection('layout', layout)
      alert('¡Orden y secciones guardados!')
    } catch (e) { alert(e.message) }
    setSaving(false)
  }

  function labelFor(key) {
    if (SECTION_LABELS[key]) return SECTION_LABELS[key]
    if (key.startsWith('custom-')) return '🧩 ' + (custom[key]?.title || 'Sección personalizada')
    return key
  }
  function colorInput(label, id, key, ph) {
    return (
      <div className="a-field"><label>{label}</label>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <input type="color" value={custom[id][key] || ph} onChange={e=>setField(id,key,e.target.value)}
            style={{width:48,height:40,border:'none',cursor:'pointer',background:'none'}} />
          <input value={custom[id][key] || ''} onChange={e=>setField(id,key,e.target.value)} style={{flex:1}} placeholder={ph} />
        </div>
      </div>
    )
  }

  return (
    <div className="a-section">
      <h2 className="a-section-title">🧩 Secciones y orden</h2>
      <p style={{color:'var(--text-lt)',fontSize:13,marginBottom:16,lineHeight:1.6}}>
        Cambiá el orden con ↑/↓ — se refleja igual en la página. Podés crear secciones nuevas personalizadas y editar sus textos, colores y botón.
      </p>

      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {layout.map((key, i) => {
          const isCustom = key.startsWith('custom-')
          return (
            <div key={key} style={{border:'1.5px solid var(--border)',borderRadius:10,overflow:'hidden'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 12px',background:'#fff'}}>
                <span style={{fontWeight:700,color:'var(--text-lt)',minWidth:22,textAlign:'center'}}>{i+1}</span>
                <span style={{flex:1,fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{labelFor(key)}</span>
                {isCustom && <button className="a-btn-outline" style={{padding:'5px 12px',fontSize:12}} onClick={()=>setEditing(editing===key?null:key)}>{editing===key?'Cerrar':'✎ Editar'}</button>}
                <button className="a-btn-outline" style={{padding:'5px 11px'}} disabled={i===0} onClick={()=>move(i,-1)}>↑</button>
                <button className="a-btn-outline" style={{padding:'5px 11px'}} disabled={i===layout.length-1} onClick={()=>move(i,1)}>↓</button>
                {isCustom && <button className="a-btn-del" onClick={()=>removeCustom(key)}>✕</button>}
              </div>
              {isCustom && editing===key && (
                <div style={{padding:'14px',borderTop:'1px solid var(--border)',background:'var(--bg)',display:'flex',flexDirection:'column',gap:12}}>
                  <div className="a-field"><label>Insignia / badge (opcional)</label>
                    <input value={custom[key].badge||''} onChange={e=>setField(key,'badge',e.target.value)} placeholder="✨ Novedad" /></div>
                  <div className="a-row">
                    <div className="a-field"><label>Título</label>
                      <input value={custom[key].title||''} onChange={e=>setField(key,'title',e.target.value)} /></div>
                    <div className="a-field"><label>Palabra destacada (color acento)</label>
                      <input value={custom[key].accent||''} onChange={e=>setField(key,'accent',e.target.value)} placeholder="opcional" /></div>
                  </div>
                  <div className="a-field"><label>Texto</label>
                    <textarea rows={3} value={custom[key].text||''} onChange={e=>setField(key,'text',e.target.value)} /></div>
                  <div className="a-field"><label>Imagen (opcional)</label>
                    <ImgPicker value={custom[key].image} onChange={url=>setField(key,'image',url)} folder="custom" label="Subir imagen" /></div>
                  <div className="a-row">
                    <div className="a-field"><label>Texto del botón (opcional)</label>
                      <input value={custom[key].buttonText||''} onChange={e=>setField(key,'buttonText',e.target.value)} placeholder="Reservar →" /></div>
                    <div className="a-field"><label>Link del botón</label>
                      <input value={custom[key].buttonUrl||''} onChange={e=>setField(key,'buttonUrl',e.target.value)} placeholder="https://..." /></div>
                  </div>
                  <div className="a-row">
                    {colorInput('Fondo', key, 'bgColor', '#FFF0F5')}
                    {colorInput('Texto', key, 'textColor', '#2D1B2E')}
                    {colorInput('Acento', key, 'accentColor', '#C2185B')}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button className="a-btn-add" onClick={addCustom} style={{marginTop:14}}>+ Agregar sección personalizada</button>

      <div style={{marginTop:22}}><SaveBtn saving={saving} onClick={save} /></div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   MAIN ADMIN PANEL
═══════════════════════════════════════════════════════════ */
const TABS = [
  { id:'hero',       label:'🏠 Inicio' },
  { id:'services',   label:'💅 Servicios' },
  { id:'gallery',    label:'📸 Galería' },
  { id:'about',      label:'🌸 Sobre mí' },
  { id:'pricing',    label:'💰 Precios' },
  { id:'reviews',    label:'⭐ Reseñas' },
  { id:'contact',    label:'📞 Contacto' },
  { id:'appearance', label:'🎨 Apariencia' },
  { id:'spotify',    label:'🎵 Spotify' },
  { id:'pinterest',  label:'📌 Pinterest' },
  { id:'layout',     label:'🧩 Secciones' },
]

export default function AdminPanel() {
  const [session, setSession] = useState(null)
  const [checking, setChecking] = useState(true)
  const [activeTab, setActiveTab] = useState('hero')
  const [menuOpen, setMenuOpen] = useState(false)

  /* Check existing session via /api/verify */
  useEffect(() => {
    const token = sessionStorage.getItem('pinky-admin-token')
    if (!token) { setChecking(false); return }
    fetch('/api/verify', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.ok) setSession(true) })
      .catch(() => {})
      .finally(() => setChecking(false))
  }, [])

  function logout() {
    sessionStorage.removeItem('pinky-admin-token')
    setSession(null)
  }

  if (checking) return <Spinner />
  if (!session)  return <Login onLogin={() => setSession(true)} />

  const tabContent = {
    hero:       <HeroEditor />,
    services:   <ServicesEditor />,
    gallery:    <GalleryEditor />,
    about:      <AboutEditor />,
    pricing:    <PricingEditor />,
    reviews:    <ReviewsEditor />,
    contact:    <ContactEditor />,
    appearance: <AppearanceEditor />,
    spotify:    <SpotifyEditor />,
    pinterest:  <PinterestEditor />,
    layout:     <LayoutEditor />,
  }

  return (
    <>
      <style>{ADMIN_CSS}</style>
      <div className="a-wrap">
        {/* ── Sidebar ── */}
        <aside className={cls('a-sidebar', menuOpen && 'a-sidebar--open')}>
          <div className="a-sidebar-logo">
            <span>💅</span>
            <span>Pinky Admin</span>
          </div>
          <nav className="a-nav">
            {TABS.map(t => (
              <button
                key={t.id}
                className={cls('a-nav-item', activeTab===t.id && 'a-nav-item--active')}
                onClick={() => { setActiveTab(t.id); setMenuOpen(false) }}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <div className="a-sidebar-footer">
            <a href="/" target="_blank" rel="noreferrer" className="a-btn-outline" style={{width:'100%',textAlign:'center',marginBottom:8}}>
              👁 Ver sitio
            </a>
            <button className="a-btn-ghost" onClick={logout} style={{width:'100%'}}>
              🚪 Salir
            </button>
          </div>
        </aside>

        {/* ── Mobile header ── */}
        <header className="a-mobile-header">
          <button className="a-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? '✕' : '☰'}
          </button>
          <span className="a-mobile-title">💅 Pinky Admin</span>
          <button className="a-btn-ghost" onClick={logout} style={{fontSize:13}}>Salir</button>
        </header>

        {/* ── Main ── */}
        <main className="a-main">
          {tabContent[activeTab]}
        </main>

        {/* ── Mobile overlay ── */}
        {menuOpen && <div className="a-overlay" onClick={() => setMenuOpen(false)} />}
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════
   LOGIN STYLES (scoped via .lg- prefix)
═══════════════════════════════════════════════════════════ */
const LOGIN_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .lg-wrap {
    min-height: 100vh;
    background: #0f0414;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    position: relative;
    overflow: hidden;
    font-family: 'Montserrat', sans-serif;
  }

  /* animated blobs */
  .lg-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.35;
    animation: lg-float 8s ease-in-out infinite;
  }
  .lg-blob1 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, #e91e8c, #880E4F);
    top: -160px; left: -140px;
    animation-delay: 0s;
  }
  .lg-blob2 {
    width: 400px; height: 400px;
    background: radial-gradient(circle, #C2185B, #4a0030);
    bottom: -120px; right: -100px;
    animation-delay: -3s;
  }
  .lg-blob3 {
    width: 260px; height: 260px;
    background: radial-gradient(circle, #ff6ec7, #C2185B);
    top: 50%; left: 55%;
    transform: translate(-50%,-50%);
    animation-delay: -5s;
    opacity: 0.18;
  }
  @keyframes lg-float {
    0%, 100% { transform: translateY(0) scale(1); }
    50%       { transform: translateY(-30px) scale(1.06); }
  }

  /* card */
  .lg-card {
    position: relative;
    width: 100%;
    max-width: 420px;
    background: rgba(255,255,255,0.055);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 28px;
    padding: 44px 40px 36px;
    box-shadow: 0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15);
    text-align: center;
    z-index: 1;
  }
  @media (max-width: 480px) {
    .lg-card { padding: 36px 24px 28px; }
  }

  /* logo */
  .lg-logo-wrap {
    width: 100px;
    height: 100px;
    margin: 0 auto 24px;
    border-radius: 50%;
    background: rgba(255,255,255,0.08);
    border: 1.5px solid rgba(255,255,255,0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(194,24,91,0.4);
  }
  .lg-logo {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }

  /* header */
  .lg-title {
    font-size: 26px;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.5px;
    margin-bottom: 6px;
  }
  .lg-sub {
    font-size: 13.5px;
    color: rgba(255,255,255,0.5);
    margin-bottom: 32px;
    font-weight: 400;
  }

  /* form */
  .lg-form {
    display: flex;
    flex-direction: column;
    gap: 14px;
    text-align: left;
  }

  /* floating label input */
  .lg-input-wrap {
    position: relative;
    background: rgba(255,255,255,0.07);
    border: 1.5px solid rgba(255,255,255,0.1);
    border-radius: 14px;
    transition: border .2s, background .2s, box-shadow .2s;
  }
  .lg-input-wrap--focus {
    border-color: #e91e8c;
    background: rgba(255,255,255,0.1);
    box-shadow: 0 0 0 3px rgba(233,30,140,0.2);
  }
  .lg-input-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255,255,255,0.35);
    display: flex;
    align-items: center;
    pointer-events: none;
    transition: color .2s;
  }
  .lg-input-wrap--focus .lg-input-icon { color: #e91e8c; }

  .lg-input {
    width: 100%;
    background: transparent;
    border: none;
    outline: none;
    padding: 20px 44px 8px 42px;
    font-size: 15px;
    font-weight: 500;
    color: #fff;
    font-family: 'Montserrat', sans-serif;
    border-radius: 14px;
  }
  .lg-input::placeholder { color: transparent; }
  .lg-input:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 40px #1a0a1e inset;
    -webkit-text-fill-color: #fff;
  }

  .lg-label {
    position: absolute;
    left: 42px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    color: rgba(255,255,255,0.4);
    pointer-events: none;
    transition: all .2s;
    font-weight: 500;
  }
  .lg-input-wrap--focus .lg-label,
  .lg-input-wrap--filled .lg-label {
    top: 10px;
    transform: translateY(0);
    font-size: 10.5px;
    color: #e91e8c;
    font-weight: 600;
    letter-spacing: .04em;
    text-transform: uppercase;
  }

  .lg-eye {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: rgba(255,255,255,0.35);
    display: flex;
    align-items: center;
    padding: 4px;
    transition: color .2s;
  }
  .lg-eye:hover { color: rgba(255,255,255,0.7); }

  /* error */
  .lg-error {
    background: rgba(229,62,62,0.15);
    border: 1px solid rgba(229,62,62,0.35);
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 13px;
    color: #fc8181;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* submit button */
  .lg-btn {
    margin-top: 4px;
    width: 100%;
    padding: 15px 24px;
    background: #e91e8c;
    color: #fff;
    border: none;
    border-radius: 14px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: opacity .2s, transform .2s, box-shadow .2s;
    box-shadow: 0 8px 32px rgba(233,30,140,0.4);
    font-family: 'Montserrat', sans-serif;
    letter-spacing: .01em;
  }
  .lg-btn:hover:not(:disabled) {
    opacity: .92;
    transform: translateY(-2px);
    box-shadow: 0 14px 40px rgba(233,30,140,0.5);
  }
  .lg-btn:active:not(:disabled) { transform: translateY(0); }
  .lg-btn:disabled { opacity: .6; cursor: not-allowed; }

  .lg-btn-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: lg-spin .65s linear infinite;
    flex-shrink: 0;
  }
  @keyframes lg-spin { to { transform: rotate(360deg); } }

  /* back link */
  .lg-back {
    display: inline-block;
    margin-top: 24px;
    font-size: 13px;
    color: rgba(255,255,255,0.35);
    text-decoration: none;
    transition: color .2s;
    font-family: 'Montserrat', sans-serif;
  }
  .lg-back:hover { color: rgba(255,255,255,0.7); }
`

/* ═══════════════════════════════════════════════════════════
   ADMIN STYLES (scoped via .a- prefix)
═══════════════════════════════════════════════════════════ */
const ADMIN_CSS = `
  /* reset for admin scope */
  .a-wrap { display:flex; min-height:100vh; background:#F7F1F9; font-family:var(--font); }

  /* ── spinner ── */
  .a-spin {
    width:40px; height:40px; border:4px solid var(--cp-r);
    border-top-color:var(--cp); border-radius:50%;
    animation:a-spin .7s linear infinite;
  }
  @keyframes a-spin { to { transform:rotate(360deg) } }

  /* ── login (kept empty — Login has its own LOGIN_CSS) ── */

  /* ── sidebar ── */
  .a-sidebar {
    width:240px; background:#fff; border-right:1px solid var(--border);
    display:flex; flex-direction:column; position:sticky; top:0; height:100vh;
    overflow-y:auto; flex-shrink:0; z-index:100;
  }
  .a-sidebar-logo {
    display:flex; align-items:center; gap:10px;
    padding:24px 20px 16px; font-size:17px; font-weight:800;
    color:var(--cp); border-bottom:1px solid var(--border);
  }
  .a-sidebar-logo span:first-child { font-size:24px; }
  .a-nav { flex:1; padding:12px 10px; display:flex; flex-direction:column; gap:2px; }
  .a-nav-item {
    display:block; width:100%; text-align:left; padding:10px 14px;
    background:none; border:none; border-radius:10px; cursor:pointer;
    font-size:14px; font-weight:500; color:var(--text); transition:.15s;
  }
  .a-nav-item:hover { background:var(--cp-r); color:var(--cp); }
  .a-nav-item--active { background:var(--cp-r); color:var(--cp); font-weight:700; }
  .a-sidebar-footer { padding:16px; border-top:1px solid var(--border); }

  /* ── mobile header ── */
  .a-mobile-header {
    display:none; align-items:center; justify-content:space-between;
    padding:12px 16px; background:#fff; border-bottom:1px solid var(--border);
    position:fixed; top:0; left:0; right:0; z-index:200;
  }
  .a-hamburger {
    background:none; border:none; font-size:22px; cursor:pointer;
    color:var(--cp); padding:4px 8px;
  }
  .a-mobile-title { font-weight:800; font-size:16px; color:var(--cp); }
  .a-overlay {
    display:none; position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:90;
  }

  @media(max-width:768px) {
    .a-sidebar {
      position:fixed; left:-260px; top:0; height:100vh;
      transition:left .25s ease; box-shadow:none;
    }
    .a-sidebar--open { left:0; box-shadow:var(--sh-lg); }
    .a-mobile-header { display:flex; }
    .a-main { margin-top:56px; }
    .a-overlay { display:block; }
  }

  /* ── main content ── */
  .a-main { flex:1; padding:32px; max-width:900px; overflow-y:auto; }
  @media(max-width:768px) { .a-main { padding:16px; } }

  /* ── section ── */
  .a-section { display:flex; flex-direction:column; gap:20px; }
  .a-section-title {
    font-size:22px; font-weight:800; color:var(--ink);
    padding-bottom:12px; border-bottom:2px solid var(--cp-r);
  }
  .a-hint { font-size:13px; color:var(--text); margin-top:-8px; }

  /* ── fields ── */
  .a-field { display:flex; flex-direction:column; gap:6px; flex:1; }
  .a-field label { font-size:12px; font-weight:600; color:var(--text); text-transform:uppercase; letter-spacing:.04em; }
  .a-field input, .a-field textarea, .a-field select {
    border:1.5px solid var(--border); border-radius:10px; padding:10px 12px;
    font-size:14px; color:var(--ink); background:#fff;
    transition:border .15s; outline:none; font-family:var(--font);
    width:100%;
  }
  .a-field input:focus, .a-field textarea:focus, .a-field select:focus {
    border-color:var(--cp); box-shadow:0 0 0 3px rgba(194,24,91,.1);
  }
  .a-field textarea { resize:vertical; }

  .a-row { display:flex; gap:16px; flex-wrap:wrap; }
  .a-row .a-field { min-width:160px; }

  /* ── list rows ── */
  .a-list-row { display:flex; gap:8px; align-items:center; margin-bottom:6px; }
  .a-list-row input { flex:1; }

  /* ── card rows ── */
  .a-card-row {
    background:#fff; border:1.5px solid var(--border);
    border-radius:14px; padding:16px; display:flex;
    flex-direction:column; gap:12px;
  }

  /* ── gallery grid ── */
  .a-gallery-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:12px; }
  .a-gallery-card {
    background:#fff; border:1.5px solid var(--border);
    border-radius:12px; padding:12px; display:flex;
    flex-direction:column; gap:8px; align-items:center;
  }
  .a-gallery-label {
    border:1.5px solid var(--border); border-radius:8px;
    padding:6px 10px; font-size:13px; width:100%;
    text-align:center; font-family:var(--font);
  }

  /* ── img picker ── */
  .a-img-picker { display:flex; flex-direction:column; gap:8px; align-items:flex-start; }
  .a-img-preview {
    width:100%; max-width:180px; height:120px;
    object-fit:cover; border-radius:10px;
    border:1.5px solid var(--border);
  }

  /* ── pricing ── */
  .a-price-cat {
    background:#fff; border:1.5px solid var(--border);
    border-radius:14px; padding:16px; display:flex;
    flex-direction:column; gap:10px;
  }
  .a-price-cat-header { display:flex; gap:10px; align-items:center; }
  .a-price-cat-name {
    flex:1; border:1.5px solid var(--cp-r); border-radius:10px;
    padding:8px 12px; font-size:15px; font-weight:700;
    color:var(--cp); background:var(--cp-r); font-family:var(--font);
  }
  .a-price-item-row { display:flex; gap:10px; align-items:flex-start; flex-wrap:wrap; }
  .a-btn-add-cat {
    border:2px dashed var(--cp);
    background:transparent; color:var(--cp);
  }

  /* ── buttons ── */
  .a-btn-primary {
    background:var(--cp);
    color:#fff; border:none; border-radius:12px;
    padding:12px 28px; font-size:14px; font-weight:700;
    cursor:pointer; transition:.2s; align-self:flex-start;
    box-shadow:var(--sh-btn);
  }
  .a-btn-primary:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 28px rgba(194,24,91,.35); }
  .a-btn-primary:disabled { opacity:.6; cursor:not-allowed; }

  .a-btn-outline {
    background:#fff; color:var(--cp);
    border:1.5px solid var(--cp); border-radius:10px;
    padding:8px 18px; font-size:13px; font-weight:600;
    cursor:pointer; transition:.15s; display:inline-block;
  }
  .a-btn-outline:hover:not(:disabled) { background:var(--cp-r); }
  .a-btn-outline:disabled { opacity:.6; cursor:not-allowed; }

  .a-btn-ghost {
    background:none; border:none; color:var(--text);
    padding:8px 12px; font-size:13px; cursor:pointer;
    border-radius:8px; transition:.15s; font-family:var(--font);
  }
  .a-btn-ghost:hover { background:var(--cp-r); color:var(--cp); }

  .a-btn-add {
    background:var(--cp-r); color:var(--cp);
    border:1.5px dashed var(--blush); border-radius:10px;
    padding:8px 18px; font-size:13px; font-weight:600;
    cursor:pointer; transition:.15s; align-self:flex-start;
  }
  .a-btn-add:hover { background:var(--blush); }

  .a-btn-del {
    background:#fff0f3; color:#e53e3e;
    border:1.5px solid #fed7d7; border-radius:8px;
    padding:6px 10px; font-size:12px; font-weight:600;
    cursor:pointer; transition:.15s; white-space:nowrap; flex-shrink:0;
  }
  .a-btn-del:hover { background:#fed7d7; }

  .a-btn-del-block {
    background:#fff0f3; color:#e53e3e;
    border:1.5px solid #fed7d7; border-radius:8px;
    padding:7px 14px; font-size:12px; font-weight:600;
    cursor:pointer; transition:.15s; align-self:flex-start;
  }
  .a-btn-del-block:hover { background:#fed7d7; }
`
