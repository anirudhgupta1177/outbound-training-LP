export default function LessonCTA() {
  return (
    <div className="mt-10">
      <a
        href="https://intentledsales.com"
        target="_blank"
        rel="noopener noreferrer"
        className="group block relative overflow-hidden rounded-2xl p-[1px] bg-gradient-to-r from-cyan-400 via-amber-400 to-cyan-400 bg-[length:200%_100%] hover:bg-[position:100%_0] transition-[background-position] duration-500"
      >
        <div className="relative rounded-2xl bg-[#0f0f0f] p-6 sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 via-transparent to-amber-400/5 pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-semibold mb-2">
                Done-for-you
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-amber-400 bg-clip-text text-transparent mb-2 leading-tight">
                Want me to set up this entire system for you?
              </h3>
              <p className="text-sm sm:text-base text-gray-400">
                Skip the build. My team installs the full outbound system for you, end-to-end.
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-amber-400 text-black font-semibold text-sm shadow-lg shadow-cyan-400/20 group-hover:shadow-cyan-400/40 transition-shadow whitespace-nowrap">
                Apply to work 1:1 with us
                <svg
                  className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </a>
    </div>
  );
}
