import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Github, Mail } from "lucide-react";
import { useGithub, useGoogle } from "@/hooks/supabase/auth";
import { useState } from "react";
import { Loader } from "@/components/ui/loader";
import toast from "react-hot-toast";

const Signup = () => {
  const [isLoading, setLoader] = useState<{state: boolean, id: string}>()
  const handleSocialSignup = (provider: string) => {
    setLoader((prev) => ({...prev, state: true, id: provider}))
    if(provider === "GitHub") {
      useGithub().catch((error) => {
        toast.error(error?.message || "an error occured")
      }).finally(() => {
        setLoader(undefined)
      })
    } else if(provider === "Google") {
      useGoogle().catch((error) => {
        console.log(error)
      }).finally(() => {
        setLoader(undefined)
      })
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-md mx-auto px-4 py-16">
        <Card className="shadow-lg border-0 bg-gradient-card">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
            <CardDescription>
              Start chatting with any documentation using AI-powered assistance
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Social Signup Buttons */}
            <div className="space-y-3">
              <Button
                variant="outline"
                disabled={isLoading?.state}
                className="w-full h-11"
                onClick={() => handleSocialSignup("GitHub")}
              >
                {isLoading?.id === "Github" && isLoading?.state ? <Loader /> : 
                <>
                <Github className="h-5 w-5 mr-2" />
                Continue with GitHub
                </>
                }
              </Button>
              <Button
                variant="outline"
                disabled={isLoading?.state}
                className="w-full h-11"
                onClick={() => handleSocialSignup("Google")}
              >
                {isLoading?.id === "Google" && isLoading?.state ? <Loader /> :   <>
                <Mail className="h-5 w-5 mr-2" />
                Continue with Google
                </>}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;