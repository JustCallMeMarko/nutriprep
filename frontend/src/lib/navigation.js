import { ROUTES } from "@/lib/routes"

export const ROLE_NAVIGATION = {
  client: {
    home: ROUTES.USER,
    links: [
      { label: "Meals", to: ROUTES.USER_MEALS },
      { label: "Plans", to: ROUTES.USER_PLANS },
      { label: "Favorites", to: ROUTES.USER_FAVORITES },
      { label: "Profile", to: ROUTES.USER_ONBOARDING },
    ],
  },
  admin: {
    home: ROUTES.ADMIN,
    links: [
      { label: "Overview", to: ROUTES.ADMIN },
      { label: "Order dispatch", to: ROUTES.ADMIN_ORDERS },
      { label: "Subscriptions", to: ROUTES.ADMIN_SUBSCRIPTIONS },
    ],
  },
  rider: {
    home: ROUTES.RIDER,
    links: [
      { label: "Deliveries", to: ROUTES.RIDER },
      { label: "Active delivery", to: ROUTES.RIDER_ACTIVE },
    ],
  },
}