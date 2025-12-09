import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Message, ProjectContext, VisualizationPayload } from "../types";

export const generatePDFReport = async (
  context: ProjectContext,
  messages: Message[],
  visualization: VisualizationPayload | null
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let cursorY = margin;

  // --- Helper Functions ---
  const checkPageBreak = (heightNeeded: number) => {
    if (cursorY + heightNeeded > pageHeight - margin) {
      doc.addPage();
      cursorY = margin;
      return true;
    }
    return false;
  };

  const addHeader = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42); // arch-900 equivalent
    doc.text("ARCHTEC-INTEGRATOR PRIME", margin, cursorY);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("RELATÓRIO DE CONSULTORIA INTEGRADA", margin, cursorY + 6);
    
    doc.setDrawColor(14, 165, 233); // arch-accent
    doc.setLineWidth(0.5);
    doc.line(margin, cursorY + 10, pageWidth - margin, cursorY + 10);
    
    cursorY += 20;
  };

  // --- 1. Title & Header ---
  addHeader();

  // --- 2. Project Context ---
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text("1. CONTEXTO DO PROJETO", margin, cursorY);
  cursorY += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  
  const contextData = [
    `Localização: ${context.location || "N/A"}`,
    `Tipologia: ${context.projectType || "N/A"}`,
    `Budget Cap: ${context.budgetCap || "N/A"}`,
    `Risco/Inflação Considerada: ${context.inflationMargin ? context.inflationMargin + "%" : "N/A"}`
  ];

  contextData.forEach((line) => {
    doc.text(`• ${line}`, margin + 5, cursorY);
    cursorY += 6;
  });
  cursorY += 10;

  // --- 3. Visualization Capture ---
  if (visualization) {
    checkPageBreak(100); // Check if we have space for the chart
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("2. ANÁLISE QUANTITATIVA (Visualização Atual)", margin, cursorY);
    cursorY += 10;

    const chartElement = document.getElementById('visualization-export-container');
    
    if (chartElement) {
      try {
        // Temporarily style for white background capture if needed, 
        // but html2canvas usually captures computed styles.
        // We use a high scale for better resolution.
        const canvas = await html2canvas(chartElement, {
          scale: 2,
          backgroundColor: '#1e293b', // Match the dark theme background
          logging: false
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - (margin * 2);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        doc.addImage(imgData, 'PNG', margin, cursorY, imgWidth, imgHeight);
        cursorY += imgHeight + 10;
      } catch (err) {
        console.error("Chart capture failed", err);
        doc.setFont("courier", "italic");
        doc.text("[Erro ao renderizar gráfico no PDF]", margin + 5, cursorY);
        cursorY += 10;
      }
    }
  }

  // --- 4. Chat History / Analysis Log ---
  checkPageBreak(20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text("3. MEMORIAL DESCRITIVO & ANÁLISE", margin, cursorY);
  cursorY += 10;

  doc.setFontSize(9);
  
  // Filter out system messages or welcome messages if desired, 
  // but usually users want the full context.
  const logMessages = messages.filter(m => m.id !== 'welcome');

  logMessages.forEach((msg) => {
    const isUser = msg.role === 'user';
    const roleTitle = isUser ? "CLIENTE/USUÁRIO" : "CONSULTOR ARCHTEC";
    
    // Check space for Header
    checkPageBreak(15);

    // Role Header
    doc.setFont("helvetica", "bold");
    doc.setTextColor(isUser ? 100 : 14, 165, 233); // Gray for user, Blue for Bot
    doc.text(`[${roleTitle}]`, margin, cursorY);
    cursorY += 5;

    // Content
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    
    // Clean content (remove markdown-ish artifacts if needed, simple replace)
    const cleanContent = msg.content.replace(/\*\*/g, '').replace(/###/g, ''); 
    const lines = doc.splitTextToSize(cleanContent, pageWidth - (margin * 2));
    
    // Check space for content block
    if (checkPageBreak(lines.length * 4 + 5)) {
        // If broken, reprint role header on new page? Optional.
        // For simplicity, just continue text.
    }

    doc.text(lines, margin, cursorY);
    cursorY += (lines.length * 4) + 8; // Line height + spacing
  });

  // --- Footer / Disclaimer ---
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      "Gerado por ArchTec-Integrator Prime AI. Este documento não substitui aprovação técnica legal.",
      margin,
      pageHeight - 10
    );
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth - margin - 20,
      pageHeight - 10
    );
  }

  // Save
  doc.save(`ArchTec_Report_${new Date().toISOString().slice(0,10)}.pdf`);
};