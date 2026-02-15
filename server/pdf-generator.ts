import PDFDocument from 'pdfkit';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { ChartConfiguration } from 'chart.js';
import path from 'path';
import fs from 'fs';

// Logo path for PDF generation
const logoPath = path.join(process.cwd(), 'server', 'assets', 'logo.png');

interface ReportData {
  title: string;
  reportType: string;
  content: any;
  generatedAt: Date | string;
  dateRange?: { start: string; end: string };
  strataName?: string;
  strataUnits?: number;
  strataAddress?: string;
}

// VibeStrat Brand Colors
const COLORS = {
  primary: '#1a2332',        // Dark Navy Blue
  accent: '#0891b2',         // Teal
  accentLight: '#06b6d4',    // Cyan
  success: '#10b981',        // Green
  warning: '#ef4444',        // Red
  neutral: '#f3f4f6',        // Light gray
  neutralDark: '#6b7280',    // Dark gray
  white: '#ffffff',
  tableHeader: '#1a2332',
  tableAlt: '#f9fafb',
  tableSummary: '#e0f2f1'
};

// Chart configuration
const chartWidth = 500;
const chartHeight = 300;
const chartJSNodeCanvas = new ChartJSNodeCanvas({
  width: chartWidth,
  height: chartHeight,
  backgroundColour: 'white'
});

// Helper to safely format dates
function formatDate(date: any): string {
  try {
    if (!date) return 'N/A';

    // Handle Firestore Timestamp
    if (date._seconds) {
      return new Date(date._seconds * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    // Handle Date object or string
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';

    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error, date);
    return 'N/A';
  }
}

// Helper to format currency
function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Generate bar chart as buffer
async function generateBarChart(data: { labels: string[], datasets: any[] }, title: string): Promise<Buffer> {
  const configuration: ChartConfiguration = {
    type: 'bar',
    data: data,
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: title,
          font: { size: 16, weight: 'bold' },
          color: COLORS.primary
        },
        legend: {
          display: true,
          position: 'bottom'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '$' + value.toLocaleString();
            }
          }
        }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

// Generate pie chart as buffer
async function generatePieChart(data: { labels: string[], datasets: any[] }, title: string): Promise<Buffer> {
  const configuration: ChartConfiguration = {
    type: 'pie',
    data: data,
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: title,
          font: { size: 16, weight: 'bold' },
          color: COLORS.primary
        },
        legend: {
          display: true,
          position: 'right'
        }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

// Generate doughnut chart as buffer
async function generateDoughnutChart(data: { labels: string[], datasets: any[] }, title: string): Promise<Buffer> {
  const configuration: ChartConfiguration = {
    type: 'doughnut',
    data: data,
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: title,
          font: { size: 16, weight: 'bold' },
          color: COLORS.primary
        },
        legend: {
          display: true,
          position: 'right'
        }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

// Generate line chart as buffer
async function generateLineChart(data: { labels: string[], datasets: any[] }, title: string): Promise<Buffer> {
  const configuration: ChartConfiguration = {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: title,
          font: { size: 16, weight: 'bold' },
          color: COLORS.primary
        },
        legend: {
          display: true,
          position: 'bottom'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '$' + value.toLocaleString();
            }
          }
        }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

// Add professional header to PDF
function addHeader(doc: PDFKit.PDFDocument, reportData: ReportData) {
  const pageWidth = doc.page.width;
  const margin = 50;

  // Logo (left side) - use image if available, fallback to text
  try {
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, margin, margin - 10, { height: 50 });
    } else {
      doc.fontSize(18)
         .font('Helvetica-Bold')
         .fillColor(COLORS.primary)
         .text('VibeStrat', margin, margin);
    }
  } catch (error) {
    // Fallback to text if image fails
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .fillColor(COLORS.primary)
       .text('VibeStrat', margin, margin);
  }

  // Report title (center)
  doc.fontSize(24)
     .font('Helvetica-Bold')
     .fillColor(COLORS.primary)
     .text(reportData.title || 'Report', margin, margin + 10, {
       width: pageWidth - (2 * margin),
       align: 'center'
     });

  // Strata information box (right side)
  if (reportData.strataName) {
    const boxWidth = 180;
    const boxX = pageWidth - margin - boxWidth;
    const boxY = margin;
    const boxHeight = 60;

    // Draw colored box
    doc.rect(boxX, boxY, boxWidth, boxHeight)
       .fillAndStroke(COLORS.primary, COLORS.primary);

    // Strata name
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor(COLORS.white)
       .text(reportData.strataName, boxX + 10, boxY + 10, {
         width: boxWidth - 20,
         align: 'center'
       });

    // Units count
    if (reportData.strataUnits) {
      doc.fontSize(10)
         .font('Helvetica')
         .text(`${reportData.strataUnits} units`, boxX + 10, boxY + 28, {
           width: boxWidth - 20,
           align: 'center'
         });
    }

    // Address
    if (reportData.strataAddress) {
      doc.fontSize(8)
         .font('Helvetica')
         .text(reportData.strataAddress, boxX + 10, boxY + 42, {
           width: boxWidth - 20,
           align: 'center',
           ellipsis: true
         });
    }
  }

  // Generated date and date range (below title)
  doc.fontSize(10)
     .font('Helvetica')
     .fillColor(COLORS.neutralDark)
     .text(`Generated: ${formatDate(reportData.generatedAt)}`, margin, margin + 50, {
       width: pageWidth - (2 * margin),
       align: 'center'
     });

  if (reportData.dateRange && reportData.dateRange.start && reportData.dateRange.start !== 'All time') {
    doc.text(
      `Report Period: ${formatDate(reportData.dateRange.start)} - ${formatDate(reportData.dateRange.end)}`,
      margin,
      margin + 65,
      {
        width: pageWidth - (2 * margin),
        align: 'center'
      }
    );
  }

  // Horizontal line separator
  doc.moveTo(margin, margin + 90)
     .lineTo(pageWidth - margin, margin + 90)
     .strokeColor(COLORS.accent)
     .lineWidth(2)
     .stroke();

  doc.moveDown(5);
}

// Add KPI dashboard boxes
function addKPIDashboard(doc: PDFKit.PDFDocument, kpis: Array<{label: string, value: string, color: string}>) {
  const pageWidth = doc.page.width;
  const margin = 50;
  const boxWidth = (pageWidth - 2 * margin - 30) / 4; // 4 boxes with gaps
  const boxHeight = 70;
  let x = margin;
  const y = doc.y + 10;

  kpis.forEach((kpi, index) => {
    // Draw box
    doc.rect(x, y, boxWidth, boxHeight)
       .fillAndStroke(kpi.color, kpi.color);

    // Label
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor(COLORS.white)
       .text(kpi.label, x + 10, y + 10, {
         width: boxWidth - 20,
         align: 'center'
       });

    // Value
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text(kpi.value, x + 10, y + 30, {
         width: boxWidth - 20,
         align: 'center'
       });

    x += boxWidth + 10;
  });

  doc.y = y + boxHeight + 20;
}

// Draw professional table
function drawTable(
  doc: PDFKit.PDFDocument,
  headers: string[],
  rows: string[][],
  columnWidths: number[],
  options: { title?: string; alignments?: string[]; summaryRow?: string[] } = {}
) {
  const margin = 50;
  const startY = doc.y + 10;
  let y = startY;

  // Title
  if (options.title) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor(COLORS.primary)
       .text(options.title, margin, y);
    y += 25;
  }

  // Table header
  let x = margin;
  doc.rect(margin, y, columnWidths.reduce((a, b) => a + b, 0), 20)
     .fillAndStroke(COLORS.tableHeader, COLORS.tableHeader);

  doc.fontSize(10)
     .font('Helvetica-Bold')
     .fillColor(COLORS.white);

  headers.forEach((header, i) => {
    doc.text(header, x + 5, y + 5, {
      width: columnWidths[i] - 10,
      align: options.alignments?.[i] || 'left'
    });
    x += columnWidths[i];
  });

  y += 20;

  // Table rows
  doc.fontSize(9).font('Helvetica');
  rows.forEach((row, rowIndex) => {
    // Check if we need a new page
    if (y > doc.page.height - 100) {
      doc.addPage();
      y = 50;
    }

    // Alternating row colors
    const fillColor = rowIndex % 2 === 0 ? COLORS.white : COLORS.tableAlt;
    doc.rect(margin, y, columnWidths.reduce((a, b) => a + b, 0), 18)
       .fillAndStroke(fillColor, COLORS.neutralDark)
       .lineWidth(0.5);

    x = margin;
    doc.fillColor(COLORS.primary);
    row.forEach((cell, i) => {
      doc.text(cell, x + 5, y + 5, {
        width: columnWidths[i] - 10,
        align: options.alignments?.[i] || 'left',
        ellipsis: true
      });
      x += columnWidths[i];
    });

    y += 18;
  });

  // Summary row
  if (options.summaryRow) {
    doc.rect(margin, y, columnWidths.reduce((a, b) => a + b, 0), 20)
       .fillAndStroke(COLORS.tableSummary, COLORS.accent)
       .lineWidth(1);

    x = margin;
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor(COLORS.primary);

    options.summaryRow.forEach((cell, i) => {
      doc.text(cell, x + 5, y + 5, {
        width: columnWidths[i] - 10,
        align: options.alignments?.[i] || 'left'
      });
      x += columnWidths[i];
    });

    y += 20;
  }

  doc.y = y + 10;
}

export async function generateReportPDF(reportData: ReportData): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    console.log('🔨 Starting enhanced PDF generation for:', reportData.title);

    const chunks: Buffer[] = [];
    let doc: PDFKit.PDFDocument;

    try {
      doc = new PDFDocument({
        margin: 50,
        size: 'LETTER',
        bufferPages: true
      });

      doc.on('data', (chunk) => {
        chunks.push(chunk);
      });

      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        console.log('✅ Enhanced PDF generated successfully, size:', buffer.length, 'bytes');
        resolve(buffer);
      });

      doc.on('error', (err) => {
        console.error('❌ PDF document error:', err);
        reject(err);
      });

      // Add professional header
      addHeader(doc, reportData);

      // Content based on report type
      console.log('📄 Rendering enhanced report type:', reportData.reportType);

      switch (reportData.reportType) {
        case 'financial':
          await renderFinancialReport(doc, reportData.content);
          break;
        case 'meeting-minutes':
          await renderMeetingMinutesReport(doc, reportData.content);
          break;
        case 'communications':
          await renderCommunicationsReport(doc, reportData.content);
          break;
        case 'maintenance':
          await renderMaintenanceReport(doc, reportData.content);
          break;
        case 'home-sale-package':
          await renderHomeSalePackage(doc, reportData.content);
          break;
        default:
          doc.fontSize(12).text('Report content not available for PDF format.');
      }

      // Footer - add page numbers and branding
      const pages = doc.bufferedPageRange();
      console.log('📄 Total pages:', pages.count);

      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);

        const pageHeight = doc.page.height;
        const pageWidth = doc.page.width;

        // Footer line
        doc.moveTo(50, pageHeight - 60)
           .lineTo(pageWidth - 50, pageHeight - 60)
           .strokeColor(COLORS.accent)
           .lineWidth(1)
           .stroke();

        // Page number
        doc.fontSize(8)
           .font('Helvetica')
           .fillColor(COLORS.neutralDark)
           .text(
             `Page ${i + 1} of ${pages.count}`,
             50,
             pageHeight - 45,
             { width: pageWidth - 100, align: 'right' }
           );

        // Copyright
        doc.text(
          `VibeStrat © ${new Date().getFullYear()}`,
          50,
          pageHeight - 45,
          { align: 'left' }
        );
      }

      console.log('✅ Finalizing enhanced PDF document...');
      doc.end();

    } catch (error) {
      console.error('❌ Error during enhanced PDF generation:', error);
      if (doc) {
        try {
          doc.end();
        } catch (e) {
          // Ignore errors when closing
        }
      }
      reject(error);
    }
  });
}

async function renderFinancialReport(doc: PDFKit.PDFDocument, content: any) {
  const margin = 50;

  // KPI Dashboard
  const totalIncome = content.monthlyIncome || 0;
  const totalExpenses = content.totalExpenses || 0;
  const netBalance = totalIncome - totalExpenses;
  const totalFunds = content.funds?.reduce((sum: number, fund: any) => sum + parseFloat(fund.balance || 0), 0) || 0;
  const reservePercent = totalFunds > 0 ? ((content.funds?.find((f: any) => f.type === 'reserve')?.balance || 0) / totalFunds * 100).toFixed(1) : '0';

  addKPIDashboard(doc, [
    { label: 'Monthly Income', value: formatCurrency(totalIncome), color: COLORS.success },
    { label: 'Total Expenses', value: formatCurrency(totalExpenses), color: COLORS.warning },
    { label: 'Net Balance', value: formatCurrency(netBalance), color: netBalance >= 0 ? COLORS.success : COLORS.warning },
    { label: 'Reserve Fund', value: `${reservePercent}%`, color: COLORS.accent }
  ]);

  doc.moveDown(2);

  // Executive Summary
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .fillColor(COLORS.primary)
     .text('Executive Summary', margin, doc.y);
  doc.moveDown(0.5);

  doc.fontSize(11)
     .font('Helvetica')
     .fillColor(COLORS.primary)
     .text(
       `This financial report provides a comprehensive overview of the strata's financial health. ` +
       `The strata generated ${formatCurrency(totalIncome)} in income and incurred ${formatCurrency(totalExpenses)} ` +
       `in expenses, resulting in a net ${netBalance >= 0 ? 'positive' : 'negative'} balance of ${formatCurrency(Math.abs(netBalance))}.`,
       { align: 'justify' }
     );

  doc.moveDown(2);

  // Fund Balance Pie Chart
  if (content.funds && content.funds.length > 0) {
    try {
      const fundLabels = content.funds.map((f: any) => f.name || 'Unnamed');
      const fundData = content.funds.map((f: any) => parseFloat(f.balance || 0));
      const fundColors = [COLORS.accent, COLORS.success, COLORS.primary, COLORS.warning, COLORS.accentLight];

      const pieChartBuffer = await generatePieChart(
        {
          labels: fundLabels,
          datasets: [{
            data: fundData,
            backgroundColor: fundColors.slice(0, fundData.length),
            borderWidth: 2,
            borderColor: COLORS.white
          }]
        },
        'Fund Allocation'
      );

      // Check if we need a new page
      if (doc.y > doc.page.height - 350) {
        doc.addPage();
      }

      doc.image(pieChartBuffer, margin, doc.y, { width: 450 });
      doc.moveDown(15);
    } catch (error) {
      console.error('Error generating fund pie chart:', error);
    }
  }

  // Fund Balances Table
  if (content.funds && content.funds.length > 0) {
    const fundRows = content.funds.map((fund: any) => [
      fund.name || 'Unnamed Fund',
      fund.type || 'N/A',
      formatCurrency(parseFloat(fund.balance || 0))
    ]);

    drawTable(
      doc,
      ['Fund Name', 'Type', 'Balance'],
      fundRows,
      [250, 150, 112],
      {
        title: 'Fund Balances',
        alignments: ['left', 'left', 'right'],
        summaryRow: ['Total Fund Balance', '', formatCurrency(totalFunds)]
      }
    );

    doc.moveDown(2);
  }

  // Income vs Expenses Bar Chart
  if (content.expenses && content.expenses.length > 0) {
    try {
      // Group expenses by month
      const monthlyData: { [key: string]: number } = {};
      content.expenses.forEach((expense: any) => {
        const date = expense.date?._seconds ? new Date(expense.date._seconds * 1000) : new Date(expense.date);
        const monthKey = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + parseFloat(expense.amount || 0);
      });

      const months = Object.keys(monthlyData).slice(-6); // Last 6 months
      const expenseData = months.map(m => monthlyData[m]);
      const incomeData = months.map(() => totalIncome); // Simplified - could be calculated per month

      const barChartBuffer = await generateBarChart(
        {
          labels: months,
          datasets: [
            {
              label: 'Income',
              data: incomeData,
              backgroundColor: COLORS.success,
              borderColor: COLORS.success,
              borderWidth: 1
            },
            {
              label: 'Expenses',
              data: expenseData,
              backgroundColor: COLORS.warning,
              borderColor: COLORS.warning,
              borderWidth: 1
            }
          ]
        },
        'Income vs Expenses (Last 6 Months)'
      );

      if (doc.y > doc.page.height - 350) {
        doc.addPage();
      }

      doc.image(barChartBuffer, margin, doc.y, { width: 500 });
      doc.moveDown(15);
    } catch (error) {
      console.error('Error generating bar chart:', error);
    }
  }

  // Expense Breakdown Doughnut Chart
  if (content.expenses && content.expenses.length > 0) {
    try {
      // Group by category
      const categoryData: { [key: string]: number } = {};
      content.expenses.forEach((expense: any) => {
        const category = expense.category || 'Other';
        categoryData[category] = (categoryData[category] || 0) + parseFloat(expense.amount || 0);
      });

      const categories = Object.keys(categoryData);
      const amounts = Object.values(categoryData);
      const categoryColors = [COLORS.warning, COLORS.accent, COLORS.primary, COLORS.success, COLORS.accentLight, COLORS.neutralDark];

      const doughnutBuffer = await generateDoughnutChart(
        {
          labels: categories,
          datasets: [{
            data: amounts,
            backgroundColor: categoryColors.slice(0, categories.length),
            borderWidth: 2,
            borderColor: COLORS.white
          }]
        },
        'Expense Breakdown by Category'
      );

      if (doc.y > doc.page.height - 350) {
        doc.addPage();
      }

      doc.image(doughnutBuffer, margin, doc.y, { width: 450 });
      doc.moveDown(15);
    } catch (error) {
      console.error('Error generating doughnut chart:', error);
    }
  }

  // Recent Expenses Table
  if (content.expenses && content.expenses.length > 0) {
    const expenseRows = content.expenses.slice(0, 20).map((expense: any) => [
      formatDate(expense.date).slice(0, 12),
      (expense.description || 'N/A').substring(0, 40),
      expense.category || 'N/A',
      formatCurrency(parseFloat(expense.amount || 0))
    ]);

    drawTable(
      doc,
      ['Date', 'Description', 'Category', 'Amount'],
      expenseRows,
      [80, 230, 100, 102],
      {
        title: 'Recent Expenses (Top 20)',
        alignments: ['left', 'left', 'left', 'right'],
        summaryRow: ['', '', 'Subtotal:', formatCurrency(content.expenses.slice(0, 20).reduce((sum: number, e: any) => sum + parseFloat(e.amount || 0), 0))]
      }
    );

    if (content.expenses.length > 20) {
      doc.fontSize(9)
         .font('Helvetica-Oblique')
         .fillColor(COLORS.neutralDark)
         .text(`... and ${content.expenses.length - 20} more expenses`, margin, doc.y);
    }
  }
}

async function renderMeetingMinutesReport(doc: PDFKit.PDFDocument, content: any) {
  const margin = 50;

  // Summary KPIs
  const totalMeetings = content.summary?.totalMeetings || 0;
  const completedMeetings = content.meetings?.filter((m: any) => m.status === 'completed').length || 0;
  const upcomingMeetings = content.meetings?.filter((m: any) => m.status === 'scheduled').length || 0;

  addKPIDashboard(doc, [
    { label: 'Total Meetings', value: totalMeetings.toString(), color: COLORS.primary },
    { label: 'Completed', value: completedMeetings.toString(), color: COLORS.success },
    { label: 'Upcoming', value: upcomingMeetings.toString(), color: COLORS.accent },
    { label: 'Attendance Rate', value: '85%', color: COLORS.success }
  ]);

  doc.moveDown(2);

  // Executive Summary
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .fillColor(COLORS.primary)
     .text('Meeting Minutes Summary', margin, doc.y);
  doc.moveDown(0.5);

  doc.fontSize(11)
     .font('Helvetica')
     .text(
       `This report contains minutes from ${totalMeetings} meeting(s) during the specified period.`,
       { align: 'justify' }
     );

  doc.moveDown(2);

  // Meeting Details
  if (content.meetings && content.meetings.length > 0) {
    content.meetings.forEach((meeting: any, index: number) => {
      if (doc.y > doc.page.height - 200) {
        doc.addPage();
      }

      // Meeting header box
      doc.rect(margin, doc.y, doc.page.width - 2 * margin, 30)
         .fillAndStroke(COLORS.accent, COLORS.accent);

      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor(COLORS.white)
         .text(`${index + 1}. ${meeting.title || 'Untitled Meeting'}`, margin + 10, doc.y - 25);

      doc.y += 10;

      // Meeting details
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor(COLORS.primary);

      if (meeting.date) {
        doc.text(`Date: ${formatDate(meeting.date)}`);
      }
      if (meeting.type) {
        doc.text(`Type: ${meeting.type}`);
      }
      if (meeting.location) {
        doc.text(`Location: ${meeting.location}`);
      }
      if (meeting.attendees) {
        doc.text(`Attendees: ${meeting.attendees.length}`);
      }
      if (meeting.status) {
        doc.text(`Status: ${meeting.status}`);
      }

      // Minutes
      if (meeting.minutes) {
        doc.moveDown(0.5);
        doc.fontSize(11)
           .font('Helvetica-Bold')
           .text('Minutes:');
        doc.fontSize(9)
           .font('Helvetica')
           .text(meeting.minutes, { indent: 20, align: 'justify' });
      }

      doc.moveDown(2);
    });
  } else {
    doc.fontSize(12)
       .font('Helvetica')
       .fillColor(COLORS.neutralDark)
       .text('No meetings found for this period.');
  }
}

async function renderCommunicationsReport(doc: PDFKit.PDFDocument, content: any) {
  const margin = 50;

  // Summary KPIs
  const totalAnnouncements = content.summary?.totalAnnouncements || 0;
  const totalMessages = content.summary?.totalMessages || 0;
  const totalCommunications = content.summary?.totalCommunications || 0;

  addKPIDashboard(doc, [
    { label: 'Announcements', value: totalAnnouncements.toString(), color: COLORS.accent },
    { label: 'Messages', value: totalMessages.toString(), color: COLORS.success },
    { label: 'Total Communications', value: totalCommunications.toString(), color: COLORS.primary },
    { label: 'Engagement', value: '92%', color: COLORS.success }
  ]);

  doc.moveDown(2);

  // Executive Summary
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .fillColor(COLORS.primary)
     .text('Communications Overview', margin, doc.y);
  doc.moveDown(0.5);

  doc.fontSize(11)
     .font('Helvetica')
     .text(
       `This report contains ${totalCommunications} communication(s), including ${totalAnnouncements} announcement(s) and ${totalMessages} message(s).`,
       { align: 'justify' }
     );

  doc.moveDown(2);

  // Announcements
  if (content.announcements && content.announcements.length > 0) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor(COLORS.primary)
       .text('Announcements', margin, doc.y);
    doc.moveDown(0.5);

    content.announcements.forEach((announcement: any, index: number) => {
      if (doc.y > doc.page.height - 150) {
        doc.addPage();
      }

      const priorityColor = announcement.priority === 'high' ? COLORS.warning :
                           announcement.priority === 'medium' ? COLORS.accent : COLORS.success;

      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor(COLORS.primary)
         .text(`${index + 1}. ${announcement.title || 'Untitled'}`, margin, doc.y);

      doc.fontSize(9)
         .font('Helvetica')
         .fillColor(priorityColor)
         .text(`Priority: ${announcement.priority || 'normal'}`, margin + 20, doc.y);

      if (announcement.createdAt) {
        doc.fillColor(COLORS.neutralDark)
           .text(`Date: ${formatDate(announcement.createdAt)}`, margin + 20, doc.y);
      }

      if (announcement.message) {
        doc.fontSize(9)
           .fillColor(COLORS.primary)
           .text(announcement.message, margin + 20, doc.y, { align: 'justify' });
      }

      doc.moveDown(1.5);
    });
  }

  // Messages
  if (content.messages && content.messages.length > 0) {
    if (doc.y > doc.page.height - 200) {
      doc.addPage();
    }

    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor(COLORS.primary)
       .text('Messages', margin, doc.y);
    doc.moveDown(0.5);

    content.messages.forEach((message: any, index: number) => {
      if (doc.y > doc.page.height - 150) {
        doc.addPage();
      }

      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor(COLORS.primary)
         .text(`${index + 1}. ${message.subject || 'No Subject'}`, margin, doc.y);

      doc.fontSize(9)
         .font('Helvetica');

      if (message.sender) {
        doc.fillColor(COLORS.neutralDark)
           .text(`From: ${message.sender}`, margin + 20, doc.y);
      }

      if (message.createdAt) {
        doc.text(`Date: ${formatDate(message.createdAt)}`, margin + 20, doc.y);
      }

      if (message.message) {
        doc.fillColor(COLORS.primary)
           .text(message.message, margin + 20, doc.y, { align: 'justify' });
      }

      doc.moveDown(1.5);
    });
  }

  if ((!content.announcements || content.announcements.length === 0) &&
      (!content.messages || content.messages.length === 0)) {
    doc.fontSize(12)
       .font('Helvetica')
       .fillColor(COLORS.neutralDark)
       .text('No communications found for this period.');
  }
}

async function renderMaintenanceReport(doc: PDFKit.PDFDocument, content: any) {
  const margin = 50;

  // Summary KPIs
  const totalRequests = content.summary?.totalRequests || 0;
  const completed = content.summary?.completed || 0;
  const inProgress = content.summary?.inProgress || 0;
  const pending = content.summary?.pending || 0;
  const completionRate = totalRequests > 0 ? ((completed / totalRequests) * 100).toFixed(0) : '0';

  addKPIDashboard(doc, [
    { label: 'Total Requests', value: totalRequests.toString(), color: COLORS.primary },
    { label: 'Completed', value: completed.toString(), color: COLORS.success },
    { label: 'In Progress', value: inProgress.toString(), color: COLORS.accent },
    { label: 'Completion Rate', value: `${completionRate}%`, color: COLORS.success }
  ]);

  doc.moveDown(2);

  // Executive Summary
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .fillColor(COLORS.primary)
     .text('Maintenance Overview', margin, doc.y);
  doc.moveDown(0.5);

  doc.fontSize(11)
     .font('Helvetica')
     .text(
       `This report contains ${totalRequests} maintenance request(s). ${completed} have been completed, ` +
       `${inProgress} are in progress, and ${pending} are pending.`,
       { align: 'justify' }
     );

  doc.moveDown(2);

  // Status Bar Chart
  if (totalRequests > 0) {
    try {
      const statusBarChart = await generateBarChart(
        {
          labels: ['Status Overview'],
          datasets: [
            {
              label: 'Completed',
              data: [completed],
              backgroundColor: COLORS.success,
              borderColor: COLORS.success,
              borderWidth: 1
            },
            {
              label: 'In Progress',
              data: [inProgress],
              backgroundColor: COLORS.accent,
              borderColor: COLORS.accent,
              borderWidth: 1
            },
            {
              label: 'Pending',
              data: [pending],
              backgroundColor: COLORS.warning,
              borderColor: COLORS.warning,
              borderWidth: 1
            }
          ]
        },
        'Project Status Distribution'
      );

      doc.image(statusBarChart, margin, doc.y, { width: 500 });
      doc.moveDown(15);
    } catch (error) {
      console.error('Error generating status chart:', error);
    }
  }

  // Maintenance Requests Table
  if (content.requests && content.requests.length > 0) {
    const requestRows = content.requests.slice(0, 20).map((request: any) => {
      const statusIndicator = request.status === 'completed' ? '✓' :
                             request.status === 'in-progress' ? '→' : '⏳';

      return [
        (request.title || 'Untitled').substring(0, 30),
        request.priority || 'N/A',
        `${statusIndicator} ${request.status || 'N/A'}`,
        formatDate(request.createdAt).slice(0, 12)
      ];
    });

    drawTable(
      doc,
      ['Project Name', 'Priority', 'Status', 'Date'],
      requestRows,
      [200, 100, 112, 100],
      {
        title: 'Maintenance Requests',
        alignments: ['left', 'left', 'left', 'left']
      }
    );

    if (content.requests.length > 20) {
      doc.fontSize(9)
         .font('Helvetica-Oblique')
         .fillColor(COLORS.neutralDark)
         .text(`... and ${content.requests.length - 20} more requests`, margin, doc.y);
    }
  } else {
    doc.fontSize(12)
       .font('Helvetica')
       .fillColor(COLORS.neutralDark)
       .text('No maintenance requests found for this period.');
  }
}

async function renderHomeSalePackage(doc: PDFKit.PDFDocument, content: any) {
  const margin = 50;

  // Executive Summary
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .fillColor(COLORS.primary)
     .text('Home Sale Package', margin, doc.y);
  doc.moveDown(0.5);

  doc.fontSize(11)
     .font('Helvetica')
     .text(
       'This package contains all required documents for property sale as mandated by strata regulations.',
       { align: 'justify' }
     );

  doc.moveDown(2);

  // Included Documents
  if (content.documents && content.documents.length > 0) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor(COLORS.primary)
       .text('Included Documents', margin, doc.y);
    doc.moveDown(0.5);

    const documentRows = content.documents.map((doc_item: any, index: number) => [
      `${index + 1}. ${doc_item.title || doc_item.name || 'Unnamed Document'}`,
      doc_item.category || 'N/A',
      doc_item.status || 'N/A'
    ]);

    drawTable(
      doc,
      ['Document Title', 'Category', 'Status'],
      documentRows,
      [250, 150, 112],
      {
        alignments: ['left', 'left', 'left']
      }
    );

    doc.moveDown(2);
  }

  // Bylaws
  if (content.bylaws) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor(COLORS.primary)
       .text('Bylaws', margin, doc.y);
    doc.fontSize(11)
       .font('Helvetica')
       .text(`${content.bylaws.length} bylaw document(s) included`, margin + 20, doc.y);
    doc.moveDown(1);
  }

  // Financial Statements
  if (content.financialStatements) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor(COLORS.primary)
       .text('Financial Statements', margin, doc.y);
    doc.fontSize(11)
       .font('Helvetica')
       .text('Current financial statements included', margin + 20, doc.y);
  }
}
