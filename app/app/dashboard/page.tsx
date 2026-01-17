export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-white">Platform Overview</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { name: 'Total Tenants', value: '12', change: '+2', changeType: 'increase' },
          { name: 'Active Domains', value: '24', change: '+5', changeType: 'increase' },
          { name: 'Avg. Response Time', value: '45ms', change: '-12%', changeType: 'decrease' }, // decrease is good here
          { name: 'Error Rate', value: '0.01%', change: '0%', changeType: 'neutral' },
        ].map((stat) => (
          <div key={stat.name} className="overflow-hidden rounded-lg bg-gray-900 px-4 py-5 shadow sm:p-6 border border-gray-800">
            <dt className="truncate text-sm font-medium text-gray-400">{stat.name}</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">{stat.value}</dd>
            <div className={`mt-2 flex items-baseline text-sm font-semibold ${
                stat.changeType === 'increase' ? 'text-green-500' :
                stat.changeType === 'decrease' ? 'text-green-500' : 'text-gray-500'
            }`}>
                {stat.change}
                <span className="ml-2 text-gray-400 font-normal">from last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-gray-900 p-6 border border-gray-800">
        <h3 className="text-base font-semibold leading-6 text-white">System Health</h3>
        <div className="mt-4 text-gray-400">
            <p>Control Plane: <span className="text-green-500 font-bold">OPERATIONAL</span></p>
            <p>Edge Nodes: <span className="text-green-500 font-bold">12/12 ONLINE</span></p>
            <p>Database: <span className="text-green-500 font-bold">HEALTHY</span></p>
        </div>
      </div>
    </div>
  );
}
