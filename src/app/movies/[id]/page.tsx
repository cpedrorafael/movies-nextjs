'use client';

import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { BookmarkIcon, BookmarkCheck, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import type { Rating } from '@/lib/db/schema';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import type { Movie } from '@/app/api/movies/movie';

export default function MovieDetailsPage() {
  const params = useParams();
  const id = params?.id?.toString();
  const { user } = useAuth0();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<Rating | null>(null);

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
        const isCurrentlyInWatchlist = isInWatchlist;
        setIsInWatchlist(prev => !prev);
        toast.success(
          isCurrentlyInWatchlist 
            ? `${movie.Title} removed from watchlist`
            : `${movie.Title} added to watchlist`
        );
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
      toast.error('Failed to update watchlist');
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
        toast.success(`Rating updated for ${movie.Title}`);
      } else {
        toast.error('Failed to update rating');
      }
    } catch (error) {
      console.error('Error rating movie:', error);
      toast.error('Failed to update rating');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('No movie ID provided');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/movies/${id}`);
        console.log('Movie API Response:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch movie details');
        }

        const data = await response.json();
        console.log('Movie data:', data);
        
        if (!data) {
          throw new Error('No movie data received');
        }

        setMovie(data);

        if (user?.sub) {
          const watchlistResponse = await fetch(`/api/watchlist?userId=${user.sub}`);
          if (watchlistResponse.ok) {
            const data = await watchlistResponse.json();
            console.log(data);
            setIsInWatchlist(data.watchlist.some((m: Movie) => m.id === parseInt(id)));
          }

          const ratingsResponse = await fetch(`/api/ratings?userId=${user.sub}`);
          if (ratingsResponse.ok) {
            const data = await ratingsResponse.json();
            const movieRating = data.ratings.find((r: { movieId: number }) => 
              r.movieId === parseInt(id)
            );
            setRating(movieRating?.rating || null);
          }
        }
      } catch (err) {
        console.error('Error fetching movie data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load movie details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, user?.sub]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500 mb-4">Movie not found</p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column - Image and Ratings */}
        <div className="space-y-6">
          {/* Movie Poster */}
          {movie.Poster && movie.Poster !== 'N/A' ? (
            <div className="relative aspect-[2/3] w-full">
              <Image
                src={movie.Poster}
                alt={movie.Title}
                fill
                className="object-cover rounded-lg"
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
              />
            </div>
          ) : (
            <div className="aspect-[2/3] w-full bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">No poster available</span>
            </div>
          )}

          {/* User Ratings */}
          {user && (
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Your Rating</h3>
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  variant={rating === 'liked' ? 'default' : 'outline'}
                  onClick={() => handleRate('liked')}
                  className="flex items-center justify-center gap-2 w-full"
                >
                  <ThumbsUp className="h-4 w-4" />
                  Like
                </Button>
                <Button
                  size="sm"
                  variant={rating === 'neutral' ? 'default' : 'outline'}
                  onClick={() => handleRate('neutral')}
                  className="flex items-center justify-center gap-2 w-full"
                >
                  <Minus className="h-4 w-4" />
                  Neutral
                </Button>
                <Button
                  size="sm"
                  variant={rating === 'disliked' ? 'default' : 'outline'}
                  onClick={() => handleRate('disliked')}
                  className="flex items-center justify-center gap-2 w-full"
                >
                  <ThumbsDown className="h-4 w-4" />
                  Dislike
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right column - Title, Metadata, and Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Title and Bookmark */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">{movie.Title}</h1>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>{movie.Year}</span>
                <span>{movie.Runtime}</span>
                <span>{movie.Rated}</span>
              </div>
            </div>
            {user && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleToggleWatchlist}
                title={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
              >
                {isInWatchlist ? (
                  <BookmarkCheck className="h-5 w-5" />
                ) : (
                  <BookmarkIcon className="h-5 w-5" />
                )}
              </Button>
            )}
          </div>

          {/* Movie Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Director</h3>
              <p className="text-muted-foreground">{movie.Director}</p>
            </div>
            <div>
              <h3 className="font-semibold">Cast</h3>
              <p className="text-muted-foreground">{movie.Actors}</p>
            </div>
            <div>
              <h3 className="font-semibold">Genre</h3>
              <p className="text-muted-foreground">{movie.Genre}</p>
            </div>
            <div>
              <h3 className="font-semibold">Language</h3>
              <p className="text-muted-foreground">{movie.Language}</p>
            </div>
          </div>

          {/* Ratings */}
          {movie.Ratings && movie.Ratings.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Ratings</h3>
              <div className="flex flex-wrap gap-6">
                {movie.Ratings.map((rating, index) => (
                  <div key={index} className="flex flex-col">
                    <span className="text-sm text-muted-foreground">{rating.Source}</span>
                    <span className="font-medium">{rating.Value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Plot */}
          <div className="space-y-2">
            <h3 className="font-semibold">Plot</h3>
            <p className="text-lg leading-relaxed">{movie.Plot}</p>
          </div>
        </div>
      </div>
    </main>
  );
}