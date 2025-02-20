import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { movies, userWatchlist } from '@/lib/db/schema';
import { eq, inArray, and, isNull } from 'drizzle-orm';

const DEFAULT_USER_ID = 'default-user';

export async function GET(request: Request) {
  try {
    // First get the user's watchlist movies
    const watchlistMovies = await db
      .select({
        id: movies.id,
        title: movies.title,
        director: movies.director,
      })
      .from(movies)
      .innerJoin(userWatchlist, eq(movies.id, userWatchlist.movieId))
      .where(eq(userWatchlist.userId, DEFAULT_USER_ID));

    // If watchlist is empty, return empty recommendations
    if (watchlistMovies.length === 0) {
      return NextResponse.json({
        movies: [],
        basedOn: { directors: [] }
      });
    }

    // Get directors from watchlist
    const directors = [...new Set(watchlistMovies.map(movie => movie.director))];

    // Get movies by the same directors, explicitly excluding watchlist movies
    const directorRecommendations = await db
      .select({
        id: movies.id,
        title: movies.title,
        year: movies.year,
        director: movies.director,
        plot: movies.plot,
        posterUrl: movies.posterUrl,
        imdbRating: movies.imdbRating,
        rottenTomatoesRating: movies.rottenTomatoesRating,
      })
      .from(movies)
      .leftJoin(
        userWatchlist,
        and(
          eq(movies.id, userWatchlist.movieId),
          eq(userWatchlist.userId, DEFAULT_USER_ID)
        )
      )
      .where(
        and(
          inArray(movies.director, directors),
          isNull(userWatchlist.id)
        )
      )
      .limit(20);

    return NextResponse.json({ 
      movies: directorRecommendations,
      basedOn: {
        directors: directors
      }
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}
