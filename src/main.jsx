import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { initSecurity } from './security.js'

// Initialisation sécurité au démarrage
initSecurity();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)
