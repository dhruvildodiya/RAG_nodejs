const database = [];

export function insertVector(id, vector, text) {
  database.push({ id, vector, text });
  console.log(database)
}

export function cosineSimilarity(a, b) {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export function search(queryVector, topK = 3) {
  return database
    .map(doc => ({
      ...doc,
      score: cosineSimilarity(queryVector, doc.vector)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}