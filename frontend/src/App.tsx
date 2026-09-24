import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import { ROUTES } from './constants/routes'
import AuthenticationPage from './features/auth/AuthenticationPage'
import ClerkProviderWithRoutes from './features/auth/ClerkProviderWithRoutes'
import { ROLES } from './constants/roles'
import UserLayout from './layouts/UserLayout'
import UserDashboard from './pages/user/UserDashboard'

function App() {
  return (
    <ClerkProviderWithRoutes>
      <Routes>
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={`${ROUTES.SIGN_IN}/*`} element={<AuthenticationPage />} />
        <Route path={`${ROUTES.SIGN_UP}/*`} element={<AuthenticationPage />} />
        <Route path={ROLES.USER} element={<UserLayout />}>
          <Route index element={<UserDashboard />} />
          <Route path={ROUTES.USER_MEAL.replace(`/${ROLES.USER}/`, '')} element={<div>User Meal Page</div>} />
          <Route path={ROUTES.USER_CALENDAR.replace(`/${ROLES.USER}/`, '')} element={<div>User Calendar Page</div>} />
          <Route path={ROUTES.USER_PLANS.replace(`/${ROLES.USER}/`, '')} element={<div>User Plans Page</div>} />
          <Route path={ROUTES.USER_FAVORITE.replace(`/${ROLES.USER}/`, '')} element={<div>User Favorite Page</div>} />
        </Route>
      </Routes> 
    </ClerkProviderWithRoutes>
  )
}

export default App
