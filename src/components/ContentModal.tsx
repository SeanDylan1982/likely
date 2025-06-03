import React from 'react';
import { X, Star, Clock, Calendar, Users, Award, TrendingUp, Heart } from 'lucide-react';
import type { ContentDetails, ContentType } from '../types';

interface ContentModalProps {
  content: ContentDetails;
  type: ContentType;
  onClose: () => void;
  isAuthenticated?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function ContentModal({ 
  content, 
  type, 
  onClose,
  isAuthenticated = false,
  isFavorite = false,
  onToggleFavorite
}: ContentModalProps) {
  const title = type === 'movie' ? content.title : content.name;
  const date = type === 'movie' ? content.release_date : content.first_air_date;
  const director = content.credits.crew.find(person => person.job === 'Director');
  const mainCast = content.credits.cast.slice(0, 6);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <div className="absolute right-4 top-4 z-10 flex gap-2">
            {isAuthenticated && onToggleFavorite && (
              <button
                onClick={onToggleFavorite}
                className="bg-black/50 p-2 rounded-full text-white hover:bg-black/75 transition-colors"
              >
                <Heart
                  size={20}
                  className={isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}
                />
              </button>
            )}
            <button
              onClick={onClose}
              className="bg-black/50 p-2 rounded-full text-white hover:bg-black/75 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="aspect-video w-full relative">
            <img
              src={`https://image.tmdb.org/t/p/original${content.backdrop_path}`}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
              {content.tagline && (
                <p className="text-gray-300 italic">{content.tagline}</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2 text-yellow-500">
              <Star size={20} className="fill-current" />
              <span>{content.vote_average.toFixed(1)}</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Calendar size={20} />
              <span>{new Date(date).getFullYear()}</span>
            </div>

            {content.runtime && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock size={20} />
                <span>{content.runtime} min</span>
              </div>
            )}

            {content.number_of_seasons && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Users size={20} />
                <span>{content.number_of_seasons} season{content.number_of_seasons !== 1 ? 's' : ''}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Award size={20} />
              <span>{content.status}</span>
            </div>

            {content.popularity && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <TrendingUp size={20} />
                <span>{Math.round(content.popularity)} popularity</span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">Overview</h3>
              <p className="text-gray-600 dark:text-gray-400">{content.overview}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {content.genres.map(genre => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>

            {director && (
              <div>
                <h3 className="text-lg font-semibold mb-2 dark:text-white">Director</h3>
                <p className="text-gray-600 dark:text-gray-400">{director.name}</p>
              </div>
            )}

            {mainCast.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2 dark:text-white">Cast</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  {mainCast.map(actor => (
                    <div key={actor.id} className="text-center">
                      <div className="aspect-[2/3] mb-2">
                        <img
                          src={actor.profile_path
                            ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                            : 'https://via.placeholder.com/185x278?text=No+Image'
                          }
                          alt={actor.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <p className="font-medium text-sm line-clamp-1 dark:text-white">{actor.name}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-1">{actor.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {type === 'movie' && (content.budget || content.revenue) && (
              <div className="grid grid-cols-2 gap-4">
                {content.budget > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 dark:text-white">Budget</h3>
                    <p className="text-gray-600 dark:text-gray-400">{formatMoney(content.budget)}</p>
                  </div>
                )}
                {content.revenue > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 dark:text-white">Revenue</h3>
                    <p className="text-gray-600 dark:text-gray-400">{formatMoney(content.revenue)}</p>
                  </div>
                )}
              </div>
            )}

            {content.production_companies.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2 dark:text-white">Production Companies</h3>
                <div className="flex flex-wrap gap-4">
                  {content.production_companies.map(company => (
                    <div key={company.id} className="text-center">
                      {company.logo_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${company.logo_path}`}
                          alt={company.name}
                          className="h-8 object-contain dark:invert"
                        />
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400">{company.name}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}