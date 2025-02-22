import { Movie } from './movie';

export function mapDbToMovie(dbMovie: any): Movie {
    return {
      id: dbMovie.id,
      Title: dbMovie.title,
      Year: dbMovie.year, 
      Rated: dbMovie.rated || 'N/A', 
      Released: dbMovie.released || 'N/A',
      imdbID: dbMovie.imdbId,
      Poster: dbMovie.posterUrl, 
      Plot: dbMovie.plot || 'N/A',
      Runtime: dbMovie.runtime || 'N/A',
      Genre: dbMovie.genre || 'N/A',
      Director: dbMovie.director,
      Actors: dbMovie.actors || 'N/A',
      Writer: dbMovie.writer || 'N/A',
      Language: dbMovie.language || 'N/A',
      Country: dbMovie.country || 'N/A',
      Awards: dbMovie.awards || 'N/A',
      Ratings: [
        {
          Source: 'Internet Movie Database',
          Value: `${dbMovie.imdbRating}/10`, 
        },
        {
          Source: 'Rotten Tomatoes',
          Value: dbMovie.rottenTomatoesRating ? `${dbMovie.rottenTomatoesRating}%` : 'N/A', 
        },
        {
          Source: 'Metacritic',
          Value: dbMovie.metascore ? `${dbMovie.metascore}/100` : 'N/A', 
        },
      ],
      Metascore: dbMovie.metascore?.toString() || 'N/A',
      imdbRating: dbMovie.imdbRating || 0, 
      imdbVotes: dbMovie.imdbVotes || 'N/A',
      Type: dbMovie.type || 'N/A',
      DVD: dbMovie.dvd || 'N/A',
      BoxOffice: dbMovie.boxOffice || 'N/A',
      Production: dbMovie.production || 'N/A',
      Website: dbMovie.website || 'N/A',
      Response: dbMovie.response || 'N/A', 
    };
  }



  export function mapMovieToDb(movie: Movie): any {
    return {
      imdbId: movie.imdbID, 
      title: movie.Title,
      year: parseInt(movie.Year, 10),
      rated: movie.Rated !== 'N/A' ? movie.Rated : null, 
      released: movie.Released !== 'N/A' ? movie.Released : null,
      runtime: movie.Runtime !== 'N/A' ? movie.Runtime : null,
      genre: movie.Genre !== 'N/A' ? movie.Genre : null,
      director: movie.Director,
      writer: movie.Writer !== 'N/A' ? movie.Writer : null,
      actors: movie.Actors !== 'N/A' ? movie.Actors : null,
      plot: movie.Plot !== 'N/A' ? movie.Plot : null,
      language: movie.Language !== 'N/A' ? movie.Language : null,
      country: movie.Country !== 'N/A' ? movie.Country : null,
      awards: movie.Awards !== 'N/A' ? movie.Awards : null,
      posterUrl: movie.Poster !== 'N/A' ? movie.Poster : null, 
      imdbRating: movie.imdbRating || null, 
      ratings: movie.Ratings,
      metascore: movie.Metascore !== 'N/A' ? parseInt(movie.Metascore, 10) : null,
      imdbVotes: movie.imdbVotes !== 'N/A' ? movie.imdbVotes : null,
      type: movie.Type !== 'N/A' ? movie.Type : null,
      dvd: movie.DVD !== 'N/A' ? movie.DVD : null,
      boxOffice: movie.BoxOffice !== 'N/A' ? movie.BoxOffice : null,
      production: movie.Production !== 'N/A' ? movie.Production : null,
      website: movie.Website !== 'N/A' ? movie.Website : null,
      response: movie.Response !== 'N/A' ? movie.Response : null,
    };
  }