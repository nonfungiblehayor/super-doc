import { Trash } from "lucide-react"
import { Button } from "./ui/button"
import { Separator } from "./ui/separator"
import { useDeleteUser } from "@/hooks/supabase/auth"

const Userdropdown = ({email, profileRef, user_id}: {email: string, profileRef: any, user_id: string}) => {
    const deleteUser = useDeleteUser()
    const handleDeleteAccount = () => {
        deleteUser.mutateAsync(user_id).then(() => {

        })
    }
    return (
        <div ref={profileRef} className="w-[300px] bg-white z-[999] ring ring-primary absolute right-4 px-4 py-[7px] flex flex-col gap-y-2 rounded-xl shadow-2xl">
            <p className="text-primary font-bold text-[12px]">{email}</p>
            <div className="font-bold text-[14px]">
                Credits: <span className="text-primary font-bold text-[12px]">0</span>
            </div>
          <Separator />
          <Button className="text-white bg-red-500 hover:bg-red-500 p-0">Delete Account<Trash className="w-3 h-3 text-white"/> </Button>
        </div>
    )
}
export default Userdropdown