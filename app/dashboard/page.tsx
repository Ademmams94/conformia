import { redirect } from "next/navigation";
import { getProfile } from "@/lib/dal";
import { logout } from "@/app/actions/auth";

const SECTOR_LABELS: Record<string, string> = {
  recrutement_rh: "Recrutement / RH",
  fintech_credit: "Fintech / Crédit",
  assurance: "Assurance",
  autre: "Autre",
};

export default async function DashboardPage() {
  const profile = await getProfile();

  // Authentifié mais sans profil (signup interrompu avant la création société)
  if (!profile) {
    redirect("/signup");
  }

  const company = Array.isArray(profile.companies)
    ? profile.companies[0]
    : profile.companies;

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="border-b border-black/5 dark:border-white/10">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold tracking-tight">
            Conform<span className="text-emerald-600">IA</span>
          </span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {profile.email}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-full border border-black/10 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/[.06]"
              >
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">
          {company?.name}
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {company?.sector ? SECTOR_LABELS[company.sector] ?? company.sector : "Secteur non renseigné"}
          {company?.employee_count ? ` · ${company.employee_count} salariés` : ""}
          {" · "}
          <span className="font-medium">
            {profile.role === "admin" ? "Administrateur" : "Employé"}
          </span>
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { title: "Outils détectés", value: "—", hint: "Via l'extension" },
            { title: "Outils déclarés", value: "—", hint: "Saisie manuelle" },
            { title: "À classer", value: "—", hint: "Niveau de risque" },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-xl border border-black/5 bg-white p-5 dark:border-white/10 dark:bg-zinc-900"
            >
              <p className="text-sm text-zinc-500">{card.title}</p>
              <p className="mt-1 text-3xl font-semibold">{card.value}</p>
              <p className="mt-1 text-xs text-zinc-400">{card.hint}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-dashed border-black/10 p-8 text-center dark:border-white/15">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            La cartographie des outils IA arrive à la prochaine étape.
          </p>
        </div>

        <p className="mt-8 text-xs text-zinc-500">
          Outil d&apos;auto-diagnostic. Ne remplace pas un avis juridique
          professionnel.
        </p>
      </main>
    </div>
  );
}
