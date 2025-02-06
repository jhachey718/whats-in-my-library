export const levenshteinDistance = (a, b) => {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) =>
      i === 0 ? j : j === 0 ? i : 0
    )
  );

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // Deletion
        matrix[i][j - 1] + 1, // Insertion
        matrix[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1) // Substitution
      );
    }
  }
  return matrix[a.length][b.length];
};

// Function to calculate similarity percentage
export const similarityPercentage = (guess, answer) => {
  if (!guess || !answer) return 0;
  const maxLength = Math.max(guess.length, answer.length);
  const distance = levenshteinDistance(
    guess.toLowerCase(),
    answer.toLowerCase()
  );
  return ((maxLength - distance) / maxLength) * 100;
};
