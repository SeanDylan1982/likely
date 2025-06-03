import { useState, useEffect } from 'react';
import { Search, Film, Tv } from 'lucide-react';
import { supabase } from './supabase';
import { AuthModal } from './components/AuthModal';
import { UserDropdown } from './components/UserDropdown';
import { ContentCard } from './components/MovieCard';
import { ContentModal } from './components/ContentModal';
import { TrendingCarousel } from './components/TrendingCarousel';
import { FilterControls } from './components/FilterControls';
import { UserProfile } from './components/UserProfile';
import { searchContent, getTrendingContent, getTopRatedContent, getContentDetails } from './api';
import type { Movie, TVShow, ContentType, User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Movie | TVShow | null>(null);
  const [contentType, setContentType] = useState<ContentType>('movie');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<(Movie | TVShow)[]>([]);
  const [trendingContent, setTrendingContent] = useState<(Movie | TVShow)[]>([]);
  const [topRatedContent, setTopRatedContent] = useState<(Movie | TVShow)[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [sortBy, setSortBy] = useState<'popularity' | 'date-asc' | 'date-desc' | 'rating'>('popularity');
  const [minRating, setMinRating] = useState(0);
  const [yearFilter, setYearFilter] = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!
        });
        fetchFavorites(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!
        });
        fetchFavorites(session.user.id);
      } else {
        setUser(null);
        setFavorites(new Set());
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchInitialContent = async () => {
      const [trending, topRated] = await Promise.all([
        getTrendingContent(contentType),
        getTopRatedContent(contentType)
      ]);
      setTrendingContent(trending);
      setTopRatedContent(topRated);
    };

    fetchInitialContent();
  }, [contentType]);

  const fetchFavorites = async (userId: string) => {
    const { data } = await supabase
      .from('favorites')
      .select('content_id')
      .eq('user_id', userId)
      .eq('content_type', contentType);

    if (data) {
      setFavorites(new Set(data.map(f => f.content_id)));
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const results = await searchContent(searchQuery, contentType);
      setSearchResults(results);
    }
  };

  const handleContentSelect = async (content: Movie | TVShow) => {
    const details = await getContentDetails(content.id, contentType);
    setSelectedContent(details);
  };

  const handleToggleFavorite = async (content: Movie | TVShow) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const isFavorite = favorites.has(content.id);
    if (isFavorite) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('content_id', content.id)
        .eq('content_type', contentType);
      favorites.delete(content.id);
    } else {
      await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          content_id: content.id,
          content_type: contentType
        });
      favorites.add(content.id);
    }
    setFavorites(new Set(favorites));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setFavorites(new Set());
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-gray-900">Likely</h1>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setContentType('movie')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    contentType === 'movie'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
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
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Tv size={20} />
                  TV Shows
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={`Search ${contentType === 'movie' ? 'movies' : 'TV shows'}...`}
                  className="w-64 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Search size={20} />
                </button>
              </div>

              {user ? (
                <UserDropdown
                  email={user.email}
                  onSignOut={handleSignOut}
                  onProfileClick={() => setShowUserProfile(true)}
                />
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {searchQuery ? (
          <>
            <FilterControls
              sortBy={sortBy}
              onSortChange={setSortBy}
              minRating={minRating}
              onMinRatingChange={setMinRating}
              yearFilter={yearFilter}
              onYearFilterChange={setYearFilter}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
              {searchResults.map((content) => (
                <ContentCard
                  key={content.id}
                  content={content}
                  type={contentType}
                  onSelect={handleContentSelect}
                  isAuthenticated={!!user}
                  isFavorite={favorites.has(content.id)}
                  onToggleFavorite={() => handleToggleFavorite(content)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-8">
            <TrendingCarousel
              items={trendingContent}
              type={contentType}
              onSelect={handleContentSelect}
              title="Trending"
            />
            <div className="mt-12">
              <h2 className="text-xl font-semibold mb-6">Top Rated</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {topRatedContent.map((content) => (
                  <ContentCard
                    key={content.id}
                    content={content}
                    type={contentType}
                    onSelect={handleContentSelect}
                    isAuthenticated={!!user}
                    isFavorite={favorites.has(content.id)}
                    onToggleFavorite={() => handleToggleFavorite(content)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {selectedContent && (
        <ContentModal
          content={selectedContent}
          type={contentType}
          onClose={() => setSelectedContent(null)}
        />
      )}

      {showUserProfile && user && (
        <UserProfile
          userId={user.id}
          onClose={() => setShowUserProfile(false)}
        />
      )}
    </div>
  );
}

export default App;