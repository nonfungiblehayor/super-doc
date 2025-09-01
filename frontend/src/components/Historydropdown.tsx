import { getSessions } from "@/hooks/supabase/session"
import { Loader2 } from "lucide-react"
import { Separator } from "./ui/separator"

const HistoryDropdown = ({user_id}: {user_id: string}) => {
    const { data: history, error: historyError, isLoading: historyLoading} = getSessions(user_id)
    return (
        <div className="w-[450px] absolute h-[140px] overflow-y-scroll right-4 z-10 px-4 py-[7px] flex flex-col gap-y-2 rounded-xl shadow-2xl">
            {history && history?.length > 0 && (
                <div>
                    {history?.map((history) => (
                        <div className="py-2">
                            <a key={history?.id} href={`/chat/${history.id}`}>{history?.docs_link}</a>
                            <Separator />
                        </div>
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