import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ContentProvider } from './context/ContentContext'
import Site from './pages/Site/Site'
import AdminPanel from './pages/Admin/AdminPanel'

export default function App() {
  return (
    <ContentProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"      element={<Site />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*"      element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ContentProvider>
  )
}
