import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import ClientLayout from './layouts/ClientLayout.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import RiderLayout from './layouts/RiderLayout.jsx'
import ClientHome from './pages/client/ClientHome.jsx'
import AdminHome from './pages/admin/AdminHome.jsx'
import RiderHome from './pages/rider/RiderHome.jsx'
import ClerkProviderWithRoutes from './features/auth/ClerkProviderWithRoutes.jsx'
import AuthenticationPage from './features/auth/AuthenticationPage.jsx'

function App() {
  return (
    <ClerkProviderWithRoutes>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sign-in/*" element={<AuthenticationPage />} />
        <Route path="/sign-up/*" element={<AuthenticationPage />} />
        <Route element={<ClientLayout />} >
          <Route path="/user" element={<ClientHome />} />
        </Route>
        <Route element={<AdminLayout />} >
          <Route path="/admin" element={<AdminHome />} />
        </Route>
        <Route element={<RiderLayout />} >
          <Route path="/rider" element={<RiderHome />} />
        </Route>
      </Routes>
    </ClerkProviderWithRoutes>
  )
}

export default App
