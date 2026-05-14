# US-10 - Retention - Sprint 3

## Returning to exactly where I left off

**As a new CS student**, I want the game to remember my preferred language, difficulty, and warmup settings between sessions, so that I can restart quickly without reconfiguring everything.

---

## Acceptance criteria

- [ ] Player preferences persist across browser refresh and restart
- [ ] Saved preferences include language, difficulty, warmup toggle, and slow-start toggle
- [ ] Returning player can start a run in two actions or fewer from main menu
- [ ] A reset-to-default option is available in settings

---

## Notes

Low setup friction is important for students with short practice windows. Remembering preferences increases repeat usage and supports habit formation.

## Dependencies

- Settings subsystem must support persistent storage
- Main menu must preload and display saved configuration

## Definition of done

Returning players see their prior settings automatically loaded and can begin a run with minimal setup.
