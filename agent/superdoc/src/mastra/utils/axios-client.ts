import axios from "axios"
const baseUrl = process.env.API_BASE_URL

export const AxiosClient = axios.create({
   baseURL: baseUrl,
   headers: {
      "Content-Type": "application/json",
   }
})