import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import 'leaflet/dist/leaflet.css';

import { registerSW } from 'virtual:pwa-register';

// Automatically update the service worker
const updateSW = registerSW({
  onNeedRefresh() {
    // We can show a prompt here if we didn't use autoUpdate
    // but with registerType: 'autoUpdate' this handles the background update
  },
  onOfflineReady() {
    console.log('App is ready to work offline');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
