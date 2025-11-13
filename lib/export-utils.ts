import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import QRCode from 'qrcode'
import type { ScanResult, Violation } from '@/lib/scanner/types'

// Export to JSON
export function exportToJSON(results: ScanResult, filename: string = 'accessibility-report.json') {
  const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
  downloadBlob(blob, filename)
}

// Export to CSV
export function exportToCSV(results: ScanResult, filename: string = 'accessibility-report.csv') {
  const rows: string[][] = [
    ['Category', 'Violation', 'Severity', 'Elements Affected', 'Description', 'WCAG Criteria', 'Help URL']
  ]

  Object.entries(results.violations).forEach(([category, violations]) => {
    violations.forEach((violation: Violation) => {
      rows.push([
        category,
        violation.help,
        violation.severity,
        violation.nodes.length.toString(),
        violation.description,
        violation.wcagTags.join(', '),
        violation.helpUrl
      ])
    })
  })

  const csv = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  downloadBlob(blob, filename)
}

// Export to Excel
export function exportToExcel(results: ScanResult, filename: string = 'accessibility-report.xlsx') {
  const workbook = XLSX.utils.book_new()

  // Summary sheet
  const summaryData = [
    ['WCAG Accessibility Scan Report'],
    [''],
    ['URL', results.url],
    ['Scan Date', new Date(results.timestamp).toLocaleString()],
    [''],
    ['Summary'],
    ['Total Violations', results.summary.violations],
    ['Tests Passed', results.summary.passes],
    ['Needs Review', results.summary.incomplete],
  ]
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

  // Violations sheet
  const violationsData: any[][] = [
    ['Category', 'Violation', 'Severity', 'Impact', 'Elements', 'Description', 'WCAG Tags', 'Help URL']
  ]

  Object.entries(results.violations).forEach(([category, violations]) => {
    violations.forEach((violation: Violation) => {
      violationsData.push([
        category,
        violation.help,
        violation.severity,
        violation.impact,
        violation.nodes.length,
        violation.description,
        violation.wcagTags.join(', '),
        violation.helpUrl
      ])
    })
  })

  const violationsSheet = XLSX.utils.aoa_to_sheet(violationsData)
  XLSX.utils.book_append_sheet(workbook, violationsSheet, 'Violations')

  // Write file
  XLSX.writeFile(workbook, filename)
}

// Export to PDF
export async function exportToPDF(results: ScanResult, filename: string = 'accessibility-report.pdf') {
  const pdf = new jsPDF()
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  let yPos = 20

  // Helper function to add text with page break
  const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
    pdf.setFontSize(fontSize)
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal')

    if (yPos > pageHeight - 20) {
      pdf.addPage()
      yPos = 20
    }

    const lines = pdf.splitTextToSize(text, pageWidth - 40)
    pdf.text(lines, 20, yPos)
    yPos += (lines.length * fontSize * 0.5) + 5
  }

  // Title
  addText('WCAG Accessibility Scan Report', 20, true)
  yPos += 5

  // URL and Date
  addText(`URL: ${results.url}`, 12)
  addText(`Scan Date: ${new Date(results.timestamp).toLocaleString()}`, 12)
  yPos += 10

  // Summary
  addText('Summary', 16, true)
  addText(`Total Violations: ${results.summary.violations}`, 12)
  addText(`Tests Passed: ${results.summary.passes}`, 12)
  addText(`Needs Review: ${results.summary.incomplete}`, 12)
  yPos += 10

  // Violations by Category
  Object.entries(results.violations).forEach(([category, violations]) => {
    if (violations.length > 0) {
      addText(`${category.toUpperCase()} Issues (${violations.length})`, 14, true)

      violations.forEach((violation: Violation, index: number) => {
        addText(`${index + 1}. ${violation.help}`, 11, true)
        addText(`Severity: ${violation.severity} | Elements: ${violation.nodes.length}`, 10)
        addText(`Description: ${violation.description}`, 10)
        addText(`WCAG: ${violation.wcagTags.join(', ')}`, 10)
        yPos += 3
      })

      yPos += 5
    }
  })

  pdf.save(filename)
}

// Export to HTML
export function exportToHTML(results: ScanResult, filename: string = 'accessibility-report.html') {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WCAG Accessibility Scan Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
    h2 { color: #1e40af; margin-top: 30px; }
    h3 { color: #1e3a8a; }
    .summary { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .summary-item { display: inline-block; margin: 10px 20px 10px 0; }
    .violation { border: 1px solid #e5e7eb; padding: 15px; margin: 15px 0; border-radius: 8px; }
    .violation-header { font-weight: bold; color: #1f2937; margin-bottom: 10px; }
    .severity { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 0.875rem; font-weight: 600; }
    .critical { background: #fee2e2; color: #991b1b; }
    .major { background: #fed7aa; color: #9a3412; }
    .moderate { background: #fef3c7; color: #92400e; }
    .minor { background: #dbeafe; color: #1e40af; }
    .wcag-tag { background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 4px; font-size: 0.875rem; margin: 2px; display: inline-block; }
    code { background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
  </style>
</head>
<body>
  <h1>WCAG Accessibility Scan Report</h1>

  <div class="summary">
    <h2>Scan Information</h2>
    <p><strong>URL:</strong> ${results.url}</p>
    <p><strong>Scan Date:</strong> ${new Date(results.timestamp).toLocaleString()}</p>

    <h3>Summary</h3>
    <div class="summary-item"><strong>Violations:</strong> ${results.summary.violations}</div>
    <div class="summary-item"><strong>Passed:</strong> ${results.summary.passes}</div>
    <div class="summary-item"><strong>Needs Review:</strong> ${results.summary.incomplete}</div>
  </div>

  ${Object.entries(results.violations).map(([category, violations]) => {
    if (violations.length === 0) return ''

    return `
      <h2>${category.charAt(0).toUpperCase() + category.slice(1)} Issues (${violations.length})</h2>
      ${violations.map((violation: Violation, index: number) => `
        <div class="violation">
          <div class="violation-header">
            ${index + 1}. ${violation.help}
            <span class="severity ${violation.severity}">${violation.severity}</span>
          </div>
          <p><strong>Description:</strong> ${violation.description}</p>
          <p><strong>Elements Affected:</strong> ${violation.nodes.length}</p>
          <p><strong>WCAG Criteria:</strong> ${violation.wcagTags.map(tag => `<span class="wcag-tag">${tag}</span>`).join(' ')}</p>
          <p><strong>Learn More:</strong> <a href="${violation.helpUrl}" target="_blank">${violation.helpUrl}</a></p>

          ${violation.nodes.slice(0, 3).map((node, i) => `
            <details>
              <summary>Element ${i + 1}</summary>
              <p><code>${node.html.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></p>
              ${node.failureSummary ? `<p><strong>Issue:</strong> ${node.failureSummary}</p>` : ''}
            </details>
          `).join('')}

          ${violation.nodes.length > 3 ? `<p><em>...and ${violation.nodes.length - 3} more element(s)</em></p>` : ''}
        </div>
      `).join('')}
    `
  }).join('')}

  <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
    <p>Generated by WCAG Accessibility Scanner | Powered by axe-core</p>
  </footer>
</body>
</html>
  `

  const blob = new Blob([html], { type: 'text/html' })
  downloadBlob(blob, filename)
}

// Generate QR Code for shareable link
export async function generateQRCode(url: string): Promise<string> {
  try {
    return await QRCode.toDataURL(url, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
  } catch (error) {
    console.error('QR Code generation failed:', error)
    return ''
  }
}

// Generate shareable link (mock - would need backend)
export function generateShareableLink(results: ScanResult): string {
  // In production, this would POST to backend and return a short URL
  // For now, we'll encode in URL params (limited by URL length)
  const compressed = btoa(JSON.stringify({
    url: results.url,
    timestamp: results.timestamp,
    summary: results.summary
  }))

  return `${window.location.origin}/share?data=${compressed}`
}

// Helper function to download blob
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
