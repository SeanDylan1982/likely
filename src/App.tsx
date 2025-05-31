import React, { useState, useEffect } from 'react';
import { Search, X, Film, Tv, Sparkles } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { ContentCard } from './components/MovieCard';
import { AuthModal } from './components/AuthModal';
import { UserDropdown } from './components/UserDropdown';
import { FilterControls } from './components/FilterControls';
import { TrendingCarousel } from './components/TrendingCarousel';
import { UserProfile } from './components/UserProfile';
import { ContentModal } from './components/ContentModal';
import { searchContent, getSimilarContent, getSearchSuggestions, getTrendingContent, getContentDetails, getTopRatedContent, getContentByGenre, getGenres } from './api';
import { supabase } from './supabase';
import type { Movie, TVShow, ContentType, User as UserType, Favorite, ContentDetails, Genre } from './types';

function App() {
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('popularity');
  const [minRating, setMinRating] = useState(0);
  const [yearFilter, setYearFilter] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState('movie');
  const [movieGenres, setMovieGenres] = useState<Genre[]>([]);
  const [tvGenres, setTvGenres] = useState<Genre[]>([]);
  const [genreContent, setGenreContent] = useState<Record<number, (Movie | TVShow)[]>>({});
  const [topRatedContent, setTopRatedContent] = useState<(Movie | TVShow)[]>([]);

  useEffect(() => {
    async function fetchGenres() {
      try {
        const [movieGenresData, tvGenresData] = await Promise.all([
          getGenres('movie'),
          getGenres('tv')
        ]);
        setMovieGenres(movieGenresData);
        setTvGenres(tvGenresData);
      } catch (err) {
        console.error('Error fetching genres:', err);
      }
    }
    fetchGenres();
  }, []);

  useEffect(() => {
    async function fetchContentForGenres() {
      const genres = selectedTab === 'movie' ? movieGenres : tvGenres;
      try {
        const contentPromises = genres.map(genre =>
          getContentByGenre(selectedTab as ContentType, genre.id)
        );
        const contents = await Promise.all(contentPromises);
        const contentByGenre: Record<number, (Movie | TVShow)[]> = {};
        genres.forEach((genre, index) => {
          contentByGenre[genre.id] = contents[index];
        });
        setGenreContent(contentByGenre);
      } catch (err) {
        console.error('Error fetching genre content:', err);
      }
    }

    async function fetchTopRated() {
      try {
        const content = await getTopRatedContent(selectedTab as ContentType);
        setTopRatedContent(content);
      } catch (err) {
        console.error('Error fetching top rated content:', err);
      }
    }

    if ((selectedTab === 'movie' && movieGenres.length > 0) ||
        (selectedTab === 'tv' && tvGenres.length > 0)) {
      fetchContentForGenres();
      fetchTopRated();
    }
  }, [selectedTab, movieGenres, tvGenres]);

  const getFilteredAndSortedContent = (items: (Movie | TVShow)[]) => {
    let filtered = items;

    filtered = filtered.filter(item => item.vote_average >= minRating);

    if (yearFilter) {
      filtered = filtered.filter(item => {
        const date = 'release_date' in item ? item.release_date : item.first_air_date;
        return new Date(date).getFullYear() === yearFilter;
      });
    }

    if (selectedGenre) {
      filtered = filtered.filter(item => {
        const genres = 'genre_ids' in item ? item.genre_ids : [];
        return genres.includes(selectedGenre);
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

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {!query && (
        <div className="space-y-8 mb-8">
          <TrendingCarousel
            items={trendingMovies}
            type="movie"
            title="Trending Movies"
            onSelect={(item) => {
              setSelectedTab('movie');
              handleContentSelect(item);
            }}
          />
          
          <TrendingCarousel
            items={topRatedContent}
            type={selectedTab as ContentType}
            title={`Top 20 ${selectedTab === 'movie' ? 'Movies' : 'TV Shows'} of All Time`}
            onSelect={handleContentSelect}
          />

          {(selectedTab === 'movie' ? movieGenres : tvGenres).map(genre => (
            genreContent[genre.id] && (
              <TrendingCarousel
                key={genre.id}
                items={genreContent[genre.id]}
                type={selectedTab as ContentType}
                title={`${genre.name} ${selectedTab === 'movie' ? 'Movies' : 'TV Shows'}`}
                onSelect={handleContentSelect}
              />
            )
          ))}
        </div>
      )}
      
      <FilterControls
        sortBy={sortBy}
        onSortChange={setSortBy}
        minRating={minRating}
        onMinRatingChange={setMinRating}
        yearFilter={yearFilter}
        onYearFilterChange={setYearFilter}
        genres={selectedTab === 'movie' ? movieGenres : tvGenres}
        selectedGenre={selectedGenre}
        onGenreChange={setSelectedGenre}
      />
    </div>
  );
}

export default App;