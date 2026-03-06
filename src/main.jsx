import React, { Component } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { initSecurity } from './security.js'

// ── Initialisation sécurité ──────────────────────────────────
initSecurity();

// ── Global error handlers — le serveur NE CRASHE PAS ────────
// Inspiré de WIN WIN v2 server/index.ts
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (e) => {
    console.error('🟡 [tAIx] Promise rejetée non gérée:', e.reason?.message || e.reason);
    e.preventDefault(); // Empêche le crash
  });
  window.addEventListener('error', (e) => {
    console.error('🔴 [tAIx] Erreur globale:', e.message, e.filename);
  });
}

// ── ErrorBoundary React — écran de secours Pixou ────────────
// Inspiré de WIN WIN v2 client/src/main.tsx
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: '' };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error: error.message };
  }
  componentDidCatch(error, info) {
    console.error('🔴 [tAIx] Crash React:', error.message, info?.componentStack?.split('\n')[1]);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: '#060B18',
          flexDirection: 'column', gap: 20, padding: 40, textAlign: 'center'
        }}>
          <img src="/pixou-error.png" alt="Pixou"
               style={{ width: 140, objectFit: 'contain' }} />
          <div style={{ fontSize: 20, fontWeight: 700, color: '#E8EDF2',
                        fontFamily: "'Outfit',sans-serif" }}>
            Oups — Pixou a un problème technique 🦆
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)',
                        maxWidth: 380, fontFamily: "'Outfit',sans-serif", lineHeight: 1.6 }}>
            Ne vous inquiétez pas, vos données sont en sécurité.
            Rafraîchissez la page pour continuer votre déclaration.
          </div>
          {process.env.NODE_ENV === 'development' && (
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)',
                          background: 'rgba(255,255,255,0.04)', padding: '8px 14px',
                          borderRadius: 8, maxWidth: 500, wordBreak: 'break-all',
                          fontFamily: 'monospace' }}>
              {this.state.error}
            </div>
          )}
          <button onClick={() => window.location.reload()}
                  style={{
                    marginTop: 8, padding: '12px 32px',
                    background: 'linear-gradient(135deg, #1A3A5C, #2563EB)',
                    color: '#fff', border: 'none', borderRadius: 20,
                    fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    fontFamily: "'Outfit',sans-serif",
                  }}>
            🔄 Rafraîchir la page
          </button>
          <a href="mailto:admin@taix.ch" style={{ fontSize: 11, color: '#60A5FA',
                                                   fontFamily: "'Outfit',sans-serif" }}>
            Persiste ? Contactez-nous → admin@taix.ch
          </a>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
