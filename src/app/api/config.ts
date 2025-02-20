import { z } from 'zod';

export const movieSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  year: z.number().min(1888, 'Year must be after 1888'),
  director: z.string().min(1, 'Director is required'),
  plot: z.string().nullable().optional(),
  posterUrl: z.string().url().nullable().optional(),
  imdbRating: z.number().min(0).max(10).nullable().optional(),
  rottenTomatoesRating: z.number().min(0).max(100).nullable().optional(),
});

export const ratingSchema = z.object({
  movieId: z.number(),
  rating: z.number().min(1).max(5),
});

export const watchlistSchema = z.object({
  movieId: z.number(),
  watched: z.boolean().nullable().optional(),
});

export type Movie = z.infer<typeof movieSchema>;
export type Rating = z.infer<typeof ratingSchema>;
export type Watchlist = z.infer<typeof watchlistSchema>;
