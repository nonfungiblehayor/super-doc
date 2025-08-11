import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { AlertCircleIcon, ArrowRight, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/context/user";
import { AxiosClient } from "@/utils/axios-client";
import { Loader } from "@/components/ui/loader";
import { Separator } from "@/components/ui/separator";

const Home = () => {
  const [documentUrl, setDocumentUrl] = useState("");
  const [docName, setDocName] = useState<string>()
  const [isLoading, setLoading] = useState<{
    search: boolean,
    chatting: boolean
  }>()
  const [isError, setError] = useState<{
    search: string,
    chatting: string
  }>()
  const mockup = [
{name: 'Firebase Documentation Home', link: 'https://firebase.google.com/docs'}, 
{name: 'Firebase Authentication', link: 'https://firebase.google.com/docs/auth'},
{name: 'Cloud Firestore', link: 'https://firebase.google.com/docs/firestore'},
{name: 'Firebase Realtime Database', link: 'https://firebase.google.com/docs/database'},
{name: 'Firebase Realtime Database', link: 'https://firebase.google.com/docs/database'},
{name: 'Firebase Realtime Database', link: 'https://firebase.google.com/docs/database'},
{name: 'Cloud Functions for Firebase', link: 'https://firebase.google.com/docs'}
  ]
  const [suggestions, setSuggestions] = useState<{name: string, link: string}[]>()
  const [invalidMsg, setInvalidMsg] = useState<string>()
  const useSearchDoc = async() => {
    if(isError?.search) {
      setError(undefined)
    }
    if(invalidMsg) {
      setInvalidMsg(undefined)
    }
    if(suggestions) {
      setSuggestions(undefined)
    }
    setLoading((prev) => ({...prev, search: true}))
    AxiosClient.post(`/find-doc`, { query: docName }).then((response) => {
      if(response.data?.result?.name) {
        setDocumentUrl(response.data?.result?.link)
      } else if(response.data?.result?.suggestions) {
        setSuggestions(response.data?.result?.suggestions)
      } else if(response.data?.result?.message) {
        setInvalidMsg(response.data?.result?.message)
      }
    }).catch((error) => {
      if(error.status === 500) {
        setError((prev) => ({...prev, search: "An error occured try again"}))
      } else {
        setError((prev) => ({...prev, search: error?.message}))
      }
      console.log(error)
    }).finally(() => {
      setLoading(undefined)
      setDocName(undefined)
    })
  }
  const disabilityChecker = () => {
    if(!documentUrl?.trim() && !docName?.trim()) {
      return true
    } else if(documentUrl?.trim() && !docName?.trim()) {
      return false
    } else if(!documentUrl?.trim() && docName?.trim()) {
      return false
    }
  }
  const { appUser} = useUser()
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
  const tabs = ["Search Docs", "Paste Link"]
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
      if(appUser) {
        navigate(`/chat?url=${encodeURIComponent(documentUrl)}`);
      } else {
        navigate("/signup")
      }
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
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Skip the keyword hunt — just ask your docs directly and get instant answers.
            </p>

            <Tabs defaultValue={tabs[0]}>
              <TabsList className="gap-x-6 text-primary">
                <TabsTrigger value={tabs[0]}>{tabs[0]}</TabsTrigger>
                <TabsTrigger value={tabs[1]}>{tabs[1]}</TabsTrigger>
              </TabsList>
                <TabsContent value={tabs[0]} className="z-10">
                <form onSubmit={handleSubmit} className="flex flex-col z-10 space-y-1 max-w-2xl mx-auto mb-12">
                      <div className={`flex flex-col sm:flex-row gap-4 p-2 bg-background z-10 rounded-xl border shadow-lg ${isError?.search && "border-[1px] border-red-500"}`}>
                        <div className="flex-1">
                          <Input
                            type="text"
                            placeholder="Search documentation by name…..."
                            value={documentUrl !== "" ? documentUrl : docName}
                            onChange={(e) => documentUrl !== "" ? setDocumentUrl(e.target.value) : setDocName(e.target.value)}
                            className={`border-0 bg-transparent text-lg placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0`}
                            required
                          />
                        </div>
                        <Button
                          type="submit"
                          onClick={() => documentUrl ? console.log(10) : useSearchDoc()}
                          size="lg"
                          className="bg-primary hover:bg-primary-hover text-primary-foreground px-8 shadow-md"
                          disabled={disabilityChecker() || isLoading?.search}
                        >
                          {documentUrl ? "Start Chatting" : <>{isLoading?.search ? <Loader /> : "Search docs"}</>}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </div>
                      {isError?.search && <span className="text-red-500 text-[12px] self-start text-left font-semibold">{isError?.search}</span>}
                </form>
                </TabsContent>
                <TabsContent value={tabs[1]} className="z-10">
                  <form onSubmit={handleSubmit} className="max-w-2xl z-10 mx-auto mb-12 z-[9999]">
                      <div className="flex flex-col sm:flex-row gap-4 p-2 bg-background z-10 rounded-xl border shadow-lg">
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
                </TabsContent>
            </Tabs>
            {suggestions && suggestions.length > 0 && (
              <div className="shadow-2xl bg-white rounded-xl -mt-14 h-[180px] z-0 overflow-y-scroll p-4 w-4/12 ml-28">
                <p className="text-[10px] text-primary text-left">Which of the follwiing documentations are you trying to access:</p>
                {suggestions.map((suggestion, index) => (
                  <div onClick={() => setDocumentUrl(suggestion.link)} key={index} className="flex cursor-pointer flex-col text-left p-2 font-semibold text-[13px]">
                    <span>{suggestion.name}</span>
                    <Separator />
                  </div>
                ))}
              </div>
            )}
            {invalidMsg && <div className="-mt-10 text-red-500 flex items-center justify-center gap-x-2"> <AlertCircleIcon className="h-4 w-4"/> {invalidMsg}</div>}
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