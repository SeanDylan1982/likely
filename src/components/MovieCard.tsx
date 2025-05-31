import React from 'react';
import { Star, Heart } from 'lucide-react';
import type { Movie, TVShow } from '../types';

interface ContentCardProps {
  content: Movie | TVShow;
  type: 'movie' | 'tv';
  onSelect: (content: Movie | TVShow) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  isAuthenticated?: boolean;
}

export function ContentCard({ 
  content, 
  type, 
  onSelect, 
  isFavorite = false,
  onToggleFavorite,
  isAuthenticated = false
}: ContentCardProps) {
  const title = type === 'movie' ? (content as Movie).title : (content as TVShow).name;
  const date = type === 'movie' 
    ? (content as Movie).release_date 
    : (content as TVShow).first_air_date;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden relative group">
      <div 
        className="cursor-pointer transform transition hover:scale-105"
        onClick={() => onSelect(content)}
      >
        <div className="relative">
          <img
            src={`https://image.tmdb.org/t/p/w500${content.poster_path}`}
            alt={title}
            className="w-full h-64 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/500x750?text=No+Image';
            }}
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white font-medium">View Details</span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2 line-clamp-1">{title}</h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{content.overview}</p>
          <div className="flex items-center justify-between">
            <span className="flex items-center text-yellow-500">
              <Star size={16} className="fill-current" />
              <span className="ml-1">{content.vote_average.toFixed(1)}</span>
            </span>
            <span className="text-sm text-gray-500">
              {new Date(date).getFullYear()}
            </span>
          </div>
        </div>
      </div>
      
      {isAuthenticated && onToggleFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
        >
          <Heart
            size={20}
            className={`${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'}`}
          />
        </button>
      )}
    </div>
  );
}