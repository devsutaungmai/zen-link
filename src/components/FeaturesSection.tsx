import { ClockIcon, ChartBarIcon, WalletIcon } from '@heroicons/react/24/outline'

const features = [
  {
    title: "Staff Scheduling",
    description: "Create and manage employee schedules with ease.",
    icon: ClockIcon,
  },
  {
    title: "Time Tracking",
    description: "Track employee hours and attendance automatically.",
    icon: ChartBarIcon,
  },
  {
    title: "Payroll Integration",
    description: "Seamlessly sync with your payroll system.",
    icon: WalletIcon,
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          Everything you need to manage your workforce
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="p-6 rounded-lg border border-gray-200 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-[#31BCFF]/10 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-[#31BCFF]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}