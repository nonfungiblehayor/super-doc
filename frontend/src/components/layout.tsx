import { ReactNode, useState } from "react"
import { Header } from "./Header"
import { useUser } from "@/context/user"
import Userdropdown from "./Userdropdown"
import HistoryDropdown from "./Historydropdown"

const Layout = ({children}: {children: ReactNode}) => {
    const { appUser } = useUser()
    const [isDropdown, setDropdown] = useState<{details: boolean, history: boolean}>()
    return (
        <div className="h-screen">
            <Header appUser={appUser} showdropdown={setDropdown} dropdown={isDropdown}/>
            {
                isDropdown?.details && <Userdropdown email={appUser?.email}/> 
            }
            {
                isDropdown?.history && <HistoryDropdown user_id={appUser?.id}/>
            }
            <div className="h-[90%]">
                {children}
            </div>
        </div>
    )
}
export default Layout