import React, { useState } from 'react';
import { Search, X, Film, Tv } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { ContentCard } from './components/MovieCard';
import { searchContent, getSimilarContent, getSearchSuggestions } from './api';
import type { Movie, TVShow, ContentType } from './types';

function App() {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 300);
  const [contentType, setContentType] = useState<ContentType>('movie');
  const [content, setContent] = useState<(Movie | TVShow)[]>([]);
  const [suggestions, setSuggestions] = useState<(Movie | TVShow)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'search' | 'similar'>('search');
  const [selectedContent, setSelectedContent] = useState<Movie | TVShow | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  React.useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        const results = await getSearchSuggestions(debouncedQuery, contentType);
        setSuggestions(results);
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery, contentType]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setShowSuggestions(false);
    try {
      const results = await searchContent(query, contentType);
      setContent(results);
      setMode('search');
    } catch (err) {
      setError(`Failed to fetch ${contentType === 'movie' ? 'movies' : 'TV shows'}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleContentSelect = async (item: Movie | TVShow) => {
    setLoading(true);
    setError('');
    try {
      const similar = await getSimilarContent(item.id, contentType);
      setContent(similar);
      setSelectedContent(item);
      setMode('similar');
    } catch (err) {
      setError(`Failed to fetch similar ${contentType === 'movie' ? 'movies' : 'TV shows'}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (item: Movie | TVShow) => {
    setQuery(contentType === 'movie' ? (item as Movie).title : (item as TVShow).name);
    setSuggestions([]);
    setShowSuggestions(false);
    handleContentSelect(item);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Entertainment Finder</h1>
        
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setContentType('movie')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              contentType === 'movie'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Film size={20} />
            Movies
          </button>
          <button
            onClick={() => setContentType('tv')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              contentType === 'tv'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Tv size={20} />
            TV Shows
          </button>
        </div>

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
              placeholder={`Search for ${contentType === 'movie' ? 'a movie' : 'a TV show'}...`}
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
                {suggestions.map((item) => (
                  <div
                    key={item.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSuggestionClick(item)}
                  >
                    <div className="font-medium">
                      {contentType === 'movie' 
                        ? (item as Movie).title 
                        : (item as TVShow).name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(
                        contentType === 'movie'
                          ? (item as Movie).release_date
                          : (item as TVShow).first_air_date
                      ).getFullYear()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {mode === 'similar' && selectedContent && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {contentType === 'movie' 
                ? `Movies similar to "${(selectedContent as Movie).title}"`
                : `TV Shows similar to "${(selectedContent as TVShow).name}"`}
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
            {content.map((item) => (
              <ContentCard
                key={item.id}
                content={item}
                type={contentType}
                onSelect={handleContentSelect}
              />
            ))}
          </div>
        )}

        {!loading && content.length === 0 && (
          <div className="text-center text-gray-500">
            {mode === 'search' 
              ? `Search for ${contentType === 'movie' ? 'movies' : 'TV shows'} to get started`
              : `No similar ${contentType === 'movie' ? 'movies' : 'TV shows'} found`}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;