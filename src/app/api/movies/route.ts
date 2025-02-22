import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { movies, actors, genres, movieActors, movieGenres } from '@/lib/db/schema';
import { eq, inArray, like, and } from 'drizzle-orm';
import { fetchAndSaveMovieDetails } from './movieService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const actor = searchParams.get('actor');
    const director = searchParams.get('director');
    const genre = searchParams.get('genre');

    const conditions = [];

    if (query) {
      conditions.push(like(movies.title, `%${query}%`));
    }

    if (director) {
      conditions.push(like(movies.director, `%${director}%`));
    }

    if (actor) {
      const actorMovies = await db
        .select({ movieId: movieActors.movieId })
        .from(movieActors)
        .innerJoin(actors, eq(actors.id, movieActors.actorId))
        .where(like(actors.name, `%${actor}%`));

      if (actorMovies.length > 0) {
        conditions.push(
          inArray(
            movies.id,
            actorMovies.map((m) => m.movieId)
          )
        );
      } else {
        return NextResponse.json({ movies: [] });
      }
    }

    if (genre) {
      const genreMovies = await db
        .select({ movieId: movieGenres.movieId })
        .from(movieGenres)
        .innerJoin(genres, eq(genres.id, movieGenres.genreId))
        .where(like(genres.name, `%${genre}%`));

      if (genreMovies.length > 0) {
        conditions.push(
          inArray(
            movies.id,
            genreMovies.map((m) => m.movieId)
          )
        );
      } else {
        return NextResponse.json({ movies: [] });
      }
    }

    const result = await db
      .select()
      .from(movies)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return NextResponse.json({ movies: result });
  } catch (error) {
    console.error('Error fetching movies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movies' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log(body);

    const movie = await fetchAndSaveMovieDetails(body.imdbID);
  
    return NextResponse.json({ movie }, { status: 201 });
  } catch (error) {
    console.error('Error creating movie:', error);
    return NextResponse.json(
      { error: 'Failed to create movie' },
      { status: 500 }
    );
  }
}
