import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const target = e.target;
    if (target.tagName === 'INPUT' || target.tagName === 'SELECT') {
      if (target.type === 'submit' || target.type === 'button' || target.type === 'reset') {
        return;
      }
      e.preventDefault();
      const focusableElements = 'input:not([disabled]):not([readonly]), select:not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';
      const elements = Array.from(document.querySelectorAll(focusableElements)).filter(el => el.offsetParent !== null); // Only visible elements
      
      const index = elements.indexOf(target);
      if (index > -1 && index < elements.length - 1) {
        elements[index + 1].focus();
      }
    }
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
