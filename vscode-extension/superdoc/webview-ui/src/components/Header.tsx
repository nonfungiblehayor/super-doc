import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { CreditCard, User2 } from "lucide-react";
import Logosrc from "../../public/super-doc-logo.png"
import { User } from "@supabase/supabase-js";
import { useUser } from "@/context/user";
import { Dispatch, SetStateAction } from "react";

type authProps = {
  appUser: User,
  showdropdown: Dispatch<SetStateAction<{details: boolean}>>,
  dropdown: {details: boolean}
}

export const Header = ({ appUser, showdropdown, dropdown }: authProps) => {
  const location = useLocation()
  const { loadingUser } = useUser()
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container px-4 sm:p-2">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={Logosrc} className="h-24 w-24"/>
          </Link>


          {/* Navigation */}
          {(location.pathname === "/" || location.pathname.startsWith("/chat")) &&  (
            <nav className="flex items-center space-x-4">
              {appUser? 
                  <>                 
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => showdropdown((prev) => ({...prev, details: !dropdown?.details}))}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <User2 className="w-4 h-4"/>
                    </Button>
                  </> :
                  loadingUser ? 
                  "" :
                  <>
                    <Link to="/signup">
                      <Button size="sm" className="bg-primary hover:bg-primary-hover">
                        Sign in
                      </Button>
                    </Link>
                  </>
              }
            </nav>
              
          )}
        </div>
      </div>
    </header>
  );
};