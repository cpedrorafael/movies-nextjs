import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { movies } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

const OMDB_API_KEY = process.env.OMDB_API_KEY;
const OMDB_API_URL = 'http://www.omdbapi.com';
const MAX_RESULTS = 10;

function mapDbMovieToOmdbFormat(movie: any) {
  return {
    Title: movie.title,
    Year: movie.year.toString(),
    Rated: movie.rated,
    Released: movie.released,
    Runtime: movie.runtime,
    Genre: movie.genre,
    Director: movie.director,
    Writer: movie.writer,
    Actors: movie.actors,
    Plot: movie.plot,
    Language: movie.language,
    Country: movie.country,
    Awards: movie.awards,
    Poster: movie.posterUrl,
    Ratings: [
      movie.rottenTomatoesRating ? {
        Source: "Rotten Tomatoes",
        Value: `${movie.rottenTomatoesRating}%`
      } : null
    ].filter(Boolean),
    Metascore: movie.metascore?.toString(),
    imdbRating: movie.imdbRating?.toString(),
    imdbVotes: movie.imdbVotes,
    imdbID: movie.imdbId,
    Type: movie.type,
    DVD: movie.dvd,
    BoxOffice: movie.boxOffice,
    Production: movie.production,
    Website: movie.website,
    Response: "True"
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const localMovies = await db.select()
      .from(movies)
      .where(sql`LOWER(title) LIKE ${`%${query.toLowerCase()}%`}`)
      .limit(MAX_RESULTS);

    const mappedLocalMovies = localMovies.map(mapDbMovieToOmdbFormat);
    
    if (mappedLocalMovies.length >= MAX_RESULTS) {
      return NextResponse.json(mappedLocalMovies);
    }

    if (!OMDB_API_KEY) {
      return NextResponse.json(mappedLocalMovies);
    }

    const response = await fetch(
      `${OMDB_API_URL}/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(query)}&type=movie`
    );
    const data = await response.json();

    if (data.Response === 'False') {
      if (mappedLocalMovies.length > 0) {
        return NextResponse.json(mappedLocalMovies);
      }
      return NextResponse.json({ error: data.Error }, { status: 404 });
    }

    const localImdbIds = new Set(localMovies.map(m => m.imdbId));

    const omdbResults = data.Search || [];
    const uniqueOmdbIds = omdbResults
      .filter((m: any) => !localImdbIds.has(m.imdbID))
      .slice(0, MAX_RESULTS - mappedLocalMovies.length)
      .map((m: any) => m.imdbID);

    const detailedOmdbMovies = await Promise.all(
      uniqueOmdbIds.map(async (imdbId: string) => {
        try {
          const detailResponse = await fetch(
            `${OMDB_API_URL}/?apikey=${OMDB_API_KEY}&i=${imdbId}`
          );
          return detailResponse.json();
        } catch (error) {
          console.error(`Failed to fetch details for movie ${imdbId}:`, error);
          return null;
        }
      })
    );

    const validOmdbMovies = detailedOmdbMovies.filter((m: any) => m && m.Response === 'True')

    const combinedResults = [...mappedLocalMovies, ...validOmdbMovies];
    return NextResponse.json(combinedResults);

  } catch (error) {
    console.error('Error searching movies:', error);
    return NextResponse.json(
      { error: 'Failed to search movies' },
      { status: 500 }
    );
  }
}
