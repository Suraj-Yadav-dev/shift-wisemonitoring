export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white-700 text-white p-4 text-xl font-semibold shadow">
        Shift Wise Monitoring Dashboard
      </div>

      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
