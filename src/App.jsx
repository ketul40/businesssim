import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="8" fill="url(#gradient)"/>
            <path d="M12 20L18 26L28 14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#646cff"/>
                <stop offset="1" stopColor="#535bf2"/>
              </linearGradient>
            </defs>
          </svg>
          <h1>BusinessSim</h1>
        </div>
        <nav className="nav">
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main className="main">
        <section className="hero">
          <h2 className="hero-title">Welcome to Your React App</h2>
          <p className="hero-subtitle">
            A modern, beautiful starting point for your next project
          </p>
          
          <div className="card">
            <div className="counter">
              <button onClick={() => setCount((count) => count - 1)} className="btn btn-secondary">
                -
              </button>
              <div className="count-display">
                <span className="count-label">Counter</span>
                <span className="count-value">{count}</span>
              </div>
              <button onClick={() => setCount((count) => count + 1)} className="btn btn-secondary">
                +
              </button>
            </div>
            <button onClick={() => setCount(0)} className="btn btn-primary">
              Reset Counter
            </button>
          </div>

          <div className="features-grid" id="features">
            <div className="feature">
              <div className="feature-icon">⚡</div>
              <h3>Lightning Fast</h3>
              <p>Built with Vite for instant HMR and optimized builds</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🎨</div>
              <h3>Beautiful UI</h3>
              <p>Modern design with smooth animations and gradients</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🔧</div>
              <h3>Ready to Use</h3>
              <p>All dependencies configured and ready to go</p>
            </div>
            <div className="feature">
              <div className="feature-icon">📱</div>
              <h3>Responsive</h3>
              <p>Looks great on all devices and screen sizes</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>Built with React + Vite</p>
        <p className="footer-links">
          <a href="https://react.dev" target="_blank" rel="noopener noreferrer">React Docs</a>
          <span>•</span>
          <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer">Vite Docs</a>
        </p>
      </footer>
    </div>
  )
}

export default App

