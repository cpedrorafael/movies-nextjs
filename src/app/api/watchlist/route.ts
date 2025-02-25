import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { movies, userWatchlist } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const watchlistMovies = await db
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
      .innerJoin(userWatchlist, eq(movies.id, userWatchlist.movieId))
      .where(eq(userWatchlist.userId, userId));

    return NextResponse.json({ movies: watchlistMovies });
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch watchlist' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { movieId, userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!movieId) {
      return NextResponse.json(
        { error: 'Movie ID is required' },
        { status: 400 }
      );
    }

    // Check if movie exists
    const movieExists = await db
      .select({ id: movies.id })
      .from(movies)
      .where(eq(movies.id, movieId))
      .limit(1);

    if (movieExists.length === 0) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      );
    }

    // Add to watchlist
    await db.insert(userWatchlist).values({
      userId,
      movieId,
    });

    // Get the added movie details
    const addedMovie = await db
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
      .where(eq(movies.id, movieId))
      .limit(1);

    return NextResponse.json({ movie: addedMovie[0] });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return NextResponse.json(
      { error: 'Failed to add to watchlist' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const movieId = searchParams.get('movieId');

    if (!userId || !movieId) {
      return NextResponse.json(
        { error: 'User ID and Movie ID are required' },
        { status: 400 }
      );
    }

    await db
      .delete(userWatchlist)
      .where(
        eq(userWatchlist.movieId, parseInt(movieId))
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return NextResponse.json(
      { error: 'Failed to remove from watchlist' },
      { status: 500 }
    );
  }
}