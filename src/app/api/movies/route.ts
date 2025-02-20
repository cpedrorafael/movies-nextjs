import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { movies, actors, genres, movieActors, movieGenres } from '@/lib/db/schema';
import { eq, inArray, like, and, or } from 'drizzle-orm';
import { movieSchema } from '../config';
import { sql } from 'drizzle-orm';

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
    const validatedMovie = movieSchema.parse(body);

    const result = await db.insert(movies).values(validatedMovie);
    const movieId = Number(result.lastInsertRowid);

    if (body.actors) {
      for (const actorName of body.actors) {
        let actor = await db
          .select()
          .from(actors)
          .where(eq(actors.name, actorName))
          .get();

        if (!actor) {
          const result = await db
            .insert(actors)
            .values({ name: actorName });
          actor = { id: Number(result.lastInsertRowid), name: actorName };
        }

        await db.insert(movieActors).values({
          movieId,
          actorId: actor.id,
        });
      }
    }

    if (body.genres) {
      for (const genreName of body.genres) {
        let genre = await db
          .select()
          .from(genres)
          .where(eq(genres.name, genreName))
          .get();

        if (!genre) {
          const result = await db
            .insert(genres)
            .values({ name: genreName });
          genre = { id: Number(result.lastInsertRowid), name: genreName };
        }

        await db.insert(movieGenres).values({
          movieId,
          genreId: genre.id,
        });
      }
    }

    const movie = await db
      .select()
      .from(movies)
      .where(eq(movies.id, movieId))
      .get();

    return NextResponse.json({ movie }, { status: 201 });
  } catch (error) {
    console.error('Error creating movie:', error);
    return NextResponse.json(
      { error: 'Failed to create movie' },
      { status: 500 }
    );
  }
}
