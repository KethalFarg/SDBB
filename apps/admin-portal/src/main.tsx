import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import 'mapbox-gl/dist/mapbox-gl.css'
import './style.css'

console.log('React main entry running')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

