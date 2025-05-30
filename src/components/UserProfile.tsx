import React, { useEffect, useState } from 'react';
import { X, Star } from 'lucide-react';
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
          <div className="space-y-4">
            {favorites.map((content) => {
              const type = 'name' in content ? 'tv' : 'movie';
              const title = type === 'movie' ? (content as Movie).title : (content as TVShow).name;
              const date = type === 'movie' 
                ? (content as Movie).release_date 
                : (content as TVShow).first_air_date;

              return (
                <div 
                  key={content.id}
                  className="flex bg-gray-50 rounded-lg overflow-hidden hover:bg-gray-100 transition-colors"
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w200${content.poster_path}`}
                    alt={title}
                    className="w-32 h-48 object-cover flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x300?text=No+Image';
                    }}
                  />
                  <div className="p-4 flex-grow">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg">{title}</h3>
                      <span className="flex items-center text-yellow-500 bg-yellow-50 px-2 py-1 rounded">
                        <Star size={16} className="fill-current" />
                        <span className="ml-1">{content.vote_average.toFixed(1)}</span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(date).getFullYear()} • {type.toUpperCase()}
                    </p>
                    <p className="text-gray-600 mt-2 line-clamp-3">{content.overview}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}