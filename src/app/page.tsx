'use client';
import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MovieCard } from '@/components/MovieCard';
import { SearchBar } from '@/components/SearchBar';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';  
import { toast } from 'sonner';

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
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading} = useAuth0();
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("watchlist");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setIsDataLoading(true);
      try {
        const watchlistResponse = await fetch(`/api/watchlist?userId=${user.sub}`);
        if (watchlistResponse.ok) {
          const data = await watchlistResponse.json();
          setWatchlist(data.watchlist || []);
        }

        await fetchRecommendations();
      } catch (error) {
        console.error('Error fetching data:', error);
        setWatchlist([]);
        setRecommendations([]);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleMovieAdd = async (movie: Movie, isRemove: boolean = false) => {
    if (!user?.sub) return;
    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieId: movie.id,
          userId: user.sub,
        }),
      });
      if (response.ok) {
        if (isRemove) {
          setWatchlist((prev) => prev.filter((m) => m.id !== movie.id));
          toast.success(`${movie.title} removed from watchlist`);
          return;
        }
        setWatchlist((prev) => [...prev, movie]);
        toast.success(`${movie.title} added to watchlist`);
      }
    } catch (error) {
      console.error('Error managing watchlist:', error);
      toast.error('Failed to update watchlist');
    } finally {
      setIsDataLoading(false);
      updateRecommendations(movie);
    }
  };

  const updateRecommendations = async (movie: Movie) => {
    if (!user?.sub) return;
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.sub,
          movieId: movie.id,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error('Error updating recommendations:', error);
    } finally {
      fetchRecommendations();
    }
  };

  const fetchRecommendations = async () => {
    if (!user?.sub) return;
    try {
      const response = await fetch('/api/recommendations?userId=' + user.sub);
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data || []);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  // Handle authentication loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }


  return (
    <main className="container mx-auto py-4 px-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Movies App</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {user?.name || user?.email || 'User'}
          </span>
          <Button
            variant="outline"
            onClick={() =>
              logout({ logoutParams: { returnTo: window.location.origin } })
            }
          >
            Sign out
          </Button>
        </div>
      </div>
      <SearchBar onMovieAdd={handleMovieAdd} watchlist={watchlist} />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>
        <TabsContent value="watchlist" className="space-y-4">
          {isDataLoading ? (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : watchlist.length === 0 ? (
            <div className="text-center text-muted-foreground">
              Your watchlist is empty. Search for movies to add them here.
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {watchlist.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onToggleWatched={() => handleMovieAdd(movie, true)}
                    isWatched={true}
                    id={`movie-${movie.id}`}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
        <TabsContent value="recommendations" className="space-y-4">
          {isDataLoading ? (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center text-muted-foreground">
              Add movies to your watchlist to get personalized recommendations.
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
                    id={`movie-${movie.id}`}
                  />
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}