import { supabase } from "@/hooks/supabase";
import { userType } from "@/types/user-type";
import { User } from "@supabase/supabase-js";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

const UserContext = createContext<userType>(null)
export const useUser = () => useContext(UserContext)
export const UserContextProvider = ({children}: {children: ReactNode}) => {
    const [user, setUser] = useState<User>(null)
    const [isLoading, setLoading] = useState(true)
    useEffect(() => {
        const initAuth = async() => {
            setLoading(true)
            await supabase.auth.getUser().then((response) => {
                if(response.data) {
                    setLoading(false)
                   setUser(response.data.user)
                }
                if(response.error) {
                    setUser(null)
                    setLoading(false)
                }
            })
          }
          initAuth()
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