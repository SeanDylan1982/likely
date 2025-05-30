import React, { useState, useEffect } from 'react';
import { Search, X, Film, Tv, Sparkles } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { ContentCard } from './components/MovieCard';
import { AuthModal } from './components/AuthModal';
import { UserDropdown } from './components/UserDropdown';
import { FilterControls } from './components/FilterControls';
import { TrendingCarousel } from './components/TrendingCarousel';
import { searchContent, getSimilarContent, getSearchSuggestions, getTrendingContent } from './api';
import { supabase } from './supabase';
import type { Movie, TVShow, ContentType, User as UserType, Favorite } from './types';

function App() {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 300);
  const [contentType, setContentType] = useState<ContentType>('movie');
  const [content, setContent] = useState<(Movie | TVShow)[]>([]);
  const [suggestions, setSuggestions] = useState<(Movie | TVShow)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'search' | 'similar' | 'recommendations'>('search');
  const [selectedContent, setSelectedContent] = useState<Movie | TVShow | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [recommendations, setRecommendations] = useState<(Movie | TVShow)[]>([]);
  const [sortBy, setSortBy] = useState<'popularity' | 'date-asc' | 'date-desc' | 'rating'>('popularity');
  const [minRating, setMinRating] = useState(0);
  const [yearFilter, setYearFilter] = useState<number | null>(null);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [trendingTVShows, setTrendingTVShows] = useState<TVShow[]>([]);

  useEffect(() => {
    async function fetchTrending() {
      try {
        const [movies, tvShows] = await Promise.all([
          getTrendingContent('movie'),
          getTrendingContent('tv')
        ]);
        setTrendingMovies(movies as Movie[]);
        setTrendingTVShows(tvShows as TVShow[]);
      } catch (err) {
        console.error('Error fetching trending content:', err);
      }
    }
    fetchTrending();
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email!
        });
        fetchFavorites(session.user.id);
      } else {
        setUser(null);
        setFavorites([]);
        setRecommendations([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchFavorites = async (userId: string) => {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching favorites:', error);
      return;
    }

    setFavorites(data);
    fetchRecommendations(data);
  };

  const fetchRecommendations = async (favorites: Favorite[]) => {
    setLoading(true);
    try {
      const allRecommendations: (Movie | TVShow)[] = [];
      
      for (const favorite of favorites) {
        const similar = await getSimilarContent(favorite.content_id, favorite.content_type);
        allRecommendations.push(...similar);
      }

      // Remove duplicates based on id
      const uniqueRecommendations = Array.from(
        new Map(allRecommendations.map(item => [item.id, item])).values()
      );

      setRecommendations(uniqueRecommendations);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAndSortedContent = () => {
    let filtered = mode === 'recommendations' ? recommendations : content;

    // Convert 10-star ratings to 5-star ratings for filtering
    filtered = filtered.map(item => ({
      ...item,
      vote_average: item.vote_average / 2
    }));

    // Apply minimum rating filter
    filtered = filtered.filter(item => item.vote_average >= minRating);

    // Apply year filter
    if (yearFilter) {
      filtered = filtered.filter(item => {
        const date = 'release_date' in item ? item.release_date : item.first_air_date;
        return new Date(date).getFullYear() === yearFilter;
      });
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      if (sortBy === 'rating') {
        return b.vote_average - a.vote_average;
      } else if (sortBy === 'date-desc' || sortBy === 'date-asc') {
        const dateA = new Date('release_date' in a ? a.release_date : a.first_air_date);
        const dateB = new Date('release_date' in b ? b.release_date : b.first_air_date);
        return sortBy === 'date-desc' 
          ? dateB.getTime() - dateA.getTime()
          : dateA.getTime() - dateB.getTime();
      }
      // Default to popularity
      return b.popularity - a.popularity;
    });
  };

  const toggleFavorite = async (content: Movie | TVShow) => {
    if (!user) return;

    const contentId = content.id;
    const existing = favorites.find(
      f => f.content_id === contentId && f.content_type === contentType
    );

    if (existing) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', existing.id);

      if (!error) {
        setFavorites(favorites.filter(f => f.id !== existing.id));
      }
    } else {
      const { data, error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          content_id: contentId,
          content_type: contentType
        })
        .select()
        .single();

      if (!error && data) {
        setFavorites([...favorites, data]);
      }
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
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

  const filteredContent = getFilteredAndSortedContent();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Likely</h1>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setMode(mode === 'recommendations' ? 'search' : 'recommendations')}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
                >
                  <Sparkles size={20} />
                  {mode === 'recommendations' ? 'Search' : 'Recommendations'}
                </button>
                <UserDropdown
                  email={user.email}
                  onSignOut={handleSignOut}
                  onProfileClick={() => {}}
                />
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {mode === 'recommendations' ? (
          <FilterControls
            sortBy={sortBy}
            onSortChange={setSortBy}
            minRating={minRating}
            onMinRatingChange={setMinRating}
            yearFilter={yearFilter}
            onYearFilterChange={setYearFilter}
          />
        ) : (
          <>
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

            {!query && (
              <div className="space-y-8 mb-8">
                <TrendingCarousel
                  items={trendingMovies}
                  type="movie"
                  onSelect={(item) => {
                    setContentType('movie');
                    handleContentSelect(item);
                  }}
                />
                <TrendingCarousel
                  items={trendingTVShows}
                  type="tv"
                  onSelect={(item) => {
                    setContentType('tv');
                    handleContentSelect(item);
                  }}
                />
              </div>
            )}
          </>
        )}

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
            {filteredContent.map((item) => (
              <ContentCard
                key={item.id}
                content={item}
                type={contentType}
                onSelect={handleContentSelect}
                isAuthenticated={!!user}
                isFavorite={favorites.some(
                  f => f.content_id === item.id && f.content_type === contentType
                )}
                onToggleFavorite={() => toggleFavorite(item)}
              />
            ))}
          </div>
        )}

        {!loading && filteredContent.length === 0 && (
          <div className="text-center text-gray-500">
            {mode === 'recommendations' 
              ? "No recommendations found. Try adding more favorites!"
              : mode === 'search'
                ? `Search for ${contentType === 'movie' ? 'movies' : 'TV shows'} to get started`
                : `No similar ${contentType === 'movie' ? 'movies' : 'TV shows'} found`}
          </div>
        )}
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default App;