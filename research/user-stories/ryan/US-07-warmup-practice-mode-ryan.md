# US-07 · Session · Sprint 2

## Practice mode / arena

**As a new CS student**, I want an optional warmup mode that uses real snippets and the same typing UI but without run-ending pressure, so that I can build confidence with symbols and pacing before committing to a run with points on the line.

---

## Acceptance criteria

- [ ] From the main flow, the player can enter “Warmup” without unlocking anything special beyond practice
- [ ] Warmup pulls snippets from the same language and quality bar as the main game 
- [ ] No permanent run state: exiting warmup does not corrupt an in-progress run
- [ ] Clear on-screen label distinguishes warmup from a real run at all times
- [ ] Player can jump from warmup to starting a real run in two steps or fewer

---

## Notes

This mode might be useful for people that struggle with performing under stress, and it acts as an opportunity for them to learn without a pressure componenet.

## Dependencies

- Core typing loop and validated snippet library shared with the main game
- Navigation from the shell or main menu into a separate practice session that does not corrupt run save state

## Definition of done

First-week players can name one thing they practiced in warmup and report lower fear of starting a real run, without developers maintaining a second snippet pipeline.
