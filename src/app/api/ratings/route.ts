import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { movieRatings, movies, type Rating } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

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

    const ratings = await db
      .select({
        movieId: movieRatings.movieId,
        rating: movieRatings.rating,
      })
      .from(movieRatings)
      .where(eq(movieRatings.userId, userId));

    return NextResponse.json({ ratings });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ratings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { movieId, userId, rating } = await request.json();

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

    if (!rating || !['liked', 'disliked', 'neutral'].includes(rating)) {
      return NextResponse.json(
        { error: 'Invalid rating value' },
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

    // Update or insert rating
    const existingRating = await db
      .select()
      .from(movieRatings)
      .where(
        and(
          eq(movieRatings.userId, userId),
          eq(movieRatings.movieId, movieId)
        )
      )
      .limit(1);

    if (existingRating.length > 0) {
      await db
        .update(movieRatings)
        .set({ rating: rating as Rating })
        .where(
          and(
            eq(movieRatings.userId, userId),
            eq(movieRatings.movieId, movieId)
          )
        );
    } else {
      await db.insert(movieRatings).values({
        userId,
        movieId,
        rating: rating as Rating,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating rating:', error);
    return NextResponse.json(
      { error: 'Failed to update rating' },
      { status: 500 }
    );
  }
}
