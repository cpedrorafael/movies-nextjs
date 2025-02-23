import React from 'react';
import Image from 'next/image';
import { Button } from './ui/button';
import { BookmarkIcon, BookmarkCheck } from 'lucide-react';
import Link from 'next/link';

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
  isWatched: boolean;
  id?: string;
}

export function MovieCard({
  movie,
  onToggleWatched,
  isWatched,
  id,
}: MovieCardProps) {
  return (
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleWatched(movie.id)}
            className="shrink-0"
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
  );
}
