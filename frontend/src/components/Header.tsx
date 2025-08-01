import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, User, CreditCard } from "lucide-react";

interface HeaderProps {
  isAuthenticated?: boolean;
}

export const Header = ({ isAuthenticated = false }: HeaderProps) => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/super-doc-logo.png" className="h-48 w-48"/>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Get Credits
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="bg-primary hover:bg-primary-hover">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};