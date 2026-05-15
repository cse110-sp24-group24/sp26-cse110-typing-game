import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import DungeonCoder from './DungeonCoder.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DungeonCoder />
  </StrictMode>
)
