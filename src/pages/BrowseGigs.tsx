import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { gigsService } from '@/services/gigs';
import type { Gig } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Plus, IndianRupee, Calendar } from 'lucide-react';

export default function BrowseGigs() {
  const { user } = useAuth();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchGigs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await gigsService.getAll(debouncedQuery || undefined);
      setGigs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gigs');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    fetchGigs();
  }, [fetchGigs]);

  const getStatusColor = (status: Gig['status']) => {
    switch (status) {
      case 'open':
        return 'bg-success text-success-foreground';
      case 'assigned':
        return 'bg-warning text-warning-foreground';
      case 'completed':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Browse Gigs</h1>
          <p className="mt-1 text-muted-foreground">Find your next opportunity</p>
        </div>

        {user && (
          <Link to="/gigs/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Post Gig
            </Button>
          </Link>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search gigs by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-center text-destructive">
          {error}
        </div>
      ) : gigs.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            {debouncedQuery ? 'No gigs found matching your search.' : 'No gigs available yet.'}
          </p>
          {user && (
            <Link to="/gigs/create">
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Post the first gig
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gigs.map((gig) => (
            <Card key={gig.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="line-clamp-2 text-lg">{gig.title}</CardTitle>
                  <Badge className={getStatusColor(gig.status)}>{gig.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="line-clamp-3 text-sm text-muted-foreground">{gig.description}</p>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-1 text-foreground">
                    <IndianRupee className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{gig.budget}</span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(gig.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link to={`/gigs/${gig.id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    {user?._id === gig.ownerId ? 'View Bids' : 'View / Bid'}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
