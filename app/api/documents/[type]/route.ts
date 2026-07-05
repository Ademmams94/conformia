import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import {
  getProfile,
  getDetectedTools,
  getDeclaredTools,
  getClassifications,
} from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { sectorLabel } from "@/lib/sectors";
import { CartographieDoc } from "@/lib/pdf/CartographieDoc";
import { AipdDoc } from "@/lib/pdf/AipdDoc";
import type { DocData, DocTool } from "@/lib/pdf/types";

const DOC_TYPES = {
  cartographie: { component: CartographieDoc, dbType: "cartographie", file: "cartographie-ia" },
  aipd: { component: AipdDoc, dbType: "aipd_template", file: "aipd" },
} as const;

type DocKey = keyof typeof DOC_TYPES;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ type: string }> },
) {
  const { type } = await params;
  if (!(type in DOC_TYPES)) {
    return new Response("Type de document inconnu", { status: 404 });
  }
  const config = DOC_TYPES[type as DocKey];

  const profile = await getProfile();
  if (!profile) {
    return new Response("Non autorisé", { status: 401 });
  }

  const [detected, declared, classifications] = await Promise.all([
    getDetectedTools(),
    getDeclaredTools(),
    getClassifications(),
  ]);

  const company = Array.isArray(profile.companies)
    ? profile.companies[0]
    : profile.companies;

  const tools: DocTool[] = [
    ...detected.map((t): DocTool => {
      const c = classifications.get(`detected:${t.id}`);
      return {
        name: t.tool_name ?? t.domain,
        source: "detected",
        detail: t.domain,
        users: t.distinct_users_count,
        riskLevel: c?.risk_level ?? null,
        needsLegalReview: c?.needs_legal_review ?? false,
      };
    }),
    ...declared.map((t): DocTool => {
      const c = classifications.get(`declared:${t.id}`);
      return {
        name: t.tool_name,
        source: "declared",
        detail: t.description ?? "",
        users: null,
        riskLevel: c?.risk_level ?? null,
        needsLegalReview: c?.needs_legal_review ?? false,
      };
    }),
  ];

  const data: DocData = {
    companyName: company?.name ?? "Société",
    siret: (company?.siret as string | null) ?? null,
    sectorLabel: sectorLabel(company?.sector as string | null),
    generatedAt: new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(
      new Date(),
    ),
    tools,
  };

  const element = React.createElement(config.component, {
    data,
  }) as Parameters<typeof renderToBuffer>[0];
  const buffer = await renderToBuffer(element);

  // Trace d'audit (spec 7.2) — réservée à l'admin par la RLS ; on ignore
  // silencieusement si l'utilisateur n'a pas le droit d'écriture.
  if (profile.role === "admin") {
    const supabase = await createClient();
    await supabase.from("compliance_documents").insert({
      company_id: profile.company_id,
      type: config.dbType,
    });
  }

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${config.file}-conformia.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
