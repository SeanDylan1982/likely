// Previous UserProfile.tsx content with updated FilterControls usage
const [selectedGenre, setSelectedGenre] = useState<number | null>(null);

// Update the getFilteredAndSortedContent function
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

// Update FilterControls usage
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