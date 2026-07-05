import { Document, Page, Text } from "@react-pdf/renderer";
import { styles, Brand, Footer } from "./theme";
import { MetaBox, ToolsTable } from "./parts";
import type { DocData } from "./types";

/**
 * Registre de cartographie des systèmes d'IA (spec §6.1).
 * Recense les outils IA détectés + déclarés avec leur classification
 * préliminaire de risque au sens de l'AI Act.
 */
export function CartographieDoc({ data }: { data: DocData }) {
  const highRiskOrReview = data.tools.filter(
    (t) => t.needsLegalReview || t.riskLevel === "high" || t.riskLevel === "prohibited",
  ).length;

  return (
    <Document
      title={`Cartographie IA — ${data.companyName}`}
      author="ConformIA"
    >
      <Page size="A4" style={styles.page}>
        <Brand />
        <Text style={styles.docTitle}>Registre de cartographie des systèmes d&apos;IA</Text>
        <Text style={styles.subtitle}>
          Inventaire des outils d&apos;intelligence artificielle utilisés dans
          l&apos;organisation — Règlement (UE) 2024/1689 (AI Act)
        </Text>

        <MetaBox data={data} />

        <Text style={styles.h2}>Contexte</Text>
        <Text style={styles.paragraph}>
          En tant qu&apos;utilisatrice de systèmes d&apos;IA, votre organisation
          est susceptible d&apos;être qualifiée de « déployeur » au sens de
          l&apos;AI Act. Ce registre recense les systèmes d&apos;IA identifiés
          (détectés automatiquement ou déclarés) et propose une classification
          préliminaire de leur niveau de risque. {highRiskOrReview > 0
            ? `${highRiskOrReview} système(s) nécessite(nt) une attention particulière (relecture juridique ou risque élevé selon l'usage).`
            : "Aucun système à risque élevé n'a été identifié à ce stade."}
        </Text>

        <Text style={styles.h2}>
          Systèmes d&apos;IA recensés ({data.tools.length})
        </Text>
        <ToolsTable tools={data.tools} />

        <Text style={styles.h2}>Rappel réglementaire</Text>
        <Text style={styles.paragraph}>
          Le niveau de risque d&apos;un système d&apos;IA dépend de son usage
          concret. Un outil généraliste (risque limité) utilisé pour un cas de
          l&apos;Annexe III — recrutement, évaluation de salariés, scoring de
          crédit, tarification d&apos;assurance — relève du haut risque et
          impose des obligations renforcées. Les entrées marquées « à faire
          relire » doivent être confirmées avec un professionnel du droit.
        </Text>

        <Footer />
      </Page>
    </Document>
  );
}
