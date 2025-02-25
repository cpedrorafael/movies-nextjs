import React from 'react';
import Image from 'next/image';
import { Button } from './ui/button';
import { ThumbsUp, ThumbsDown, Minus, BookmarkIcon, BookmarkCheck } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface MovieCardProps {
  movie: {
    id: number;
    title: string;
    year: number;
    director: string;
    plot: string | null;
    posterUrl: string | null;
    imdbRating: number | null;
    rottenTomatoesRating: number | null;
  };
  onToggleWatched: (id: number) => void;
  onRate?: (id: number, rating: 'liked' | 'disliked' | 'neutral') => void;
  isWatched: boolean;
  id?: string;
  rating?: 'liked' | 'disliked' | 'neutral';
}

export function MovieCard({
  movie,
  onToggleWatched,
  onRate,
  isWatched,
  id,
  rating,
}: MovieCardProps) {
  return (
    <div className="relative group">
      <Link href={`/movies/${movie.id}`}>
        <div
          id={id}
          className="bg-card rounded-lg shadow-md overflow-hidden"
        >
          <div className="relative aspect-[2/3] h-[400px]">
            {movie.posterUrl && movie.posterUrl !== 'N/A' ? (
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                priority={false}
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">No poster available</span>
              </div>
            )}
          </div>
          <div className="p-4">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold truncate">{movie.title}</h3>
                <p className="text-muted-foreground">
                  {movie.year} • {movie.director}
                </p>
              </div>
            </div>
            {movie.plot && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {movie.plot}
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-4">
              {movie.imdbRating && movie.imdbRating !== 0 && (
                <div className="flex items-center">
                  <span className="font-semibold mr-1">IMDb:</span>
                  <span className="text-muted-foreground">{movie.imdbRating}/10</span>
                </div>
              )}
              {movie.rottenTomatoesRating && movie.rottenTomatoesRating !== 0 && (
                <div className="flex items-center">
                  <span className="font-semibold mr-1">RT:</span>
                  <span className="text-muted-foreground">{movie.rottenTomatoesRating}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
      <div className="absolute top-2 right-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleWatched(movie.id);
          }}
          className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
        >
          {isWatched ? (
            <BookmarkCheck className="h-5 w-5" />
          ) : (
            <BookmarkIcon className="h-5 w-5" />
          )}
          <span className="sr-only">
            {isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
          </span>
        </Button>
      </div>
      {onRate && (
        <div className="absolute bottom-2 right-2 flex gap-1">
          <Button
            size="sm"
            variant={rating === 'liked' ? 'default' : 'outline'}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRate(movie.id, 'liked');
            }}
            className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
          >
            <ThumbsUp className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={rating === 'neutral' ? 'default' : 'outline'}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRate(movie.id, 'neutral');
            }}
            className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={rating === 'disliked' ? 'default' : 'outline'}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRate(movie.id, 'disliked');
            }}
            className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
          >
            <ThumbsDown className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
