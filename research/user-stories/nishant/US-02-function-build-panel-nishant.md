# US-02 · Education · Sprint 1

## Watching a function build line by line

**As a CS student**, I want to see the function I'm typing grow on screen as I complete each enemy, so that I can understand how a complete function is assembled from its parts.

---

## Acceptance criteria

- [ ] A "code panel" on screen shows completed lines in syntax-highlighted style
- [ ] Each defeated enemy appends its line to the panel
- [ ] Incomplete lines are shown as placeholders (e.g., grayed-out or redacted)
- [ ] The full function is visible before the boss fight begins

---

## Notes

The code panel is a key educational differentiator. It should use real syntax highlighting (not just monospace font) so students associate the visual style with their actual code editor. Consider a subtle animation when a new line is appended to draw the eye.

## Dependencies

- Requires wave enemy system to be in place (see US-01)
- Snippet library must provide lines in correct sequential order (see US-10)

## Definition of done

As each enemy is defeated during a wave, its corresponding line appears in the code panel with syntax highlighting. Before the boss, the complete function is fully visible in the panel.
