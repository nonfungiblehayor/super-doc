import { ReactNode } from "react"
import { Header } from "./Header"

const Layout = ({children}: {children: ReactNode}) => {
    return (
        <div className="h-screen">
            <Header />
            <div className="h-[90%]">
                {children}
            </div>
        </div>
    )
}
export default Layout