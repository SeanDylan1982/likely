import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { MovieCard } from './components/MovieCard';
import { searchMovies, getSimilarMovies, getSearchSuggestions } from './api';
import type { Movie } from './types';

function App() {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 300);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'search' | 'similar'>('search');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  React.useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        const results = await getSearchSuggestions(debouncedQuery);
        setSuggestions(results);
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setShowSuggestions(false);
    try {
      const results = await searchMovies(query);
      setMovies(results);
      setMode('search');
    } catch (err) {
      setError('Failed to fetch movies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMovieSelect = async (movie: Movie) => {
    setLoading(true);
    setError('');
    try {
      const similar = await getSimilarMovies(movie.id);
      setMovies(similar);
      setSelectedMovie(movie);
      setMode('similar');
    } catch (err) {
      setError('Failed to fetch similar movies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (movie: Movie) => {
    setQuery(movie.title);
    setSuggestions([]);
    setShowSuggestions(false);
    handleMovieSelect(movie);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Movie Finder</h1>
        
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search for a movie..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setSuggestions([]);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={16} />
                </button>
              )}
              <button
                type="submit"
                className="text-gray-500 hover:text-gray-700"
              >
                <Search size={20} />
              </button>
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full bg-white mt-1 rounded-lg shadow-lg border border-gray-200">
                {suggestions.map((movie) => (
                  <div
                    key={movie.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSuggestionClick(movie)}
                  >
                    <div className="font-medium">{movie.title}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(movie.release_date).getFullYear()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {mode === 'similar' && selectedMovie && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              Movies similar to "{selectedMovie.title}"
            </h2>
          </div>
        )}

        {error && (
          <div className="text-red-500 text-center mb-4">{error}</div>
        )}

        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelect={handleMovieSelect}
              />
            ))}
          </div>
        )}

        {!loading && movies.length === 0 && (
          <div className="text-center text-gray-500">
            {mode === 'search' 
              ? 'Search for movies to get started'
              : 'No similar movies found'}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;