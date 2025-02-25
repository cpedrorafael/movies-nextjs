import { NextResponse } from 'next/server';
import { getRecommendations, getTopRatedMovies } from './recommendationUtil';
import { db } from '@/lib/db';
import { movies, watchlists } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = searchParams.get('limit');

    if (!userId) {
      const topMovies = await getTopRatedMovies(limit ? parseInt(limit) : 5);
      return NextResponse.json(topMovies);
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
    const { userId, movieId } = await request.json();

    if (!userId || !movieId) {
      return NextResponse.json(
        { error: 'Missing userId or movieId' },
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
        { error: `Movie with ID ${movieId} not found` },
        { status: 404 }
      );
    }

    // Check if movie is already in watchlist
    const existingEntry = await db
      .select({ id: watchlists.id })
      .from(watchlists)
      .where(eq(watchlists.movieId, movieId))
      .where(eq(watchlists.userId, userId))
      .limit(1);

    if (existingEntry.length > 0) {
      return NextResponse.json(
        { error: 'Movie already in watchlist' },
        { status: 409 }
      );
    }

    // Add movie to watchlist
    await db.insert(watchlists).values({
      userId,
      movieId,
    });

    return NextResponse.json({ 
      success: true,
      message: `Added movie ${movieId} to watchlist for user ${userId}`
    });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return NextResponse.json(
      { error: 'Failed to add to watchlist' },
      { status: 500 }
    );
  }
}
