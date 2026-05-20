import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { MobileApp } from './MobilePages';
import './styles.css';

const RootApp = window.location.pathname.startsWith('/mobile') ? MobileApp : App;

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
);
