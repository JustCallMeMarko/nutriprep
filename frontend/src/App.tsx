import { Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import { ROUTES } from './constants/routes'
import AuthenticationPage from './features/auth/AuthenticationPage'
import ClerkProviderWithRoutes from './features/auth/ClerkProviderWithRoutes'
import { ROLES } from './constants/roles'

import UserLayout from './layouts/UserLayout'
import UserDashboard from './pages/user/UserDashboard'
import UserMeal from './pages/user/UserMeal'
import UserMealDetail from './pages/user/UserMealDetail'
import UserPlan from './pages/user/UserPlan'
import UserSubscription from './pages/user/UserSubscription'
import UserFavorite from './pages/user/UserFavorite'

import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUser from './pages/admin/AdminUser'
import AdminOrder from './pages/admin/AdminOrder'
import AdminMeal from './pages/admin/AdminMeal'
import AdminNotification from './pages/admin/AdminNotification'

import RiderLayout from './layouts/RiderLayout'
import RiderDashboard from './pages/rider/RiderDashboard'
import RiderActiveDelivery from './pages/rider/RiderActiveDelivery'
import RiderAnalytics from './pages/rider/RiderAnalytics'
import RiderNotification from './pages/rider/RiderNotification'
import UserProfile from './pages/user/UserProfile'

function App() {
  return (
    <ClerkProviderWithRoutes>
      <Routes>
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={`${ROUTES.SIGN_IN}/*`} element={<AuthenticationPage />} />
        <Route path={`${ROUTES.SIGN_UP}/*`} element={<AuthenticationPage />} />

        <Route path={ROLES.USER} element={<UserLayout />}>
          <Route index element={<UserDashboard />} />
          <Route path={ROUTES.USER_MEAL.replace(`/${ROLES.USER}/`, '')} element={<UserMeal />} />
          <Route path="meal/:id" element={<UserMealDetail />} />
          <Route path={ROUTES.USER_PLAN.replace(`/${ROLES.USER}/`, '')} element={<UserPlan />} />
          <Route path={ROUTES.USER_SUBSCRIPTION.replace(`/${ROLES.USER}/`, '')} element={<UserSubscription />} />
          <Route path={ROUTES.USER_FAVORITE.replace(`/${ROLES.USER}/`, '')} element={<UserFavorite />} />
          <Route path={ROUTES.USER_PROFILE.replace(`/${ROLES.USER}/`, '')} element={<UserProfile />} />
        </Route>

        <Route path={ROLES.ADMIN} element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path={ROUTES.ADMIN_MEAL.replace(`/${ROLES.ADMIN}/`, '')} element={<AdminMeal />} />
          <Route path={ROUTES.ADMIN_ORDER.replace(`/${ROLES.ADMIN}/`, '')} element={<AdminOrder />} />
          <Route path={ROUTES.ADMIN_USER.replace(`/${ROLES.ADMIN}/`, '')} element={<AdminUser />} />
          <Route path={ROUTES.ADMIN_NOTIFICATION.replace(`/${ROLES.ADMIN}/`, '')} element={<AdminNotification />} />
        </Route>

        <Route path={ROLES.RIDER} element={<RiderLayout />}>
          <Route index element={<RiderDashboard />} />
          <Route path="active" element={<RiderActiveDelivery />} />
          <Route path="analytics" element={<RiderAnalytics />} />
          <Route path={ROUTES.RIDER_NOTIFICATION.replace(`/${ROLES.RIDER}/`, '')} element={<RiderNotification />} />
        </Route>
      </Routes> 
    </ClerkProviderWithRoutes>
  )
}

export default App
