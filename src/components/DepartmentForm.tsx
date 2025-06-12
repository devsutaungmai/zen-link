import React, { useState, useRef, useEffect } from 'react'
import { ChevronDownIcon, MagnifyingGlassIcon, CheckIcon } from '@heroicons/react/24/outline'
import { countries } from '@/app/constants/countries'

interface DepartmentFormData {
  name: string
  number?: string
  address: string
  address2?: string
  postCode?: string
  city: string
  phone: string
  country: string
}

interface DepartmentFormProps {
  initialData?: DepartmentFormData
  onSubmit: (data: DepartmentFormData) => void
  loading: boolean
}

export default function DepartmentForm({ initialData, onSubmit, loading }: DepartmentFormProps) {
  const [formData, setFormData] = React.useState<DepartmentFormData>(
    initialData || {
      name: '',
      number: '',
      address: '',
      address2: '',
      postCode: '',
      city: '',
      phone: '',
      country: '',
    }
  )
  
  // Country select state
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Filter countries based on search
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase())
  )
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false)
        setCountrySearch('')
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const handleCountrySelect = (countryName: string) => {
    setFormData({ ...formData, country: countryName })
    setIsCountryDropdownOpen(false)
    setCountrySearch('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-6 py-4 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 
                     text-gray-800 placeholder-gray-500 shadow-lg hover:shadow-xl
                     focus:border-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400/20 
                     transition-all duration-300 hover:bg-white/20"
            placeholder="Enter department name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Number
          </label>
          <input
            type="text"
            value={formData.number}
            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
            className="w-full px-6 py-4 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 
                     text-gray-800 placeholder-gray-500 shadow-lg hover:shadow-xl
                     focus:border-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400/20 
                     transition-all duration-300 hover:bg-white/20"
            placeholder="Department number"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-6 py-4 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 
                     text-gray-800 placeholder-gray-500 shadow-xl hover:shadow-xl
                     focus:border-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400/20 
                     transition-all duration-300 hover:bg-white/20"
            placeholder="Street address"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Address Line 2
          </label>
          <input
            type="text"
            value={formData.address2}
            onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
            className="w-full px-6 py-4 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 
                     text-gray-800 placeholder-gray-500 shadow-lg hover:shadow-xl
                     focus:border-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400/20 
                     transition-all duration-300 hover:bg-white/20"
            placeholder="Apartment, suite, etc. (optional)"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Post Code
          </label>
          <input
            type="text"
            value={formData.postCode}
            onChange={(e) => setFormData({ ...formData, postCode: e.target.value })}
            className="w-full px-6 py-4 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 
                     text-gray-800 placeholder-gray-500 shadow-lg hover:shadow-xl
                     focus:border-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400/20 
                     transition-all duration-300 hover:bg-white/20"
            placeholder="Postal code"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-6 py-4 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 
                     text-gray-800 placeholder-gray-500 shadow-lg hover:shadow-xl
                     focus:border-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400/20 
                     transition-all duration-300 hover:bg-white/20"
            placeholder="City name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-6 py-4 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 
                     text-gray-800 placeholder-gray-500 shadow-lg hover:shadow-xl
                     focus:border-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400/20 
                     transition-all duration-300 hover:bg-white/20"
            placeholder="Phone number"
            required
          />
        </div>

        <div className="relative" ref={dropdownRef}>
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Country <span className="text-red-500">*</span>
          </label>
          
          {/* Custom Select2-style dropdown */}
          <div
            onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
            className="w-full px-6 py-4 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 
                     text-gray-800 shadow-lg hover:shadow-xl cursor-pointer
                     focus-within:border-blue-400/50 focus-within:ring-2 focus-within:ring-blue-400/20 
                     transition-all duration-300 hover:bg-white/20 flex items-center justify-between"
          >
            <span className={formData.country ? 'text-gray-800' : 'text-gray-500'}>
              {formData.country || 'Select a country'}
            </span>
            <ChevronDownIcon 
              className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                isCountryDropdownOpen ? 'rotate-180' : ''
              }`} 
            />
          </div>
          
          {/* Dropdown */}
          {isCountryDropdownOpen && (
            <div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl max-h-80 overflow-hidden">
              {/* Search input */}
              <div className="p-4 border-b border-gray-200/50">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    placeholder="Search countries..."
                    className="w-full pl-10 pr-4 py-3 bg-white/50 rounded-xl border border-gray-200/50 
                             text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 
                             focus:ring-blue-400/20 focus:border-blue-400/50 transition-all duration-200"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              
              {/* Options */}
              <div className="max-h-64 overflow-y-auto">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <div
                      key={country.code}
                      onClick={() => handleCountrySelect(country.name)}
                      className="flex items-center justify-between px-4 py-3 hover:bg-blue-50/50 
                               cursor-pointer transition-colors duration-200 group"
                    >
                      <span className="text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                        {country.name}
                      </span>
                      {formData.country === country.name && (
                        <CheckIcon className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-gray-500">
                    No countries found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t border-white/20">
        <button
          type="button"
          onClick={() => {}} 
          className="px-8 py-4 text-sm font-semibold text-gray-700 bg-white/20 backdrop-blur-lg 
                   border border-white/30 rounded-2xl hover:bg-white/30 hover:scale-105
                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400/20 
                   transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-4 text-sm font-semibold text-white bg-gradient-to-r from-[#31BCFF] to-[#0EA5E9] 
                   border border-transparent rounded-2xl hover:from-[#31BCFF]/90 hover:to-[#0EA5E9]/90 
                   hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#31BCFF]/20 
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                   transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Saving...</span>
            </div>
          ) : (
            'Save Department'
          )}
        </button>
      </div>
    </form>
  )
}
