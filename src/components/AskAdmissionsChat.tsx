import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { School } from "@/types/school";
import { 
  MessageCircle, 
  X, 
  Send, 
  Loader2, 
  GraduationCap,
  Users,
  Sparkles,
  Minimize2,
  Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

type UserMode = "student" | "parent";

interface AskAdmissionsChatProps {
  school: School;
}

const STUDENT_SUGGESTIONS = [
  "Do students get to leave campus for lunch?",
  "What clubs are most popular here?",
  "How much homework do students typically get?",
  "What's the social life like?",
];

const PARENT_SUGGESTIONS = [
  "What are the transportation options?",
  "How does the school handle student safety?",
  "What financial aid options are available?",
  "What's the parent involvement like?",
];

export function AskAdmissionsChat({ school }: AskAdmissionsChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [userMode, setUserMode] = useState<UserMode>("student");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset messages when school changes
  useEffect(() => {
    setMessages([]);
  }, [school.id]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ask-admissions", {
        body: {
          message: messageText,
          school: {
            name: school.name,
            city: school.city,
            state: school.state,
            type: school.type,
            competitiveness: school.competitiveness,
            size: school.size,
            boarding: school.boarding,
            notes: school.notes,
            website: school.website,
          },
          userMode,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "I apologize, but I couldn't generate a response. Please try again.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error calling ask-admissions:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try again in a moment.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = userMode === "student" ? STUDENT_SUGGESTIONS : PARENT_SUGGESTIONS;

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card
      className={cn(
        "fixed z-50 shadow-2xl border-primary/20 transition-all duration-300",
        isExpanded
          ? "bottom-4 right-4 left-4 top-20 md:left-auto md:w-[500px] md:top-4"
          : "bottom-6 right-6 w-[380px] h-[520px]"
      )}
    >
      {/* Header */}
      <CardHeader className="p-3 border-b bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Ask Admissions AI</h3>
              <p className="text-xs text-muted-foreground">{school.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mt-3">
          <Button
            variant={userMode === "student" ? "default" : "outline"}
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={() => setUserMode("student")}
          >
            <GraduationCap className="h-3 w-3 mr-1" />
            Student
          </Button>
          <Button
            variant={userMode === "parent" ? "default" : "outline"}
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={() => setUserMode("parent")}
          >
            <Users className="h-3 w-3 mr-1" />
            Parent
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex flex-col h-[calc(100%-140px)]">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          {messages.length === 0 ? (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium text-sm mb-1">
                  Ask anything about {school.name}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {userMode === "student"
                    ? "Get the inside scoop on student life, clubs, and campus culture"
                    : "Find answers about logistics, safety, costs, and parent involvement"}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground px-1">Suggested questions:</p>
                {suggestions.map((suggestion, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left h-auto py-2 px-3 text-xs"
                    onClick={() => handleSend(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="p-3 border-t bg-background/80 backdrop-blur">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask about ${school.name}...`}
              disabled={isLoading}
              className="flex-1 h-9 text-sm"
            />
            <Button
              type="submit"
              size="icon"
              className="h-9 w-9"
              disabled={!input.trim() || isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            AI-powered responses based on available school information
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
