export interface Movie {
    id: number;
    Title: string;
    Year: string;
    Rated: string;
    Released: string;
    imdbID: string; 
    Poster: string; 
    Plot: string;   
    Runtime: string;
    Genre: string;
    Director: string;
    Actors: string;
    Writer: string;
    Language: string;
    Country: string;
    Awards: string;
    Ratings: Array<{ Source: string; Value: string }>;
    Metascore: string;
    imdbRating: number;
    imdbVotes: string;
    Type: string;
    DVD: string;
    BoxOffice: string;
    Production: string;
    Website: string;
    Response: string;
  }