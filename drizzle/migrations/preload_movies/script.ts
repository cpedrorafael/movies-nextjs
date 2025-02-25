import { db } from '../../../src/lib/db';
import { movies } from '../../../src/lib/db/schema';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

interface MovieRating {
  Source: string;
  Value: string;
}

interface MovieData {
  imdbID: string;
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings?: MovieRating[];
  imdbRating: string;
  Metascore: string;
  imdbVotes: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const filePath = path.join(__dirname, '../../../src/lib/db/preload.json');
  const moviesData = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as MovieData[];

  for (const movie of moviesData) {
    const movieToInsert = {
      imdbId: movie.imdbID,
      title: movie.Title,
      year: parseInt(movie.Year) || 0,
      rated: movie.Rated || null,
      released: movie.Released || null,
      runtime: movie.Runtime || null,
      genre: movie.Genre || null,
      director: movie.Director || '',
      writer: movie.Writer || null,
      actors: movie.Actors || null,
      plot: movie.Plot || null,
      language: movie.Language || null,
      country: movie.Country || null,
      awards: movie.Awards || null,
      posterUrl: movie.Poster || null,
      imdbRating: movie.imdbRating ? parseFloat(movie.imdbRating) : null,
      rottenTomatoesRating: movie.Ratings?.find((r: MovieRating) => r.Source === "Rotten Tomatoes")?.Value ? 
        parseInt(movie.Ratings.find((r: MovieRating) => r.Source === "Rotten Tomatoes")!.Value.replace('%', '')) : null,
      metascore: movie.Metascore ? parseInt(movie.Metascore) : null,
      imdbVotes: movie.imdbVotes || null,
      type: movie.Type || null,
      dvd: movie.DVD || null,
      boxOffice: movie.BoxOffice || null,
      production: movie.Production || null,
      website: movie.Website || null,
      response: movie.Response || null
    };

    await db.insert(movies).values(movieToInsert).run();
  }

  console.log('Movies preloaded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
