import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Movie, TVShow, ContentType } from '../types';

interface TrendingCarouselProps {
  items: (Movie | TVShow)[];
  type: ContentType;
  onSelect: (item: Movie | TVShow) => void;
  title: string;
}

export function TrendingCarousel({ items, type, onSelect, title }: TrendingCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      if (containerRef.current) {
        const scrollAmount = containerRef.current.offsetWidth * 0.8;
        const maxScroll = containerRef.current.scrollWidth - containerRef.current.offsetWidth;
        const newScrollLeft = containerRef.current.scrollLeft + scrollAmount;

        if (newScrollLeft >= maxScroll) {
          containerRef.current.scrollTo({
            left: 0,
            behavior: 'smooth'
          });
        } else {
          containerRef.current.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
          });
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isHovered]);

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = containerRef.current.offsetWidth * 0.8;
      containerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      
      <div className="relative overflow-hidden">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft size={24} />
        </button>
        
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight size={24} />
        </button>

        <div
          ref={containerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {items.map((item) => {
            const title = type === 'movie' ? (item as Movie).title : (item as TVShow).name;
            return (
              <div
                key={item.id}
                className="flex-none w-[150px] scroll-snap-align-start cursor-pointer transform transition-transform hover:scale-105"
                onClick={() => onSelect(item)}
              >
                <img
                  src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                  alt={title}
                  className="w-full h-[225px] object-cover rounded-lg shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x450?text=No+Image';
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}