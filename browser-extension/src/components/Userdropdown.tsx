import { Trash } from "lucide-react"
import { Button } from "./ui/button"
import { Separator } from "./ui/separator"
import { useDeleteUser } from "@/hooks/supabase/auth"
import { useState } from "react"
import { Loader } from "./ui/loader"
import { useLocation, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

const Userdropdown = ({email, profileRef, user_id}: {email: string, profileRef: any, user_id: string}) => {
    const deleteUser = useDeleteUser()
    const navigate = useNavigate()
    const location = useLocation()
    const [isLoading, setLoading] = useState<boolean>()
    const handleDeleteAccount = () => {
        setLoading(true)
        deleteUser.mutateAsync(user_id).then(() => {
            if(location.pathname.startsWith("/chat")) {
                navigate("/")
            } else {
                window.location.reload()
            }
        }).catch((error) => {
            toast.error(error?.message || "an error occured")
        }).finally(() => {
            setLoading(false)
        })
    }
    return (
        <div ref={profileRef} className="w-[220px] sm:w-[300px] bg-white z-[999] ring ring-primary absolute right-4 px-4 py-[7px] flex flex-col gap-y-2 rounded-xl shadow-2xl">
            <p className="text-primary text-[10px]">{email}</p>
          <Separator />
          <Button disabled={isLoading} onClick={handleDeleteAccount} className="text-white bg-red-500 hover:bg-red-500 p-0">
            {isLoading ? <Loader /> : 
            <>
                Delete Account
                <Trash className="w-3 h-3 text-white"/> 
            </>
            }
          </Button>
        </div>
    )
}
export default Userdropdown