import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans dark:bg-black">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Conform<span className="text-emerald-600">IA</span>
        </span>
        <nav className="flex items-center gap-3 text-sm font-medium">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-zinc-700 transition-colors hover:bg-black/[.04] dark:text-zinc-300 dark:hover:bg-white/[.06]"
          >
            Se connecter
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-zinc-900 px-4 py-2 text-zinc-50 transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Commencer
          </Link>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start justify-center px-6 py-24">
        <span className="mb-6 rounded-full border border-emerald-600/30 bg-emerald-600/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
          AI Act applicable le 2 août 2026
        </span>
        <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          La conformité AI Act de votre PME, en 20 minutes.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Cartographiez automatiquement les outils IA utilisés dans votre
          organisation — y compris le « Shadow AI » — classez-les par niveau de
          risque et générez votre documentation de conformité. Sans juriste
          dédié.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="flex h-12 items-center justify-center rounded-full bg-emerald-600 px-6 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
          >
            Démarrer le diagnostic
          </Link>
          <Link
            href="/login"
            className="flex h-12 items-center justify-center rounded-full border border-black/[.08] px-6 text-sm font-medium text-zinc-800 transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-200 dark:hover:bg-white/[.06]"
          >
            J&apos;ai déjà un compte
          </Link>
        </div>
        <p className="mt-8 max-w-xl text-xs leading-5 text-zinc-500 dark:text-zinc-500">
          Outil d&apos;auto-diagnostic. Ne remplace pas un avis juridique
          professionnel.
        </p>
      </main>
    </div>
  );
}
