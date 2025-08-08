import { User } from "@supabase/supabase-js"
import { Dispatch, SetStateAction } from "react"
export type userType = {
   appUser: User,
   setAppUser: Dispatch<SetStateAction<User>>
   loadingUser: boolean
}