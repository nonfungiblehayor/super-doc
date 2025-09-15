import { supabase } from "@/hooks/supabase";
import { userType } from "@/types/user-type";
import { User } from "@supabase/supabase-js";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

const UserContext = createContext<userType>(null)
export const useUser = () => useContext(UserContext)
export const UserContextProvider = ({children}: {children: ReactNode}) => {
    const [user, setUser] = useState<User>(null)
    const storage = typeof chrome !== "undefined" && chrome.storage?.local? chrome.storage.local : null;
    const [isLoading, setLoading] = useState(true)
    useEffect(() => {
        const initAuth = async () => {
            setLoading(true);
            const { data, error } = await supabase.auth.getSession();
            if (data?.session?.user) {
              setUser(data.session.user);
            } else {
              setUser(null);
            }
            setLoading(false);
          };
          initAuth();
        
          const { data: subscription } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
              setUser(session?.user ?? null);
            }
          );
        
          return () => {
            subscription.subscription.unsubscribe();
          };
    }, [])
    useEffect(() => {
        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === "TOKEN_REFRESHED") {
            console.log("Session refreshed:", session)
            setUser(session?.user ?? null)
          }
          if (event === "SIGNED_OUT") {
            setUser(null)
          }
        })
      
        return () => {
          listener.subscription.unsubscribe()
        }
      }, [])
    const values = {
        appUser: user,
        setAppUser: setUser,
        loadingUser: isLoading
    }
    return (
     <UserContext.Provider value={values}>
        {children}
     </UserContext.Provider>
    )
}