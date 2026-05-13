# US-03 · Education · Sprint 1

## Seeing structure, not just a queue of lines

**As a new CS student**, I want the function assembly panel to preserve indentation and show clear block boundaries as lines appear, so that I learn how control flow and nesting actually look in a file—not only how to copy individual lines in isolation.

---

## Acceptance criteria

- [ ] Assembled lines render in a monospace stack with leading spaces/tabs preserved exactly as in the source snippet
- [ ] When a line opens a block (`{`, `:`, etc., language-appropriate), the UI visually connects the following indented lines until the block closes
- [ ] Boss typing view can show the same structural layout read-only before input begins (time for user to process and see the code in full)

---

## Notes

The goal is for the growing function to resemble what students paste into autograders.

## Dependencies

- Function assembly panel exists and updates as each enemy line is cleared
- Snippets are stored or generated with meaningful indentation preserved end-to-end

## Definition of done

For a wave containing nested control flow, a player can point to the assembled panel and correctly identify outer vs inner blocks without re-reading the original enemies out of order.
