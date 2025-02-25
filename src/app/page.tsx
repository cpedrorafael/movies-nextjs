'use client';

import { useState, useEffect } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { MovieCard } from '@/components/MovieCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Movie {
  id: number;
  title: string;
  year: number;
  director: string;
  plot: string | null;
  posterUrl: string | null;
  imdbRating: number | null;
  rottenTomatoesRating: number | null;
}

export default function Home() {
  const [userId] = useState('default-user');
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [recommendationContext, setRecommendationContext] = useState<{ directors: string[] }>({ directors: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("watchlist");

  // Fetch watchlist
  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const response = await fetch(`/api/watchlist?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setWatchlist(Array.isArray(data.movies) ? data.movies : []);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching watchlist:', error);
        setWatchlist([]);
        setIsLoading(false);
      }
    };

    fetchWatchlist();
  }, [userId]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch(`/api/recommendations?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setRecommendations(Array.isArray(data) ? data : []); 
          setRecommendationContext(data.basedOn || { directors: [] });
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setRecommendations([]);
      }
    };

    fetchRecommendations();
  }, [userId, watchlist]);

  const handleMovieAdd = async (movie: Movie) => {
    // First add to watchlist
    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          movieId: movie.id,
          watched: false,
          userId: userId
        }),
      });

      if (response.ok) {
        setWatchlist(prev => [...prev, movie]);
        // Remove from recommendations
        setRecommendations(prev => prev.filter(m => m.id !== movie.id));
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };

  const handleToggleWatched = async (movieId: number) => {
    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          movieId: movieId,
          watched: false,
          userId: userId
        }),
      });

      if (response.ok) {
        setWatchlist(prev => prev.filter(m => m.id !== movieId));
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 h-screen flex flex-col">
      <h1 className="text-3xl font-bold mb-8">Movie Tracker</h1>
      
      <div className="mb-8">
        <SearchBar onMovieAdd={handleMovieAdd} watchlist={watchlist} />
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg text-muted-foreground">Loading...</div>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mb-4">
            <TabsTrigger value="watchlist">
              Watchlist {watchlist.length > 0 && `(${watchlist.length})`}
            </TabsTrigger>
            <TabsTrigger value="discover">
              Discover {recommendations.length > 0 && `(${recommendations.length})`}
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 -mx-4 px-4">
            <TabsContent value="watchlist" className="flex-1 mt-0 data-[state=active]:flex data-[state=active]:flex-col">
              {watchlist.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Your watchlist is empty. Search for movies to add them!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {watchlist.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      id={`movie-${movie.id}`}
                      movie={movie}
                      onToggleWatched={handleToggleWatched}
                      isWatched={true}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="discover" className="flex-1 mt-0 data-[state=active]:flex data-[state=active]:flex-col">
              {recommendations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {watchlist.length === 0 
                    ? "Add movies to your watchlist to get personalized recommendations!"
                    : "No recommendations found. Try adding more movies to your watchlist!"}
                </div>
              ) : (
                <>
                  <div className="mb-4 text-sm text-muted-foreground">
                    Recommendations based on your watchlist 
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {recommendations.map((movie) => (
                      <MovieCard
                        key={movie.id}
                        movie={movie}
                        onToggleWatched={() => handleMovieAdd(movie)}
                        isWatched={false}
                      />
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      )}
    </main>
  );
}
