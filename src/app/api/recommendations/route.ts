import { NextResponse } from 'next/server';
import { getRecommendations, getTopRatedMovies } from './recommendationUtil';
import { db } from '@/lib/db';
import { movies, userWatchlist } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = searchParams.get('limit');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const recommendations = await getRecommendations(userId, limit ? parseInt(limit) : 5);
    return NextResponse.json(recommendations);

  } catch (error) {
    console.error('Error getting recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
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

    // Check if movie is already in watchlist
    const existingEntry = await db
      .select({ id: userWatchlist.id })
      .from(userWatchlist)
      .where(
        and(
          eq(userWatchlist.movieId, movieId),
          eq(userWatchlist.userId, userId)
        )
      )
      .limit(1);

    if (existingEntry.length > 0) {
      console.log('Movie already in watchlist');
      return NextResponse.json(
        { message: 'Movie already in watchlist' },
        { status: 200 }
      );
    }

    // Add movie to watchlist
    await db.insert(userWatchlist).values({
      userId,
      movieId,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating watchlist:', error);
    return NextResponse.json(
      { error: 'Failed to update watchlist' },
      { status: 500 }
    );
  }
}
