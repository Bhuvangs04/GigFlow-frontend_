import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gigsService } from '@/services/gigs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileText, IndianRupee, AlignLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateGig() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): string | null => {
    if (!title.trim()) return 'Title is required';
    if (title.trim().length < 5) return 'Title must be at least 5 characters';
    if (!description.trim()) return 'Description is required';
    if (description.trim().length < 20) return 'Description must be at least 20 characters';
    if (!budget) return 'Budget is required';
    const budgetNum = parseFloat(budget);
    if (isNaN(budgetNum) || budgetNum <= 0) return 'Budget must be a positive number';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      await gigsService.create({
        title: title.trim(),
        description: description.trim(),
        budget: parseFloat(budget),
      });
      toast.success('Gig posted successfully!');
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create gig');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Post a New Gig</CardTitle>
          <CardDescription>Describe your project and set your budget</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="title">Gig Title</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g., Build a responsive landing page"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <div className="relative">
                <AlignLeft className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="description"
                  placeholder="Describe your project requirements in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[150px] pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Budget (₹)</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="budget"
                  type="number"
                  placeholder="500"
                  min="1"
                  step="1"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                'Post Gig'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
