export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
}

export interface SearchResponse {
  results: Movie[];
  total_results: number;
  total_pages: number;
}