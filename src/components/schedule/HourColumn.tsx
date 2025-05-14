export default function HourColumn() {
  return (
    <div>
      <div className="p-3 font-medium text-center border-r bg-gray-100 h-[72px]"></div>
      {Array.from({ length: 23 }, (_, hour) => hour + 1).map(hour => (
        <div
          key={hour}
          className="border-b border-r p-3 bg-gray-100 h-[60px]"
        >
          <div className="font-medium text-gray-900">{hour}:00</div>
        </div>
      ))}
    </div>
  )
}