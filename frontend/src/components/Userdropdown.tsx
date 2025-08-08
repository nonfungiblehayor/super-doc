import { Trash } from "lucide-react"
import { Button } from "./ui/button"
import { Separator } from "./ui/separator"

const Userdropdown = ({email}: {email: string}) => {
    return (
        <div className="w-[300px] absolute right-4 px-4 py-[7px] flex flex-col gap-y-2 rounded-xl shadow-2xl">
            <p className="text-primary font-bold text-[12px]">{email}</p>
            <div className="font-bold text-[14px]">
                Credits: <span className="text-primary font-bold text-[12px]">0</span>
            </div>
          <Separator />
          <Button className="text-red-500 bg-transparent p-0">Delete Account<Trash className="w-3 h-3 text-red-400"/> </Button>
        </div>
    )
}
export default Userdropdown