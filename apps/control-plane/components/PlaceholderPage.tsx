export default function PlaceholderPage({ title }: { title?: string }) {
    return (
        <div className="p-12 text-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            <h1 className="text-2xl font-bold mb-2 text-gray-700">{title || "Coming Soon"}</h1>
            <p className="text-gray-500">This feature is implemented in the backend/infra but UI is pending.</p>
        </div>
    );
}
