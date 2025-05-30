import React, { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';
import { FilterControls } from './FilterControls';
import { ContentCard } from './MovieCard';
import { supabase } from '../supabase';
import { getSimilarContent } from '../api';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import type { Movie, TVShow, ContentType, Favorite, RecommendationSource } from '../types';

interface UserProfileProps {
  userId: string;
  onClose: () => void;
}

export function UserProfile({ userId, onClose }: UserProfileProps) {
  const [favorites, setFavorites] = useState<(Movie | TVShow)[]>([]);
  const [recommendations, setRecommendations] = useState<(Movie | TVShow)[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedTab, setSelectedTab] = useState<ContentType>('movie');
  const [sortBy, setSortBy] = useState<'popularity' | 'date-asc' | 'date-desc' | 'rating'>('popularity');
  const [minRating, setMinRating] = useState(3);
  const [yearFilter, setYearFilter] = useState<number | null>(null);
  const [recommendationSources, setRecommendationSources] = useState<RecommendationSource[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);

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
          const content = await response.json();
          return { ...content, contentType: favorite.content_type };
        });

        const contents = await Promise.all(contentPromises);
        setFavorites(contents);

        // Initialize recommendation sources
        const sources = contents
          .filter(content => content.contentType === selectedTab)
          .map(content => ({
            id: content.id,
            type: content.contentType as ContentType,
            currentPage: 1,
            totalPages: 1,
            hasMore: true
          }));
        
        setRecommendationSources(sources);
        await loadInitialRecommendations(sources);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, [userId, selectedTab]);

  const loadInitialRecommendations = async (sources: RecommendationSource[]) => {
    try {
      const results = await Promise.all(
        sources.map(source =>
          getSimilarContent(source.id, source.type, 1)
        )
      );

      const newRecommendations = results.flatMap(result => result.results);
      const updatedSources = sources.map((source, index) => ({
        ...source,
        totalPages: results[index].total_pages,
        hasMore: results[index].page < results[index].total_pages
      }));

      setRecommendations(newRecommendations);
      setRecommendationSources(updatedSources);
    } catch (error) {
      console.error('Error loading initial recommendations:', error);
    }
  };

  const loadMoreRecommendations = async () => {
    if (loadingMore) return;

    const sourcesWithMore = recommendationSources.filter(source => source.hasMore);
    if (sourcesWithMore.length === 0) return;

    setLoadingMore(true);

    try {
      const results = await Promise.all(
        sourcesWithMore.map(source =>
          getSimilarContent(source.id, source.type, source.currentPage + 1)
        )
      );

      const newRecommendations = results.flatMap(result => result.results);
      const updatedSources = recommendationSources.map(source => {
        const result = results.find(r => 
          r.results[0] && 
          ('title' in r.results[0] ? source.type === 'movie' : source.type === 'tv')
        );
        
        if (!result) return source;

        return {
          ...source,
          currentPage: result.page,
          hasMore: result.page < result.total_pages
        };
      });

      setRecommendations(prev => [...prev, ...newRecommendations]);
      setRecommendationSources(updatedSources);
    } catch (error) {
      console.error('Error loading more recommendations:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  useInfiniteScroll(loadMoreRecommendations, containerRef.current);

  const getFilteredAndSortedContent = (items: (Movie | TVShow)[]) => {
    let filtered = items.filter(item => 
      'contentType' in item ? item.contentType === selectedTab : true
    );

    filtered = filtered.filter(item => item.vote_average >= minRating);

    if (yearFilter) {
      filtered = filtered.filter(item => {
        const date = 'release_date' in item ? item.release_date : item.first_air_date;
        return new Date(date).getFullYear() === yearFilter;
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

  const filteredContent = getFilteredAndSortedContent(recommendations);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        ref={containerRef}
        className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6">Similar to Your Favorites</h2>

        <FilterControls
          sortBy={sortBy}
          onSortChange={setSortBy}
          minRating={minRating}
          onMinRatingChange={setMinRating}
          yearFilter={yearFilter}
          onYearFilterChange={setYearFilter}
        />

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setSelectedTab('movie')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              selectedTab === 'movie'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => setSelectedTab('tv')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              selectedTab === 'tv'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            TV Shows
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : filteredContent.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {`No ${selectedTab === 'movie' ? 'movies' : 'TV shows'} found matching your criteria.`}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContent.map((content) => (
                <ContentCard
                  key={content.id}
                  content={content}
                  type={selectedTab}
                  onSelect={() => {}}
                  isAuthenticated={true}
                  isFavorite={false}
                />
              ))}
            </div>
            
            {loadingMore && (
              <div className="text-center py-4">
                Loading more...
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}