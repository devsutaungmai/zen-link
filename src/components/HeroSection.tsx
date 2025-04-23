export default function HeroSection() {
  return (
    <section className="bg-[#31BCFF] text-white pt-24">
      <div className="container mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto space-y-8">
          <h1 className="text-5xl font-bold leading-tight">
            Employee Scheduling Made Simple
          </h1>
          <p className="text-xl">
            Streamline your workforce management with our comprehensive time tracking solution.
          </p>
          <div className="space-x-4">
            <button className="bg-white text-[#31BCFF] px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition">
              Start Free Trial
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-md font-semibold hover:bg-white/10 transition">
              Book Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}