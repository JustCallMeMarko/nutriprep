import React, { useState } from "react"
import { ChevronDown, ChevronUp, ArrowRight, ShieldCheck, Calendar, CheckCircle2 } from "lucide-react"
import CartItem from "@/components/CartItem"
import NutriHeader from "@/components/NutriHeader"
import Food1 from "@/assets/landing/Food1.png"
import Food2 from "@/assets/landing/Food2.png"
import Food3 from "@/assets/landing/Food3.png"

const INITIAL_CART = [
  {
    id: "meal-1",
    name: "Chicken satay salad",
    image: Food1,
    rating: 5.0,
    quantity: 1,
    credits: 200,
    day: "Monday",
    mealTime: "Lunch",
  },
  {
    id: "meal-2",
    name: "Chicken cacciatore",
    image: Food2,
    rating: 4.0,
    quantity: 3,
    credits: 250,
    day: "Tuesday",
    mealTime: "Dinner",
  },
  {
    id: "meal-3",
    name: "Potato with Chicken",
    image: Food3,
    rating: 3.0,
    quantity: 5,
    credits: 200,
    day: "Wednesday",
    mealTime: "Lunch",
  },
]

export default function CartPage() {
  const [cartItems, setCartItems] = useState(INITIAL_CART)
  const [productSubtotalOpen, setProductSubtotalOpen] = useState(true)
  const [shippingSubtotalOpen, setShippingSubtotalOpen] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)

  const handleQuantityChange = (id, newQty) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
    )
  }

  const handleRemoveItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleScheduleChange = (id, { day, mealTime }) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, day, mealTime } : item))
    )
  }

  // Calculations in Credits
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)
  const calculatedSubtotal = cartItems.reduce(
    (acc, item) => acc + item.credits * item.quantity,
    0
  )
  const discountRate = 0.07 // 7% meal discount
  const originalCredits = Math.round(calculatedSubtotal / (1 - discountRate))
  const finalSubtotal = calculatedSubtotal
  const shippingCredits = 0
  const finalTotal = finalSubtotal + shippingCredits

  const handleCheckout = () => {
    setIsCheckingOut(true)
    setTimeout(() => {
      setIsCheckingOut(false)
      setOrderComplete(true)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* Header */}
      <NutriHeader type="client" />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16">
          {/* Left: Your Meals & Schedule Breakdown */}
          <div className="w-full lg:flex-1 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b-2 border-slate-900 pb-4">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                Your Meals
              </h1>
              <span className="text-sm font-semibold text-slate-500">
                {totalItemsCount} {totalItemsCount === 1 ? "Meal" : "Meals"} Scheduled
              </span>
            </div>

            {/* Schedule Info Ribbon */}
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-blue-800 text-xs font-medium">
              <Calendar className="size-4 text-blue-600 shrink-0" />
              <span>
                Each meal is tagged to a scheduled delivery day. You can adjust the day and slot per meal anytime before 8:00 PM.
              </span>
            </div>

            {/* Meals List */}
            {cartItems.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemoveItem}
                    onScheduleChange={handleScheduleChange}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-4 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-base font-semibold text-slate-600">Your cart is empty.</p>
                <p className="text-xs text-slate-400 mt-1">Explore our meal plans to schedule your nutrition.</p>
                <button
                  type="button"
                  onClick={() => setCartItems(INITIAL_CART)}
                  className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  Reset Demo Cart
                </button>
              </div>
            )}
          </div>

          {/* Right: Order Summary Card */}
          <div className="w-full lg:w-96 shrink-0 lg:sticky lg:top-24">
            <div className="rounded-3xl border border-slate-200/80 bg-slate-50/50 p-6 sm:p-7 shadow-sm space-y-6">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Order Summary
              </h2>

              <div className="space-y-4 text-sm">
                {/* Product Subtotal */}
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setProductSubtotalOpen(!productSubtotalOpen)}
                    className="w-full flex items-center justify-between text-slate-800 font-semibold hover:text-slate-900"
                  >
                    <span className="flex items-center gap-1.5">
                      Product Subtotal
                      {productSubtotalOpen ? (
                        <ChevronUp className="size-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="size-4 text-slate-400" />
                      )}
                    </span>
                    <span className="font-extrabold text-slate-900">
                      {finalSubtotal} Credits
                    </span>
                  </button>

                  {productSubtotalOpen && (
                    <div className="pl-3 pr-1 py-1 space-y-1 text-xs text-slate-500 border-l-2 border-slate-200 ml-1">
                      <div className="flex justify-between">
                        <span>Original price</span>
                        <span>{originalCredits} Credits</span>
                      </div>
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Meal Discount</span>
                        <span>7%</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Shipping Subtotal */}
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setShippingSubtotalOpen(!shippingSubtotalOpen)}
                    className="w-full flex items-center justify-between text-slate-800 font-semibold hover:text-slate-900"
                  >
                    <span className="flex items-center gap-1.5">
                      Shipping Subtotal
                      {shippingSubtotalOpen ? (
                        <ChevronUp className="size-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="size-4 text-slate-400" />
                      )}
                    </span>
                    <span className="font-extrabold text-slate-900">
                      0 Credits
                    </span>
                  </button>

                  {shippingSubtotalOpen && (
                    <div className="pl-3 pr-1 py-1 space-y-1 text-xs text-slate-500 border-l-2 border-slate-200 ml-1">
                      <div className="flex justify-between">
                        <span>Shipping fee</span>
                        <span>0 Credits</span>
                      </div>
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Shipping discount</span>
                        <span>100%</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* NOTE: Promo code has been REMOVED as per instructions */}
              </div>

              {/* Total & Checkout Section */}
              <div className="pt-4 border-t border-slate-200/90 space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-base font-extrabold text-slate-900">
                    Total ({totalItemsCount} items)
                  </span>
                  <div className="text-right">
                    <span className="text-xl sm:text-2xl font-black text-slate-900">
                      {finalTotal}{" "}
                      <span className="text-sm font-bold text-slate-500">Credits</span>
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0 || isCheckingOut}
                  className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isCheckingOut ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="size-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Processing Credits...
                    </span>
                  ) : (
                    <>
                      Check out
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
                  <ShieldCheck className="size-3.5 text-emerald-600" />
                  <span>Credits deducted automatically upon delivery confirmation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Order Complete Modal */}
      {orderComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-xl border border-slate-100">
            <div className="size-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="size-8" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Order Confirmed!</h3>
            <p className="text-xs text-slate-500">
              {finalTotal} Credits deducted. Your meal schedule is confirmed and sent to the kitchen.
            </p>
            <button
              type="button"
              onClick={() => setOrderComplete(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
