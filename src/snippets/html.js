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
 *
 * snippets/html.js — HTML code snippet library.
 *
 * Each snippet is one line of real HTML a beginner CS student would encounter.
 * Covers a variety of element types: headings, text, media, forms, layout, and semantic elements.
 *
 * Implemented by Issue #1.
 */

export const snippets = [
  // --- Text & Headings ---
  { line: '<h1 class="title">Hello, World!</h1>', fn: 'heading', tags: ['element', 'text'] },
  { line: '<h2 class="subtitle">About Me</h2>', fn: 'heading', tags: ['element', 'text'] },

  // Paragraphs are the most common text container in HTML
  { line: '<p id="intro">Welcome to the page.</p>', fn: 'paragraph', tags: ['element', 'text'] },

  // Span is inline — it wraps text without breaking the flow
  {
    line: '<span class="highlight">Important text</span>',
    fn: 'inline',
    tags: ['element', 'text'],
  },

  // --- Links & Media ---
  { line: '<a href="https://example.com">Click here</a>', fn: 'anchor', tags: ['element', 'link'] },

  // alt text is required for accessibility — screen readers read it aloud
  {
    line: '<img src="photo.jpg" alt="A scenic mountain view">',
    fn: 'image',
    tags: ['element', 'media'],
  },

  // --- Forms & Inputs ---
  {
    line: '<input type="text" placeholder="Enter name...">',
    fn: 'input',
    tags: ['element', 'form'],
  },
  {
    line: '<input type="checkbox" id="agree" name="agree">',
    fn: 'checkbox',
    tags: ['element', 'form'],
  },

  // for= links the label to its input by matching the input's id
  { line: '<label for="email">Email Address</label>', fn: 'label', tags: ['element', 'form'] },
  { line: '<button type="submit">Send Message</button>', fn: 'button', tags: ['element', 'form'] },
  {
    line: '<select name="country">Options go here</select>',
    fn: 'select',
    tags: ['element', 'form'],
  },

  // --- Layout & Containers ---
  // div is a generic block container — give it a class to style it
  {
    line: '<div class="container">Content goes here</div>',
    fn: 'div',
    tags: ['element', 'layout'],
  },
  { line: '<li>My first list item</li>', fn: 'listItem', tags: ['element', 'list'] },

  // --- Semantic Elements ---
  // Semantic elements tell the browser (and screen readers) what a section means
  {
    line: '<nav class="main-nav">Navigation links here</nav>',
    fn: 'nav',
    tags: ['element', 'semantic'],
  },
  {
    line: '<section id="hero">Page section content</section>',
    fn: 'section',
    tags: ['element', 'semantic'],
  },
];
