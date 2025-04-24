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
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useUser } from '@/app/lib/useUser'

const navigation = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  { name: 'Users', href: '/dashboard/users', icon: UsersIcon },
  {
    name: 'Employees',
    icon: UserGroupIcon,
    children: [
      { name: 'Departments', href: '/dashboard/departments' },
      { name: 'Empoloyees', href: '/dashboard/departments' },
      { name: 'Empoloyees Groups', href: '/dashboard/employee-groups' },
      { name: 'Contracts', href: '/dashboard/employees' },
      { name: 'Documents', href: '/dashboard/departments' },
    ],
  },
  { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
]

interface DashboardNavbarProps {
  setMobileMenuOpen: (open: boolean) => void
}

export default function DashboardNavbar({ setMobileMenuOpen }: DashboardNavbarProps) {
  const router = useRouter()
  const { user, loading } = useUser()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
    <nav className="bg-white shadow-sm fixed w-full z-30">
      <div className="px-4 h-16 flex items-center justify-between">
        {/* Left section with logo */}
        <div className="flex items-center">
          <button
            type="button"
            className="md:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="sr-only">Open menu</span>
            {isMenuOpen ? (
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
          <Link href="/dashboard" className="text-xl font-bold text-[#31BCFF] ml-2 md:ml-0">
            {APP_NAME}
          </Link>
        </div>

        {/* Center section with navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navigation.map((item) => 
            !item.children ? (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center text-gray-600 hover:text-[#31BCFF]"
              >
                <item.icon className="h-5 w-5 mr-1" />
                <span>{item.name}</span>
              </Link>
            ) : (
              <Menu key={item.name} as="div" className="relative">
                <Menu.Button className="flex items-center text-gray-600 hover:text-[#31BCFF]">
                  <item.icon className="h-5 w-5 mr-1" />
                  <span>{item.name}</span>
                  <ChevronDownIcon className="h-4 w-4 ml-1" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute left-0 mt-2 w-48 origin-top-left bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      {item.children.map((child) => (
                        <Menu.Item key={child.name}>
                          {({ active }) => (
                            <Link
                              href={child.href}
                              className={`${
                                active ? 'bg-gray-100 text-[#31BCFF]' : 'text-gray-700'
                              } block px-4 py-2 text-sm`}
                            >
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
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-600 hover:text-[#31BCFF] rounded-full">
            <BellIcon className="h-6 w-6" />
          </button>
          
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center space-x-3 border-l pl-4">
              <UserCircleIcon className="h-8 w-8 text-gray-600" />
              <div className="hidden md:block">
                {loading ? (
                  <p className="text-sm text-gray-500">Loading...</p>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </>
                )}
              </div>
              <ChevronDownIcon className="h-4 w-4 text-gray-500" />
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/dashboard/profile"
                        className={`${
                          active ? 'bg-gray-100 text-[#31BCFF]' : 'text-gray-700'
                        } flex items-center px-4 py-2 text-sm`}
                      >
                        Edit Profile
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/dashboard/account"
                        className={`${
                          active ? 'bg-gray-100 text-[#31BCFF]' : 'text-gray-700'
                        } flex items-center px-4 py-2 text-sm`}
                      >
                        Account Settings
                      </Link>
                    )}
                  </Menu.Item>
                  <div className="border-t border-gray-100" />
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={`${
                          active ? 'bg-gray-100 text-red-600' : 'text-red-500'
                        } flex w-full items-center px-4 py-2 text-sm`}
                      >
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

      {/* Mobile menu */}
      <Transition
        show={isMenuOpen}
        enter="transition ease-out duration-100 transform"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75 transform"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-lg">
            {navigation.map((item) => 
              !item.children ? (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#31BCFF] hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5 mr-3" aria-hidden="true" />
                  {item.name}
                </Link>
              ) : (
                <Disclosure key={item.name} as="div">
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:text-[#31BCFF] hover:bg-gray-50">
                        <item.icon className="h-5 w-5 mr-3" />
                        <span className="flex-1">{item.name}</span>
                        <ChevronDownIcon
                          className={`${
                            open ? 'rotate-180' : ''
                          } w-5 h-5 transition-transform`}
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="px-4 pt-2 pb-2 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            className="flex items-center pl-9 pr-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:text-[#31BCFF] hover:bg-gray-50"
                            onClick={() => setIsMenuOpen(false)}
                          >
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
