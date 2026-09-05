import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import ClerkProviderWithRoutes from './features/auth/ClerkProviderWithRoutes.jsx'
import AuthenticationPage from './features/auth/AuthenticationPage.jsx'

function App() {
  return (
    <ClerkProviderWithRoutes>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sign-in/*" element={<AuthenticationPage />} />
        <Route path="/sign-up/*" element={<AuthenticationPage />} />
      </Routes>
    </ClerkProviderWithRoutes>
  )
}

export default App
