import { describe, it, expect } from 'vitest';
import { isPassingScore, checkAnswer, getQuizSummary } from './quizDomain';

describe('Quiz Domain Logic', () => {
    describe('isPassingScore', () => {
        it('returns true if score equals threshold', () => {
            expect(isPassingScore(3, 3)).toBe(true);
        });

        it('returns true if score exceeds threshold', () => {
            expect(isPassingScore(5, 3)).toBe(true);
        });

        it('returns false if score is below threshold', () => {
            expect(isPassingScore(2, 3)).toBe(false);
        });
    });

    describe('checkAnswer', () => {
        it('returns true if keys match', () => {
            expect(checkAnswer('A', 'A')).toBe(true);
        });

        it('returns false if keys do not match', () => {
            expect(checkAnswer('A', 'B')).toBe(false);
        });
    });

    describe('getQuizSummary', () => {
        it('calculates correct percentage and message for pass', () => {
            const result = getQuizSummary({ score: 4, total: 5, threshold: 3 });
            expect(result.isPass).toBe(true);
            expect(result.percentage).toBe(80);
            expect(result.message).toBe('STAGE CLEAR!');
        });

        it('calculates correct percentage and message for fail', () => {
            const result = getQuizSummary({ score: 1, total: 5, threshold: 3 });
            expect(result.isPass).toBe(false);
            expect(result.percentage).toBe(20);
            expect(result.message).toBe('GAME OVER');
        });
    });
});
