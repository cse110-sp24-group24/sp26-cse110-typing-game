# US-10 · Accessibility · Sprint 2

## Not losing runs to concepts I've not familiar with

**As a new CS student** , I want predictable access to symbols I need for real code—braces, semicolons, underscores—on typical laptop keyboards, including a visible on-screen reference for less common keys, so that I don't waste to much time figuring where a certain character is, hindering actual learning.

## Acceptance criteria

- [ ] A collapsible “symbol bar” or shortcut card shows the exact characters required by the current line that are not letters/digits, updating as the target changes
- [ ] If a snippet needs shifted keys, the reference shows shift plainly (e.g., `Shift + [` for `{` on US layouts) or shows the character itself with clear typography
- [ ] The reference does not cover the typing line; default collapsed if screen space is tight

---

## Notes

This feature would be targetted towards true beginners to coding, but still might be useful regardless

## Dependencies

- Typing input with focus rules, per-character comparison, and typo styling consistent with the rest of the game
- Snippet validation so the UI can list which non-alphanumeric keys the active line may require

## Definition of done

Novice testers on a standard US laptop complete a symbol-heavy line with fewer “where is that key?” interruptions, and they find the help by the app to actually be useful.
