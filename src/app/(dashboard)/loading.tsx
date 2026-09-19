export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 lg:px-10 animate-pulse">
      {/* Skeleton Header */}
      <div className="rounded-3xl border border-[#d6e2d8] bg-white/60 p-6 sm:p-7 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="h-4 w-28 rounded-full bg-[#e3ebe4]" />
          <div className="h-4 w-20 rounded-full bg-[#edf2ee]" />
        </div>
        <div className="mt-3 h-8 w-64 rounded-xl bg-[#d8e3da]" />
        <div className="mt-2 h-4 w-80 max-w-full rounded-lg bg-[#e3ebe4]" />
      </div>

      {/* Skeleton Stat Cards / Content Grid */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-3xl border border-[#d8e3da] bg-white/70 p-4 sm:p-5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-2xl bg-[#e3ebe4]" />
              <div className="h-3 w-10 rounded bg-[#edf2ee]" />
            </div>
            <div className="mt-4 h-3 w-16 rounded bg-[#e3ebe4]" />
            <div className="mt-1 h-7 w-12 rounded-lg bg-[#d8e3da]" />
          </div>
        ))}
      </div>

      {/* Skeleton Main Grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-3xl border border-[#d8e3da] bg-white/70 p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#edf2ee] pb-4">
              <div className="h-5 w-36 rounded-lg bg-[#d8e3da]" />
              <div className="h-4 w-20 rounded-lg bg-[#e3ebe4]" />
            </div>
            <div className="mt-4 space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-16 w-full rounded-2xl bg-[#f0f4f0]" />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-[#d8e3da] bg-white/70 p-6 shadow-xs">
            <div className="h-5 w-32 rounded-lg bg-[#d8e3da]" />
            <div className="mt-4 h-24 w-full rounded-2xl bg-[#f0f4f0]" />
            <div className="mt-4 h-2 w-full rounded-full bg-[#e3ebe4]" />
          </div>
        </div>
      </div>
    </div>
  );
}
