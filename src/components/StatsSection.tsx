export default function StatsSection() {
  return (
    <section className="py-20 bg-[#31BCFF]">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-12 text-white-800">Trusted by businesses worldwide</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatItem number="10k+" label="Active Users" />
          <StatItem number="50+" label="Countries" />
          <StatItem number="98%" label="Satisfaction Rate" />
          <StatItem number="24/7" label="Support" />
        </div>
      </div>
    </section>
  )
}

function StatItem({ number, label }: { number: string; label: string }) {
  return (
    <div className="p-6">
      <div className="text-4xl font-bold text-[#0b2634]">{number}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  )
}