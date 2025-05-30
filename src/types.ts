export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  popularity: number;
}

export interface TVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  first_air_date: string;
  popularity: number;
}

export interface SearchResponse {
  results: Movie[] | TVShow[];
  total_results: number;
  total_pages: number;
  page: number;
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

export interface RecommendationSource {
  id: number;
  type: ContentType;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}