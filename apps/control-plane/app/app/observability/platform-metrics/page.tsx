import Link from "next/link";

export default function PlatformMetricsPage() {
    // In a real implementation, this would query Prometheus/VictoriaMetrics
    const GRAFANA_URL = process.env.GRAFANA_URL || "http://localhost:3002";

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Platform Metrics</h1>
            <div className="bg-white p-6 rounded shadow space-y-4">
                <p className="text-gray-600">
                    Detailed metrics are available in Grafana.
                </p>
                <div className="flex gap-4">
                    <Link href={`${GRAFANA_URL}/d/vantus-overview`} target="_blank" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Open Grafana Dashboard
                    </Link>
                </div>
                <div className="aspect-video bg-gray-100 rounded flex items-center justify-center border-2 border-dashed border-gray-300">
                     <p className="text-gray-400">Chart Embed Placeholder</p>
                </div>
            </div>
        </div>
    );
}
