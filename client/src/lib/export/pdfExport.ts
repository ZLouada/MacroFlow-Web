import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { 
  FiscalPolicy, 
  MonetaryPolicy, 
  ExternalSector, 
  EconomicIndicators,
  ModelParameters 
} from '@/lib/stores/economicStore';
import type { EquilibriumResult } from '@/lib/economics/mundellFleming';

// =============================================================================
// TYPES
// =============================================================================

export interface ReportData {
  title: string;
  generatedAt: Date;
  fiscalPolicy: FiscalPolicy;
  monetaryPolicy: MonetaryPolicy;
  externalSector: ExternalSector;
  indicators: EconomicIndicators;
  parameters?: ModelParameters;
  equilibrium?: EquilibriumResult;
  chartElement?: HTMLElement | null;
  locale?: string;
}

export interface ExportOptions {
  format: 'pdf' | 'csv';
  includeCharts: boolean;
  includeParameters: boolean;
  fileName?: string;
  orientation?: 'portrait' | 'landscape';
}

// =============================================================================
// PDF EXPORT
// =============================================================================

/**
 * Generate a PDF report from simulation data
 */
export async function exportToPDF(
  data: ReportData,
  options: ExportOptions = { format: 'pdf', includeCharts: true, includeParameters: true }
): Promise<void> {
  const { title, generatedAt, fiscalPolicy, monetaryPolicy, externalSector, indicators, parameters, equilibrium, chartElement } = data;
  const orientation = options.orientation || 'portrait';
  
  // Create PDF document
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // Helper function to add text with line wrapping
  const addText = (text: string, fontSize: number, isBold = false, color: [number, number, number] = [0, 0, 0]) => {
    pdf.setFontSize(fontSize);
    pdf.setTextColor(...color);
    if (isBold) {
      pdf.setFont('helvetica', 'bold');
    } else {
      pdf.setFont('helvetica', 'normal');
    }
    
    const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += fontSize * 0.4;
    });
  };

  // Helper function to add a section
  const addSection = (sectionTitle: string, items: { label: string; value: string | number }[]) => {
    yPosition += 5;
    addText(sectionTitle, 12, true, [99, 102, 241]); // Primary color
    yPosition += 2;
    
    items.forEach(({ label, value }) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128); // Gray
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${label}:`, margin, yPosition);
      pdf.setTextColor(31, 41, 55); // Dark gray
      pdf.setFont('helvetica', 'bold');
      pdf.text(String(value), margin + 60, yPosition);
      yPosition += 5;
    });
  };

  // Header
  addText(title, 24, true, [99, 102, 241]);
  yPosition += 3;
  addText(`Generated: ${generatedAt.toLocaleString(data.locale || 'en-US')}`, 10, false, [107, 114, 128]);
  yPosition += 8;

  // Horizontal line
  pdf.setDrawColor(229, 231, 235);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  // Economic Indicators Section
  addSection('Economic Indicators', [
    { label: 'GDP', value: `${indicators.gdp.toFixed(2)} B` },
    { label: 'Inflation', value: `${(indicators.inflation * 100).toFixed(2)}%` },
    { label: 'Unemployment', value: `${(indicators.unemployment * 100).toFixed(2)}%` },
    { label: 'Price Level', value: indicators.priceLevel.toFixed(2) },
    { label: 'Potential Output', value: `${indicators.potentialOutput.toFixed(2)} B` },
  ]);

  // Fiscal Policy Section
  addSection('Fiscal Policy', [
    { label: 'Tax Rate', value: `${(fiscalPolicy.taxRate * 100).toFixed(1)}%` },
    { label: 'Government Spending', value: `${fiscalPolicy.governmentSpending.toFixed(2)} B` },
    { label: 'Transfer Payments', value: `${fiscalPolicy.transferPayments.toFixed(2)} B` },
  ]);

  // Monetary Policy Section
  addSection('Monetary Policy', [
    { label: 'Money Supply', value: `${monetaryPolicy.moneySupply.toFixed(2)} B` },
    { label: 'Interest Rate', value: `${(monetaryPolicy.interestRate * 100).toFixed(2)}%` },
    { label: 'Reserve Requirement', value: `${(monetaryPolicy.reserveRequirement * 100).toFixed(1)}%` },
    { label: 'Discount Rate', value: `${(monetaryPolicy.discountRate * 100).toFixed(2)}%` },
  ]);

  // External Sector Section
  addSection('External Sector', [
    { label: 'Exchange Rate', value: externalSector.exchangeRate.toFixed(4) },
    { label: 'Exchange Rate Regime', value: externalSector.exchangeRateRegime },
    { label: 'Capital Mobility', value: externalSector.capitalMobility },
    { label: 'World Interest Rate', value: `${(externalSector.worldInterestRate * 100).toFixed(2)}%` },
    { label: 'Exports', value: `${externalSector.exports.toFixed(2)} B` },
    { label: 'Imports', value: `${externalSector.imports.toFixed(2)} B` },
    { label: 'Trade Balance', value: `${(externalSector.exports - externalSector.imports).toFixed(2)} B` },
  ]);

  // Equilibrium Results (if available)
  if (equilibrium) {
    addSection('IS-LM Equilibrium', [
      { label: 'Equilibrium Income (Y)', value: equilibrium.Y.toFixed(2) },
      { label: 'Equilibrium Interest Rate', value: `${(equilibrium.i * 100).toFixed(2)}%` },
      { label: 'Status', value: equilibrium.isValid ? 'Valid' : 'Invalid' },
    ]);
  }

  // Model Parameters (if requested and available)
  if (options.includeParameters && parameters) {
    // New page for parameters
    pdf.addPage();
    yPosition = margin;
    
    addSection('Model Parameters', [
      { label: 'Autonomous Consumption', value: parameters.autonomousConsumption.toFixed(2) },
      { label: 'MPC', value: parameters.marginalPropensityConsume.toFixed(2) },
      { label: 'Investment Sensitivity', value: parameters.investmentSensitivity.toFixed(2) },
      { label: 'Autonomous Investment', value: parameters.autonomousInvestment.toFixed(2) },
      { label: 'Money Demand (k)', value: parameters.moneyDemandIncomeSensitivity.toFixed(2) },
      { label: 'Money Demand (h)', value: parameters.moneyDemandInterestSensitivity.toFixed(2) },
      { label: 'Import Propensity', value: parameters.importPropensity.toFixed(2) },
      { label: 'Export Sensitivity', value: parameters.exportSensitivity.toFixed(2) },
      { label: 'Capital Flow Sensitivity', value: parameters.capitalFlowSensitivity.toFixed(2) },
    ]);
  }

  // Charts (if requested and element available)
  if (options.includeCharts && chartElement) {
    try {
      // New page for charts
      pdf.addPage();
      yPosition = margin;
      
      addText('IS-LM-BOP Chart', 14, true, [99, 102, 241]);
      yPosition += 5;

      const canvas = await html2canvas(chartElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 2 * margin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      if (yPosition + imgHeight > pageHeight - margin) {
        const scaleFactor = (pageHeight - margin - yPosition) / imgHeight;
        pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth * scaleFactor, imgHeight * scaleFactor);
      } else {
        pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
      }
    } catch (error) {
      console.error('Failed to capture chart:', error);
    }
  }

  // Footer on each page
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(156, 163, 175);
    pdf.text(
      `MacroFlow Economic Simulation Report - Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  const fileName = options.fileName || `macroflow-report-${formatDateForFileName(generatedAt)}.pdf`;
  pdf.save(fileName);
}

// =============================================================================
// CSV EXPORT
// =============================================================================

/**
 * Generate a CSV file from simulation data
 */
export function exportToCSV(
  data: ReportData,
  options: ExportOptions = { format: 'csv', includeCharts: false, includeParameters: true }
): void {
  const { title, generatedAt, fiscalPolicy, monetaryPolicy, externalSector, indicators, parameters, equilibrium } = data;
  
  const rows: string[][] = [
    ['MacroFlow Economic Simulation Report'],
    ['Title', title],
    ['Generated', generatedAt.toISOString()],
    [],
    ['Economic Indicators'],
    ['GDP (Billions)', String(indicators.gdp)],
    ['Inflation (%)', String(indicators.inflation * 100)],
    ['Unemployment (%)', String(indicators.unemployment * 100)],
    ['Price Level', String(indicators.priceLevel)],
    ['Potential Output (Billions)', String(indicators.potentialOutput)],
    [],
    ['Fiscal Policy'],
    ['Tax Rate (%)', String(fiscalPolicy.taxRate * 100)],
    ['Government Spending (Billions)', String(fiscalPolicy.governmentSpending)],
    ['Transfer Payments (Billions)', String(fiscalPolicy.transferPayments)],
    [],
    ['Monetary Policy'],
    ['Money Supply (Billions)', String(monetaryPolicy.moneySupply)],
    ['Interest Rate (%)', String(monetaryPolicy.interestRate * 100)],
    ['Reserve Requirement (%)', String(monetaryPolicy.reserveRequirement * 100)],
    ['Discount Rate (%)', String(monetaryPolicy.discountRate * 100)],
    [],
    ['External Sector'],
    ['Exchange Rate', String(externalSector.exchangeRate)],
    ['Exchange Rate Regime', externalSector.exchangeRateRegime],
    ['Capital Mobility', externalSector.capitalMobility],
    ['World Interest Rate (%)', String(externalSector.worldInterestRate * 100)],
    ['Exports (Billions)', String(externalSector.exports)],
    ['Imports (Billions)', String(externalSector.imports)],
    ['Trade Balance (Billions)', String(externalSector.exports - externalSector.imports)],
  ];

  if (equilibrium) {
    rows.push(
      [],
      ['IS-LM Equilibrium'],
      ['Equilibrium Income (Y)', String(equilibrium.Y)],
      ['Equilibrium Interest Rate (%)', String(equilibrium.i * 100)],
      ['Valid', String(equilibrium.isValid)]
    );
  }

  if (options.includeParameters && parameters) {
    rows.push(
      [],
      ['Model Parameters'],
      ['Autonomous Consumption', String(parameters.autonomousConsumption)],
      ['Marginal Propensity to Consume', String(parameters.marginalPropensityConsume)],
      ['Investment Sensitivity', String(parameters.investmentSensitivity)],
      ['Autonomous Investment', String(parameters.autonomousInvestment)],
      ['Money Demand Income Sensitivity (k)', String(parameters.moneyDemandIncomeSensitivity)],
      ['Money Demand Interest Sensitivity (h)', String(parameters.moneyDemandInterestSensitivity)],
      ['Import Propensity', String(parameters.importPropensity)],
      ['Export Sensitivity', String(parameters.exportSensitivity)],
      ['Capital Flow Sensitivity', String(parameters.capitalFlowSensitivity)]
    );
  }

  // Convert to CSV string
  const csvContent = rows
    .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const fileName = options.fileName || `macroflow-report-${formatDateForFileName(generatedAt)}.csv`;
  
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

// =============================================================================
// UNIFIED EXPORT FUNCTION
// =============================================================================

/**
 * Export simulation data to the specified format
 */
export async function exportReport(
  data: ReportData,
  options: ExportOptions
): Promise<void> {
  if (options.format === 'pdf') {
    await exportToPDF(data, options);
  } else {
    exportToCSV(data, options);
  }
}

// =============================================================================
// UTILITIES
// =============================================================================

function formatDateForFileName(date: Date): string {
  return date.toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .slice(0, 19);
}

/**
 * Capture an HTML element as an image data URL
 */
export async function captureElementAsImage(
  element: HTMLElement,
  options: { scale?: number; backgroundColor?: string } = {}
): Promise<string> {
  const { scale = 2, backgroundColor = '#ffffff' } = options;
  
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    backgroundColor,
  });
  
  return canvas.toDataURL('image/png');
}

/**
 * Download an image from a data URL
 */
export function downloadImage(dataUrl: string, fileName: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
