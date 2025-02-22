'use client';

import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { SearchIcon } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner';

interface Movie {
  Title: string;
  Year: string;
  Director: string;
  Plot: string;
  Poster: string;
  imdbID: string;
  imdbRating: string;
  Ratings: Array<{ Source: string; Value: string }>;
}

interface SearchBarProps {
  onMovieAdd: (movie: any) => void;
  watchlist: any[];
}

export function SearchBar({ onMovieAdd, watchlist }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (response.ok) {
        setSearchResults(data);
        setShowResults(true);
      } else {
        console.error('Search failed:', data.error);
      }
    } catch (error) {
      console.error('Error searching movies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMovie = async (movie: Movie) => {
    try {
      const rottenTomatoesRating = movie.Ratings?.find(
        (r) => r.Source === 'Rotten Tomatoes'
      )?.Value;

      const movieData = {
        title: movie.Title,
        year: parseInt(movie.Year),
        director: movie.Director,
        plot: movie.Plot,
        posterUrl: movie.Poster,
        imdbID: movie.imdbID,
        imdbRating: parseFloat(movie.imdbRating) || null,
        rottenTomatoesRating: rottenTomatoesRating
          ? parseInt(rottenTomatoesRating)
          : null,
      };

      // Check if movie is already in watchlist
      const existingMovie = watchlist.find(
        (m) => m.title.toLowerCase() === movie.Title.toLowerCase() && 
               m.year === parseInt(movie.Year)
      );

      if (existingMovie) {
        // Close the search dialog
        setShowResults(false);
        setQuery('');
        
        // Scroll to the existing movie
        const movieElement = document.getElementById(`movie-${existingMovie.id}`);
        if (movieElement) {
          movieElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          movieElement.classList.add('highlight-pulse');
          setTimeout(() => {
            movieElement.classList.remove('highlight-pulse');
          }, 2000);
        }
        
        toast.info('Movie is already in your watchlist');
        return;
      }

      // First save the movie
      const saveResponse = await fetch('/api/movies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(movieData),
      });

      if (!saveResponse.ok) {
        const error = await saveResponse.json();
        throw new Error(error.error || 'Failed to save movie');
      }

      const savedMovie = await saveResponse.json();
      
      // Close dialog and clear search before making the second API call
      setShowResults(false);
      setQuery('');

      // Then add it directly to the watchlist
      const watchlistResponse = await fetch('/api/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          movieId: savedMovie.movie.id,
          watched: false 
        }),
      });

      if (!watchlistResponse.ok) {
        const error = await watchlistResponse.json();
        throw new Error(error.error || 'Failed to add to watchlist');
      }

      const watchlistResult = await watchlistResponse.json();
      onMovieAdd(watchlistResult.movie);
      toast.success('Movie added to watchlist');
    } catch (error) {
      console.error('Error saving movie:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add movie');
      // Reopen dialog if there was an error
      setShowResults(true);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Search for movies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={isLoading}>
          <SearchIcon className="h-4 w-4 mr-2" />
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Search Results</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[calc(80vh-8rem)] pr-4">
            <div className="grid gap-4">
              {searchResults.map((movie) => (
                <div
                  key={`${movie.Title}-${movie.Year}`}
                  className="flex items-start gap-4 p-4 border rounded-lg bg-card"
                >
                  {movie.Poster !== 'N/A' && (
                    <img
                      src={movie.Poster}
                      alt={movie.Title}
                      className="w-24 h-36 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">
                      {movie.Title} ({movie.Year})
                    </h3>
                    <p className="text-sm text-muted-foreground">Director: {movie.Director}</p>
                    <p className="text-sm mt-2 line-clamp-2">{movie.Plot}</p>
                    <div className="mt-2 flex flex-wrap gap-4">
                      {movie.imdbRating !== 'N/A' && (
                        <span className="text-sm text-muted-foreground">IMDb: {movie.imdbRating}</span>
                      )}
                      {movie.Ratings?.find((r) => r.Source === 'Rotten Tomatoes')?.Value && (
                        <span className="text-sm text-muted-foreground">
                          Rotten Tomatoes:{' '}
                          {movie.Ratings.find((r) => r.Source === 'Rotten Tomatoes')?.Value}
                        </span>
                      )}
                    </div>
                    <Button
                      onClick={() => handleAddMovie(movie)}
                      variant="outline"
                      className="mt-2"
                    >
                      Add to Watchlist
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
