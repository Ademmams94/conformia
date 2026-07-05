import { Text, View } from "@react-pdf/renderer";
import { styles, RISK_PDF, COLORS } from "./theme";
import type { DocData, DocTool } from "./types";

export function MetaBox({ data }: { data: DocData }) {
  return (
    <View style={styles.metaBox}>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Société</Text>
        <Text style={styles.metaValue}>{data.companyName}</Text>
      </View>
      {data.siret ? (
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>SIRET</Text>
          <Text style={styles.metaValue}>{data.siret}</Text>
        </View>
      ) : null}
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Secteur</Text>
        <Text style={styles.metaValue}>{data.sectorLabel}</Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Généré le</Text>
        <Text style={styles.metaValue}>{data.generatedAt}</Text>
      </View>
    </View>
  );
}

const SOURCE_LABEL: Record<DocTool["source"], string> = {
  detected: "Détecté",
  declared: "Déclaré",
};

export function ToolsTable({ tools }: { tools: DocTool[] }) {
  if (tools.length === 0) {
    return (
      <Text style={styles.paragraph}>
        Aucun système d&apos;IA recensé à ce jour.
      </Text>
    );
  }

  return (
    <View>
      <View style={styles.tableHeader}>
        <Text style={[styles.th, { flex: 2.2 }]}>Outil</Text>
        <Text style={[styles.th, { flex: 1 }]}>Source</Text>
        <Text style={[styles.th, { flex: 2.6 }]}>Domaine / Usage</Text>
        <Text style={[styles.th, { flex: 0.8 }]}>Util.</Text>
        <Text style={[styles.th, { flex: 1.8 }]}>Risque (préliminaire)</Text>
      </View>
      {tools.map((t, i) => {
        const risk = t.riskLevel ? RISK_PDF[t.riskLevel] : null;
        return (
          <View key={i} style={styles.row} wrap={false}>
            <Text style={[styles.cell, { flex: 2.2, fontFamily: "Helvetica-Bold" }]}>
              {t.name}
            </Text>
            <Text style={[styles.cell, { flex: 1, color: COLORS.gray }]}>
              {SOURCE_LABEL[t.source]}
            </Text>
            <Text style={[styles.cell, { flex: 2.6, color: COLORS.gray }]}>
              {t.detail || "—"}
            </Text>
            <Text style={[styles.cell, { flex: 0.8 }]}>
              {t.users ?? "—"}
            </Text>
            <View style={[styles.cell, { flex: 1.8 }]}>
              {risk ? (
                <Text style={{ color: risk.color, fontFamily: "Helvetica-Bold" }}>
                  {risk.label}
                </Text>
              ) : (
                <Text style={{ color: COLORS.light }}>Non classé</Text>
              )}
              {t.needsLegalReview ? (
                <Text style={{ color: COLORS.amber, fontSize: 8 }}>
                  À faire relire
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
