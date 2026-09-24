export function LoadingState() {
  return <div className="px-4 py-10 text-center text-sm text-slate-400" role="status">Loading…</div>
}

export function EmptyMessage({ title }: { title: string }) {
  return <div className="px-4 py-10 text-center text-sm text-slate-500">{title}</div>
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="px-4 py-10 text-center" role="alert">
      <p className="text-sm text-red-600">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        Retry
      </button>
    </div>
  )
}
