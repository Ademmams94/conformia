import type { RiskLevel } from "@/lib/classification/rules";

export interface DocTool {
  name: string;
  source: "detected" | "declared";
  detail: string;
  users: number | null;
  riskLevel: RiskLevel | null;
  needsLegalReview: boolean;
}

export interface DocData {
  companyName: string;
  siret: string | null;
  sectorLabel: string;
  generatedAt: string;
  tools: DocTool[];
}
