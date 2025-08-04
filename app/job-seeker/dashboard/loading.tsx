import { DashboardSkeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar skeleton */}
        <aside className="w-64 bg-white border-r shadow-sm">
          <div className="p-6">
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <nav className="px-4 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center px-4 py-3 rounded-lg">
                <div className="h-5 w-5 bg-gray-200 rounded animate-pulse mr-3"></div>
                <div className="h-4 bg-gray-200 rounded flex-1 animate-pulse"></div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content skeleton */}
        <main className="flex-1 p-8">
          <div className="h-8 bg-gray-200 rounded w-80 mb-8 animate-pulse"></div>
          <DashboardSkeleton />
        </main>
      </div>
    </div>
  )
}