# US-02 · Typing · Sprint 2

## Reading code the way my editor shows it

**As a new CS student**, I want the code I must type to use familiar syntax highlighting (keywords, strings, literals, comments), so that my eyes learn the same color patterns I see when doing assignments and coding in my personal IDE.  Also, makes code look nicer.

---

## Acceptance criteria

- [ ] The active enemy line (and boss target) is rendered with a consistent token-color scheme for the selected language
- [ ] Contrast meets readability on the haunted/dark UI background.  Perhaps change in color scheme for light and dark.
- [ ] Performance stays smooth on keypress (no visible lag)

---

## Notes

Syntax highlighting is not just cosmetic for beginners, but can help them learn through pattern reconiztion. 

## Dependencies

- Snippet pipeline exposes token boundaries, or a highlighter parses snippets safely for each MVP language
- Real-time typo feedback works on top of (or beside) highlighted target text without breaking layout or performance

## Definition of done

Tokens are visually distinct on real snippets, and typing feedback remains instant with highlighting enabled.
