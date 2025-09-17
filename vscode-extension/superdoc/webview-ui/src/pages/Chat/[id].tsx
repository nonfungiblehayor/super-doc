import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Send, Bot, User, ExternalLink, Copy, ThumbsUp, ThumbsDown, AudioLines, SquareDotIcon, Trash, Share2, Edit, RefreshCcw, Loader2, MoreVertical, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSession, useDeleteSession, useUpdateSession } from "@/hooks/supabase/session";
import { Loader } from "@/components/ui/loader";
import { useUser } from "@/context/user";
import { AxiosClient } from "@/utils/axios-client";
import { useVoiceRecorder } from "@/utils/audio";
import Waveform from "@/components/waveform";
import { getConversations, useCreateConversation, useDeleteConversation, useUpdateConversation } from "@/hooks/supabase/session/conversation";
import MarkdownRenderer from "@/components/markdown";
import { Textarea } from "@/components/ui/textarea";
import { conversationType } from "@/types/session-type";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Message {
  id?: string;
  type?: "user" | "assistant";
  user_id: string,
  session_id: string,
  question: string
  response: string;
  created_at?: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoader, setLoader] = useState<{
    delete: {loading: boolean, id: string}, 
    retry: {loading: boolean, id: string}
    deleteSession: boolean
  }>()
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [stage, setStage] = useState<string>()
  const [selectedResponse, setSelectedResponse] = useState<conversationType>();
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [sessionMore, setSessionMore] = useState<boolean>(false)
  const param = useParams()
  const navigate = useNavigate()
  const { appUser, loadingUser } = useUser()
  const { data: session, error: sessionError, isLoading: isLoadingSession} = getSession(param.id, appUser?.id)
  const { data: conversations, isLoading: isLoadingConversation } = getConversations(session?.id)
  const { isRecording, audioURL, deleteRecording, analyser, startRecording, stopRecording } =
  useVoiceRecorder();
  const [ isMobile, setMobile ] = useState<boolean>()
  const createConversation = useCreateConversation()
  const deleteConversation = useDeleteConversation()
  const updateConversation = useUpdateConversation()
  const updateSession = useUpdateSession()
  const deleteSession = useDeleteSession()

  useEffect(() => {
    if (conversations) {
      setMessages(conversations)
    }
  }, [conversations]);
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
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setSessionMore(false);
      }
    }
  
    if (sessionMore) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sessionMore]);
  const handleDelete = async(id: string) => {
    setLoader((prev) => ({...prev, delete: {loading: true, id: id}}))
    deleteConversation.mutateAsync(id).then(() => {
      setMessages(prev => prev.filter(item => item.id !== id));
      toast.success("Conversation deleted")
      if(id === selectedResponse?.id && messages?.length === 0) {
        setSelectedResponse(undefined)
      } else if (id === selectedResponse?.id && messages?.length !== 0) {
        setSelectedResponse(messages[0])
      }
    }).catch((error) => {
      toast.error(error?.message || "An error occured, try again")
    }).finally(() => {
      setLoader((prev) => ({...prev, delete: {loading: false, id: ""}}))
    })
  }
  const baseUrl = import.meta.env.VITE_BASE_URL
  const askAi = async(question: string) => {
    const payload = {
      documentation_url: session.docs_link,
      user_question: question,
      links_array: session.data,
    };
    try {
      const response = await fetch(`${baseUrl}/get-answer-from-docs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }) 
      if (!response.body) return
      const reader = response.body.getReader()
      const decoder = new TextDecoder("utf-8")
      let done = false;
      let fullAnswer;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const events = chunk.split("\n\n");
          events.forEach((eventString) => {
            if (!eventString.trim()) return;
            const match = eventString.match(/event: (\w+)\ndata: (.+)/s);
            if (!match) return;
            const [, event, data] = match;
            const parsed = JSON.parse(data);
            if (event === "log") {
              setStage(parsed.message)
            }
            if (event === "answer") {
              fullAnswer += parsed.text;
            } 
            if (event === "done") {
             createConversation.mutateAsync({
                session_id: session?.id,
                user_id: appUser?.id,
                question: question,
                response: fullAnswer
              }).then((res) => {
                const newResponse: Message = {
                  id: res?.id,
                  type: "user",
                  user_id: appUser?.id,
                  session_id: session?.id,
                  question: res?.question,
                  response: res.response,
                  created_at: res?.created_at,
                }  
                if(audioURL) {
                  deleteRecording()
                }
                setInputValue("")
                setSelectedResponse(res)
                setStage("")
                setMessages((prev) => ([...prev, newResponse]))
              }).catch((err) => {
                toast.error("an error occured")
                console.log(err)
              }).finally(() => {
                 setIsLoading(false);
                 setInputValue("")
                 setStage("")
              })
            }
          })
        }
      }
    } catch (error) {
      toast.error("An error occured try again")
      setStage("")
      setInputValue("")
      setIsLoading(undefined)
      console.log(error)
    }
  }
  const retryAi = async(message: conversationType) => {
    setLoader((prev) => ({...prev, retry: {loading: true, id: message?.id}}))
    setIsLoading(true)
    const payload = {
      documentation_url: session.docs_link,
      user_question: message?.question,
      links_array: session.data,
    };
    try {
      const response = await fetch(`${baseUrl}/get-answer-from-docs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }) 
      if (!response.body) return
      const reader = response.body.getReader()
      const decoder = new TextDecoder("utf-8")
      let done = false;
      let fullAnswer;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const events = chunk.split("\n\n");
          events.forEach((eventString) => {
            if (!eventString.trim()) return;
            const match = eventString.match(/event: (\w+)\ndata: (.+)/s);
            if (!match) return;
            const [, event, data] = match;
            const parsed = JSON.parse(data);
            if (event === "log") {
              setStage(parsed.message)
            }
            if (event === "answer") {
              fullAnswer += parsed.text;
            } 
            if (event === "done") {
              const response = {
                  ...message,
                  response: fullAnswer
              }
              updateConversation.mutateAsync({id: message?.id, ...response}).then((res) => {
              }).catch((error) => {
                toast.error(error?.message || 'Error generating response')
              }).finally(() => {
                setLoader(undefined)
                setIsLoading(false)
             })
            }
          })
        }
      }
    } catch (error) {
      toast.error("An error occured try again")
      setStage("")
      setIsLoading(false)
      setLoader(undefined)
    }
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setIsLoading(true)
    askAi(inputValue)
  };
  const handleAudio = async() => {
    setIsLoading(true)
    setStage("Transcribing Audio")
    if (!audioURL) return;
    const blob = await fetch(audioURL).then(res => res.blob());
    const formData = new FormData();
    formData.append('audio', blob, 'recording.webm');
    AxiosClient.post(`/transcribe`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },      
    }).then((response) => {
      if(response.data?.transcription) {
        setInputValue(response.data?.transcription)
        askAi(response.data?.transcription)
      }
    }).catch((error) => {
      if(error?.response?.data?.error) {
        const errorMessage: Message = {
          id: "error",
          type: "user",
          user_id: appUser?.id,
          session_id: session?.id,
          question: error?.response?.data?.error,
          response: "",
          created_at: "",
        }
        setMessages((prev) => ([...prev, errorMessage]))
      } else {
        const errorMessage: Message = {
          id: "error",
          type: "user",
          question: "An error occured try again !!!",
          response: "",
          user_id: appUser?.id,
          session_id: session?.id,
          created_at: "",
        }
        setMessages((prev) => ([...prev, errorMessage]))
      }
    })
  }
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  const shareSession = async() => {
    if(navigator?.share) {
      navigator.share({
        title: `Superdoc ${session?.docs_link} documentation session`,
        url: `${window.location.origin}/chat/${session?.id}`
      })
    } else {
      const url = `${window.location.origin}/chat/${session?.id}`
      navigator.clipboard.writeText(url).then(() => {
        toast.success("Session linked copied")
      })
    }
  }
  const handleShare = async() => {
    if(session?.share) {
      shareSession()
    } else if(session?.share !== true) {
      updateSession.mutateAsync({id: session?.id, share: true}).then(() => {
       shareSession()
      }).catch(() => {
        toast.error("Can't share session")
      })
    }
  }
  const handleDeleteSession = async() => {
    setLoader((prev) => ({...prev, deleteSession: true}))
    deleteSession.mutateAsync(session?.id).then(() => {
      navigate("/")
    }).catch((error) => {
      toast.error(error?.message || "An error occured while deleting")
    }).finally(() => {
      setLoader(undefined)
    })
  }
  return (
    <div className="h-[98%] flex flex-col bg-background">
      <div className="flex-1 h-full flex">
        {/* Chat Section */}
        <div className="flex-1 w-full sm:w-3/12 flex flex-col">
          {/* Document URL Header */}
                <div className="border-b flex w-full items-center h-[75px] justify-between p-4 bg-background/95 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="px-3 hidden sm:flex py-1">
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
                  <Button onClick={() => setSessionMore(!sessionMore)} className="bg-transparent hover:bg-transparent">
                      {sessionMore ? <X className="text-black"/> : <MoreVertical className="text-black"/>}
                  </Button>
                </div>
                {sessionMore && (
                    <div ref={menuRef} className="self-end flex flex-col gap-y-2 relative p-2 bg-white z-[9999] mr-2 rounded-xl shadow-2xl -mb-32 -mt-6 ">
                      <Button onClick={handleShare} className="bg-transparent w-full text-black hover:bg-transparent border-b-2">Share session <Share2 /></Button>
                      <Button onClick={() => navigate("/")} className="bg-transparent text-red-500 hover:bg-transparent border-b-2">Close session <X /></Button>
                      <Button disabled={isLoader?.deleteSession} onClick={handleDeleteSession} className="bg-transparent text-red-500 hover:bg-transparent border-b-2">{isLoader?.deleteSession ? "Deleting session" :  "Delete session"} <Trash /></Button>
                    </div>
                )}
                {session && (
                <div className="space-y-4 flex flex-col h-5/6 p-6 pb-14 overflow-y-scroll w-full sm:max-w-4xl">
                {messages && messages?.length > 0 && messages?.map((message) => (
                  <div key={message.id} className={`flex w-full items-center gap-3 justify-start`}>
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-primary-foreground"/>
                    </div>
                      <div
                      className={`w-full rounded-lg p-4 bg-muted cursor-pointer transition-all shadow-md
                      ${selectedResponse?.id === message?.id ? "ring-2 ring-primary" : ""}`}
                      onClick={() => message.response ? (setSelectedResponse(message), setMobile(true)) : toast.error("An error occured, no response to preview")}
                      >
                        <p className="whitespace-pre-wrap">{message?.question}</p>
                        <div className="flex items-center text-black justify-end gap-1 mt-4">
                            <Button onClick={() => retryAi(message)} disabled={isLoader?.retry?.loading || isLoading} className="bg-transparent hover:bg-transparent w-4 h-4">
                              {isLoader?.retry?.loading && isLoader?.retry?.id === message?.id ? <Loader2 className="animate-spin text-primary w-4 h-4" /> :  <RefreshCcw className="text-black"/>}
                            </Button>
                            <Button onClick={() => handleDelete(message?.id)} disabled={isLoader?.delete?.loading || isLoading} className="bg-transparent hover:bg-transparent w-4 h-4">
                              {isLoader?.delete?.loading && isLoader?.delete?.id === message?.id ? <Loader2 className="animate-spin text-primary w-4 h-4" /> : <Trash className="text-red-500"/>}
                            </Button>
                        </div>
                      </div>
                  </div>
                ))}
                {messages && messages?.length === 0 && !isLoadingConversation && !inputValue && (
                  <div className="flex z-[0] flex-col justify-center items-cemter">
                      I've loaded the documentation from {session?.docs_link} what would you like to know about it ?
                  </div>
                )}
                {inputValue && isLoading && (
                  <div className="max-w-[85%] p-2 bg-muted self-end mr-0">
                    {inputValue}
                  </div>
                )}
                {isLoading && (
                <div className="flex gap-3 w-full">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="flex items-center gap-x-4 bg-muted rounded-lg p-4 w-full">
                      <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                      {stage && (
                        <p className="text-[14px]">{stage}</p>
                      )}
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
                <div className="border-t fixed w-[100%] sm:w-[41.5%] bottom-4 p-4 bg-background/95 backdrop-blur">
                  <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                    <div className="flex gap-3">
                        {isRecording && (
                          <div style={{ width: "100%", maxWidth: "600px", background: "#111" }}>
                            <Waveform analyser={analyser} isRecording={isRecording} height={60} />
                          </div>                    
                        )}
                        {!isRecording && !audioURL && (
                          <Textarea
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder="Ask a question about the documentation..."
                          disabled={isLoading || isLoadingSession}
                          className="flex-1 resize-none overflow-y-auto"
                          rows={1}
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
                    </div>
                  </form>
                </div>
        </div>

        <Separator orientation="vertical" />

        {/* Preview Section */}
        
        <div className="w-7/12 hidden h-full sm:flex flex-col">
          <div className="p-4 border-b bg-background/95 backdrop-blur">
            <h3 className="font-semibold text-foreground">Response Preview</h3>
            <p className="text-sm text-muted-foreground">Click on any AI response to preview it here</p>
          </div>
          {selectedResponse ? (
                <div className="prose h-5/6 flex flex-col overflow-y-scroll p-6 justify-between prose-sm max-w-none dark:prose-invert">
                  <MarkdownRenderer content={selectedResponse?.response} />
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
                      onClick={() => copyToClipboard(selectedResponse?.response)}
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
      {selectedResponse && (
        <div className="flex sm:hidden">
        <Dialog open={isMobile} onOpenChange={setMobile}>
          <DialogContent className="h-5/6">
            {selectedResponse?.response ? 
            <div className="prose h-[90%] flex flex-col overflow-y-scroll justify-between prose-sm max-w-none dark:prose-invert">
                <MarkdownRenderer content={selectedResponse?.response} />
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
                    onClick={() => copyToClipboard(selectedResponse?.response)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
            </div> 
            :
            <div className="flex items-center justify-center h-full text-center">
                <div className="space-y-2">
                  <Bot className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
                  <p className="text-muted-foreground">
                    AI responses will appear here for detailed preview
                  </p>
                </div>
            </div>              
            }
          </DialogContent>
        </Dialog>
        </div>
      )}
    </div>
  );
};

export default Chat;