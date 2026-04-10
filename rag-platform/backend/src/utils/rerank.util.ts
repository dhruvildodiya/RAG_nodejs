export const simpleRerank = (query: string, chunks: string[]) => {

    const queryWords = query.toLowerCase().replace(/[^\w\s]/g, "").split(" ")

    return chunks.map(chunk => {
        let score = 0;
        const lowerChunk = chunk.toLowerCase();

        for (const word of queryWords) {
            if (lowerChunk.includes(word)) {
                score += 1
            }
        }
        return { chunk, score }
    })
        .sort((a, b) => b.score - a.score)
        .map(item => item.chunk)
}