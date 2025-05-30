import React from 'react';
import { Star } from 'lucide-react';
import type { Movie, TVShow } from '../types';

interface ContentCardProps {
  content: Movie | TVShow;
  type: 'movie' | 'tv';
  onSelect: (content: Movie | TVShow) => void;
}

export function ContentCard({ content, type, onSelect }: ContentCardProps) {
  const title = type === 'movie' ? (content as Movie).title : (content as TVShow).name;
  const date = type === 'movie' 
    ? (content as Movie).release_date 
    : (content as TVShow).first_air_date;

  return (
    <div 
      className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition hover:scale-105"
      onClick={() => onSelect(content)}
    >
      <img
        src={`https://image.tmdb.org/t/p/w500${content.poster_path}`}
        alt={title}
        className="w-full h-64 object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/500x750?text=No+Image';
        }}
      />
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
  );
}