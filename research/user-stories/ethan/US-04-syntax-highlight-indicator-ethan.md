# US-04 · Educational Visuals · Sprint 2

## Basic Syntax Highlighting

**As a beginner CS student**, I want the code lines on the enemies to feature basic syntax highlighting, so that I can learn the code structure and recognize keywords while I type.

---

## Acceptance criteria

- [ ] A lightweight text parser identifies standard keywords (`var`, `return`, `for`, `if`), strings, and numbers.
- [ ] Identified components are rendered in distinct, readable colors (keywords in blue, numbers in green).
- [ ] The syntax highlighting remains intact or updates as the player types and characters are consumed/colored.
- [ ] Typos still trigger the red error feedback without breaking the original syntax colors.

---

## Notes

Visual pattern recognition is a huge part of learning to code. By highlighting the syntax, students passively learn the difference between a variable name, a protected keyword, and a literal value.

## Dependencies

- Requires the core typing UI and typo feedback systems to be fully functional

## Definition of done

When an enemy spawns, its code line displays at least three distinct syntax colors (keyword, literal, plain text) which remain functional and visually stable as the player types the characters.