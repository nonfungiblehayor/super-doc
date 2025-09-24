import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useUser } from "@/context/user"
import { useMail, useOtp } from "@/hooks/supabase/auth"
import { useState } from "react"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

const Otp = () => {
    const [formState, setFormState] = useState<{otp: string, error: string, loading: boolean}>()
    const otpMail = localStorage.getItem("otp-mail")
    const navigate = useNavigate()
    const { setAppUser } = useUser()
    const handleVerifyOtp = async() => {
        setFormState((prev) => ({...prev, loading: true}))
        useOtp(formState?.otp).then((res) => {
            setAppUser(res?.user)
            navigate("/")
        }).catch((error) => {
            setFormState((prev) => ({ ...prev, error: error?.message }))
        }).finally(() => {
            setFormState((prev) => ({...prev, loading: false}))
        })
    }
        const handleSignup = () => {
        setFormState((prev) => ({...prev, loading: true}))
        if(formState?.error) {
          setFormState((prev) => ({ ...prev, error: "" }));
        }
        useMail(otpMail).then((res) => {
         toast.success("OTP sent succesfully")
        }).catch((error) => {
          setFormState((prev) => ({ ...prev, error: error?.message }))
        }).finally(() => {
          setFormState((prev) => ({...prev, loading: false}))
        })
    };
    return (
        <div className="min-h-screen w-[320px] bg-background">
        <div className="container max-w-md mx-auto px-4 py-16">
          <Card className="shadow-lg border-0 bg-gradient-card">
            <CardHeader className="text-center space-y-2">
              <CardDescription>
                 An otp has been sent to {otpMail}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Social Signup Buttons */}
              <div className="space-y-3">
                <div className="flex flex-col">
                  <Input 
                    className="border-primary text-center" 
                    inputMode="numeric"
                    pattern="[0-9]*" 
                    required 
                    type="password" 
                    disabled={formState?.loading} 
                    value={formState?.otp} 
                    onChange={(e) => setFormState((prev) => ({...prev, otp: e.target.value}))} 
                    placeholder="Enter otp"
                  />
                  {formState?.error && <span className="text-red-500 text-[13px] text-left">{formState?.error}</span>}
                </div>
                <Button 
                onClick={handleSignup}
                disabled={!otpMail || formState?.loading}
                className="bg-transparent hover:bg-transparent text-[10px] text-primary">
                  Resend otp
                </Button>
                <Button
                  disabled={!formState?.otp?.trim() || formState?.loading || formState?.otp?.length !== 6}
                  variant="outline"
                  className="w-full h-11 bg-primary text-white hover:text-white hover:bg-primary"
                  onClick={() => handleVerifyOtp()}
                >
                   {formState?.loading ? "Verifying...." : "Verify"} 
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
}
export default Otp