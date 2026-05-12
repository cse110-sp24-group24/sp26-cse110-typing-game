# US-10 · Education · Sprint 1

## Recognizing real code syntax in snippets

**As a CS student**, I want all typed content to be real, syntactically valid code, so that what I practice in the game actually reinforces what I learn in class.

---

## Acceptance criteria

- [ ] All snippets are manually curated or validated against a real language spec
- [ ] No pseudocode or invented syntax is used in any snippet
- [ ] Each wave targets a single, self-contained, named function
- [ ] Functions are appropriate in complexity for beginner-to-intermediate level

---

## Notes

The snippet library is a content deliverable, not just a code task — it requires time from someone with pedagogical awareness of what beginner-to-intermediate students are learning. For MVP, aim for at least 5–8 functions per language (JavaScript and Python) covering common patterns: loops, conditionals, string manipulation, basic array operations. Each function should be 4–8 lines so waves feel substantial but not exhausting. Snippets should be version-pinned (e.g., ES6+ for JS, Python 3.x) to avoid syntax confusion.

## Dependencies

- Must be complete before wave gameplay can be tested end-to-end (see US-01)
- Language selection determines which subset of snippets is used (see US-05)

## Definition of done

A curated library of at least 5 functions per language exists, all syntactically valid and verified. No wave in a run uses pseudocode or invented syntax. Complexity is appropriate for the target audience.
