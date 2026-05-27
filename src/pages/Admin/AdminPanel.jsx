import { useState, useEffect, useRef } from 'react'
import { supabase, uploadImage } from '../../lib/supabase'
import { useContent } from '../../context/ContentContext'

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
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [err,  setErr]  = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setErr('')
    if (!supabase) {
      setErr('El panel admin requiere Supabase configurado. Agregá las variables de entorno.')
      return
    }
    const expectedUser = import.meta.env.VITE_ADMIN_USERNAME || 'felicitas'
    if (user.trim().toLowerCase() !== expectedUser.toLowerCase()) {
      setErr('Usuario incorrecto.')
      return
    }
    setBusy(true)
    const email = import.meta.env.VITE_ADMIN_EMAIL
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
    setBusy(false)
    if (error) { setErr('Contraseña incorrecta.'); return }
    onLogin()
  }

  return (
    <div className="a-login-wrap">
      <div className="a-login-card">
        <div className="a-login-logo">💅</div>
        <h1 className="a-login-title">Pinky Admin</h1>
        <p className="a-login-sub">Ingresá para editar el sitio</p>
        <form onSubmit={submit} className="a-login-form">
          <div className="a-field">
            <label>Usuario</label>
            <input value={user} onChange={e=>setUser(e.target.value)} placeholder="felicitas" autoFocus />
          </div>
          <div className="a-field">
            <label>Contraseña</label>
            <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" />
          </div>
          {err && <p className="a-error">{err}</p>}
          <button type="submit" className="a-btn-primary" disabled={busy} style={{ width:'100%', marginTop:8 }}>
            {busy ? 'Ingresando…' : 'Ingresar →'}
          </button>
        </form>
      </div>
    </div>
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
      <h2 className="a-section-title">🏠 Hero</h2>

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

      <div className="a-field"><label>Texto tarjeta flotante</label>
        <input value={d.floatCard1} onChange={e=>setD({...d,floatCard1:e.target.value})} /></div>

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
   MAIN ADMIN PANEL
═══════════════════════════════════════════════════════════ */
const TABS = [
  { id:'hero',       label:'🏠 Hero' },
  { id:'services',   label:'💅 Servicios' },
  { id:'gallery',    label:'📸 Galería' },
  { id:'about',      label:'🌸 Sobre mí' },
  { id:'pricing',    label:'💰 Precios' },
  { id:'reviews',    label:'⭐ Reseñas' },
  { id:'contact',    label:'📞 Contacto' },
  { id:'appearance', label:'🎨 Apariencia' },
]

export default function AdminPanel() {
  const [session, setSession] = useState(null)
  const [checking, setChecking] = useState(true)
  const [activeTab, setActiveTab] = useState('hero')
  const [menuOpen, setMenuOpen] = useState(false)

  /* Check existing session */
  useEffect(() => {
    if (!supabase) { setChecking(false); return }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setChecking(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  async function logout() {
    if (supabase) await supabase.auth.signOut()
  }

  if (checking) return <Spinner />
  if (!session)  return <Login onLogin={() => {}} />

  const tabContent = {
    hero:       <HeroEditor />,
    services:   <ServicesEditor />,
    gallery:    <GalleryEditor />,
    about:      <AboutEditor />,
    pricing:    <PricingEditor />,
    reviews:    <ReviewsEditor />,
    contact:    <ContactEditor />,
    appearance: <AppearanceEditor />,
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

  /* ── login ── */
  .a-login-wrap {
    display:flex; align-items:center; justify-content:center;
    min-height:100vh; background:linear-gradient(135deg,var(--cp-r),#fff);
    padding:24px;
  }
  .a-login-card {
    background:#fff; border-radius:24px; padding:40px 36px;
    box-shadow:var(--sh-lg); width:100%; max-width:400px; text-align:center;
  }
  .a-login-logo { font-size:48px; margin-bottom:8px; }
  .a-login-title { font-size:24px; font-weight:800; color:var(--ink); margin-bottom:4px; }
  .a-login-sub { color:var(--text); font-size:14px; margin-bottom:28px; }
  .a-login-form { text-align:left; }
  .a-error { color:#e53e3e; font-size:13px; margin-top:-4px; margin-bottom:8px; background:#fff5f5; padding:8px 12px; border-radius:8px; }

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
    background:linear-gradient(135deg,var(--cp),var(--cp-d));
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
