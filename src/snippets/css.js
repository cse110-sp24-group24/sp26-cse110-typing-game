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

/**
 * snippets/css.js — CSS code snippet library.
 *
 * Each snippet is one line of real CSS a beginner CS student would encounter.
 * Covers layout, color, typography, spacing, box model, effects, and interactivity.
 *
 * Implemented by Issue #1.
 */

export const snippets = [
  // --- Layout: Flexbox ---
  // display: flex turns the element into a flex container; children line up in a row by default
  { line: 'display: flex;', fn: 'flexbox', tags: ['layout'] },
  { line: 'justify-content: space-between;', fn: 'flexbox', tags: ['layout'] },
  { line: 'align-items: center;', fn: 'flexbox', tags: ['layout'] },

  // --- Layout: Grid ---
  { line: 'display: grid;', fn: 'grid', tags: ['layout'] },

  // repeat(3, 1fr) creates three equal-width columns
  { line: 'grid-template-columns: repeat(3, 1fr);', fn: 'grid', tags: ['layout'] },

  // --- Layout: Positioning ---
  // position: absolute removes the element from normal flow — pair with a positioned parent
  { line: 'position: absolute;', fn: 'position', tags: ['layout'] },
  { line: 'overflow: hidden;', fn: 'overflow', tags: ['layout'] },

  // --- Sizing & Spacing ---
  { line: 'width: 100%;', fn: 'sizing', tags: ['spacing'] },

  // shorthand: 12px top/bottom, 24px left/right
  { line: 'padding: 12px 24px;', fn: 'spacing', tags: ['spacing'] },
  { line: 'margin: 16px;', fn: 'spacing', tags: ['spacing'] },

  // --- Box Model ---
  { line: 'border-radius: 8px;', fn: 'border', tags: ['box-model'] },
  { line: 'box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);', fn: 'shadow', tags: ['box-model'] },

  // --- Color ---
  { line: 'background-color: #1a1a2e;', fn: 'color', tags: ['color'] },
  { line: 'color: #333333;', fn: 'color', tags: ['color'] },

  // opacity affects the whole element including children — use rgba() for background-only transparency
  { line: 'opacity: 0.8;', fn: 'color', tags: ['color'] },

  // --- Typography ---
  { line: 'font-size: 1.5rem;', fn: 'typography', tags: ['text'] },
  { line: 'font-weight: 700;', fn: 'typography', tags: ['text'] },
  { line: 'text-align: center;', fn: 'typography', tags: ['text'] },

  // --- Animation & Interactivity ---
  { line: 'transition: opacity 0.3s ease;', fn: 'animation', tags: ['motion'] },

  // cursor: pointer signals to the user that this element is clickable
  { line: 'cursor: pointer;', fn: 'interaction', tags: ['motion'] },
];
