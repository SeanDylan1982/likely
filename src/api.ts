import { Movie, TVShow, ContentType, SearchResponse, ContentDetails, Genre } from './types';

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

export async function getTrendingContent(type: ContentType): Promise<Movie[] | TVShow[]> {
  const response = await fetch(
    `${BASE_URL}/trending/${type}/day`,
    { headers }
  );
  const data: SearchResponse = await response.json();
  return data.results;
}

export async function getTopRatedContent(type: ContentType): Promise<Movie[] | TVShow[]> {
  const response = await fetch(
    `${BASE_URL}/${type}/top_rated`,
    { headers }
  );
  const data: SearchResponse = await response.json();
  return data.results.slice(0, 20);
}

export async function getContentByGenre(type: ContentType, genreId: number): Promise<Movie[] | TVShow[]> {
  // Fetch multiple pages to get more content per genre
  const pages = await Promise.all([1, 2].map(page => 
    fetch(
      `${BASE_URL}/discover/${type}?with_genres=${genreId}&sort_by=vote_count.desc&page=${page}`,
      { headers }
    ).then(res => res.json())
  ));

  // Combine results from all pages
  const results = pages.flatMap(page => page.results);
  
  // Sort by popularity and take top 20
  return results
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 20);
}

export async function getGenres(type: ContentType): Promise<Genre[]> {
  const response = await fetch(
    `${BASE_URL}/genre/${type}/list`,
    { headers }
  );
  const data: { genres: Genre[] } = await response.json();
  return data.genres;
}

export async function getContentDetails(id: number, type: ContentType): Promise<ContentDetails> {
  const [details, credits] = await Promise.all([
    fetch(`${BASE_URL}/${type}/${id}`, { headers }).then(res => res.json()),
    fetch(`${BASE_URL}/${type}/${id}/credits`, { headers }).then(res => res.json())
  ]);

  return {
    ...details,
    credits
  };
}