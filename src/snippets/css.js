/**
 * snippets/css.js — CSS code snippet library.
 *
 * At least 5 distinct CSS properties covered. Each snippet is one
 * line of real, meaningful CSS a beginner CS student would encounter.
 *
 * Implemented by Issue #1.
 */

// export const snippets = [
//   // Placeholder snippets — expand to full library in Issue #1
//   { line: 'display: flex;', fn: 'flexbox', tags: ['layout'] },
//   { line: 'background-color: #1a1a2e;', fn: 'color', tags: ['color'] },
//   { line: 'font-size: 1.5rem;', fn: 'typography', tags: ['text'] },
//   { line: 'border-radius: 8px;', fn: 'border', tags: ['box-model'] },
//   { line: 'transition: opacity 0.3s ease;', fn: 'animation', tags: ['motion'] },
// ];

export const snippets = [
  // --- Layout: Flexbox ---
  {
    id: 'css-flexbox-row',
    name: 'flexboxRow',
    language: 'css',
    description:
      'Creates a flex container whose children are laid out in a horizontal row and centred on the cross axis.',
    conceptTags: ['objects'],
    complexity: 1,
    lines: ['.card {', '  display: flex;', '  align-items: center;', '  gap: 8px;', '}'],
  },

  // --- Layout: Grid ---
  {
    id: 'css-grid-three-col',
    name: 'gridThreeColumns',
    language: 'css',
    description:
      'Creates a three-column equal-width grid layout using repeat() and the fr (fraction) unit.',
    conceptTags: ['objects'],
    complexity: 1,
    lines: [
      '.grid {',
      '  display: grid;',
      // repeat(3, 1fr) divides available space into three equal columns
      '  grid-template-columns: repeat(3, 1fr);',
      '  gap: 16px;',
      '}',
    ],
  },

  // --- Sizing & Spacing ---
  {
    id: 'css-box-model-card',
    name: 'boxModelCard',
    language: 'css',
    description:
      'Applies padding, a border, and border-radius to give an element a card-like appearance.',
    conceptTags: ['objects'],
    complexity: 1,
    lines: [
      '.card {',
      '  padding: 12px 24px;',
      '  border: 1px solid #cccccc;',
      '  border-radius: 8px;',
      '}',
    ],
  },

  // --- Color & Background ---
  {
    id: 'css-dark-theme-bg',
    name: 'darkThemeBackground',
    language: 'css',
    description: 'Sets a dark background colour and contrasting white text for a dark-theme UI.',
    conceptTags: ['objects'],
    complexity: 1,
    lines: ['.dark-theme {', '  background-color: #1a1a2e;', '  color: #ffffff;', '}'],
  },

  // --- Typography ---
  {
    id: 'css-typography-heading',
    name: 'typographyHeading',
    language: 'css',
    description: 'Styles a heading with a large font size, bold weight, and centred alignment.',
    conceptTags: ['objects'],
    complexity: 1,
    lines: [
      '.heading {',
      '  font-size: 2rem;',
      '  font-weight: 700;',
      '  text-align: center;',
      '}',
    ],
  },

  // --- Animation & Transition ---
  {
    id: 'css-fade-transition',
    name: 'fadeTransition',
    language: 'css',
    description: 'Adds a smooth opacity fade on hover using the CSS transition property.',
    conceptTags: ['objects'],
    complexity: 1,
    lines: [
      '.btn {',
      '  opacity: 1;',
      // transition eases the change in opacity over 0.3 s
      '  transition: opacity 0.3s ease;',
      '}',
      '.btn:hover {',
      '  opacity: 0.7;',
      '}',
    ],
  },

  // --- Positioning ---
  {
    id: 'css-absolute-centre',
    name: 'absoluteCentre',
    language: 'css',
    description:
      'Centres a child element inside a positioned parent using absolute positioning and the transform trick.',
    conceptTags: ['objects'],
    complexity: 2,
    lines: [
      '.parent {',
      '  position: relative;',
      '}',
      '.child {',
      '  position: absolute;',
      '  top: 50%;',
      '  left: 50%;',
      // translate(-50%, -50%) shifts the element back by half its own size
      '  transform: translate(-50%, -50%);',
      '}',
    ],
  },

  // --- Shadow & Effects ---
  {
    id: 'css-card-shadow',
    name: 'cardShadow',
    language: 'css',
    description: 'Applies a subtle drop shadow to lift a card element off the page.',
    conceptTags: ['objects'],
    complexity: 1,
    lines: ['.card {', '  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);', '}'],
  },

  // --- Responsive: Media Query ---
  {
    id: 'css-responsive-stack',
    name: 'responsiveStack',
    language: 'css',
    description: 'Uses a media query to switch a flex row to a column layout on narrow screens.',
    conceptTags: ['conditionals'],
    complexity: 2,
    lines: [
      '.row {',
      '  display: flex;',
      '  flex-direction: row;',
      '}',
      // conditionally override layout below 600 px viewport width
      '@media (max-width: 600px) {',
      '  .row {',
      '    flex-direction: column;',
      '  }',
      '}',
    ],
  },

  // --- Custom Properties (CSS Variables) ---
  {
    id: 'css-custom-properties',
    name: 'customProperties',
    language: 'css',
    description:
      'Declares CSS custom properties (variables) on :root and uses them for consistent theming.',
    conceptTags: ['objects'],
    complexity: 2,
    lines: [
      ':root {',
      '  --color-primary: #4f46e5;',
      '  --spacing-md: 16px;',
      '}',
      '.btn {',
      // var() reads the value declared on :root
      '  background-color: var(--color-primary);',
      '  padding: var(--spacing-md);',
      '}',
    ],
  },
  // --- Sticky Nagivation Bar ---
  {
    id: 'css-sticky-navbar',
    name: 'stickyNavbar',
    language: 'css',
    description: 'Keeps a navigation bar fixed to the top of the viewport while scrolling.',
    conceptTags: ['objects'],
    complexity: 2,
    lines: ['.navbar {', '  position: sticky;', '  top: 0;', '  background-color: white;', '}'],
  },
  // --- Hover Transform ---
  {
    id: 'css-hover-scale',
    name: 'hoverScale',
    language: 'css',
    description:
      'Slightly enlarges an element when the mouse hovers over it using the transform property.',
    conceptTags: ['animation'],
    complexity: 1,
    lines: [
      '.card {',
      '  transition: transform 0.2s ease;',
      '}',
      '.card:hover {',
      '  transform: scale(1.05);',
      '}',
    ],
  },
];
