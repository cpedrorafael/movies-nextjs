import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { movies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const movie = await db
      .select()
      .from(movies)
      .where(eq(movies.id, parseInt(context.params.id)))
      .get();

    if (!movie) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(movie);
  } catch (error) {
    console.error('Error fetching movie:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movie' },
      { status: 500 }
    );
  }
}
