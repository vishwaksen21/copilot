import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './assets/main.css'

console.log('[Renderer] main.tsx executing')

try {
  const root = ReactDOM.createRoot(document.getElementById('root')!)
  console.log('[Renderer] Root element found:', document.getElementById('root'))
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
  console.log('[Renderer] React mounted successfully')
} catch (err) {
  console.error('[Renderer] React mount FAILED:', err)
  document.body.innerHTML = `<pre style="color:red;padding:20px">React mount error: ${err}</pre>`
}
