import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { Github, Mail } from "lucide-react";
import { useMail } from "@/hooks/supabase/auth";
import { useState } from "react";
import { Loader } from "@/components/ui/loader";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";

const Signup = () => {
  const [formState, setFormState] = useState<{email: string, error: string, loading: boolean}>()
  const navigate = useNavigate()
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  const handleEmail = (mail: string) => {
    if(formState?.error) {
      setFormState((prev) => ({ ...prev, error: "" }));
    }
    setFormState((prev) => ({...prev, email: mail}))
  }
  const handleSignup = () => {
    setFormState((prev) => ({...prev, loading: true}))
    if(formState?.error) {
      setFormState((prev) => ({ ...prev, error: "" }));
    }
    if (!validateEmail(formState.email)) {
      setFormState((prev) => ({ ...prev, error: "Please enter a valid email" }));
      return;
    }
    useMail(formState?.email).then((res) => {
      localStorage.setItem("otp-mail", formState?.email)
      navigate("/confirm-otp")
    }).catch((error) => {
      setFormState((prev) => ({ ...prev, error: error?.message }))
    }).finally(() => {
      setFormState((prev) => ({...prev, loading: false}))
    })
  };

  return (
    <div className="min-h-screen w-[320px] bg-background">
      <div className="w-full mx-auto px-4 py-16">
        <Card className="shadow-lg border-0 bg-gradient-card">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold">Create/ Sign in your account</CardTitle>
            <CardDescription>
              Start chatting with any documentation using AI-powered assistance
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Social Signup Buttons */}
            <div className="space-y-3">
              <div className="flex flex-col">
                <Input className="border-primary" required type="email" disabled={formState?.loading} value={formState?.email} onChange={(e) => handleEmail(e.target.value)} placeholder="Enter your email"/>
                {formState?.error && <span className="text-red-500 text-[13px] text-left">{formState?.error}</span>}
              </div>
              <Button
                disabled={!formState?.email.trim() || formState?.loading}
                variant="outline"
                className="w-full h-11 bg-primary text-white hover:text-white hover:bg-primary"
                onClick={() => handleSignup()}
              >
                {formState?.loading ? <Loader /> : "Sign up"} 
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;