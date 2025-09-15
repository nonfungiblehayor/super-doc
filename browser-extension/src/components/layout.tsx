import { ReactNode, useState, useRef, useEffect } from "react"
import { Header } from "./Header"
import { useUser } from "@/context/user"
import Userdropdown from "./Userdropdown"
import HistoryDropdown from "./Historydropdown"

const Layout = ({children}: {children: ReactNode}) => {
    const { appUser } = useUser()
    const [isDropdown, setDropdown] = useState<{details: boolean}>()
    const profileRef = useRef<HTMLDivElement | null>(null)
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
          if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
            setDropdown((prev) => ({...prev, details: false}));
          }
        }
      
        if (isDropdown?.details) {
          document.addEventListener("mousedown", handleClickOutside);
        } else {
          document.removeEventListener("mousedown", handleClickOutside);
        }
      
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDropdown?.details]);
    return (
        <div className="h-screen w-full px-4">
            <Header appUser={appUser} showdropdown={setDropdown} dropdown={isDropdown}/>
            {
                isDropdown?.details && <Userdropdown user_id={appUser?.id} profileRef={profileRef} email={appUser?.email}/> 
            }
            <div className="h-[90%] w-full px-4">
                {children}
            </div>
        </div>
    )
}
export default Layout