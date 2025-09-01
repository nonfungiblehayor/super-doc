import { Dispatch, SetStateAction } from "react"
export type SessionItem = {
    base_link: string
    data: {
      href: string
      text: string
    }[]
  }
export type sessionType = {
    sessionData: SessionItem
    setSessionData: Dispatch<SetStateAction<SessionItem>>
}
export type sessionServer = {
  id?: string,
  user_id: string,
  docs_link: string,
  created_at?: string,
  share?: boolean,
  data: any,
}