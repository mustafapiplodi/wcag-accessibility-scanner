# WCAG Accessibility Scanner

A comprehensive WCAG 2.2 compliance testing tool built with Next.js, shadcn/ui, and axe-core. This tool automatically scans web pages to identify accessibility issues and provides actionable remediation guidance.

## Features

- 🔍 **Automated WCAG 2.2 Scanning** - Test websites against the latest WCAG guidelines
- 🎨 **Modern UI with shadcn/ui** - Beautiful, accessible interface built with Tailwind CSS
- 🌓 **Dark Mode Support** - Full dark mode implementation using next-themes
- 📊 **Detailed Reports** - Comprehensive violation reports with HTML snippets and fix guidance
- ♿ **Four WCAG Principles** - Categorized by Perceivable, Operable, Understandable, and Robust
- 🎯 **Multiple WCAG Levels** - Support for Level A, AA, and AAA compliance testing
- 🚀 **Built with TypeScript** - Full type safety throughout the application

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Accessibility Engine**: axe-core
- **Browser Automation**: Puppeteer
- **Theme**: next-themes (dark mode)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Chrome/Chromium browser (for Puppeteer)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd wcag-accessibility-scanner
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Enter a website URL in the scan form
2. Select your desired WCAG conformance level (A, AA, or AAA)
3. Click "Scan Website"
4. Review the detailed accessibility report organized by WCAG principles

## Project Structure

```
├── app/
│   ├── api/scan/        # API route for accessibility scanning
│   ├── layout.tsx       # Root layout with theme provider
│   ├── page.tsx         # Main page
│   └── globals.css      # Global styles with dark mode variables
├── components/
│   ├── scanner/         # Scanner-specific components
│   │   ├── scan-form.tsx
│   │   ├── results-dashboard.tsx
│   │   └── violation-list.tsx
│   ├── ui/              # shadcn/ui components
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
├── lib/
│   ├── scanner/         # Scanner engine
│   │   ├── engine.ts    # Core scanning logic
│   │   └── types.ts     # TypeScript types
│   └── utils.ts         # Utility functions
└── public/              # Static assets
```

## API Endpoints

### POST /api/scan

Scans a URL for accessibility issues.

**Request Body:**
```json
{
  "url": "https://example.com",
  "options": {
    "wcagLevel": "AA"
  }
}
```

**Response:**
```json
{
  "url": "https://example.com",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "summary": {
    "violations": 5,
    "passes": 45,
    "incomplete": 2,
    "inapplicable": 10
  },
  "violations": {
    "perceivable": [...],
    "operable": [...],
    "understandable": [...],
    "robust": [...]
  }
}
```

## WCAG Principles Tested

### 1. Perceivable
- Alt text for images
- Color contrast ratios
- Text resizing support
- Language attributes

### 2. Operable
- Keyboard accessibility
- Visible focus indicators
- Logical tab order
- Descriptive headings and labels

### 3. Understandable
- Consistent navigation
- Form input labels
- Predictable behavior
- Error prevention

### 4. Robust
- Valid HTML/ARIA
- Status messages
- Compatibility with assistive technologies

## Development

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Environment Variables

Create a `.env.local` file for environment-specific configuration:

```env
# Optional: Custom Chromium path for Puppeteer
PUPPETEER_EXECUTABLE_PATH=/path/to/chromium
```

## License

ISC

## Acknowledgments

- Built with [axe-core](https://github.com/dequelabs/axe-core) by Deque Systems
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Follows [WCAG 2.2 Guidelines](https://www.w3.org/TR/WCAG22/)
