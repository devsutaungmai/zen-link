'use client'

export default function TimeTrackingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      <div className="h-screen p-4">
        {children}
      </div>
    </div>
  )
}
