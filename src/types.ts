export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
}

export interface TVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  first_air_date: string;
}

export interface SearchResponse {
  results: Movie[] | TVShow[];
  total_results: number;
  total_pages: number;
}

export type ContentType = 'movie' | 'tv';

export interface User {
  id: string;
  email: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  content_id: number;
  content_type: ContentType;
  created_at: string;
}