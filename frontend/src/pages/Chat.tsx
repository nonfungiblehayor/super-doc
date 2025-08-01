import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "react-router-dom";
import { Send, Bot, User, ExternalLink, Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const Chat = () => {
  const [searchParams] = useSearchParams();
  const documentUrl = searchParams.get("url") || "";
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);

  // Sample welcome message
  useEffect(() => {
    if (documentUrl) {
      const welcomeMessage: Message = {
        id: "welcome",
        type: "assistant",
        content: `I've loaded the documentation from ${documentUrl}. What would you like to know about it?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      setSelectedResponse(welcomeMessage.content);
    }
  }, [documentUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: `Based on the documentation, here's what I found about "${inputValue}":\n\nThis is a simulated response hat would normally come from AI analysis of the documentation.  hat would normally come from AI analysis of the documentation.  hat would normally come from AI analysis of the documentation. hat would normally come from AI analysis of the documentation. hat would normally come from AI analysis of the documentation. hat would normally come from AI analysis of the documentation. hat would normally come from AI analysis of the documentation. hat would normally come from AI analysis of the documentation.  that would normally come from AI analysis of the documentation. The AI would provide contextual, accurate answers based on the content of the documentation you provided.Based on the documentation, here's what I found about "${inputValue}":\n\nThis is a simulated response that would normally come from AI analysis of the documentation. The AI would provide contextual, accurate answers based on the content of the documentation you provided.Based on the documentation, here's what I found about "${inputValue}":\n\nThis is a simulated response that would normally come from AI analysis of the documentation. The AI would provide contextual, accurate answers based on the content of the documentation you provided.Based on the documentation, here's what I found about "${inputValue}":\n\nThis is a simulated response that would normally come from AI analysis of the documentation. The AI would provide contextual, accurate answers based on the content of the documentation you provided.Based on the documentation, here's what I found about "${inputValue}":\n\nThis is a simulated response that would normally come from AI analysis of the documentation. The AI would provide contextual, accurate answers based on the content of the documentation you provided.Based on the documentation, here's what I found about "${inputValue}":\n\nThis is a simulated response that would normally come from AI analysis of the documentation. The AI would provide contextual, accurate answers based on the content of the documentation you provided.`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setSelectedResponse(assistantMessage.content);
      setIsLoading(false);
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Response copied to clipboard",
      duration: 2000,
    });
  };

  return (
    <div className="h-[98%] flex flex-col bg-background">
      <div className="flex-1 h-full flex">
        {/* Chat Section */}
        <div className="flex-1 w-3/12 flex flex-col">
          {/* Document URL Header */}
          <div className="border-b p-4 bg-background/95 backdrop-blur">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="px-3 py-1">
                Documentation
              </Badge>
              <a
                href={documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 truncate"
              >
                {documentUrl}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Messages */}
            <div className="space-y-4 h-5/6 p-4 overflow-y-scroll max-w-4xl mx-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.type === "assistant" && (
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[70%] rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      message.type === "user"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-muted text-foreground"
                    } ${selectedResponse === message.content && message.type === "assistant" ? "ring-2 ring-primary" : ""}`}
                    onClick={() => message.type === "assistant" && setSelectedResponse(message.content)}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                      {message.type === "assistant" && (
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
                      )}
                    </div>
                  </div>

                  {message.type === "user" && (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
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
          
          {/* Input Form */}
          <div className="border-t fixed w-[41.5%] bottom-4 p-4 bg-background/95 backdrop-blur">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
              <div className="flex gap-3">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask a question about the documentation..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-primary hover:bg-primary-hover"
                >
                  <Send className="h-4 w-4" />
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