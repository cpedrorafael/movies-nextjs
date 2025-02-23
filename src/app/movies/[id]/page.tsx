import { fetchMovieById } from '@/app/api/movies/movieService';

export default async function MovieDetailsPage({ params }: { params: { id: string } }) {
  const movie = await fetchMovieById(params.id);

  if (!movie) {
    return <div>Movie not found</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{movie.Title}</h1>
      <p className="text-gray-600">{movie.Year}</p>
      <img src={movie.Poster} alt={movie.Title} className="w-full max-w-md my-4" />
      <p className="mt-4">{movie.Plot}</p>
      <div className="mt-4">
        <h2 className="text-xl font-semibold">Details</h2>
        <p><strong>Director:</strong> {movie.Director}</p>
        <p><strong>Actors:</strong> {movie.Actors}</p>
        <p><strong>Genre:</strong> {movie.Genre}</p>
        <p><strong>IMDB Rating:</strong> {movie.imdbRating}</p>
      </div>
    </div>
  );
}