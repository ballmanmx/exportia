import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Polyfill window.storage para desarrollo local
// En producción Vercel esto viene del sistema
if (!window.storage) {
  const store = {};
  window.storage = {
    get: async (key) => store[key] ? { key, value: store[key] } : null,
    set: async (key, value) => { store[key] = value; return { key, value }; },
    delete: async (key) => { delete store[key]; return { key, deleted: true }; },
    list: async () => ({ keys: Object.keys(store) }),
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
