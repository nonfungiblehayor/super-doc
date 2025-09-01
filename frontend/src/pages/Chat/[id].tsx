import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Send, Bot, User, ExternalLink, Copy, ThumbsUp, ThumbsDown, AudioLines, SquareDotIcon, Trash, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSession } from "@/hooks/supabase/session";
import { Loader } from "@/components/ui/loader";
import { useUser } from "@/context/user";
import { AxiosClient } from "@/utils/axios-client";
import { useVoiceRecorder } from "@/utils/audio";
import Waveform from "@/components/waveform";

interface Message {
  id: string;
  type: "user" | "assistant";
  request: string
  content: string;
  timestamp: Date;
  state: "error" | "success"
}

const Chat = () => {
  const [searchParams] = useSearchParams();
  const documentUrl = searchParams.get("url") || "";
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setError] = useState<string>()
  const [selectedResponse, setSelectedResponse] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const param = useParams()
  const { appUser, loadingUser } = useUser()
  const { data: session, error: sessionError, isLoading: isLoadingSession} = getSession(param.id, appUser?.id)
  const { isRecording, audioURL, deleteRecording, analyser, startRecording, stopRecording } =
  useVoiceRecorder();
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);

  useEffect(() => {
    if (session) {
      const welcomeMessage: Message = {
        id: "welcome",
        type: "user",
        request: `I've loaded the documentation from ${session.docs_link}. What would you like to know about it?`,
        content: `I've loaded the documentation from ${session.docs_link}. What would you like to know about it?`,
        timestamp: new Date(),
        state: "success"
      };
      setMessages([welcomeMessage]);
      setSelectedResponse(welcomeMessage.content);
    }
  }, [session]);
  useEffect(() => {
      if (sessionError) {
        toast.error("Invalid session id")
        navigate("/")
      }
  }, [sessionError])
  useEffect(() => {
    if(!appUser && !loadingUser) {
        navigate("/signup")
    } 
  }, [appUser, loadingUser])

  
  const handleAudio = async() => {
    setIsLoading(true)
    if (!audioURL) return;
    const blob = await fetch(audioURL).then(res => res.blob());
    const formData = new FormData();
    formData.append('audio', blob, 'recording.webm');
    AxiosClient.post(`/transcribe`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },      
    }).then((response) => {
      setInputValue(response.data?.transcription)
      deleteRecording()
    }).catch((error) => {
      if(error?.response?.data?.error) {
        const errorMessage: Message = {
          id: "error",
          type: "user",
          request: error?.response?.data?.error,
          content: "",
          timestamp: new Date(),
          state: "error"
        }
        setMessages((prev) => ([...prev, errorMessage]))
      } else {
        const errorMessage: Message = {
          id: "error",
          type: "user",
          request: "An error occured try again !!!",
          content: "",
          timestamp: new Date(),
          state: "error"
        }
        setMessages((prev) => ([...prev, errorMessage]))
      }
    }).finally(() => {
      setIsLoading(false)
    })
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setIsLoading(true)
    AxiosClient.post("/use-agent", { 
      documentation_url: session.docs_link,
      user_question: inputValue,
      links_array: session.data
     }).then((response) => {
      if(response.data) {
        console.log(response.data)
      }
     }).catch((error) => {
      console.log(error)
      // const errorMessage: Message = {
      //   id: "welcome",
      //   type: "assistant",
      //   content: `${error}`,
      //   timestamp: new Date(),
      // };
      // setMessages([errorMessage]);
      // setError(error)
      // toast.error(error)
     }).finally(() => {
      setIsLoading(false)
      setInputValue("")
     })

    // const userMessage: Message = {
    //   id: Date.now().toString(),
    //   type: "user",
    //   content: inputValue,
    //   timestamp: new Date(),
    // };

    // setMessages((prev) => [...prev, userMessage]);
    // setInputValue("");
    // setIsLoading(true);

    // // Simulate AI response
    // setTimeout(() => {
    //   const assistantMessage: Message = {
    //     id: (Date.now() + 1).toString(),
    //     type: "assistant",
    //     content: `Based on the documentation, here's what I found about "${inputValue}":\n\nThis is a simulated response hat would normally come from AI analysis of the documentation.  hat would normally come from AI analysis of the documentation.  hat would normally come from AI analysis of the documentation. hat would normally come from AI analysis of the documentation. hat would normally come from AI analysis of the documentation. hat would normally come from AI analysis of the documentation. hat would normally come from AI analysis of the documentation. hat would normally come from AI analysis of the documentation.  that would normally come from AI analysis of the documentation. The AI would provide contextual, accurate answers based on the content of the documentation you provided.Based on the documentation, here's what I found about "${inputValue}":\n\nThis is a simulated response that would normally come from AI analysis of the documentation. The AI would provide contextual, accurate answers based on the content of the documentation you provided.Based on the documentation, here's what I found about "${inputValue}":\n\nThis is a simulated response that would normally come from AI analysis of the documentation. The AI would provide contextual, accurate answers based on the content of the documentation you provided.Based on the documentation, here's what I found about "${inputValue}":\n\nThis is a simulated response that would normally come from AI analysis of the documentation. The AI would provide contextual, accurate answers based on the content of the documentation you provided.Based on the documentation, here's what I found about "${inputValue}":\n\nThis is a simulated response that would normally come from AI analysis of the documentation. The AI would provide contextual, accurate answers based on the content of the documentation you provided.Based on the documentation, here's what I found about "${inputValue}":\n\nThis is a simulated response that would normally come from AI analysis of the documentation. The AI would provide contextual, accurate answers based on the content of the documentation you provided.`,
    //     timestamp: new Date(),
    //   };

    //   setMessages((prev) => [...prev, assistantMessage]);
    //   setSelectedResponse(assistantMessage.content);
    //   setIsLoading(false);
    // }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  const handleShare = () => {
    
  }
  return (
    <div className="h-[98%] flex flex-col bg-background">
      <div className="flex-1 h-full flex">
        {/* Chat Section */}
        <div className="flex-1 w-3/12 flex flex-col">
          {/* Document URL Header */}
          <div className="border-b flex w-full items-center justify-between p-4 bg-background/95 backdrop-blur">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="px-3 py-1">
                Documentation
              </Badge>
              <a
                href={session?.docs_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 truncate"
              >
                {session?.docs_link}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <Button>
               <Share2 />
            </Button>
          </div>

          {/* Messages */}
            {session && (
                <div className="space-y-4 h-5/6 p-4 overflow-y-scroll max-w-4xl mx-auto">
                {messages.map((message) => (
                <div key={message.id} className={`flex gap-3 justify-start`}>
                    <div
                    className={`max-w-[70%] ${message?.state === "error" && "ring-2 ring-red-500"} rounded-lg p-4 cursor-pointer transition-all hover:shadow-md
                    ${selectedResponse === message.content && message.type === "user" ? "ring-2 ring-primary" : ""}`}
                    onClick={() => message.state === "success" ? setSelectedResponse(message.content) : toast.error("An error occured, no response to preview")}
                    >
                      <p className="whitespace-pre-wrap">{message.request}</p>
                      <div className="flex items-center justify-between mt-2">
                          <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                          </span>
                          {/* {message.type === "assistant" && (
                          <div className="flex items-center gap-1">
                              <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                              onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(message.content);
                              }}
                              >
                              <Copy className="h-3 w-3" />
                              </Button>
                          </div>
                          )} */}
                      </div>
                    </div>
                </div>
                ))}
                {isLoading && (
                <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="bg-muted rounded-lg p-4 max-w-[70%]">
                    <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                    </div>
                </div>
                )}
                <div ref={messagesEndRef} />
                </div>                
            )}
            {isLoadingSession && (
                <div className="flex w-full items-center justify-center h-5/6">
                    <Loader />
                </div>
            )}
          {/* Input Form */}
          <div className="border-t fixed w-[41.5%] bottom-4 p-4 bg-background/95 backdrop-blur">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
              <div className="flex gap-3">
                  {isRecording && (
                    <div style={{ width: "100%", maxWidth: "600px", background: "#111" }}>
                      <Waveform analyser={analyser} isRecording={isRecording} height={60} />
                    </div>                    
                  )}
                  {!isRecording && !audioURL && (
                      <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask a question about the documentation..."
                      className="flex-1"
                      disabled={isLoading || isLoadingSession}
                    />
                  )}
                  {audioURL && !isRecording && (
                    <div className="w-[90%]">
                      <audio style={{ width: "100%"}} controls src={audioURL} className="mt-4">
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}
                {audioURL ? 
                <Button
                  onClick={() => handleAudio()}
                  disabled={!audioURL || isLoading}
                  className="bg-primary hover:bg-primary- hover"
                >
                  {isLoading ? <Loader /> : <Send className="h-4 w-4" />}
                </Button> : 
                <Button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-primary hover:bg-primary-hover"
                >
                  {isLoading ? <Loader /> : <Send className="h-4 w-4" />}
                </Button>
                }
                <Button
                  onClick={isRecording ? stopRecording : audioURL ? deleteRecording : startRecording}
                  className={`${isRecording ? "bg-red-500" : audioURL ? "bg-transparent hover:bg-tranparent border border-red-500" : "bg-primary hover:bg-primary-hover"}`}
                >
                  {isRecording ? <SquareDotIcon className="h-4 w-4"/> : audioURL ? <Trash className="h-4 w-4 text-red-500" /> : <AudioLines className="h-4 w-4" />}
                </Button>              
              </div>
            </form>
          </div>
        </div>

        <Separator orientation="vertical" />

        {/* Preview Section */}
        
        <div className="w-7/12 h-full flex flex-col">
          <div className="p-4 border-b bg-background/95 backdrop-blur">
            <h3 className="font-semibold text-foreground">Response Preview</h3>
            <p className="text-sm text-muted-foreground">Click on any AI response to preview it here</p>
          </div>
          {selectedResponse ? (
                <div className="prose h-5/6 flex flex-col justify-between prose-sm max-w-none dark:prose-invert">
                  <p className="whitespace-pre-wrap overflow-y-scroll px-2">{selectedResponse}</p>
                  <div className="flex fixed bottom-8 w-[55%] items-center px-4 justify-between">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-8 px-3">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        Helpful
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 px-3">
                        <ThumbsDown className="h-3 w-3 mr-1" />
                        Not helpful
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(selectedResponse)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div> 
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div className="space-y-2">
                  <Bot className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
                  <p className="text-muted-foreground">
                    AI responses will appear here for detailed preview
                  </p>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Chat;