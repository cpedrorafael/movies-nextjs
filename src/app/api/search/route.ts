import { NextResponse } from 'next/server';

const OMDB_API_KEY = process.env.OMDB_API_KEY;
const OMDB_API_URL = 'http://www.omdbapi.com';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  if (!OMDB_API_KEY) {
    return NextResponse.json(
      { error: 'OMDB_API_KEY environment variable is not set' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `${OMDB_API_URL}/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(query)}&type=movie`
    );
    const data = await response.json();

    if (data.Response === 'False') {
      return NextResponse.json({ error: data.Error }, { status: 404 });
    }

    const detailedMovies = await Promise.all(
      data.Search.slice(0, 10).map(async (movie: any) => {
        const detailResponse = await fetch(
          `${OMDB_API_URL}/?apikey=${OMDB_API_KEY}&i=${movie.imdbID}`
        );
        return detailResponse.json();
      })
    );

    return NextResponse.json(detailedMovies);
  } catch (error) {
    console.error('Error fetching movies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movies from OMDB' },
      { status: 500 }
    );
  }
}
