export interface RetainedChunk {
    content: string;
    source: string;
    score: number;
}

const STOP_WORDS = new Set([
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
    "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
    "below", "between", "both", "but", "by", "can", "can't", "cannot", "could",
    "did", "do", "does", "doing", "don't", "down", "during", "each", "few", "for",
    "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers",
    "herself", "him", "himself", "his", "how", "i", "if", "in", "into", "is",
    "it", "its", "itself", "me", "more", "most", "my", "myself", "no", "nor",
    "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our",
    "ours", "ourselves", "out", "over", "own", "same", "she", "should", "so",
    "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves",
    "then", "there", "these", "they", "this", "those", "through", "to", "too",
    "under", "until", "up", "very", "was", "we", "were", "what", "when", "where",
    "which", "while", "who", "whom", "why", "with", "would", "you", "your",
    "yours", "yourself", "yourselves", "tell", "show", "give", "please"
]);

export const simpleRerank = (query: string, chunks: (RetainedChunk | string)[]): RetainedChunk[] => {
    // Standardize input chunks
    const normalizedChunks: RetainedChunk[] = chunks.map((item, idx) => {
        if (typeof item === "string") {
            return { content: item, source: "unknown", score: 1 / (idx + 1) };
        }
        return item;
    });

    // Extract significant query terms (excluding stop words and short tokens)
    const queryWords = query
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((word) => word.length > 1 && !STOP_WORDS.has(word));

    return normalizedChunks
        .map((item) => {
            let keywordMatches = 0;
            const lowerContent = item.content.toLowerCase();

            for (const word of queryWords) {
                if (lowerContent.includes(word)) {
                    keywordMatches += 1;
                }
            }

            // Combine vector score with keyword match boost (0.1 boost per significant word match)
            const keywordBoost = queryWords.length > 0 ? (keywordMatches / queryWords.length) * 0.2 : 0;
            const combinedScore = item.score + keywordBoost;

            return { ...item, combinedScore };
        })
        .sort((a, b) => b.combinedScore - a.combinedScore)
        .map(({ combinedScore, ...rest }) => rest);
};