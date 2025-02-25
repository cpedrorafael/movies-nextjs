'use client';

import { useState, useEffect } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { MovieGrid } from '@/components/MovieGrid';
import { MovieCard } from '@/components/MovieCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Movie {
  id: number;
  title: string;
  year: number;
  director: string;
  plot: string | null;
  posterUrl: string | null;
  imdbRating: number | null;
  rottenTomatoesRating: number | null;
}

export function Movies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchMovies(), fetchWatchlist()]).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await fetch('/api/movies');
      if (response.ok) {
        const data = await response.json();
        setMovies(data);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  const fetchWatchlist = async () => {
    try {
      const response = await fetch('/api/watchlist');
      if (response.ok) {
        const data = await response.json();
        setWatchlist(data);
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    }
  };

  const handleMovieAdd = async (movie: Movie) => {
    await fetchMovies();
  };

  const handleToggleWatched = async (movieId: number) => {
    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ movieId }),
      });

      if (response.ok) {
        await fetchWatchlist();
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <SearchBar onMovieAdd={handleMovieAdd} watchlist={watchlist} />
      </div>

      <Tabs defaultValue="discover" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
        </TabsList>

        <TabsContent value="discover">
          {movies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No movies in your collection yet. Try searching for some!
            </div>
          ) : (
            <MovieGrid>
              {movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onToggleWatched={handleToggleWatched}
                  isWatched={watchlist.some((m) => m.id === movie.id)}
                />
              ))}
            </MovieGrid>
          )}
        </TabsContent>

        <TabsContent value="watchlist">
          {watchlist.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Your watchlist is empty. Add some movies from the Discover tab!
            </div>
          ) : (
            <MovieGrid>
              {watchlist.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onToggleWatched={handleToggleWatched}
                  isWatched={true}
                />
              ))}
            </MovieGrid>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
