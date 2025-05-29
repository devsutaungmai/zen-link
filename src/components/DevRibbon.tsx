'use client'

export default function DevRibbon() {
  const isDevelopment = process.env.NODE_ENV === 'development' || 
                       process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' ||
                       typeof window !== 'undefined' && window.location.hostname.includes('dev.')

  if (!isDevelopment) {
    return null
  }

  return (
    <div className="fixed top-0 right-0 z-[9999] pointer-events-none">
      <div className="relative">
        <div className="bg-red-500 text-black px-12 py-1 text-xs font-bold transform rotate-45 translate-x-8 translate-y-6 shadow-lg">
          <div className="flex items-center space-x-1">
            <span className="text-white">DEV Zenlink</span>
          </div>
        </div>
      </div>
    </div>
  )
}
