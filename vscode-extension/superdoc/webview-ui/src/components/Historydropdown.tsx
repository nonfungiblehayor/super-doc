import { getSessions } from "@/hooks/supabase/session"
import { Loader2 } from "lucide-react"
import { Separator } from "./ui/separator"
import { Link } from "react-router-dom"

const HistoryDropdown = ({user_id}: {user_id: string}) => {
    const { data: history, error: historyError, isLoading: historyLoading} = getSessions(user_id)
    return (
        <div className="sm:w-7/12 m-auto h-[250px] sm:h-[180px] bg-white overflow-y-scroll px-4 py-[7px] flex flex-col gap-y-2 rounded-xl shadow-2xl">
            {history && history?.length > 0 && (
                <div className="py-2">
                    {history?.map((history) => (
                        <Link key={history?.id} to={`/chat/${history.id}`} className="pb-4 flex flex-col justify-start items-start">
                            <p className="mb-[3px]">{history?.docs_link}</p>
                            <Separator />
                        </Link>
                    ))}
                </div>
            )}
            {history && history?.length === 0 && (
                <div>
                    This user has no session yet
                </div>
            )}
            {historyLoading && (
                <div className="flex items-center justify-center">
                    <Loader2 className="text-primary w-4 h-4 animate-spin"/>
                </div>
            )}
            {historyError && (
                <div className="text-red-500 text-[14px]">
                    {historyError?.message}
                </div>
            )}
        </div>
    )
}
export default HistoryDropdown