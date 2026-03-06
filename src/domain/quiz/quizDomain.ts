/**
 * Pure business logic for the Quiz domain.
 * This file should have ZERO dependencies on React or any UI framework.
 */

export interface QuizResults {
    score: number;
    total: number;
    threshold: number;
}

/**
 * Validates if the given score meets the passing threshold.
 */
export const isPassingScore = (score: number, threshold: number): boolean => {
    return score >= threshold;
};

/**
 * Checks if the selected option key is the correct answer.
 */
export const checkAnswer = (selectedKey: string, correctKey: string): boolean => {
    return selectedKey === correctKey;
};

/**
 * Calculates the final result summary.
 */
export const getQuizSummary = (results: QuizResults) => {
    const isPass = isPassingScore(results.score, results.threshold);
    return {
        isPass,
        percentage: Math.round((results.score / results.total) * 100),
        message: isPass ? 'STAGE CLEAR!' : 'GAME OVER'
    };
};
