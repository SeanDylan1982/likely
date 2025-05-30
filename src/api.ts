const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0YjM1NzA1ZDQ2OWQ1OTdmMWY2YWQyM2Q0MjY0YjMwNCIsIm5iZiI6MTc0ODU5Nzc0MC42MzEsInN1YiI6IjY4Mzk3YmVjNjI1OTg5OTE4MzA4MDkwMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.zWnHs6I27PyqJ2mvTIDEfCENKj17dbrtEpl3K-RJ2sA';
const BASE_URL = 'https://api.themoviedb.org/3';

const headers = {
  'Authorization': `Bearer ${AUTH_TOKEN}`,
  'Content-Type': 'application/json'
};

export async function searchContent(query: string, type: ContentType): Promise<Movie[] | TVShow[]> {
  const response = await fetch(
    `${BASE_URL}/search/${type}?query=${encodeURIComponent(query)}`,
    { headers }
  );
  const data: SearchResponse = await response.json();
  return data.results;
}

export async function getSimilarContent(id: number, type: ContentType): Promise<Movie[] | TVShow[]> {
  const response = await fetch(
    `${BASE_URL}/${type}/${id}/similar`,
    { headers }
  );
  const data: SearchResponse = await response.json();
  return data.results;
}

export async function getSearchSuggestions(query: string, type: ContentType): Promise<Movie[] | TVShow[]> {
  if (!query.trim()) return [];
  const response = await fetch(
    `${BASE_URL}/search/${type}?query=${encodeURIComponent(query)}&page=1`,
    { headers }
  );
  const data: SearchResponse = await response.json();
  return data.results.slice(0, 5);
}