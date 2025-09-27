export default function Skeleton() {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg bg-slate-800">
      <div className="absolute inset-0 w-full h-full animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 opacity-70" />
    </div>
  );
}
