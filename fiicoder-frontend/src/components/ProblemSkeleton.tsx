export default function ProblemSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-(--accent)/15 bg-(--surface-muted) p-4 animate-pulse">
                    <div className="flex items-center justify-between gap-3">
                        <div className="h-5 w-48 rounded-lg bg-(--accent)/10" />
                        <div className="h-6 w-16 rounded-full bg-(--accent)/10" />
                    </div>
                    <div className="mt-3 flex gap-2">
                        <div className="h-4 w-12 rounded-full bg-(--accent)/8" />
                        <div className="h-4 w-16 rounded-full bg-(--accent)/8" />
                    </div>
                </div>
            ))}
        </div>
    );
}
