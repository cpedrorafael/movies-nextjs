import { NextRequest, NextResponse } from 'next/server';
import { fetchMovieById } from '@/app/api/movies/movieService';

type tParams = Promise<{ id: string }>;

export async function GET(
  request: NextRequest,
  props: { params: tParams }
) {
  const { id } = await props.params;

  try {
    const movie = await fetchMovieById(id);
    if (!movie) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(movie);
  } catch (error) {
    console.error('Error fetching movie:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movie' },
      { status: 500 }
    );
  }
}