import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { initToast } from './components/Toast/Toast.jsx';
import { initBottomToast } from './components/Toast/BottomToast.jsx';
import './styles/globals.css';

/** toast initialize */
initToast();
initBottomToast();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
