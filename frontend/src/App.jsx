import ClerkProviderWithRoutes from './features/auth/ClerkProviderWithRoutes.jsx'
import { Routes, Route } from 'react-router-dom'
import RequireRole from './features/auth/RequireRole.jsx'
import { ROLES } from './features/auth/roles.js'

// Layouts
import ClientLayout from './layouts/ClientLayout.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import RiderLayout from './layouts/RiderLayout.jsx'

// Client Pages
import ClientHome from './pages/client/ClientHome.jsx'
import Onboarding from './pages/client/Onboarding.jsx'

// Admin Pages
import AdminHome from './pages/admin/AdminHome.jsx'

// Rider Pages
import RiderHome from './pages/rider/RiderHome.jsx'

// Other Pages
import Home from './pages/Home.jsx'
import AuthenticationPage from './features/auth/AuthenticationPage.jsx'
import RequireRole from './features/auth/RequireRole.jsx'
import { ROLES } from './features/auth/roles.js'
import ActiveDelivery from "./pages/rider/ActiveDelivery.jsx"

function App() {
  return (
    <ClerkProviderWithRoutes>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/sign-in/*" element={<AuthenticationPage />} />
        <Route path="/sign-up/*" element={<AuthenticationPage />} />

        <Route path="/user" element={<RequireRole role={ROLES.MEMBER}><ClientLayout /></RequireRole>} >
          <Route index element={<ClientHome />} />
          <Route path="favs" element={<FavoritePage />} />
        </Route>

        <Route path="/admin" element={<RequireRole role={ROLES.ADMIN}><AdminLayout /></RequireRole>} >
          <Route index element={<AdminHome />} />
          <Route path="orders" element={<OrderDispatchPage />} />
          <Route path="subscriptions" element={<UserSubscriptionPage />} />
        </Route>
        
        <Route path="/rider" element={<RequireRole role={ROLES.RIDER}><RiderLayout /></RequireRole>} >
          <Route index element={<RiderHome />} />
          <Route path="active" element={<ActiveDelivery />} />
        </Route>
      </Routes>
    </ClerkProviderWithRoutes>
  )
}

export default App
