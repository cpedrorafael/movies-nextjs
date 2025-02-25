import { sql } from 'drizzle-orm';
import {
  integer,
  sqliteTable,
  text,
  real,
} from 'drizzle-orm/sqlite-core';

export const movies = sqliteTable('movies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  imdbId: text('imdb_id').notNull(),
  title: text('title').notNull(),
  year: integer('year').notNull(),
  rated: text('rated'),
  released: text('released'),
  runtime: text('runtime'),
  genre: text('genre'),
  director: text('director').notNull(),
  writer: text('writer'),
  actors: text('actors'),
  plot: text('plot'),
  language: text('language'),
  country: text('country'),
  awards: text('awards'),
  posterUrl: text('poster_url'),
  imdbRating: real('imdb_rating'),
  rottenTomatoesRating: integer('rotten_tomatoes_rating'),
  metascore: integer('metascore'),
  imdbVotes: text('imdb_votes'),
  type: text('type'),
  dvd: text('dvd'),
  boxOffice: text('box_office'),
  production: text('production'),
  website: text('website'),
  response: text('response'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const genres = sqliteTable('genres', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
});

export const movieGenres = sqliteTable('movie_genres', {
  movieId: integer('movie_id')
    .references(() => movies.id)
    .notNull(),
  genreId: integer('genre_id')
    .references(() => genres.id)
    .notNull(),
});

export const actors = sqliteTable('actors', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
});

export const movieActors = sqliteTable('movie_actors', {
  movieId: integer('movie_id')
    .references(() => movies.id)
    .notNull(),
  actorId: integer('actor_id')
    .references(() => actors.id)
    .notNull(),
});

export const userRatings = sqliteTable('user_ratings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  movieId: integer('movie_id')
    .references(() => movies.id)
    .notNull(),
  rating: integer('rating').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const userWatchlist = sqliteTable('user_watchlist', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  movieId: integer('movie_id')
    .references(() => movies.id)
    .notNull(),
  watched: integer('watched', { mode: 'boolean' })
    .notNull()
    .default(sql`0`),
  watchedAt: integer('watched_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
