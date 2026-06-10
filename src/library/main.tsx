import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import LibraryPage from './LibraryPage'
import '../index.css'
import '../App.css'
import './library.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LibraryPage />
  </StrictMode>,
)
