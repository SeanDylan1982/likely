// Add genre_ids to Movie and TVShow interfaces
export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  popularity: number;
  genre_ids: number[];
}

export interface TVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  first_air_date: string;
  popularity: number;
  genre_ids: number[];
}