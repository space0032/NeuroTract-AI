import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Questionnaire from './pages/Questionnaire'
import LiveTracker from './pages/LiveTracker'
import Dashboard from './pages/Dashboard'
import './App.css'

function App() {
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/questionnaire" element={<Questionnaire />} />
          <Route path="/tracker" element={<LiveTracker />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </>
  )
}

export default App
