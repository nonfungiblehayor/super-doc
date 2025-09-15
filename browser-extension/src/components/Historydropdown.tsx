import { getSessions } from "@/hooks/supabase/session"
import { Loader2 } from "lucide-react"
import { Link } from "react-router-dom"
import { Separator } from "./ui/separator"

const HistoryDropdown = ({user_id}: {user_id: string}) => {
    const { data: history, error: historyError, isLoading: historyLoading} = getSessions(user_id)
    return (
        <div className="w-[300px] m-auto h-[250px] sm:h-[180px] bg-white overflow-x-hidden overflow-y-scroll px-6 py-[7px] flex flex-col gap-y-2 rounded-xl shadow-2xl">
            {history && history?.length > 0 && (
                <div className="py-2">
                    {history?.map((history) => (
                        <Link key={history?.id} to={`/chat/${history.id}`} className="pb-4 flex flex-col justify-start items-start">
                            <span className="mb-[3px] text-[12px] w-4/12">{history?.docs_link}</span>
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