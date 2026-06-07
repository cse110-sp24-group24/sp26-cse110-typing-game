/**
 * snippets/html.js — HTML code snippet library.
 *
 * At least 5 distinct HTML element types covered. Each snippet is one
 * line of real, meaningful HTML a beginner CS student would encounter.
 *
 * Implemented by Issue #1.
 */

// export const snippets = [
//   // Placeholder snippets — expand to full library in Issue #1
//   { line: '<h1 class="title">Hello, World!</h1>',               fn: 'heading',   tags: ['element', 'text'] },
//   { line: '<p id="intro">Welcome to the page.</p>',             fn: 'paragraph', tags: ['element', 'text'] },
//   { line: '<img src="photo.jpg" alt="A photo">',                fn: 'image',     tags: ['element', 'media'] },
//   { line: '<a href="https://example.com">Click here</a>',       fn: 'anchor',    tags: ['element', 'link'] },
//   { line: '<input type="text" placeholder="Enter name...">',    fn: 'input',     tags: ['element', 'form'] },
// ];

/**
 * snippets/html.js — HTML code snippet library.
 *
 * Each snippet is a real HTML structure a beginner CS student would encounter.
 * Conforms to the ADR-004 snippet object schema.
 *
 * Concept tags drawn from the MVP vocabulary:
 *   loops | conditionals | strings | arrays | functions | recursion | objects
 * HTML has no procedural logic, so tags here reflect the closest structural
 * concept (e.g. "objects" for element/attribute structures, "strings" for
 * text content and attribute values).
 *
 * Implemented by Issue #5.
 */

export const snippets = [
  // --- Headings & Paragraphs ---
  {
    id: 'html-article-header',
    name: 'articleHeader',
    language: 'html',
    description:
      'Marks up an article with a semantic header containing a heading and a paragraph introduction.',
    conceptTags: ['strings', 'objects'],
    complexity: 1,
    lines: [
      '<article>',
      '  <h1 class="title">Hello, World!</h1>',
      '  <p id="intro">Welcome to the page.</p>',
      '</article>',
    ],
  },

  // --- Navigation ---
  {
    id: 'html-nav-links',
    name: 'navLinks',
    language: 'html',
    description: 'Creates a semantic navigation bar with three anchor links.',
    conceptTags: ['arrays', 'objects'],
    complexity: 1,
    lines: [
      '<nav class="main-nav">',
      // each <a> is an item in the navigation list
      '  <a href="index.html">Home</a>',
      '  <a href="about.html">About</a>',
      '  <a href="contact.html">Contact</a>',
      '</nav>',
    ],
  },

  // --- Unordered List ---
  {
    id: 'html-unordered-list',
    name: 'unorderedList',
    language: 'html',
    description: 'Marks up a bulleted list of three items using <ul> and <li> elements.',
    conceptTags: ['arrays'],
    complexity: 1,
    lines: [
      '<ul>',
      '  <li>My first list item</li>',
      '  <li>My second list item</li>',
      '  <li>My third list item</li>',
      '</ul>',
    ],
  },

  // --- Image with alt text ---
  {
    id: 'html-figure-image',
    name: 'figureImage',
    language: 'html',
    description:
      'Wraps an image and its caption in a <figure> element. The alt attribute is required for accessibility.',
    conceptTags: ['strings', 'objects'],
    complexity: 1,
    lines: [
      '<figure>',
      // alt text is read aloud by screen readers when the image cannot be seen
      '  <img src="photo.jpg" alt="A scenic mountain view">',
      '  <figcaption>Photo by the trail team</figcaption>',
      '</figure>',
    ],
  },

  // --- Form ---
  {
    id: 'html-contact-form',
    name: 'contactForm',
    language: 'html',
    description: 'Creates a simple contact form with a labelled text input and a submit button.',
    conceptTags: ['objects', 'strings'],
    complexity: 1,
    lines: [
      '<form>',
      // for= links the label to the input with matching id
      '  <label for="email">Email Address</label>',
      '  <input type="text" id="email" placeholder="Enter email...">',
      '  <button type="submit">Send Message</button>',
      '</form>',
    ],
  },

  // --- Checkbox & Label ---
  {
    id: 'html-checkbox-label',
    name: 'checkboxLabel',
    language: 'html',
    description:
      'Pairs a checkbox input with a label using the for/id pattern so clicking the label toggles the checkbox.',
    conceptTags: ['objects'],
    complexity: 1,
    lines: [
      '<div>',
      '  <input type="checkbox" id="agree" name="agree">',
      '  <label for="agree">I agree to the terms</label>',
      '</div>',
    ],
  },

  // --- Select Dropdown ---
  {
    id: 'html-select-dropdown',
    name: 'selectDropdown',
    language: 'html',
    description:
      'Creates a labelled dropdown menu with three options using <select> and <option> elements.',
    conceptTags: ['arrays', 'objects'],
    complexity: 1,
    lines: [
      '<label for="country">Country</label>',
      '<select id="country" name="country">',
      '  <option value="us">United States</option>',
      '  <option value="ca">Canada</option>',
      '  <option value="mx">Mexico</option>',
      '</select>',
    ],
  },

  // --- Semantic Page Layout ---
  {
    id: 'html-page-layout',
    name: 'pageLayout',
    language: 'html',
    description:
      'Lays out a page with semantic elements: a <header>, a <main> content area, and a <footer>.',
    conceptTags: ['objects'],
    complexity: 1,
    lines: [
      '<header>',
      '  <h1>Site Title</h1>',
      '</header>',
      '<main>',
      '  <section id="hero">Page section content</section>',
      '</main>',
      '<footer>',
      '  <p>&copy; 2026 My Site</p>',
      '</footer>',
    ],
  },

  // --- Card Component ---
  {
    id: 'html-card-component',
    name: 'cardComponent',
    language: 'html',
    description:
      'Marks up a reusable card component with an image, a heading, a description, and a call-to-action link.',
    conceptTags: ['objects', 'strings'],
    complexity: 2,
    lines: [
      '<div class="card">',
      '  <img src="thumb.jpg" alt="Card thumbnail">',
      '  <div class="card-body">',
      '    <h2 class="card-title">Card Title</h2>',
      '    <p class="card-text">A short description goes here.</p>',
      '    <a href="#" class="btn">Learn more</a>',
      '  </div>',
      '</div>',
    ],
  },

  // --- Table ---
  {
    id: 'html-data-table',
    name: 'dataTable',
    language: 'html',
    description:
      'Creates a two-column table with a header row and two data rows using semantic <thead> and <tbody>.',
    conceptTags: ['arrays', 'objects'],
    complexity: 2,
    lines: [
      '<table>',
      '  <thead>',
      '    <tr>',
      '      <th>Name</th>',
      '      <th>Score</th>',
      '    </tr>',
      '  </thead>',
      '  <tbody>',
      '    <tr>',
      '      <td>Alice</td>',
      '      <td>98</td>',
      '    </tr>',
      '    <tr>',
      '      <td>Bob</td>',
      '      <td>85</td>',
      '    </tr>',
      '  </tbody>',
      '</table>',
    ],
  },

  {
    id: 'html-progress-bar',
    name: 'progressBar',
    language: 'html',
    description: 'Displays task completion using the progress element.',
    conceptTags: ['objects'],
    complexity: 1,
    lines: [
      '<label for="progress">Loading</label>',
      '<progress id="progress" value="70" max="100">70%</progress>',
    ],
  },

  {
    id: 'html-ordered-list',
    name: 'orderedList',
    language: 'html',
    description: 'Creates an ordered list showing numbered steps.',
    conceptTags: ['arrays'],
    complexity: 1,
    lines: [
      '<ol>',
      '  <li>Install dependencies</li>',
      '  <li>Run the project</li>',
      '  <li>Test the application</li>',
      '</ol>',
    ],
  },
];
