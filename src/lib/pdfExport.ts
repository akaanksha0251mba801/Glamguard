import { jsPDF } from "jspdf";
import type { GeneratedRescuePlan, RescuePlanSituation } from "../types/glamguard";

export interface ExportRescuePlanPdfParams {
  title: string;
  occasion: string;
  concerns: string[];
  availableTime: string;
  availableMinutes: number;
  situation: RescuePlanSituation;
  plan: GeneratedRescuePlan;
}

function cleanText(text: string | undefined | null): string {
  if (!text) return "";
  return String(text)
    .replace(/\u20B9/g, "Rs. ")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2022/g, "-")
    .replace(/\u00B7/g, "|")
    .replace(/[^\x20-\x7E\u00B0\n]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildSafeFilename(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `glamguard-${slug || "rescue-plan"}.pdf`;
}

export function exportRescuePlanPdf(params: ExportRescuePlanPdfParams): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 16;
  const contentWidth = pageWidth - marginX * 2;
  const bottomMargin = 20;

  // Brand RGB colors
  const PLUM: [number, number, number] = [56, 36, 62];
  const RASPBERRY: [number, number, number] = [232, 77, 121];
  const MUTED: [number, number, number] = [107, 85, 112];
  const HAIRLINE: [number, number, number] = [232, 223, 230];
  const SOFT_BG: [number, number, number] = [250, 247, 249];

  let y = 0;

  // Top Header Banner
  doc.setFillColor(...PLUM);
  doc.rect(0, 0, pageWidth, 28, "F");
  doc.setFillColor(...RASPBERRY);
  doc.rect(0, 28, pageWidth, 1.5, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("GlamGuard", marginX, 13);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(240, 228, 236);
  doc.text("Personalized Beauty Rescue Plan | Offline Copy", marginX, 20.5);

  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  doc.text(dateStr, pageWidth - marginX, 20.5, { align: "right" });

  y = 39;

  const ensureSpace = (neededMm: number) => {
    if (y + neededMm > pageHeight - bottomMargin) {
      doc.addPage();
      y = 18;
    }
  };

  const writeSectionHeading = (heading: string) => {
    ensureSpace(14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...PLUM);
    doc.text(cleanText(heading), marginX, y);
    y += 2.5;
    doc.setDrawColor(...RASPBERRY);
    doc.setLineWidth(0.5);
    doc.line(marginX, y, marginX + 24, y);
    y += 5.5;
  };

  const writeParagraph = (
    text: string,
    options?: {
      fontSize?: number;
      color?: [number, number, number];
      bold?: boolean;
      indent?: number;
      spacingAfter?: number;
    }
  ) => {
    const fontSize = options?.fontSize ?? 10;
    const indent = options?.indent ?? 0;
    const color = options?.color ?? PLUM;
    const lineHeight = fontSize * 0.45;
    doc.setFont("helvetica", options?.bold ? "bold" : "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(cleanText(text), contentWidth - indent) as string[];
    for (const line of lines) {
      ensureSpace(lineHeight + 2);
      doc.text(line, marginX + indent, y);
      y += lineHeight;
    }
    y += options?.spacingAfter ?? 3;
  };

  // Plan Title & Metadata
  writeParagraph(params.title, { fontSize: 15, bold: true, color: PLUM, spacingAfter: 2 });
  const metaParts = [
    params.occasion,
    `${params.availableTime} limit`,
    params.situation.environment || "Everyday setting",
    ...(params.situation.weather ? [params.situation.weather] : []),
  ];
  writeParagraph(metaParts.join("  |  "), { fontSize: 9, color: RASPBERRY, bold: true, spacingAfter: 2 });

  if (params.concerns.length > 0) {
    writeParagraph(`Concerns: ${params.concerns.join(", ")}`, {
      fontSize: 9.5,
      color: MUTED,
      spacingAfter: 6,
    });
  } else {
    y += 3;
  }

  // 1. Your Situation
  writeSectionHeading("1. Your Situation");
  writeParagraph(params.plan.situationSummary, { fontSize: 10, color: PLUM, spacingAfter: 6 });

  // 2. Your Personalized Rescue Plan
  writeSectionHeading(
    `2. Your Personalized Rescue Plan (${params.plan.timeBreakdown.totalMinutes} min total)`
  );

  for (const step of params.plan.steps) {
    ensureSpace(22);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...PLUM);
    const stepHeader = `${String(step.stepNumber).padStart(2, "0")}. ${cleanText(step.title)} (${step.timeMinutes} min)`;
    const headerLines = doc.splitTextToSize(stepHeader, contentWidth) as string[];
    for (const line of headerLines) {
      ensureSpace(5);
      doc.text(line, marginX, y);
      y += 4.8;
    }

    writeParagraph(`Action: ${step.whatToDo} - ${step.howToDoIt}`, {
      fontSize: 9.5,
      color: PLUM,
      indent: 4,
      spacingAfter: 1.5,
    });
    writeParagraph(`Product / Item: ${step.productUsed}`, {
      fontSize: 9,
      color: RASPBERRY,
      bold: true,
      indent: 4,
      spacingAfter: 1.5,
    });
    writeParagraph(`Why it helps: ${step.whyItHelps}`, {
      fontSize: 9,
      color: MUTED,
      indent: 4,
      spacingAfter: 4.5,
    });
  }

  // 3. Quick Fixes
  if (params.plan.quickFixes.length > 0) {
    writeSectionHeading("3. Quick Fixes");
    for (const fix of params.plan.quickFixes) {
      ensureSpace(14);
      writeParagraph(`${fix.title} (${fix.timeMinutes} min)`, {
        fontSize: 10,
        bold: true,
        color: PLUM,
        spacingAfter: 1,
      });
      writeParagraph(`${fix.instruction} (Using: ${fix.productUsed})`, {
        fontSize: 9.5,
        color: MUTED,
        indent: 3,
        spacingAfter: 3.5,
      });
    }
  }

  // 4. Products That May Help
  if (params.plan.productsThatMayHelp.length > 0) {
    writeSectionHeading("4. Products That May Help");
    for (const prod of params.plan.productsThatMayHelp) {
      ensureSpace(14);
      writeParagraph(`${prod.productType} [${prod.ownershipStatus}]`, {
        fontSize: 10,
        bold: true,
        color: PLUM,
        spacingAfter: 1,
      });
      writeParagraph(`${prod.whyItHelps} (${prod.affordabilityNote})`, {
        fontSize: 9.5,
        color: MUTED,
        indent: 3,
        spacingAfter: 3.5,
      });
    }
  }

  // 5. What to Avoid
  if (params.plan.whatToAvoid.length > 0) {
    writeSectionHeading("5. What to Avoid");
    for (const item of params.plan.whatToAvoid) {
      writeParagraph(`- ${item}`, { fontSize: 9.5, color: PLUM, indent: 2, spacingAfter: 2 });
    }
    y += 3;
  }

  // 6. Time Breakdown
  writeSectionHeading("6. Time Breakdown");
  writeParagraph(params.plan.timeBreakdown.summary, {
    fontSize: 9.5,
    bold: true,
    color: RASPBERRY,
    spacingAfter: 3,
  });

  for (const row of params.plan.timeBreakdown.perStep) {
    ensureSpace(6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...PLUM);
    doc.text(cleanText(row.stepTitle), marginX + 2, y);
    doc.text(`${row.minutes} min`, pageWidth - marginX, y, { align: "right" });
    y += 4.8;
  }

  ensureSpace(8);
  doc.setDrawColor(...HAIRLINE);
  doc.line(marginX, y - 1.5, pageWidth - marginX, y - 1.5);
  y += 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...PLUM);
  doc.text(`Total Estimated Time (Limit: ${params.availableMinutes} min)`, marginX + 2, y);
  doc.setTextColor(...RASPBERRY);
  doc.text(`${params.plan.timeBreakdown.totalMinutes} min`, pageWidth - marginX, y, {
    align: "right",
  });
  y += 8;

  // 7. Final Beauty Tip
  writeSectionHeading("7. Final Beauty Tip");
  const tipLines = doc.splitTextToSize(cleanText(params.plan.finalTip), contentWidth - 8) as string[];
  const boxHeight = tipLines.length * 4.6 + 8;
  ensureSpace(boxHeight + 12);
  doc.setFillColor(...SOFT_BG);
  doc.setDrawColor(...HAIRLINE);
  doc.roundedRect(marginX, y, contentWidth, boxHeight, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...PLUM);
  let tipY = y + 6;
  for (const line of tipLines) {
    doc.text(line, marginX + 4, tipY);
    tipY += 4.6;
  }
  y += boxHeight + 6;

  // Disclaimer Note
  writeParagraph(
    params.plan.professionalNote ||
      "Note: GlamGuard provides practical everyday beauty and styling guidance, not medical diagnosis. Consult a qualified dermatologist for persistent skin or scalp concerns.",
    { fontSize: 8.5, color: MUTED, spacingAfter: 2 }
  );

  // Page Footer on every page
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("GlamGuard | Kolkata Beauty Assistant", marginX, pageHeight - 9);
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - marginX, pageHeight - 9, { align: "right" });
  }

  doc.save(buildSafeFilename(params.title));
}
