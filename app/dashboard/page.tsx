import { redirect } from "next/navigation";
import { getProfile, getDetectedTools, getDeclaredTools } from "@/lib/dal";
import { logout } from "@/app/actions/auth";
import { ExtensionCard } from "./extension-card";

const SECTOR_LABELS: Record<string, string> = {
  recrutement_rh: "Recrutement / RH",
  fintech_credit: "Fintech / Crédit",
  assurance: "Assurance",
  autre: "Autre",
};

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "short",
  timeStyle: "short",
});

export default async function DashboardPage() {
  const profile = await getProfile();

  // Authentifié mais sans profil (signup interrompu avant la création société)
  if (!profile) {
    redirect("/signup");
  }

  const company = Array.isArray(profile.companies)
    ? profile.companies[0]
    : profile.companies;

  const [detected, declared] = await Promise.all([
    getDetectedTools(),
    getDeclaredTools(),
  ]);

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
            {
              title: "Outils détectés",
              value: detected.length,
              hint: "Via l'extension",
            },
            {
              title: "Outils déclarés",
              value: declared.length,
              hint: "Saisie manuelle",
            },
            {
              title: "À classer",
              value: detected.length + declared.length,
              hint: "Niveau de risque",
            },
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

        <section className="mt-8">
          <h2 className="mb-3 text-base font-semibold">Outils IA détectés</h2>
          {detected.length === 0 ? (
            <div className="rounded-xl border border-dashed border-black/10 p-8 text-center dark:border-white/15">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Aucun outil détecté pour l&apos;instant. Installez l&apos;extension
                sur les postes de l&apos;équipe pour lancer la détection.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-black/5 bg-white dark:border-white/10 dark:bg-zinc-900">
              <table className="w-full text-sm">
                <thead className="border-b border-black/5 text-left text-xs text-zinc-500 dark:border-white/10">
                  <tr>
                    <th className="px-4 py-3 font-medium">Outil</th>
                    <th className="px-4 py-3 font-medium">Domaine</th>
                    <th className="px-4 py-3 font-medium">Utilisateurs</th>
                    <th className="px-4 py-3 font-medium">Dernière activité</th>
                  </tr>
                </thead>
                <tbody>
                  {detected.map((tool) => (
                    <tr
                      key={tool.id}
                      className="border-b border-black/5 last:border-0 dark:border-white/10"
                    >
                      <td className="px-4 py-3 font-medium">
                        {tool.tool_name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {tool.domain}
                      </td>
                      <td className="px-4 py-3">{tool.distinct_users_count}</td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {tool.last_seen
                          ? dateFmt.format(new Date(tool.last_seen))
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {profile.role === "admin" && company?.ingest_token && (
          <ExtensionCard token={company.ingest_token} />
        )}

        <p className="mt-8 text-xs text-zinc-500">
          Outil d&apos;auto-diagnostic. Ne remplace pas un avis juridique
          professionnel.
        </p>
      </main>
    </div>
  );
}
