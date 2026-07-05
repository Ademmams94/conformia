import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { RiskLevel } from "@/lib/classification/rules";

export const COLORS = {
  emerald: "#059669",
  ink: "#18181b",
  gray: "#52525b",
  light: "#a1a1aa",
  border: "#e4e4e7",
  bgSoft: "#f4f4f5",
  red: "#b91c1c",
  orange: "#c2410c",
  amber: "#b45309",
  green: "#047857",
};

export const RISK_PDF: Record<RiskLevel, { label: string; color: string }> = {
  prohibited: { label: "Interdit", color: COLORS.red },
  high: { label: "Haut risque", color: COLORS.orange },
  limited: { label: "Risque limité", color: COLORS.amber },
  minimal: { label: "Risque minimal", color: COLORS.green },
};

export const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 64,
    paddingHorizontal: 44,
    fontSize: 10,
    color: COLORS.ink,
    fontFamily: "Helvetica",
    lineHeight: 1.5,
  },
  brand: { fontSize: 13, fontFamily: "Helvetica-Bold", color: COLORS.ink },
  brandAccent: { color: COLORS.emerald },
  docTitle: { fontSize: 18, fontFamily: "Helvetica-Bold", marginTop: 18 },
  subtitle: { fontSize: 10, color: COLORS.gray, marginTop: 2 },
  metaBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.bgSoft,
    borderRadius: 4,
  },
  metaRow: { flexDirection: "row", marginBottom: 2 },
  metaLabel: { width: 110, color: COLORS.gray },
  metaValue: { flex: 1, fontFamily: "Helvetica-Bold" },
  h2: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginTop: 20,
    marginBottom: 6,
  },
  paragraph: { marginBottom: 8, color: COLORS.gray },
  // Tableau
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.ink,
    paddingBottom: 4,
    marginBottom: 2,
  },
  th: { fontSize: 9, fontFamily: "Helvetica-Bold", color: COLORS.gray },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 5,
  },
  cell: { fontSize: 9, paddingRight: 6 },
  // Champs à compléter (AIPD)
  field: {
    marginTop: 4,
    marginBottom: 10,
    minHeight: 26,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 3,
    padding: 6,
    color: COLORS.light,
    fontSize: 9,
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 44,
    right: 44,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 6,
    fontSize: 7.5,
    color: COLORS.light,
  },
});

/** En-tête de marque commun. */
export function Brand() {
  return (
    <Text style={styles.brand}>
      Conform<Text style={styles.brandAccent}>IA</Text>
    </Text>
  );
}

/** Pied de page fixe avec le disclaimer obligatoire (spec §8A). */
export function Footer() {
  return (
    <View style={styles.footer} fixed>
      <Text>
        Document généré par ConformIA — outil d&apos;auto-diagnostic. Les
        classifications sont préliminaires et ne remplacent pas un avis juridique
        professionnel. Aucune garantie de conformité n&apos;est fournie ; une
        relecture par un juriste spécialisé AI Act / RGPD est recommandée.
      </Text>
    </View>
  );
}
