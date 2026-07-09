import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Storage usando localStorage con fallback a memoria
const memStore = {};
window.storage = {
  get: async (key) => {
    try {
      const value = localStorage.getItem(key);
      if (value) return { key, value };
      return memStore[key] ? { key, value: memStore[key] } : null;
    } catch {
      return memStore[key] ? { key, value: memStore[key] } : null;
    }
  },
  set: async (key, value) => {
    memStore[key] = value;
    try { localStorage.setItem(key, value); } catch {}
    return { key, value };
  },
  delete: async (key) => {
    delete memStore[key];
    try { localStorage.removeItem(key); } catch {}
    return { key, deleted: true };
  },
  list: async () => {
    try { return { keys: Object.keys(localStorage) }; }
    catch { return { keys: Object.keys(memStore) }; }
  },
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
