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
    <div className="relative group w-full">
      <Link href={`/movies/${movie.id}`}>
        <div
          id={id}
          className="bg-card rounded-lg shadow-md overflow-hidden w-full"
        >
          <div className="relative w-full aspect-[2/2]">
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
          <div className="p-3">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-semibold truncate">{movie.title}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onToggleWatched(movie.id);
                    }}
                    className="shrink-0 -mr-2"
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
                <p className="text-sm text-muted-foreground">
                  {movie.year} • {movie.director}
                </p>
              </div>
            </div>
            {movie.plot && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {movie.plot}
              </p>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
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
            {onRate && (
              <div className="flex gap-1 mt-2 justify-end">
                <Button
                  size="sm"
                  variant={rating === 'liked' ? 'default' : 'outline'}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRate(movie.id, 'liked');
                  }}
                  className="h-7 px-2"
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
                  className="h-7 px-2"
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
                  className="h-7 px-2"
                >
                  <ThumbsDown className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
