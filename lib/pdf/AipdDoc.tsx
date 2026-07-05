import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles, Brand, Footer } from "./theme";
import { MetaBox, ToolsTable } from "./parts";
import type { DocData } from "./types";

/** Champ à compléter par l'utilisateur. */
function Field({ hint }: { hint: string }) {
  return (
    <View style={styles.field}>
      <Text>[ À compléter — {hint} ]</Text>
    </View>
  );
}

/**
 * Modèle d'AIPD (Analyse d'Impact relative à la Protection des Données / DPIA)
 * pré-rempli, croisant les obligations RGPD (art. 35) et AI Act (spec §6.1).
 * Structure inspirée du modèle CNIL. Les systèmes d'IA recensés sont
 * pré-injectés ; les analyses restent à compléter par l'organisation.
 */
export function AipdDoc({ data }: { data: DocData }) {
  const sensitive = data.tools.filter(
    (t) => t.needsLegalReview || t.riskLevel === "high" || t.riskLevel === "prohibited",
  );

  return (
    <Document title={`AIPD — ${data.companyName}`} author="ConformIA">
      <Page size="A4" style={styles.page}>
        <Brand />
        <Text style={styles.docTitle}>
          Modèle d&apos;analyse d&apos;impact (AIPD)
        </Text>
        <Text style={styles.subtitle}>
          Croisé RGPD (art. 35) × AI Act — modèle pré-rempli à compléter
        </Text>

        <MetaBox data={data} />

        <Text style={styles.h2}>1. Description générale du traitement</Text>
        <Text style={styles.paragraph}>
          Décrivez le(s) traitement(s) de données personnelles s&apos;appuyant
          sur des systèmes d&apos;IA, leur nature, leur portée et leur contexte.
        </Text>
        <Field hint="nature, portée, contexte et finalités du traitement" />

        <Text style={styles.h2}>2. Finalités</Text>
        <Field hint="objectifs poursuivis par le traitement" />

        <Text style={styles.h2}>3. Données personnelles concernées</Text>
        <Field hint="catégories de données, personnes concernées, durées de conservation" />

        <Text style={styles.h2}>4. Systèmes d&apos;IA impliqués (pré-rempli)</Text>
        <Text style={styles.paragraph}>
          Systèmes d&apos;IA recensés dans la cartographie ConformIA et leur
          classification préliminaire :
        </Text>
        <ToolsTable tools={data.tools} />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.h2}>5. Nécessité et proportionnalité</Text>
        <Text style={styles.paragraph}>
          Justifiez la nécessité du recours à l&apos;IA et la proportionnalité au
          regard des finalités (minimisation des données, base légale,
          information des personnes, exercice des droits).
        </Text>
        <Field hint="base légale, minimisation, information et droits des personnes" />

        <Text style={styles.h2}>6. Risques pour les droits et libertés</Text>
        <Text style={styles.paragraph}>
          {sensitive.length > 0
            ? `Point d'attention : ${sensitive.length} système(s) recensé(s) présente(nt) un risque élevé potentiel ou nécessite(nt) une relecture juridique (${sensitive
                .map((t) => t.name)
                .join(", ")}). Analysez notamment les risques de décision automatisée, de biais et de discrimination.`
            : "Analysez les risques d'accès illégitime, de modification non désirée et de disparition des données, ainsi que les risques spécifiques à l'IA (biais, décision automatisée, discrimination)."}
        </Text>
        <Field hint="risques identifiés, gravité et vraisemblance" />

        <Text style={styles.h2}>7. Mesures envisagées</Text>
        <Field hint="mesures techniques et organisationnelles pour traiter les risques" />

        <Text style={styles.h2}>8. Validation</Text>
        <Text style={styles.paragraph}>
          Avis du DPO (le cas échéant) et validation par la direction.
        </Text>
        <Field hint="avis du DPO, date, décision de la direction" />

        <Footer />
      </Page>
    </Document>
  );
}
