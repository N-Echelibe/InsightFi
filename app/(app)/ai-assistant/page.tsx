"use client";

import { useChat } from "@ai-sdk/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sparkles,
  Send,
  User,
  Loader2,
  Lightbulb,
  TrendingUp,
  PiggyBank,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useEffect } from "react";

const suggestedQuestions = [
  {
    icon: PiggyBank,
    text: "How can I improve my savings rate?",
    category: "Savings",
  },
  {
    icon: TrendingUp,
    text: "What's a good investment strategy for beginners?",
    category: "Investing",
  },
  {
    icon: Target,
    text: "Help me create a budget for next month",
    category: "Budgeting",
  },
  {
    icon: Lightbulb,
    text: "Analyze my spending patterns and suggest improvements",
    category: "Analysis",
  },
];

export default function AIAssistantPage() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setInput,
  } = useChat({
    api: "/api/chat",
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSuggestionClick = (question: string) => {
    setInput(question);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Assistant</h1>
        <p className="text-muted-foreground">
          Get personalized financial advice and insights
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Panel */}
        <Card className="lg:col-span-3">
          <CardHeader className="border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Financial Advisor</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Powered by AI - Always available to help
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Messages Area */}
            <div className="h-[400px] overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    How can I help you today?
                  </h3>
                  <p className="text-muted-foreground max-w-md mb-6">
                    Ask me anything about budgeting, saving, investing, or
                    managing your finances.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                    {suggestedQuestions.map((q, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        className="justify-start h-auto py-3 px-4 text-left bg-transparent"
                        onClick={() => handleSuggestionClick(q.text)}
                      >
                        <q.icon className="h-4 w-4 mr-2 shrink-0 text-primary" />
                        <span className="text-sm line-clamp-2">{q.text}</span>
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
                        "flex gap-3",
                        message.role === "user" && "flex-row-reverse"
                      )}
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback
                          className={cn(
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}
                        >
                          {message.role === "user" ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Sparkles className="h-4 w-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={cn(
                          "rounded-lg px-4 py-3 max-w-[80%]",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-muted">
                          <Sparkles className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="rounded-lg px-4 py-3 bg-muted">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">
                            Thinking...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={input || ""}
                  onChange={handleInputChange}
                  placeholder="Ask about budgeting, saving, investing..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={!input?.trim() || isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestedQuestions.map((q, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  className="w-full justify-start h-auto py-2 px-3"
                  onClick={() => handleSuggestionClick(q.text)}
                >
                  <q.icon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm truncate">{q.category}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-muted-foreground space-y-2">
                <p>
                  <strong className="text-foreground">Be specific:</strong> The
                  more details you provide, the better advice I can give.
                </p>
                <p>
                  <strong className="text-foreground">Share context:</strong>{" "}
                  Tell me about your financial goals and situation.
                </p>
                <p>
                  <strong className="text-foreground">Ask follow-ups:</strong>{" "}
                  Feel free to dig deeper into any topic.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">
                <strong>Disclaimer:</strong> This AI assistant provides general
                financial information and is not a substitute for professional
                financial advice.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
