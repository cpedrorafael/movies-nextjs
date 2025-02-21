import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { movies, userWatchlist } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { watchlistSchema } from '../config';
import { sql } from 'drizzle-orm';

// Since we don't have auth yet, we'll use a default user ID
const DEFAULT_USER_ID = 'default-user';

export async function GET(request: Request) {
  try {
    const result = await db
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
      .where(eq(userWatchlist.userId, DEFAULT_USER_ID));

    return NextResponse.json({ movies: result });
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

    const validatedWatchlist = watchlistSchema.parse(body);

    // First verify that the movie exists
    const movieExists = await db
      .select()
      .from(movies)
      .where(eq(movies.id, validatedWatchlist.movieId))
      .get();


    if (!movieExists) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      );
    }

    // Check if movie is already in watchlist
    const existingEntry = await db
      .select()
      .from(userWatchlist)
      .where(
        and(
          eq(userWatchlist.userId, DEFAULT_USER_ID),
          eq(userWatchlist.movieId, validatedWatchlist.movieId)
        )
      )
      .get();


    if (existingEntry) {
      console.log('POST /api/watchlist - Movie already in watchlist:', existingEntry.id);
      return NextResponse.json({ success: true });
    }

    // Add to watchlist
    const result = await db.insert(userWatchlist).values({
      userId: DEFAULT_USER_ID,
      movieId: validatedWatchlist.movieId,
      watched: validatedWatchlist.watched ?? false,
    });

    console.log('POST /api/watchlist - Insert result:', result);

    if (!result.lastInsertRowid) {
      console.log('POST /api/watchlist - Insert failed, no lastInsertRowid');
      throw new Error('Failed to insert into watchlist');
    }

    console.log('POST /api/watchlist - Successfully added movie to watchlist');

    return NextResponse.json({ movie: movieExists }, { status: 201 });
  } catch (error) {
    console.error('Error updating watchlist:', error);
    return NextResponse.json(
      { error: 'Failed to update watchlist' },
      { status: 500 }
    );
  }
}
