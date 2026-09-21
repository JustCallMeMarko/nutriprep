import { dummyMeals } from "@/lib/dummyMeals";
import { dummyPlans } from "@/lib/dummyPlans";
import { subscriptionTiers } from "@/lib/subscriptionTiers";

const demoState = {
  favorites: dummyMeals.filter((meal) => [1, 3].includes(meal.id)),
  subscription: null,
  orders: [
    { id: "order-101", orderId: "NP-1042", customerName: "Sarah Jenkins", mealPlan: "Lean & Active", address: "14 Maple Street", status: "ready", riderId: null },
    { id: "order-102", orderId: "NP-1043", customerName: "Michael Scott", mealPlan: "Performance", address: "20 Market Avenue", status: "pending", riderId: "rider-2" },
    { id: "order-103", orderId: "NP-1044", customerName: "Pam Beesly", mealPlan: "Low Calorie", address: "8 Garden Road", status: "in_transit", riderId: "rider-1" },
  ],
  riders: [
    { id: "rider-1", name: "Alex Rivera", vehicle: "Motorbike", rating: "4.9", currentLoads: 1 },
    { id: "rider-2", name: "Jordan Lee", vehicle: "Bicycle", rating: "4.8", currentLoads: 2 },
  ],
};

const deliveryFromOrder = (order) => ({
  id: order.id,
  orderId: order.orderId,
  customerName: order.customerName,
  pickupLocation: "NutriPrep Kitchen",
  pickupDetails: "Ready for pickup at the dispatch counter",
  dropoffLocation: order.address,
  address: order.address,
  notes: "Leave at the front desk if nobody answers.",
  status: order.status,
});

export async function makeDemoRequest(endpoint, options = {}) {
  await new Promise((resolve) => setTimeout(resolve, 250));
  const method = options.method || "GET";
  const body = options.body ? JSON.parse(options.body) : {};

  if (endpoint === "/user/catalog") return { plans: dummyPlans, meals: dummyMeals };
  if (endpoint === "/user/me") return { id: "demo-user", name: "Demo Member", credits: 42 };
  if (endpoint === "/user/favorites" && method === "GET") return [...demoState.favorites];
  if (endpoint === "/user/favorites" && method === "POST") {
    const meal = dummyMeals.find((item) => item.id === body.meal_id);
    if (meal && !demoState.favorites.some((item) => item.id === meal.id)) demoState.favorites.push(meal);
    return meal;
  }
  if (endpoint.startsWith("/user/favorites/") && method === "DELETE") {
    const id = Number(endpoint.split("/").pop());
    demoState.favorites = demoState.favorites.filter((item) => item.id !== id);
    return null;
  }
  if (endpoint === "/user/subscriptions" && method === "GET") return demoState.subscription;
  if (endpoint === "/user/subscriptions" && method === "POST") {
    const tier = body.tier_id;
    const selectedTier = subscriptionTiers.find((item) => item.id === tier);
    demoState.subscription = { tierName: selectedTier?.name || "Demo Plan", credits: selectedTier?.credits || 50 };
    return demoState.subscription;
  }
  if (endpoint === "/user/admin/dashboard") {
    return { totalOrders: 128, pendingOrders: 18, activeDeliveries: 7, recentOrders: demoState.orders };
  }
  if (endpoint === "/user/admin/orders") return [...demoState.orders];
  if (endpoint === "/user/admin/riders") return [...demoState.riders];
  if (endpoint.startsWith("/user/admin/orders/") && endpoint.endsWith("/assign")) {
    const orderId = endpoint.split("/")[4];
    const order = demoState.orders.find((item) => item.id === orderId);
    if (order) {
      order.riderId = body.rider_id;
      order.status = "ready";
    }
    return order;
  }
  if (endpoint === "/user/rider/deliveries") return demoState.orders.map(deliveryFromOrder);
  if (endpoint.startsWith("/user/rider/deliveries/") && endpoint.endsWith("/accept")) {
    const orderId = endpoint.split("/")[4];
    const order = demoState.orders.find((item) => item.id === orderId);
    if (order) order.status = "in_transit";
    return order && deliveryFromOrder(order);
  }
  if (endpoint.startsWith("/user/rider/deliveries/") && endpoint.endsWith("/complete")) {
    const orderId = endpoint.split("/")[4];
    const order = demoState.orders.find((item) => item.id === orderId);
    if (order) order.status = "delivered";
    return order && deliveryFromOrder(order);
  }

  return null;
}