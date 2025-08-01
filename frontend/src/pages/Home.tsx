import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, BookOpen, MessageSquare } from "lucide-react";

const Home = () => {
  const [documentUrl, setDocumentUrl] = useState("");
  const navigate = useNavigate();
  const heroTexts = [
    {
      main: "Because no one actually reads the",
      sub: "docs."
    }, 
    {
      main: "Skip the scroll, skip the search —",
      sub: "just ask."
    }
  ]
  const [heroText, setHerotext] = useState<number>(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setHerotext((prev) => (prev + 1) % heroTexts.length )
    }, 7000);

    return () => clearInterval(interval);
  }, []);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (documentUrl.trim()) {
      // Navigate to chat page with the document URL
      navigate(`/chat?url=${encodeURIComponent(documentUrl)}`);
    }
  };

  return (
    <div className="h-full bg-background">
      {/* Hero Section */}
      <main className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-light to-background opacity-50"></div>
        
        <div className="relative container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium mb-8 bg-primary-light border-primary/20">
              <Sparkles className="h-4 w-4 mr-2 text-primary" />
                Documentation Copilot
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6">
              {heroTexts[heroText].main}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-hover">
              {heroTexts[heroText].sub}
              </span>

              {/* Skip the scroll, skip the search — just ask. */}
            </h1>

            {/* Subheading */}
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
              Skip the keyword hunt — just ask your docs directly and get instant answers.
            </p>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-12">
              <div className="flex flex-col sm:flex-row gap-4 p-2 bg-background rounded-xl border shadow-lg">
                <div className="flex-1">
                  <Input
                    type="url"
                    placeholder="Paste documentation URL here..."
                    value={documentUrl}
                    onChange={(e) => setDocumentUrl(e.target.value)}
                    className="border-0 bg-transparent text-lg placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="bg-primary hover:bg-primary-hover text-primary-foreground px-8 shadow-md"
                  disabled={!documentUrl.trim()}
                >
                  Start Chatting
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </form>

            {/* Features */}
            {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center p-6 rounded-xl bg-background border shadow-sm">
                <div className="h-12 w-12 rounded-lg bg-primary-light flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Any Documentation</h3>
                <p className="text-muted-foreground">
                  Works with any online documentation, guides, or knowledge base
                </p>
              </div>

              <div className="text-center p-6 rounded-xl bg-background border shadow-sm">
                <div className="h-12 w-12 rounded-lg bg-primary-light flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Natural Conversations</h3>
                <p className="text-muted-foreground">
                  Ask questions in plain English and get contextual answers
                </p>
              </div>

              <div className="text-center p-6 rounded-xl bg-background border shadow-sm">
                <div className="h-12 w-12 rounded-lg bg-primary-light flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">AI-Powered</h3>
                <p className="text-muted-foreground">
                  Advanced AI understands context and provides accurate responses
                </p>
              </div>
            </div> */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;