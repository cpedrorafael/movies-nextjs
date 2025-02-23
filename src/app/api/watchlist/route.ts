import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { movies, userWatchlist } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { watchlistSchema } from '../config';

const DEFAULT_USER_ID = 'default-user';
const OMDB_API_KEY = process.env.OMDB_API_KEY;
const OMDB_API_URL = 'http://www.omdbapi.com';

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
      return NextResponse.json({ success: true });
    }

    const result = await db.insert(userWatchlist).values({
      userId: DEFAULT_USER_ID,
      movieId: validatedWatchlist.movieId,
      watched: validatedWatchlist.watched ?? false,
    });

    if (!result.lastInsertRowid) {
      throw new Error('Failed to insert into watchlist');
    }


    return NextResponse.json({ movie: movieExists }, { status: 201 });
  } catch (error) {
    console.error('Error updating watchlist:', error);
    return NextResponse.json(
      { error: 'Failed to update watchlist' },
      { status: 500 }
    );
  }
}


async function getMovieDetails(movieId: string) {
  if (!OMDB_API_KEY) {
    return NextResponse.json(
      { error: 'Failed to fetch movie details' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `${OMDB_API_URL}/?apikey=${OMDB_API_KEY}&i=${movieId}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movie details' },
      { status: 500 }
    );
  }
}