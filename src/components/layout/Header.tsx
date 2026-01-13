import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut, Briefcase } from 'lucide-react';

export function Header() {
  const { user, isLoading, isInitialized, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-foreground">GigFlow</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost">Browse Gigs</Button>
          </Link>

          {!isInitialized ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : user ? (
            <>
              <Link to="/gigs/create">
                <Button variant="default">Post Gig</Button>
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  Hi, <span className="font-medium text-foreground">{user.name}</span>
                </span>
                <Button variant="outline" size="icon" onClick={handleLogout} disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/register">
                <Button variant="default">Register</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
