export default function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-stone/20 rounded" />
      <div className="mt-3 space-y-2">
        <div className="h-4 bg-stone/20 rounded w-3/4" />
        <div className="h-4 bg-stone/20 rounded w-1/2" />
        <div className="flex gap-1.5 mt-2">
          {[1,2,3].map(i => <div key={i} className="w-5 h-5 rounded-full bg-stone/20" />)}
        </div>
        <div className="flex gap-1 mt-1">
          {['XS','S','M','L'].map(s => <div key={s} className="w-8 h-6 bg-stone/20 rounded" />)}
        </div>
        <div className="h-9 bg-stone/20 rounded mt-2" />
      </div>
    </div>
  );
}
