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
import MealCatalog from './pages/client/MealCatalog.jsx'
import SubscriptionSelector from './pages/client/SubscriptionSelector.jsx'
import FavoritePage from './pages/client/FavoritePage.jsx'

// Admin Pages
import AdminHome from './pages/admin/AdminHome.jsx'
import OrderDispatchPage from './pages/admin/OrderDispatchPage.jsx'
import UserSubscriptionPage from './pages/admin/UserSubscriptionPage.jsx'

// Rider Pages
import RiderHome from './pages/rider/RiderHome.jsx'
import ActiveDelivery from "./pages/rider/ActiveDelivery.jsx"

// Other Pages
import Home from './pages/Home.jsx'
import AuthenticationPage from './features/auth/AuthenticationPage.jsx'
import NotFound from './pages/NotFound.jsx'
import { ROUTES } from './lib/routes.js'

function App() {
  return (
    <ClerkProviderWithRoutes>
      <Routes>

        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={`${ROUTES.SIGN_IN}/*`} element={<AuthenticationPage />} />
        <Route path={`${ROUTES.SIGN_UP}/*`} element={<AuthenticationPage />} />

        <Route path={ROUTES.USER} element={<RequireRole role={ROLES.MEMBER}><ClientLayout /></RequireRole>} >
          <Route index element={<ClientHome />} />
          <Route path={ROUTES.USER_ONBOARDING.replace(`${ROUTES.USER}/`, '')} element={<Onboarding />} />
          <Route path={ROUTES.USER_MEALS.replace(`${ROUTES.USER}/`, '')} element={<MealCatalog />} />
          <Route path={ROUTES.USER_PLANS.replace(`${ROUTES.USER}/`, '')} element={<SubscriptionSelector />} />
          <Route path={ROUTES.USER_FAVORITES.replace(`${ROUTES.USER}/`, '')} element={<FavoritePage />} />
        </Route>

        <Route path={ROUTES.ADMIN} element={<RequireRole role={ROLES.ADMIN}><AdminLayout /></RequireRole>} >
          <Route index element={<AdminHome />} />
          <Route path={ROUTES.ADMIN_ORDERS.replace(`${ROUTES.ADMIN}/`, '')} element={<OrderDispatchPage />} />
          <Route path={ROUTES.ADMIN_SUBSCRIPTIONS.replace(`${ROUTES.ADMIN}/`, '')} element={<UserSubscriptionPage />} />
        </Route>
        
        <Route path={ROUTES.RIDER} element={<RequireRole role={ROLES.RIDER}><RiderLayout /></RequireRole>} >
          <Route index element={<RiderHome />} />
          <Route path={ROUTES.RIDER_ACTIVE.replace(`${ROUTES.RIDER}/`, '')} element={<ActiveDelivery />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </ClerkProviderWithRoutes>
  )
}

export default App
