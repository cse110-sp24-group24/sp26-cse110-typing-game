import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { init, setTarget, clearTarget, activate, deactivate } from '../src/engine/typingEngine.js';

let inputEl, feedbackEl, onDefeated, onKeystroke;

beforeEach(() => {
  inputEl = document.createElement('input');
  feedbackEl = document.createElement('div');
  onDefeated = jest.fn();
  onKeystroke = jest.fn();
  init(inputEl, feedbackEl, onDefeated, onKeystroke);
  setTarget('hello');
});

afterEach(() => {
  deactivate();
});

describe('setTarget', () => {
  it('clears the input field', () => {
    inputEl.value = 'hel';
    setTarget('world');
    expect(inputEl.value).toBe('');
  });
});

describe('clearTarget', () => {
  it('clears the input field', () => {
    inputEl.value = 'hel';
    clearTarget();
    expect(inputEl.value).toBe('');
  });

  it('clears the feedback overlay', () => {
    clearTarget();
    expect(feedbackEl.innerHTML).toBe('');
  });
});

describe('handleInput', () => {
  it('marks correct characters', () => {
    inputEl.value = 'hel';
    inputEl.dispatchEvent(new Event('input'));
    const correct = feedbackEl.querySelectorAll('.correct');
    expect(correct.length).toBe(3);
  });

  it('marks incorrect characters', () => {
    inputEl.value = 'heXlo';
    inputEl.dispatchEvent(new Event('input'));
    const incorrect = feedbackEl.querySelectorAll('.incorrect');
    expect(incorrect.length).toBe(3);
  });

  it('fires onDefeated on full match and clears field', () => {
    inputEl.value = 'hello';
    inputEl.dispatchEvent(new Event('input'));
    expect(onDefeated).toHaveBeenCalledTimes(1);
    expect(inputEl.value).toBe('');
  });

  it('calls onKeystroke on every input event', () => {
    inputEl.value = 'h';
    inputEl.dispatchEvent(new Event('input'));
    inputEl.value = 'he';
    inputEl.dispatchEvent(new Event('input'));
    expect(onKeystroke).toHaveBeenCalledTimes(2);
  });
});

describe('activate / deactivate', () => {
  it('stops handling input after deactivate', () => {
    deactivate();
    inputEl.value = 'hello';
    inputEl.dispatchEvent(new Event('input'));
    expect(onKeystroke).not.toHaveBeenCalled();
  });

  it('resumes handling input after activate', () => {
    deactivate();
    activate();
    inputEl.value = 'h';
    inputEl.dispatchEvent(new Event('input'));
    expect(onKeystroke).toHaveBeenCalledTimes(1);
  });
});
