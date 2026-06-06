# Contexto del proyecto — Pinky Nail Studio

## URLs
- **Producción:** https://pinky-nails.vercel.app (también tiene dominio .com propio)
- **Vercel dashboard:** https://vercel.com/brian-franks-projects-470eb035/pinky-nails
- **GitHub:** https://github.com/Brian-Frank/pinky-nails
- **Local:** `C:\Users\brian\OneDrive\Escritorio\Proyectos\pinky-nails`

---

## Stack
- React 19 + Vite 8 + React Router v7
- Sin Tailwind — estilos con CSS-in-JS (inline) + `<style>` tags dentro de componentes
- Supabase (base de datos + storage de imágenes)
- Vercel (hosting + serverless functions en `/api`)

---

## Ramas git
| Rama | Uso |
|------|-----|
| `master` | Producción — Vercel deploya desde acá automáticamente |
| `dev` | Desarrollo activo — trabajar siempre acá |
| `QA` | Testing antes de pasar a prod (aún no se usó formalmente) |

**Flujo:** trabajar en `dev` → merge a `master` → push → Vercel redeploya automático.

---

## Cómo levantar local

```bash
# Con APIs funcionando (necesario para /admin):
npx vercel dev
# Levanta en http://localhost:3000

# Solo frontend (sin APIs — /admin no funciona):
npm run dev
# Levanta en http://localhost:5173
```

---

## Admin panel
- **URL:** `/admin`
- **Usuario:** `felicitas`
- **Contraseña:** está en las env vars de Vercel (`ADMIN_PASS`) — hacer `npx vercel env pull` para bajarlas
- Las credenciales se verifican en `api/login.js` contra `process.env.ADMIN_USER` y `process.env.ADMIN_PASS`

---

## Arquitectura

### Contexto de datos (`src/context/ContentContext.jsx`)
Todas las secciones del sitio se cargan desde Supabase tabla `pinky_content` (columnas: `section`, `data`, `updated_at`). Si la DB está vacía usa `DEFAULT_CONTENT` como fallback.

**Secciones:** `hero`, `services`, `gallery`, `about`, `pricing`, `reviews`, `contact`, `theme`, `spotify`

### API routes (`/api`)
| Archivo | Qué hace |
|---------|----------|
| `get-content.js` | GET — devuelve todas las secciones (público) |
| `save-section.js` | POST — guarda una sección (requiere token admin) |
| `login.js` | POST — valida credenciales, devuelve token |
| `upload-image.js` | POST — sube imagen a Supabase Storage (requiere token) |

### Páginas
- `src/pages/Site/Site.jsx` — sitio público (808+ líneas)
- `src/pages/Admin/AdminPanel.jsx` — panel admin (1300+ líneas)

### Design system (`src/index.css`)
Variables CSS principales:
```
--cp       #C2185B   color primario (rosa)
--cp-d     #880E4F   rosa oscuro
--cp-r     #FCE4EC   rosa suave (fondos)
--cp-50    #FFF0F5   rosa muy suave
--ink      #2D1B2E   texto oscuro
--text     #8D6E8F   texto secundario
--bg       #FFF8F0   fondo página
--card     #FFFFFF   fondo tarjeta
--font     Montserrat
```

---

## Lo que se hizo en la sesión del 2026-06-06

### Fixes aplicados
1. **Float card "Turno disponible" (Hero)** — estaba tirada a la izquierda en mobile. Fix: clase `hero-float-card` con `left:50%; transform:translateX(-50%)` en mobile.
2. **Servicios en mobile** — scrolleo excesivo. Fix: carrusel con swipe (mismo patrón que Reseñas). Grid en desktop, carrusel en mobile (≤640px). Componente `ServicesCarousel`.
3. **Stats hero (∞ "Diseños únicos")** — símbolo no centrado. Fix: `display:flex; justify-content:center; align-items:center; height:38px` + `fontSize:48` para el `∞` (Montserrat no tiene ese glifo en peso 900).

### Feature nueva: Banner Spotify
- Componente `SpotifyBanner` en `Site.jsx` — aparece entre Servicios y Sobre mí
- Sección `spotify` en `ContentContext` con campos: `text`, `url`, `bgColor`, `accentColor`, `textColor`
- Tab "🎵 Spotify" en AdminPanel con color pickers + preview en tiempo real
- Desktop: logo (48px) + texto centrados, botón abajo
- Mobile: stack centrado (logo 30px + texto + botón)

### SEO local — City Bell, La Plata
- **`index.html`** — title, description y keywords con zonas geográficas, JSON-LD `NailSalon` schema, Open Graph, Twitter Card, meta geo tags, canonical URL
- **`public/robots.txt`** — creado, apunta al sitemap
- **`public/sitemap.xml`** — creado con la URL del .com
- **`vercel.json`** — cache headers para robots y sitemap
- **`ContentContext.jsx`** — texto visible actualizado: ubicación dice "City Bell, La Plata · Atendemos City Bell, Gonnet, Villa Elisa y alrededores"; about.p3 menciona City Bell

**Keywords targetadas:** uñas city bell, manicura city bell, nail studio city bell, uñas la plata, uñas gonnet, uñas villa elisa, semipermanente city bell, kapping city bell, nail art la plata

**Pendiente (fuera del código):**
- Registrar en **Google Search Console** y enviar sitemap (`/sitemap.xml`)
- Validar schema en **search.google.com/test/rich-results**
- Crear/reclamar perfil en **Google Business Profile** (mayor impacto para Maps)
- Actualizar `telephone` en JSON-LD del `index.html` cuando tengan el número real

---

## Idea pendiente para próxima sesión
**Sistema de reseñas con moderación:**
- Formulario público para que clientas dejen comentarios
- Las reseñas se guardan en Supabase con estado `pending`
- Admin aprueba o rechaza desde el panel
- Solo las `approved` aparecen en el sitio
- Pregunta pendiente: ¿las reseñas manuales actuales conviven o se reemplazan?

**Piezas a construir:**
- Nueva tabla Supabase `pinky_reviews` (nombre, texto, estrellas, estado, fecha)
- `api/submit-review.js` — público, guarda con estado `pending`
- `api/get-reviews.js` — devuelve solo `approved`
- `api/moderate-review.js` — requiere token admin
- Formulario en `Site.jsx` (debajo de reseñas actuales)
- Tab "Moderación" en `AdminPanel.jsx`
