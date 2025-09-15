import { sessionType, SessionItem } from "@/types/session-type";
import { createContext, useContext, ReactNode, useState } from "react";

const SessionContext = createContext<sessionType>(undefined)
export const useSession = () => useContext(SessionContext)
export const SessionContextProvider = ({children}: {children: ReactNode}) => {
    const [session, setSession] = useState<SessionItem>()
    const values = {
        sessionData: session,
        setSessionData: setSession
    }
    return (
        <SessionContext.Provider value={values}>
            {children}
        </SessionContext.Provider>
    )
} 