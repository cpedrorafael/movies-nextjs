import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { movies, userWatchlist } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const watchlist = await db
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
      .from(userWatchlist)
      .innerJoin(movies, eq(userWatchlist.movieId, movies.id))
      .where(eq(userWatchlist.userId, userId));

    return NextResponse.json({ watchlist });
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
    const body = await request.json();
    const { movieId, userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!movieId) {
      return NextResponse.json({ error: 'Movie ID is required' }, { status: 400 });
    }

    // Check if movie exists
    const movie = await db
      .select()
      .from(movies)
      .where(eq(movies.id, movieId))
      .limit(1);

    if (!movie.length) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      );
    }

    // Check if movie is already in watchlist
    const isAlreadyInWatchlist = await db
      .select({ id: userWatchlist.id })
      .from(userWatchlist)
      .where(
        and(
          eq(userWatchlist.userId, userId),
          eq(userWatchlist.movieId, movieId)
        )
      )
      .limit(1);

    if (isAlreadyInWatchlist.length > 0) {
      // Remove from watchlist
      await db.delete(userWatchlist)
        .where(
          and(
            eq(userWatchlist.userId, userId),
            eq(userWatchlist.movieId, movieId)
          )
        );

      return NextResponse.json({ success: true });
    }

    // Add to watchlist
    await db.insert(userWatchlist).values({
      userId,
      movieId,
    });

    return NextResponse.json({ success: true, movie: movie[0] });
  } catch (error) {
    console.error('Error managing watchlist:', error);
    return NextResponse.json(
      { error: 'Failed to manage watchlist' },
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