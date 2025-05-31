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

export interface Credits {
  cast: {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
  }[];
  crew: {
    id: number;
    name: string;
    job: string;
    department: string;
  }[];
}

export interface ContentDetails extends Movie, TVShow {
  credits: Credits;
  runtime?: number;
  number_of_seasons?: number;
  genres: { id: number; name: string }[];
  production_companies: { id: number; name: string; logo_path: string | null }[];
  status: string;
  tagline: string;
  budget?: number;
  revenue?: number;
}

export interface Genre {
  id: number;
  name: string;
}