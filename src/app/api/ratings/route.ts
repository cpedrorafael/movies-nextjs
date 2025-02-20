import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userRatings } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { ratingSchema } from '../config';

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
      .select()
      .from(userRatings)
      .where(eq(userRatings.userId, userId));

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
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedRating = ratingSchema.parse(body);

    // Check if user has already rated this movie
    const existingRating = await db
      .select()
      .from(userRatings)
      .where(
        and(
          eq(userRatings.userId, userId),
          eq(userRatings.movieId, validatedRating.movieId)
        )
      )
      .get();

    if (existingRating) {
      return NextResponse.json(
        { error: 'User has already rated this movie' },
        { status: 400 }
      );
    }

    const result = await db.insert(userRatings).values({
      ...validatedRating,
      userId,
    });

    const rating = await db
      .select()
      .from(userRatings)
      .where(eq(userRatings.id, Number(result.lastInsertRowid)))
      .get();

    return NextResponse.json({ rating }, { status: 201 });
  } catch (error) {
    console.error('Error creating rating:', error);
    return NextResponse.json(
      { error: 'Failed to create rating' },
      { status: 500 }
    );
  }
}
