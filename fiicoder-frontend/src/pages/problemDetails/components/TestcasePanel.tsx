type Props = {
    // placeholder for future props (input value, handlers)
};

export default function TestcasePanel(_: Props) {
    return (
        <div className="h-full p-6 bg-(--surface-card) overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
                <div className="flex gap-2">
                    {['Case 1', 'Case 2', 'Case 3'].map((c, i) => (
                        <button
                            key={i}
                            className="px-3 py-1 rounded-lg bg-(--accent)/10 border border-(--accent)/20 text-[10px] font-bold text-(--text-muted) hover:text-(--accent)"
                        >
                            {c}
                        </button>
                    ))}
                </div>
                <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-(--accent) tracking-tighter">
                        Input =
                    </p>
                    <textarea
                        className="w-full bg-(--surface-input) border-2 border-(--accent)/20 rounded-xl p-3 outline-none text-xs font-mono text-(--text) focus:border-(--accent)/50 transition-all"
                        placeholder="Ex: 2 3"
                        rows={3}
                    />
                </div>
            </div>
        </div>
    );
}
