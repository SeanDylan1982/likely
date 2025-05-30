import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { ContentCard } from './MovieCard';
import { supabase } from '../supabase';
import type { Movie, TVShow, Favorite } from '../types';

interface UserProfileProps {
  userId: string;
  onClose: () => void;
}

export function UserProfile({ userId, onClose }: UserProfileProps) {
  const [favorites, setFavorites] = useState<(Movie | TVShow)[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFavorites() {
      try {
        const { data: favoritesData, error: favoritesError } = await supabase
          .from('favorites')
          .select('*')
          .eq('user_id', userId);

        if (favoritesError) throw favoritesError;

        const contentPromises = favoritesData.map(async (favorite) => {
          const response = await fetch(
            `https://api.themoviedb.org/3/${favorite.content_type}/${favorite.content_id}`,
            {
              headers: {
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0YjM1NzA1ZDQ2OWQ1OTdmMWY2YWQyM2Q0MjY0YjMwNCIsIm5iZiI6MTc0ODU5Nzc0MC42MzEsInN1YiI6IjY4Mzk3YmVjNjI1OTg5OTE4MzA4MDkwMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.zWnHs6I27PyqJ2mvTIDEfCENKj17dbrtEpl3K-RJ2sA',
                'Content-Type': 'application/json'
              }
            }
          );
          return await response.json();
        });

        const contents = await Promise.all(contentPromises);
        setFavorites(contents);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, [userId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6">My Favorites</h2>

        {loading ? (
          <div className="text-center py-8">Loading your favorites...</div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            You haven't added any favorites yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((content) => (
              <ContentCard
                key={content.id}
                content={content}
                type={'name' in content ? 'tv' : 'movie'}
                onSelect={() => {}}
                isAuthenticated={true}
                isFavorite={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}