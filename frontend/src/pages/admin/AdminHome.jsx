import { Package, Truck, Bike } from 'lucide-react'
import KPICard from '@/components/KPICard'
import { useDemoResource } from '@/hooks/useDemoResource'

export default function AdminHome() {
  // TODO: Replace demo dashboard data with a React Query API query.
  const { data, loading, error, reload } = useDemoResource('/user/admin/dashboard')

  if (loading) return <div className="p-6 text-sm text-slate-500">Loading dashboard...</div>
  if (error) {
    return (
      <div className="space-y-3 p-6 text-sm text-red-600">
        <p>Unable to load the admin dashboard.</p>
        <button type="button" onClick={() => reload()} className="font-bold underline">Try again</button>
      </div>
    )
  }

  const recentOrders = data?.recentOrders || []

  return (
    <main className="min-h-screen space-y-6 bg-slate-50/60 p-6 text-slate-900">
      <h1 className="text-2xl font-extrabold">Operations overview</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KPICard title="Total orders" value={data?.totalOrders ?? 0} icon={<Package className="size-6" />} />
        <KPICard title="Pending orders" value={data?.pendingOrders ?? 0} icon={<Truck className="size-6" />} />
        <KPICard title="Active deliveries" value={data?.activeDeliveries ?? 0} icon={<Bike className="size-6" />} />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-bold">Recent orders</h2>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-slate-500">No orders have been placed yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <span className="font-semibold">{order.orderId}</span>
                <span className="text-slate-600">{order.customerName}</span>
                <span className="capitalize text-slate-500">{order.status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
