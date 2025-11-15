import type { ScanResult } from "./scanner/types"

export const demoScanResult: ScanResult = {
  url: "https://example-demo-site.com",
  timestamp: new Date().toISOString(),
  summary: {
    violations: 12,
    passes: 38,
    incomplete: 5,
    inapplicable: 15
  },
  violations: {
    perceivable: [
      {
        id: "image-alt",
        impact: "critical",
        severity: "critical",
        help: "Images must have alternate text",
        description: "Ensures <img> elements have alternate text or a role of none or presentation",
        helpUrl: "https://dequeuniversity.com/rules/axe/4.4/image-alt",
        nodes: [
          {
            html: '<img src="/hero.jpg">',
            target: ["#hero > img"],
            failureSummary: "Fix any of the following:\n  Element does not have an alt attribute"
          },
          {
            html: '<img src="/banner.png">',
            target: ["#banner > img"],
            failureSummary: "Fix any of the following:\n  Element does not have an alt attribute"
          }
        ]
      },
      {
        id: "color-contrast",
        impact: "serious",
        severity: "serious",
        help: "Elements must have sufficient color contrast",
        description: "Ensures the contrast between foreground and background colors meets WCAG 2 AA contrast ratio thresholds",
        helpUrl: "https://dequeuniversity.com/rules/axe/4.4/color-contrast",
        nodes: [
          {
            html: '<p class="text-gray-400">Small text with low contrast</p>',
            target: [".footer p"],
            failureSummary: "Fix any of the following:\n  Element has insufficient color contrast of 2.8:1 (minimum required is 4.5:1)"
          }
        ]
      }
    ],
    operable: [
      {
        id: "button-name",
        impact: "critical",
        severity: "critical",
        help: "Buttons must have discernible text",
        description: "Ensures buttons have discernible text",
        helpUrl: "https://dequeuniversity.com/rules/axe/4.4/button-name",
        nodes: [
          {
            html: '<button><i class="icon-search"></i></button>',
            target: ["#search-btn"],
            failureSummary: "Fix any of the following:\n  Element does not have inner text that is visible to screen readers"
          }
        ]
      },
      {
        id: "link-name",
        impact: "serious",
        severity: "serious",
        help: "Links must have discernible text",
        description: "Ensures links have discernible text",
        helpUrl: "https://dequeuniversity.com/rules/axe/4.4/link-name",
        nodes: [
          {
            html: '<a href="/contact"><i class="icon-mail"></i></a>',
            target: ["nav a:nth-child(3)"],
            failureSummary: "Fix any of the following:\n  Element does not have text that is visible to screen readers"
          },
          {
            html: '<a href="#"><img src="logo.png"></a>',
            target: ["header a"],
            failureSummary: "Fix any of the following:\n  Element does not have text that is visible to screen readers"
          }
        ]
      },
      {
        id: "aria-allowed-attr",
        impact: "critical",
        severity: "serious",
        help: "Elements must only use allowed ARIA attributes",
        description: "Ensures ARIA attributes are allowed for an element's role",
        helpUrl: "https://dequeuniversity.com/rules/axe/4.4/aria-allowed-attr",
        nodes: [
          {
            html: '<div role="button" aria-checked="true">Toggle</div>',
            target: ["#custom-toggle"],
            failureSummary: "Fix all of the following:\n  ARIA attribute is not allowed: aria-checked is not allowed on element with role button"
          }
        ]
      }
    ],
    understandable: [
      {
        id: "label",
        impact: "critical",
        severity: "critical",
        help: "Form elements must have labels",
        description: "Ensures every form element has a label",
        helpUrl: "https://dequeuniversity.com/rules/axe/4.4/label",
        nodes: [
          {
            html: '<input type="email" name="email" placeholder="Email">',
            target: ["#newsletter-form input"],
            failureSummary: "Fix any of the following:\n  Form element does not have an implicit (wrapped) <label>\n  Form element does not have an explicit <label>\n  aria-label attribute does not exist or is empty"
          },
          {
            html: '<input type="text" name="search">',
            target: ["#search-input"],
            failureSummary: "Fix any of the following:\n  Form element does not have an implicit (wrapped) <label>\n  Form element does not have an explicit <label>\n  aria-label attribute does not exist or is empty"
          }
        ]
      },
      {
        id: "html-has-lang",
        impact: "serious",
        severity: "serious",
        help: "The <html> element must have a lang attribute",
        description: "Ensures every HTML document has a lang attribute",
        helpUrl: "https://dequeuniversity.com/rules/axe/4.4/html-has-lang",
        nodes: [
          {
            html: "<!DOCTYPE html>\n<html>",
            target: ["html"],
            failureSummary: "Fix any of the following:\n  The <html> element does not have a lang attribute"
          }
        ]
      }
    ],
    robust: [
      {
        id: "duplicate-id",
        impact: "minor",
        severity: "moderate",
        help: "id attributes must be unique",
        description: "Ensures every id attribute value is unique",
        helpUrl: "https://dequeuniversity.com/rules/axe/4.4/duplicate-id",
        nodes: [
          {
            html: '<div id="content">...</div>',
            target: ["#content:nth-child(1)"],
            failureSummary: "Fix all of the following:\n  Document has multiple elements with the same id attribute: content"
          },
          {
            html: '<div id="content">...</div>',
            target: ["#content:nth-child(2)"],
            failureSummary: "Fix all of the following:\n  Document has multiple elements with the same id attribute: content"
          }
        ]
      },
      {
        id: "aria-valid-attr-value",
        impact: "critical",
        severity: "serious",
        help: "ARIA attributes must have valid values",
        description: "Ensures all ARIA attributes have valid values",
        helpUrl: "https://dequeuniversity.com/rules/axe/4.4/aria-valid-attr-value",
        nodes: [
          {
            html: '<button aria-expanded="yes">Menu</button>',
            target: ["#menu-btn"],
            failureSummary: "Fix all of the following:\n  Invalid ARIA attribute value: aria-expanded value must be 'true' or 'false', not 'yes'"
          }
        ]
      }
    ],
    other: []
  }
}
