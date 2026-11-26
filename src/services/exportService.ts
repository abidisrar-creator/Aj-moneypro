import jsPDF from 'jspdf';
import { Transaction, Category, Account } from '../types';

export interface ReportExportData {
  title: string;
  dateRangeLabel: string;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  currencySymbol: string;
  categoryBreakdown: Array<{ name: string; amount: number; percentage: number }>;
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
}

export class ExportService {
  /**
   * Export transactions to CSV
   */
  static exportToCSV(data: ReportExportData): void {
    const categoryMap = new Map(data.categories.map((c) => [c.id, c.name]));
    const accountMap = new Map(data.accounts.map((a) => [a.id, a.name]));

    const headers = [
      'Date',
      'Time',
      'Type',
      'Title',
      'Category',
      'Account / Wallet',
      'Payment Method',
      `Amount (${data.currencySymbol})`,
      'Description',
    ];

    const rows = data.transactions.map((tx) => {
      const catName = tx.type === 'transfer' ? 'Internal Transfer' : categoryMap.get(tx.categoryId) || 'Uncategorized';
      const accName = accountMap.get(tx.accountId) || 'Default Account';
      const toAccName = tx.toAccountId ? ` -> ${accountMap.get(tx.toAccountId) || 'Target'}` : '';

      return [
        `"${tx.date}"`,
        `"${tx.time || ''}"`,
        `"${tx.type.toUpperCase()}"`,
        `"${(tx.title || '').replace(/"/g, '""')}"`,
        `"${catName.replace(/"/g, '""')}"`,
        `"${(accName + toAccName).replace(/"/g, '""')}"`,
        `"${tx.paymentMethod || 'Cash'}"`,
        tx.type === 'expense' ? `-${tx.amount}` : `${tx.amount}`,
        `"${(tx.description || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    // Summary header lines
    const summaryLines = [
      `"AJ MoneyPro - Official Financial Statement & Expense Report"`,
      `"Period: ${data.dateRangeLabel}"`,
      `"Total Income: ${data.currencySymbol} ${data.totalIncome.toLocaleString()}"`,
      `"Total Expenses: ${data.currencySymbol} ${data.totalExpense.toLocaleString()}"`,
      `"Net Savings: ${data.currencySymbol} ${data.netSavings.toLocaleString()}"`,
      '',
      headers.join(','),
      ...rows,
    ];

    const csvContent = '\uFEFF' + summaryLines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AJMoneyPro_Report_${data.dateRangeLabel.replace(/[\s/:]+/g, '_')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Export to Excel format (.csv with XML Excel compatibility metadata)
   */
  static exportToExcel(data: ReportExportData): void {
    // Standard UTF-8 BOM CSV that Excel opens cleanly as columns
    this.exportToCSV(data);
  }

  /**
   * Export to clean, formatted PDF statement
   */
  static exportToPDF(data: ReportExportData): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const categoryMap = new Map(data.categories.map((c) => [c.id, c.name]));
    const accountMap = new Map(data.accounts.map((a) => [a.id, a.name]));

    // Top Brand Banner
    doc.setFillColor(15, 23, 42); // Navy slate-900
    doc.rect(0, 0, 210, 42, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('AJ MoneyPro', 14, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text('Premium Fintech Expense Manager • Official Financial Statement', 14, 27);

    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 34);

    // Period pill badge
    doc.setFillColor(37, 99, 235); // Blue-600
    doc.roundedRect(135, 12, 62, 18, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTING PERIOD', 140, 19);
    doc.setFontSize(10);
    doc.text(data.dateRangeLabel, 140, 26);

    // Financial Overview Summary Cards
    let y = 52;

    // Card 1: Total Income
    doc.setFillColor(240, 253, 244); // Green-50
    doc.setDrawColor(187, 247, 208); // Green-200
    doc.roundedRect(14, y, 58, 24, 2, 2, 'FD');
    doc.setTextColor(22, 101, 52); // Green-800
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL INCOME', 18, y + 7);
    doc.setFontSize(13);
    doc.text(`${data.currencySymbol} ${data.totalIncome.toLocaleString()}`, 18, y + 17);

    // Card 2: Total Expenses
    doc.setFillColor(254, 242, 242); // Red-50
    doc.setDrawColor(254, 202, 202); // Red-200
    doc.roundedRect(76, y, 58, 24, 2, 2, 'FD');
    doc.setTextColor(153, 27, 27); // Red-800
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL EXPENSES', 80, y + 7);
    doc.setFontSize(13);
    doc.text(`${data.currencySymbol} ${data.totalExpense.toLocaleString()}`, 80, y + 17);

    // Card 3: Net Savings
    const isPositiveSavings = data.netSavings >= 0;
    doc.setFillColor(239, 246, 255); // Blue-50
    doc.setDrawColor(191, 219, 254); // Blue-200
    doc.roundedRect(138, y, 58, 24, 2, 2, 'FD');
    doc.setTextColor(30, 64, 175); // Blue-800
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('NET SAVINGS', 142, y + 7);
    doc.setFontSize(13);
    doc.text(
      `${isPositiveSavings ? '+' : ''}${data.currencySymbol} ${data.netSavings.toLocaleString()}`,
      142,
      y + 17
    );

    y += 34;

    // Category Breakdown Section
    if (data.categoryBreakdown.length > 0) {
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Top Spending Categories', 14, y);
      y += 6;

      const topCats = data.categoryBreakdown.slice(0, 5);
      topCats.forEach((cat) => {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(cat.name, 14, y);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(
          `${data.currencySymbol} ${cat.amount.toLocaleString()} (${cat.percentage.toFixed(1)}%)`,
          196,
          y,
          { align: 'right' }
        );

        // progress bar
        doc.setFillColor(226, 232, 240);
        doc.roundedRect(14, y + 2, 182, 2, 1, 1, 'F');
        doc.setFillColor(37, 99, 235);
        const barWidth = Math.max(2, (182 * cat.percentage) / 100);
        doc.roundedRect(14, y + 2, barWidth, 2, 1, 1, 'F');

        y += 9;
      });
      y += 4;
    }

    // Transactions Table
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Transaction Details', 14, y);
    y += 5;

    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, 182, 7, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('DATE', 17, y + 5);
    doc.text('TITLE / CATEGORY', 45, y + 5);
    doc.text('ACCOUNT', 115, y + 5);
    doc.text('TYPE', 150, y + 5);
    doc.text('AMOUNT', 193, y + 5, { align: 'right' });
    y += 8;

    // Table Rows (up to 20 for PDF fit or new page)
    const listToRender = data.transactions.slice(0, 22);

    listToRender.forEach((tx) => {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }

      const catName = tx.type === 'transfer' ? 'Transfer' : categoryMap.get(tx.categoryId) || 'General';
      const accName = accountMap.get(tx.accountId) || 'Account';

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(tx.date, 17, y);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      const truncatedTitle = tx.title.length > 30 ? tx.title.substring(0, 28) + '...' : tx.title;
      doc.text(truncatedTitle, 45, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(catName, 45, y + 4);

      doc.setTextColor(71, 85, 105);
      doc.text(accName.substring(0, 16), 115, y);

      if (tx.type === 'income') {
        doc.setTextColor(16, 185, 129);
        doc.text('INCOME', 150, y);
        doc.setFont('helvetica', 'bold');
        doc.text(`+${data.currencySymbol} ${tx.amount.toLocaleString()}`, 193, y, { align: 'right' });
      } else if (tx.type === 'expense') {
        doc.setTextColor(239, 68, 68);
        doc.text('EXPENSE', 150, y);
        doc.setFont('helvetica', 'bold');
        doc.text(`-${data.currencySymbol} ${tx.amount.toLocaleString()}`, 193, y, { align: 'right' });
      } else {
        doc.setTextColor(59, 130, 246);
        doc.text('TRANSFER', 150, y);
        doc.setFont('helvetica', 'bold');
        doc.text(`${data.currencySymbol} ${tx.amount.toLocaleString()}`, 193, y, { align: 'right' });
      }

      // divider
      doc.setDrawColor(241, 245, 249);
      doc.line(14, y + 6, 196, y + 6);

      y += 8;
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Generated with AJ MoneyPro – Take Control of Your Money • Offline-First Native Finance App', 105, 290, {
      align: 'center',
    });

    doc.save(`AJMoneyPro_Statement_${data.dateRangeLabel.replace(/[\s/:]+/g, '_')}.pdf`);
  }
}
