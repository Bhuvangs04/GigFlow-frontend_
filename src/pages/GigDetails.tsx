import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { gigsService } from '@/services/gigs';
import { bidsService } from '@/services/bids';
import type { Gig, Bid } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  ArrowLeft, 
  IndianRupee, 
  Calendar, 
  MessageSquare,
  Check,
  X,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

export default function GigDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [gig, setGig] = useState<Gig | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoadingGig, setIsLoadingGig] = useState(true);
  const [isLoadingBids, setIsLoadingBids] = useState(false);
  const [gigError, setGigError] = useState<string | null>(null);
  
  // Bid form state
  const [bidMessage, setBidMessage] = useState('');
  const [bidPrice, setBidPrice] = useState('');
  const [bidError, setBidError] = useState<string | null>(null);
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);
  
  // Hiring state
  const [hiringBidId, setHiringBidId] = useState<string | null>(null);

  const isOwner = user && gig && user._id === gig.ownerId;
  const isOpen = gig?.status === 'open';
  const hasHiredBid = bids.some(b => b.status === 'hired');




  const fetchGig = useCallback(async () => {
    if (!id) return;
    setIsLoadingGig(true);
    setGigError(null);
    try {
      const data = await gigsService.getById(id);
      setGig(data);
    } catch (err) {
      setGigError(err instanceof Error ? err.message : 'Failed to load gig');
    } finally {
      setIsLoadingGig(false);
    }
  }, [id]);


  const fetchBids = useCallback(async () => {
    if (!id || !isOwner) return;
    setIsLoadingBids(true);
    try {
      const data = await bidsService.getByGig(id);
      setBids(data);
    } catch (err) {
      console.error('Failed to load bids:', err);
    } finally {
      setIsLoadingBids(false);
    }
  }, [id, isOwner]);

  useEffect(() => {
    fetchGig();
  }, [fetchGig]);

  useEffect(() => {
    fetchBids();
  }, [fetchBids]);


  const validateBidForm = (): string | null => {
    if (!bidMessage.trim()) return 'Message is required';
    if (bidMessage.trim().length < 10) return 'Message must be at least 10 characters';
    if (!bidPrice) return 'Price is required';
    const priceNum = parseFloat(bidPrice);
    if (isNaN(priceNum) || priceNum <= 0) return 'Price must be a positive number';
    return null;
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setBidError(null);
    const validationError = validateBidForm();
    if (validationError) {
      setBidError(validationError);
      return;
    }

    setIsSubmittingBid(true);
    try {
      await bidsService.create({
        gigId: id,
        message: bidMessage.trim(),
        price: parseFloat(bidPrice),
      });
      toast.success('Bid submitted successfully!');
      setBidMessage('');
      setBidPrice('');
    } catch (err) {
      setBidError(err instanceof Error ? err.message : 'Failed to submit bid');
    } finally {
      setIsSubmittingBid(false);
    }
  };

  const handleHire = async (bidId: string) => {
    setHiringBidId(bidId);
    try {
      await bidsService.hire(bidId);
      toast.success('Freelancer hired successfully!');
      // Refresh gig and bids
      await Promise.all([fetchGig(), fetchBids()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to hire');
    } finally {
      setHiringBidId(null);
    }
  };

  const getStatusBadge = (status: Bid['status']) => {
    switch (status) {
      case 'hired':
        return <Badge className="bg-success text-success-foreground"><Check className="mr-1 h-3 w-3" />Hired</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="text-muted-foreground"><X className="mr-1 h-3 w-3" />Rejected</Badge>;
      default:
        return <Badge variant="outline"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
    }
  };

  if (isLoadingGig) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (gigError || !gig) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-center text-destructive">
          {gigError || 'Gig not found'}
        </div>
        <div className="text-center">
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Gigs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link to="/">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Gigs
        </Button>
      </Link>

      {/* Gig Details */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">{gig.title}</CardTitle>
              <CardDescription className="mt-2 flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(gig.createdAt).toLocaleDateString()}
                </span>
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge 
                className={
                  gig.status === 'open' 
                    ? 'bg-success text-success-foreground' 
                    : gig.status === 'assigned' 
                    ? 'bg-warning text-warning-foreground' 
                    : 'bg-muted text-muted-foreground'
                }
              >
                {gig.status}
              </Badge>
              <div className="flex items-center gap-1/2 text-2xl font-bold text-primary">
                <IndianRupee className="h-6 w-6" />
                {gig.budget}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-foreground">{gig.description}</p>
        </CardContent>
      </Card>

      {/* Bid Form (for non-owners when gig is open) */}
      {user && !isOwner && isOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Submit Your Bid
            </CardTitle>
            <CardDescription>Propose your price and explain why you're the right fit</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmitBid}>
            <CardContent className="space-y-4">
              {bidError && (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                  {bidError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="bidMessage">Message</Label>
                <Textarea
                  id="bidMessage"
                  placeholder="Describe your approach and relevant experience..."
                  value={bidMessage}
                  onChange={(e) => setBidMessage(e.target.value)}
                  className="min-h-[100px]"
                  disabled={isSubmittingBid}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bidPrice">Your Price (₹)</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="bidPrice"
                    type="number"
                    placeholder="Your proposed price"
                    min="1"
                    step="1"
                    value={bidPrice}
                    onChange={(e) => setBidPrice(e.target.value)}
                    className="pl-10"
                    disabled={isSubmittingBid}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmittingBid}>
                {isSubmittingBid ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Bid'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* Login prompt for non-authenticated users */}
      {!user && isOpen && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="mb-4 text-muted-foreground">Sign in to submit a bid on this gig</p>
            <Link to="/login">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Bids List (for owners) */}
      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle>Bids ({bids.length})</CardTitle>
            <CardDescription>Review proposals from freelancers</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingBids ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : bids.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No bids yet</p>
            ) : (
              <div className="space-y-4">
                {bids.map((bid, index) => (
                  <div key={bid._id}>
                    {index > 0 && <Separator className="my-4" />}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">
                            Freelancer ID: {bid.freelancerId.slice(0, 6)}…</span>                          {getStatusBadge(bid.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{bid.message}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 font-medium text-primary">
                            <IndianRupee className="h-4 w-4" />
                            {bid.price}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {new Date(bid.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {bid.status === 'pending' && isOpen && !hasHiredBid && (
                        <Button
                          onClick={() => handleHire(bid._id)}
                          disabled={hiringBidId !== null}
                          className="shrink-0"
                        >
                          {hiringBidId === bid._id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Hiring...
                            </>
                          ) : (
                            'Hire'
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
