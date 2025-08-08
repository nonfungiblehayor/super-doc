import { ReactNode, useState } from "react"
import { Header } from "./Header"
import { useUser } from "@/context/user"
import Userdropdown from "./Userdropdown"

const Layout = ({children}: {children: ReactNode}) => {
    const { appUser } = useUser()
    const [isDropdown, setDropdown] = useState(false)
    return (
        <div className="h-screen">
            <Header appUser={appUser} showdropdown={setDropdown} dropdown={isDropdown}/>
            {
                isDropdown && <Userdropdown email={appUser.email}/> 
            }
            <div className="h-[90%]">
                {children}
            </div>
        </div>
    )
}
export default Layout