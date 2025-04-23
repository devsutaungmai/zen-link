import Link from 'next/link'
import { APP_NAME } from '@/app/constants'

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm fixed w-full z-10">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-[#31BCFF]">
            {APP_NAME}
          </Link>
          <div className="hidden md:flex space-x-8">
            <Link href="#" className="text-gray-600 hover:text-[#31BCFF]">Features</Link>
            <Link href="#" className="text-gray-600 hover:text-[#31BCFF]">Solutions</Link>
            <Link href="#" className="text-gray-600 hover:text-[#31BCFF]">Pricing</Link>
            <Link href="#" className="text-gray-600 hover:text-[#31BCFF]">Resources</Link>
          </div>
          <div className="hidden md:flex space-x-4">
            <Link 
              href="/login" 
              className="px-4 py-2 text-[#31BCFF] font-medium hover:bg-[#31BCFF]/10 rounded-md"
            >
              Login
            </Link>
            <Link 
              href="/register" 
              className="px-4 py-2 bg-[#31BCFF] text-white rounded-md font-medium hover:bg-[#31BCFF]/90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}