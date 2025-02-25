-- Create movie ratings table
CREATE TABLE movie_ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  movie_id INTEGER NOT NULL,
  rating TEXT NOT NULL CHECK (rating IN ('liked', 'disliked', 'neutral')),
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (movie_id) REFERENCES movies (id) ON DELETE CASCADE
);
