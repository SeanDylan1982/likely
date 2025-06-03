import React, { useState, useEffect } from 'react';
import { X, Film, Tv } from 'lucide-react';
import { FilterControls } from './FilterControls';
import { ContentCard } from './MovieCard';
import { supabase } from '../supabase';
import { getContentDetails } from '../api';
import type { Movie, TVShow, ContentType, Favorite } from '../types';

interface UserProfileProps {
  userId: string;
  onClose: () => void;
}

export function UserProfile({ userId, onClose }: UserProfileProps) {
  const [favorites, setFavorites] = useState<(Movie | TVShow)[]>([]);
  const [selectedTab, setSelectedTab] = useState<ContentType>('movie');
  const [sortBy, setSortBy] = useState<'popularity' | 'date-asc' | 'date-desc' | 'rating'>('popularity');
  const [minRating, setMinRating] = useState(3);
  const [yearFilter, setYearFilter] = useState<number | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [movieGenres, setMovieGenres] = useState<{ id: number; name: string; }[]>([]);
  const [tvGenres, setTvGenres] = useState<{ id: number; name: string; }[]>([]);

  useEffect(() => {
    fetchFavorites();
  }, [userId]);

  const fetchFavorites = async () => {
    try {
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId);

      if (favoritesError) throw favoritesError;

      if (favoritesData) {
        const contentPromises = favoritesData.map(async (favorite) => {
          const content = await getContentDetails(favorite.content_id, favorite.content_type);
          return {
            ...content,
            contentType: favorite.content_type
          };
        });

        const contentData = await Promise.all(contentPromises);
        setFavorites(contentData);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAndSortedContent = (items: (Movie | TVShow)[]) => {
    let filtered = items.filter(item => 
      'contentType' in item && item.contentType === selectedTab
    );

    filtered = filtered.filter(item => item.vote_average >= minRating);

    if (yearFilter) {
      filtered = filtered.filter(item => {
        const date = 'release_date' in item ? item.release_date : item.first_air_date;
        return new Date(date).getFullYear() === yearFilter;
      });
    }

    if (selectedGenre) {
      filtered = filtered.filter(item => {
        const genres = item.genres || [];
        return genres.some(genre => genre.id === selectedGenre);
      });
    }

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
      return b.popularity - a.popularity;
    });
  };

  const handleRemoveFavorite = async (content: Movie | TVShow) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('content_id', content.id)
        .eq('content_type', 'contentType' in content ? content.contentType : selectedTab);

      if (error) throw error;

      setFavorites(favorites.filter(f => f.id !== content.id));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setSelectedTab('movie')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              selectedTab === 'movie'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            <Film size={20} />
            Movies
          </button>
          <button
            onClick={() => setSelectedTab('tv')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              selectedTab === 'tv'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            <Tv size={20} />
            TV Shows
          </button>
        </div>

        <FilterControls
          sortBy={sortBy}
          onSortChange={setSortBy}
          minRating={minRating}
          onMinRatingChange={setMinRating}
          yearFilter={yearFilter}
          onYearFilterChange={setYearFilter}
        />

        {loading ? (
          <div className="text-center py-8 text-gray-600 dark:text-gray-300">Loading your favorites...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {getFilteredAndSortedContent(favorites).map((content) => (
              <ContentCard
                key={content.id}
                content={content}
                type={'contentType' in content ? content.contentType : selectedTab}
                onSelect={() => {}}
                isAuthenticated={true}
                isFavorite={true}
                onToggleFavorite={() => handleRemoveFavorite(content)}
              />
            ))}
          </div>
        )}

        {!loading && getFilteredAndSortedContent(favorites).length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No {selectedTab === 'movie' ? 'movies' : 'TV shows'} in your favorites yet.
          </div>
        )}
      </div>
    </div>
  );
}