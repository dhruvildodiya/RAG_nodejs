import fs from 'fs';

export async function loadDocs() {
  const text = fs.readFileSync('./data/docs.txt', 'utf-8');

  return text.split('\n\n').map((chunk,i) =>({
    pageContent: chunk,
    metadata: { id: `doc-${i}` }
  }));

}