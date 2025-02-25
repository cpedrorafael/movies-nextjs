'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '@/components/ui/button';
import { BookmarkIcon, BookmarkCheck, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import type { Rating } from '@/lib/db/schema';

interface Movie {
  id: number;
  title: string;
  year: number;
  director: string;
  plot: string | null;
  posterUrl: string | null;
  imdbRating: number | null;
  rottenTomatoesRating: number | null;
  actors: string | null;
  runtime: string | null;
  genre: string | null;
}

export default function MovieDetailsPage({ params }: { params: { id: string } }) {
  const { user } = useAuth0();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [rating, setRating] = useState<Rating | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch movie details
        const response = await fetch(`/api/movies/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setMovie(data);
        }

        // Only fetch user-specific data if we have a user
        if (user?.sub) {
          // Check if movie is in watchlist
          const watchlistResponse = await fetch(`/api/watchlist?userId=${user.sub}`);
          if (watchlistResponse.ok) {
            const data = await watchlistResponse.json();
            setIsInWatchlist(data.movies.some((m: Movie) => m.id === parseInt(params.id)));
          }

          // Get user's rating
          const ratingsResponse = await fetch(`/api/ratings?userId=${user.sub}`);
          if (ratingsResponse.ok) {
            const data = await ratingsResponse.json();
            const movieRating = data.ratings.find((r: { movieId: number }) => 
              r.movieId === parseInt(params.id)
            );
            setRating(movieRating?.rating || null);
          }
        }
      } catch (error) {
        console.error('Error fetching movie details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id, user?.sub]);

  const handleToggleWatchlist = async () => {
    if (!user?.sub || !movie) return;

    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieId: movie.id,
          userId: user.sub,
        }),
      });

      if (response.ok) {
        setIsInWatchlist(prev => !prev);
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    }
  };

  const handleRate = async (newRating: Rating) => {
    if (!user?.sub || !movie) return;

    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieId: movie.id,
          userId: user.sub,
          rating: newRating,
        }),
      });

      if (response.ok) {
        setRating(newRating);
      }
    } catch (error) {
      console.error('Error rating movie:', error);
    }
  };

  if (isLoading && !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Movie not found</div>
      </div>
    );
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="flex items-center gap-2 hover:bg-transparent hover:text-primary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Back
        </Button>
      </div>

      <div className="bg-card rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/4">
            {movie.posterUrl && movie.posterUrl !== 'N/A' ? (
              <div className="relative aspect-[2/3] max-h-[400px]">
                <Image
                  src={movie.posterUrl}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 25vw"
                  priority
                />
              </div>
            ) : (
              <div className="aspect-[2/3] max-h-[400px] bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">No poster available</span>
              </div>
            )}
            <div className="p-4 space-y-4 border-t">
              {movie.actors && (
                <div>
                  <h3 className="font-semibold mb-1">Cast</h3>
                  <p className="text-sm text-muted-foreground">
                    {movie.actors.split(',').map((actor, index) => (
                      <span key={actor}>
                        {actor.trim()}
                        {index < movie.actors!.split(',').length - 1 && ', '}
                      </span>
                    ))}
                  </p>
                </div>
              )}
              {movie.runtime && (
                <div>
                  <h3 className="font-semibold mb-1">Runtime</h3>
                  <p className="text-sm text-muted-foreground">{movie.runtime}</p>
                </div>
              )}
              {movie.genre && (
                <div>
                  <h3 className="font-semibold mb-1">Genre</h3>
                  <p className="text-sm text-muted-foreground">
                    {movie.genre.split(',').map((g, index) => (
                      <span key={g}>
                        {g.trim()}
                        {index < movie.genre!.split(',').length - 1 && ', '}
                      </span>
                    ))}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="p-6 md:w-3/4">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold">{movie.title}</h1>
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleWatchlist}
                  className="shrink-0"
                >
                  {isInWatchlist ? (
                    <BookmarkCheck className="h-6 w-6" />
                  ) : (
                    <BookmarkIcon className="h-6 w-6" />
                  )}
                  <span className="sr-only">
                    {isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                  </span>
                </Button>
              )}
            </div>
            
            <div className="mt-2 space-y-4">
              <p className="text-lg text-muted-foreground">
                {movie.year} • {movie.director}
              </p>
              
              {movie.plot && (
                <p className="text-muted-foreground">{movie.plot}</p>
              )}

              <div className="flex flex-wrap items-center gap-6">
                {movie.imdbRating && movie.imdbRating !== 0 && (
                  <div className="flex items-center">
                    <span className="font-semibold mr-2">IMDb:</span>
                    <span className="text-muted-foreground">{movie.imdbRating}/10</span>
                  </div>
                )}
                {movie.rottenTomatoesRating && movie.rottenTomatoesRating !== 0 && (
                  <div className="flex items-center">
                    <span className="font-semibold mr-2">Rotten Tomatoes:</span>
                    <span className="text-muted-foreground">{movie.rottenTomatoesRating}%</span>
                  </div>
                )}
              </div>

              {user && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={rating === 'liked' ? 'default' : 'outline'}
                    onClick={() => handleRate('liked')}
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Like
                  </Button>
                  <Button
                    size="sm"
                    variant={rating === 'neutral' ? 'default' : 'outline'}
                    onClick={() => handleRate('neutral')}
                  >
                    <Minus className="h-4 w-4 mr-2" />
                    Neutral
                  </Button>
                  <Button
                    size="sm"
                    variant={rating === 'disliked' ? 'default' : 'outline'}
                    onClick={() => handleRate('disliked')}
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Dislike
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}