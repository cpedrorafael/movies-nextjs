import { db } from '@/lib/db';
import { movies, watchlists } from '@/lib/db/schema';
import { and, eq, notInArray, sql } from 'drizzle-orm';
import { findBestMatch } from 'string-similarity';

interface MovieFeatures {
  id: number;
  title: string;
  genre: string | null;
  director: string;
  actors: string | null;
  plot: string | null;
}

interface MovieWithScore extends MovieFeatures {
  imdbId: string;
  year: number;
  rated: string | null;
  released: string | null;
  runtime: string | null;
  writer: string | null;
  language: string | null;
  country: string | null;
  awards: string | null;
  posterUrl: string | null;
  imdbRating: number | null;
  rottenTomatoesRating: number | null;
  metascore: number | null;
  imdbVotes: string | null;
  type: string | null;
  dvd: string | null;
  boxOffice: string | null;
  production: string | null;
  website: string | null;
  response: string | null;
  score: number;
}

export async function getRecommendations(userId: string, topN = 5): Promise<MovieWithScore[]> {
  const watchlistMovies = await db
    .select({
      id: movies.id,
      title: movies.title,
      genre: movies.genre,
      director: movies.director,
      actors: movies.actors,
      plot: movies.plot,
    })
    .from(movies)
    .innerJoin(watchlists, eq(movies.id, watchlists.movieId))
    .where(eq(watchlists.userId, userId));

  if (watchlistMovies.length === 0) {
    const topRated = await db
      .select()
      .from(movies)
      .where(and(
        sql`imdb_rating IS NOT NULL`,
        sql`imdb_rating > 0`
      ))
      .orderBy(sql`imdb_rating DESC`)
      .limit(topN);

    return topRated.map(movie => ({ ...movie, score: movie.imdbRating || 0 }));
  }

  const candidateMovies = await db
    .select()
    .from(movies)
    .where(
      notInArray(
        movies.id,
        watchlistMovies.map(m => m.id)
      )
    );

  const recommendations = candidateMovies.map(candidate => {
    const score = calculateSimilarity(watchlistMovies, candidate);
    return { ...candidate, score };
  });

  recommendations.sort((a, b) => b.score - a.score);
  return recommendations.slice(0, topN);
}

function calculateSimilarity(watchlistMovies: MovieFeatures[], candidateMovie: MovieFeatures): number {
  const getMovieFeatures = (movie: MovieFeatures): string => {
    const features = [
      movie.genre || '',
      movie.director || '',
      movie.actors || '',
      movie.plot || '',
    ].filter(Boolean).join(' ').toLowerCase();
    return features;
  };

  const candidateFeatures = getMovieFeatures(candidateMovie);
  
  const scores = watchlistMovies.map(watchlistMovie => {
    const watchlistFeatures = getMovieFeatures(watchlistMovie);
    const { bestMatch } = findBestMatch(candidateFeatures, [watchlistFeatures]);
    return bestMatch.rating; 
  });

  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

export async function getTopRatedMovies(limit = 5): Promise<MovieWithScore[]> {
  const topRated = await db
    .select()
    .from(movies)
    .where(and(
      sql`imdb_rating IS NOT NULL`,
      sql`imdb_rating > 0`
    ))
    .orderBy(sql`imdb_rating DESC`)
    .limit(limit);

  return topRated.map(movie => ({ ...movie, score: movie.imdbRating || 0 }));
}