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
import RequireRole from './features/auth/RequireRole.jsx'
import { ROLES } from './features/auth/roles.js'

function App() {
  return (
    <ClerkProviderWithRoutes>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sign-in/*" element={<AuthenticationPage />} />
        <Route path="/sign-up/*" element={<AuthenticationPage />} />
        <Route path="/user" element={<RequireRole role={ROLES.MEMBER}><ClientLayout /></RequireRole>} >
          <Route index element={<ClientHome />} />
        </Route>
        <Route path="/admin" element={<RequireRole role={ROLES.ADMIN}><AdminLayout /></RequireRole>} >
          <Route index element={<AdminHome />} />
        </Route>
        <Route path="/rider" element={<RequireRole role={ROLES.RIDER}><RiderLayout /></RequireRole>} >
          <Route index element={<RiderHome />} />
        </Route>
      </Routes>
    </ClerkProviderWithRoutes>
  )
}

export default App
