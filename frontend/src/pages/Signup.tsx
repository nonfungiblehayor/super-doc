import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { Github, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGithub, useGoogle } from "@/hooks/supabase/auth";

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSocialSignup = (provider: string) => {
    if(provider === "GitHub") {
      useGithub().then((response) => {
        console.log(response)
      }).catch((error) => {
        console.log(error)
      })
    } else if(provider === "Google") {
      useGoogle().then(() => {
        
      }).catch((error) => {
        console.log(error)
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
                className="w-full h-11"
                onClick={() => handleSocialSignup("GitHub")}
              >
                <Github className="h-5 w-5 mr-2" />
                Continue with GitHub
              </Button>
              
              <Button
                variant="outline"
                className="w-full h-11"
                onClick={() => handleSocialSignup("Google")}
              >
                <Mail className="h-5 w-5 mr-2" />
                Continue with Google
              </Button>
            </div>
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link
                to="/login"
                className="text-primary hover:text-primary-hover font-medium"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;