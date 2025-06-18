import Link from 'next/link'
import { Fragment, useState } from 'react'
import { Menu, Transition, Disclosure } from '@headlessui/react'
import { APP_NAME } from '@/app/constants'
import { 
  BellIcon, 
  UserCircleIcon, 
  ChevronDownIcon,
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  UserIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useUser } from '@/app/lib/useUser'

type NavigationChild = {
  name: string
  href: string
}

type NavigationItem = {
  name: string
  href?: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  children?: NavigationChild[]
}

const adminNavigation: NavigationItem[] = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  { name: 'Users', href: '/dashboard/users', icon: UsersIcon },
  {
    name: 'Employees',
    icon: UserGroupIcon,
    children: [
      { name: 'Departments', href: '/dashboard/departments' },
      { name: 'Employees', href: '/dashboard/employees' },
      { name: 'Employee Groups', href: '/dashboard/employee-groups' },
      { name: 'Contracts', href: '/dashboard/employees' },
      { name: 'Documents', href: '/dashboard/departments' },
    ],
  },
  {
    name: 'Schedule',
    icon: ClockIcon,
    children: [
      { name: 'Shift', href: '/dashboard/shifts' },
      { name: 'Schedule', href: '/dashboard/schedule' },
      { name: 'Sick Leaves', href: '/dashboard/sick-leaves' },
    ],
  },
  {
    name: 'Payroll',
    icon: CurrencyDollarIcon,
    children: [
      { name: 'Payroll Periods', href: '/dashboard/payroll-periods' },
      { name: 'Payroll Entries', href: '/dashboard/payroll-entries' },
    ],
  },
  { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
]

const employeeNavigation: NavigationItem[] = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  { name: 'Schedule', href: '/dashboard/schedule', icon: ClockIcon },
  { name: 'Availability', href: '/employee/availability', icon: ClockIcon },
  { name: 'Sick Leave', href: '/employee/sick-leaves', icon: UserIcon },
]

interface DashboardNavbarProps {
  setMobileMenuOpen: (open: boolean) => void
}

export default function DashboardNavbar({ setMobileMenuOpen }: DashboardNavbarProps) {
  const router = useRouter()
  const { user, loading } = useUser()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  console.log('User:', user);
  const navigation = user?.role === 'EMPLOYEE' ? employeeNavigation : adminNavigation

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      })
      
      if (res.ok) {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-lg fixed w-full z-30">
      <div className="px-6 h-18 flex items-center justify-between">
        {/* Left section with logo */}
        <div className="flex items-center">
          <button
            type="button"
            className="md:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100/50 transition-all duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="sr-only">Open menu</span>
            {isMenuOpen ? (
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
          <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-[#31BCFF] to-[#0EA5E9] bg-clip-text text-transparent ml-2 md:ml-0 hover:scale-105 transition-transform duration-200">
            {APP_NAME}
          </Link>
        </div>

        {/* Center section with navigation - conditionally rendered based on user role */}
        <div className="hidden md:flex items-center space-x-1">
          {navigation.map((item) => 
            !item.children ? (
              <Link
                key={item.name}
                href={item.href || '#'}
                className="flex items-center px-4 py-2.5 text-gray-600 hover:text-[#31BCFF] hover:bg-blue-50/50 rounded-xl transition-all duration-200 group"
              >
                <item.icon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ) : (
              <Menu key={item.name} as="div" className="relative">
                <Menu.Button className="flex items-center px-4 py-2.5 text-gray-600 hover:text-[#31BCFF] hover:bg-blue-50/50 rounded-xl transition-all duration-200 group">
                  <item.icon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium">{item.name}</span>
                  <ChevronDownIcon className="h-4 w-4 ml-1 group-hover:rotate-180 transition-transform duration-200" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="transform opacity-0 scale-95 translate-y-2"
                  enterTo="transform opacity-100 scale-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="transform opacity-100 scale-100 translate-y-0"
                  leaveTo="transform opacity-0 scale-95 translate-y-2"
                >
                  <Menu.Items className="absolute left-0 mt-3 w-56 origin-top-left bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl ring-1 ring-black/5 focus:outline-none border border-gray-200/50">
                    <div className="py-2">
                      {item.children?.map((child) => (
                        <Menu.Item key={child.name}>
                          {({ active }) => (
                            <Link
                              href={child.href}
                              className={`${
                                active ? 'bg-blue-50/70 text-[#31BCFF]' : 'text-gray-700'
                              } flex items-center px-4 py-3 text-sm font-medium rounded-xl mx-2 transition-all duration-200 hover:scale-105`}
                            >
                              <div className="w-2 h-2 bg-current rounded-full mr-3 opacity-60"></div>
                              {child.name}
                            </Link>
                          )}
                        </Menu.Item>
                      ))}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            )
          )}
        </div>

        {/* Right section with notifications and profile */}
        <div className="flex items-center space-x-3">
          <button className="relative p-3 text-gray-600 hover:text-[#31BCFF] hover:bg-blue-50/50 rounded-xl transition-all duration-200 group">
            <BellIcon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
          </button>
          
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-50/50 rounded-xl transition-all duration-200 group">
              <div className="relative">
                <UserCircleIcon className="h-9 w-9 text-gray-600 group-hover:text-[#31BCFF] transition-colors duration-200" />
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="hidden md:block text-left">
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-[#31BCFF] transition-colors duration-200">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-200">{user?.email}</p>
                  </>
                )}
              </div>
              <ChevronDownIcon className="h-4 w-4 text-gray-500 group-hover:text-[#31BCFF] group-hover:rotate-180 transition-all duration-200" />
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="transform opacity-0 scale-95 translate-y-2"
              enterTo="transform opacity-100 scale-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="transform opacity-100 scale-100 translate-y-0"
              leaveTo="transform opacity-0 scale-95 translate-y-2"
            >
              <Menu.Items className="absolute right-0 mt-3 w-56 origin-top-right bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl ring-1 ring-black/5 focus:outline-none border border-gray-200/50">
                <div className="py-2">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/dashboard/profile"
                        className={`${
                          active ? 'bg-blue-50/70 text-[#31BCFF]' : 'text-gray-700'
                        } flex items-center px-4 py-3 text-sm font-medium rounded-xl mx-2 transition-all duration-200 hover:scale-105`}
                      >
                        <UserCircleIcon className="h-4 w-4 mr-3 opacity-60" />
                        Edit Profile
                      </Link>
                    )}
                  </Menu.Item>
                  <div className="border-t border-gray-200/50 mx-2 my-2" />
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={`${
                          active ? 'bg-red-50/70 text-red-600' : 'text-red-500'
                        } flex w-full items-center px-4 py-3 text-sm font-medium rounded-xl mx-2 transition-all duration-200 hover:scale-105`}
                      >
                        <svg className="h-4 w-4 mr-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Log out
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>

      {/* Mobile menu - also conditionally rendered based on user role */}
      <Transition
        show={isMenuOpen}
        enter="transition ease-out duration-200 transform"
        enterFrom="opacity-0 scale-95 -translate-y-2"
        enterTo="opacity-100 scale-100 translate-y-0"
        leave="transition ease-in duration-150 transform"
        leaveFrom="opacity-100 scale-100 translate-y-0"
        leaveTo="opacity-0 scale-95 -translate-y-2"
      >
        <div className="md:hidden">
          <div className="px-4 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-xl shadow-xl border-t border-gray-200/50">
            {navigation.map((item) => 
              !item.children ? (
                <Link
                  key={item.name}
                  href={item.href || '#'}
                  className="flex items-center px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-[#31BCFF] hover:bg-blue-50/50 transition-all duration-200 group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-200" aria-hidden="true" />
                  {item.name}
                </Link>
              ) : (
                <Disclosure key={item.name} as="div">
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex items-center w-full px-4 py-3 text-base font-medium text-gray-700 rounded-xl hover:text-[#31BCFF] hover:bg-blue-50/50 transition-all duration-200 group">
                        <item.icon className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
                        <span className="flex-1">{item.name}</span>
                        <ChevronDownIcon
                          className={`${
                            open ? 'rotate-180' : ''
                          } w-5 h-5 transition-transform duration-200`}
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="px-4 pt-2 pb-2 space-y-1">
                        {item.children?.map((child) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            className="flex items-center pl-9 pr-4 py-3 text-sm font-medium text-gray-600 rounded-xl hover:text-[#31BCFF] hover:bg-blue-50/50 transition-all duration-200 group"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <div className="w-2 h-2 bg-current rounded-full mr-3 opacity-60 group-hover:scale-125 transition-transform duration-200"></div>
                            {child.name}
                          </Link>
                        ))}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              )
            )}
          </div>
        </div>
      </Transition>
    </nav>
  )
}
