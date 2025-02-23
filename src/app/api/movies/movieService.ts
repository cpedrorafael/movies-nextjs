import axios from 'axios';
import { Movie } from './movie';
import { db } from '@/lib/db';
import { movies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { mapDbToMovie, mapMovieToDb } from './mapper';

export async function fetchAndSaveMovieDetails(imdb_id: string): Promise<Movie> {
    console.log(imdb_id);
  try {
    const existingMovie = await db.select().from(movies).where(eq(movies.imdbId, imdb_id));

    if (existingMovie.length > 0) {
      return mapDbToMovie(existingMovie[0]);
    }

    const omdbResponse = await axios.get<Movie>('http://www.omdbapi.com/', {
      params: {
        i: imdb_id,
        apikey: process.env.OMDB_API_KEY,
      },
    });

    console.log(omdbResponse.data);
    const movieData: Movie = {
        id: 0,
        imdbID: omdbResponse.data.imdbID,
        Title: omdbResponse.data.Title,
        Year: omdbResponse.data.Year,
        Rated: omdbResponse.data.Rated,
        Released: omdbResponse.data.Released,
        Runtime: omdbResponse.data.Runtime,
        Genre: omdbResponse.data.Genre,
        Director: omdbResponse.data.Director,
        Writer: omdbResponse.data.Writer,
        Actors: omdbResponse.data.Actors,
        Plot: omdbResponse.data.Plot,
        Language: omdbResponse.data.Language,
        Country: omdbResponse.data.Country,
        Awards: omdbResponse.data.Awards,
        Poster: omdbResponse.data.Poster,
        imdbRating: omdbResponse.data.imdbRating,
        Metascore: omdbResponse.data.Metascore,
        imdbVotes: omdbResponse.data.imdbVotes,
        Type: omdbResponse.data.Type,
        DVD: omdbResponse.data.DVD,
        BoxOffice: omdbResponse.data.BoxOffice,
        Production: omdbResponse.data.Production,
        Website: omdbResponse.data.Website,
        Ratings: omdbResponse.data.Ratings,
        Response: omdbResponse.data.Response
    };

    const result = await db.insert(movies).values(mapMovieToDb(movieData));

    movieData.id = Number(result.lastInsertRowid);

    return movieData;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch or save movie details');
  }
}

// app/api/movies/movieService.ts
export async function fetchMovieById(id: string): Promise<Movie | null> {
    try {
      const movie = await db.select().from(movies).where(eq(movies.id, Number(id))).get();
      return movie ? mapDbToMovie(movie) : null;
    } catch (error) {
      console.error('Error fetching movie by ID:', error);
      return null;
    }
  }