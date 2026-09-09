export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 text-white">
      <div className="max-w-3xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
          Veylix Platform v0.1.0 (Foundation Ready)
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
          Veylix Asset Inventory
        </h1>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Enterprise physical asset lifecycle management platform designed as a
          modular monolith of near-production quality.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-left">
          <div className="p-4 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <h3 className="font-semibold text-sky-400 text-sm">
              Modular Monolith
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              NestJS backend with clean domain boundaries and explicit policies.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <h3 className="font-semibold text-sky-400 text-sm">
              PostgreSQL + Prisma
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Optimistic concurrency control, append-only audit trail and
              movement chains.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <h3 className="font-semibold text-sky-400 text-sm">
              Security by Design
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Argon2id hashing, secure HttpOnly sessions, and RBAC
              authorization.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
