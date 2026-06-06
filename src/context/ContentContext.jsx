import { createContext, useContext, useEffect, useState, useCallback } from 'react'

/* ── Default content (used when DB is empty) ───────────────── */
export const DEFAULT_CONTENT = {
  hero: {
    badge: '✨ Nail Studio — Buenos Aires',
    title: 'UÑAS QUE', accent: 'ENAMORAN',
    subtitle: 'Nail studio especializado en diseños únicos y personalizados. Cada uña, una obra de arte. Calidad premium, amor por el detalle.',
    stats: [
      { num: '5+',   label: 'Años de exp.' },
      { num: '500+', label: 'Clientas felices' },
      { num: '∞',    label: 'Diseños únicos' },
    ],
    floatCard1: 'Turnos disponibles',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
  },
  services: [
    { icon:'💅', name:'Semipermanente',        desc:'Color liso duradero, brillo intenso y secado instantáneo.' },
    { icon:'✨', name:'Nail Art',               desc:'Diseños personalizados, desde detalles finos hasta complejos.' },
    { icon:'💎', name:'Kapping',                desc:'Resistencia y natural. El servicio más elegante.' },
    { icon:'🌸', name:'Softgel',                desc:'La fusión perfecta entre resistencia y flexibilidad.' },
    { icon:'👣', name:'Semipermanente en Pies', desc:'El mismo cuidado y color en tus pies. Duración garantizada.' },
    { icon:'🎨', name:'Diseños + Adicionales',  desc:'Polvo aurora, francesitas, ojo de gato, carey y más.' },
  ],
  gallery: [
    { image:'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80', label:'Nail Art Premium' },
    { image:'https://images.unsplash.com/photo-1604655824833-8b5c1e6e0e66?auto=format&fit=crop&w=400&q=80', label:'Diseño Floral' },
    { image:'https://images.unsplash.com/photo-1604654894614-6dd2bc7bd671?auto=format&fit=crop&w=400&q=80', label:'Kapping' },
    { image:'https://images.unsplash.com/photo-1604654894618-6e8ac44d5b40?auto=format&fit=crop&w=400&q=80', label:'Semipermanente' },
    { image:'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?auto=format&fit=crop&w=400&q=80', label:'French Deluxe' },
    { image:'https://images.unsplash.com/photo-1604655824851-aaa09a58b32b?auto=format&fit=crop&w=400&q=80', label:'Softgel' },
    { image:'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=400&q=80', label:'Full Color Art' },
  ],
  about: {
    title: 'UNA PASIÓN QUE', accent: 'SE VE EN LAS MANOS',
    p1: 'Hola, soy la creadora detrás de Pinky Nail Studio. Lo que empezó como una pasión se convirtió en mi forma de vida y en la manera de hacer sentir especial a cada clienta que pasa por mis manos.',
    p2: 'Con más de 5 años de experiencia y formación continua en las últimas tendencias internacionales, me especializo en nail art detallista y diseños únicos que reflejan tu personalidad.',
    p3: 'Cada sesión es un momento tuyo — un espacio para relajarte, expresarte y salir sintiéndote increíble.',
    pills: ['✅ Materiales premium','✅ Higiene garantizada','✅ Diseños originales','✅ Atención personalizada'],
    photos: [
      'https://images.unsplash.com/photo-1604654894614-6dd2bc7bd671?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1604654894618-6e8ac44d5b40?auto=format&fit=crop&w=400&q=80',
    ],
  },
  pricing: [
    {
      category: '💅 Servicios generales',
      items: [
        { name:'Semipermanente (color liso)', desc:'', price:'$17.000' },
        { name:'Kapping (color liso)',         desc:'', price:'$19.000' },
        { name:'Softgel (color liso)',          desc:'', price:'$22.000' },
        { name:'Semipermanente en pies (color liso)', desc:'', price:'$17.000' },
      ],
    },
    {
      category: '🎨 Diseños y adicionales',
      items: [
        { name:'Diseño por uña — detalles',    desc:'', price:'$300' },
        { name:'Diseño por uña — simple',       desc:'', price:'$400' },
        { name:'Diseño por uña — complejo',     desc:'Incluye polvos, strasses, relieve, stickers, etc.', price:'$500' },
        { name:'Polvo aurora (todas las uñas)', desc:'', price:'$3.500' },
        { name:'Francesitas (todas las uñas)',  desc:'', price:'$4.000' },
        { name:'Aura / Babyboomer (por uña)',   desc:'', price:'$400' },
        { name:'Ojo de gato (por uña)',         desc:'', price:'$400' },
        { name:'Carey (por uña)',               desc:'', price:'$500' },
      ],
    },
    {
      category: '🔧 Arreglos y remociones',
      items: [
        { name:'Arreglo tip de softgel',         desc:'Por uña', price:'$1.000' },
        { name:'Arreglo kapping',                desc:'Por uña', price:'$500' },
        { name:'Manicuría sin esmaltar',         desc:'Corte, limado y remoción de cutículas', price:'$8.000' },
        { name:'Pedicuría sin esmaltar',         desc:'Corte, limado y remoción de cutículas', price:'$8.000' },
        { name:'Remoción softgel',               desc:'Más realización de otro servicio', price:'$1.500' },
        { name:'Remoción semiperm. / kapping',   desc:'Sin realización de otro servicio (incluye manicuría)', price:'$9.000' },
        { name:'Remoción softgel (sola)',        desc:'Sin realización de otro servicio (incluye manicuría)', price:'$10.000' },
      ],
    },
  ],
  reviews: [
    { stars:5, text:'"Las mejores uñas que me hice en mi vida. El nail art quedó exactamente como lo quería. Ya soy clienta fija!"', avatar:'👩', name:'Sofía M.', date:'hace 2 semanas' },
    { stars:5, text:'"Super profesional, el lugar muy limpio. El kapping duró más de un mes sin astillarse. Totalmente recomendada 💅"', avatar:'👩‍🦰', name:'Valentina R.', date:'hace 1 mes' },
    { stars:5, text:'"Fui con una referencia y el resultado fue IDÉNTICO pero incluso mejor. Tiene un talento increíble. ¡La amo!"', avatar:'🧑‍🦱', name:'Camila T.', date:'hace 3 semanas' },
  ],
  contact: {
    whatsapp: '5491100000000',
    instagram: '@_pinkynailstudio',
    location: 'Buenos Aires, Argentina\nZona a confirmar — consultá por DM',
    hours: 'Lunes a sábado · Con turno previo',
    ctaTitle: '¡Reservá tu turno!',
    ctaText: 'Escribinos por WhatsApp con el servicio que querés, tu disponibilidad horaria y acordamos la fecha perfecta para vos 🌸',
    replyTime: 'Respondemos en menos de 1 hora ✨',
  },
  theme: {
    primaryColor: '#C2185B',
    darkColor: '#880E4F',
    softColor: '#FCE4EC',
    studioName: 'Pinky Nail Studio',
    footerTagline: 'Hecho con 💜 en Buenos Aires',
  },
  spotify: {
    text: '¿Querés saber qué canciones se escuchan en Pinky? 🎵',
    url: 'https://open.spotify.com/playlist/',
    bgColor:     '#FCE4EC',
    accentColor: '#C2185B',
    textColor:   '#2D1B2E',
  },
}

const SECTIONS = Object.keys(DEFAULT_CONTENT)
const ContentCtx = createContext(null)

export function ContentProvider({ children }) {
  const [content, setContent] = useState(DEFAULT_CONTENT)
  const [loading, setLoading] = useState(true)

  /* fetch all sections via API */
  useEffect(() => {
    fetch('/api/get-content')
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(({ data }) => {
        if (data && data.length > 0) {
          const merged = { ...DEFAULT_CONTENT }
          data.forEach(row => { if (merged[row.section] !== undefined) merged[row.section] = row.data })
          setContent(merged)
        }
      })
      .catch(err => console.error('Error cargando contenido:', err))
      .finally(() => setLoading(false))
  }, [])

  /* apply theme CSS variables */
  useEffect(() => {
    const t = content.theme
    if (!t) return
    const r = document.documentElement.style
    if (t.primaryColor) { r.setProperty('--cp', t.primaryColor); r.setProperty('--cp-h', t.primaryColor) }
    if (t.darkColor)    r.setProperty('--cp-d', t.darkColor)
    if (t.softColor)    r.setProperty('--cp-r', t.softColor)
  }, [content.theme])

  /** Save one section via /api/save-section (requiere token admin) */
  const updateSection = useCallback(async (section, data) => {
    setContent(prev => ({ ...prev, [section]: data }))
    const token = sessionStorage.getItem('pinky-admin-token')
    if (!token) return
    const res = await fetch('/api/save-section', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ section, data }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || 'Error al guardar')
    }
  }, [])

  return (
    <ContentCtx.Provider value={{ content, loading, updateSection }}>
      {children}
    </ContentCtx.Provider>
  )
}

export function useContent() {
  return useContext(ContentCtx)
}
