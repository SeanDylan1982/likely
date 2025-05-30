import React from 'react';
import { Star } from 'lucide-react';
import type { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  onSelect: (movie: Movie) => void;
}

export function MovieCard({ movie, onSelect }: MovieCardProps) {
  return (
    <div 
      className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition hover:scale-105"
      onClick={() => onSelect(movie)}
    >
      <img
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title}
        className="w-full h-64 object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/500x750?text=No+Image';
        }}
      />
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-1">{movie.title}</h3>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{movie.overview}</p>
        <div className="flex items-center justify-between">
          <span className="flex items-center text-yellow-500">
            <Star size={16} className="fill-current" />
            <span className="ml-1">{movie.vote_average.toFixed(1)}</span>
          </span>
          <span className="text-sm text-gray-500">
            {new Date(movie.release_date).getFullYear()}
          </span>
        </div>
      </div>
    </div>
  );
}