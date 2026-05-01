"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, X, Check } from "lucide-react";

interface ParsedTransaction {
  name: string;
  amount: number;
  category: string;
  date: string;
}

export function AITransactionInput() {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedTransaction, setParsedTransaction] =
    useState<ParsedTransaction | null>(null);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setIsProcessing(true);

    // Simulate AI parsing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock parsed result based on input
    const mockParsed: ParsedTransaction = {
      name: input.includes("coffee")
        ? "Starbucks"
        : input.includes("uber")
          ? "Uber Ride"
          : "Transaction",
      amount: parseFloat(input.match(/\$?(\d+\.?\d*)/)?.[1] || "0") * -1,
      category: input.includes("coffee")
        ? "Food & Dining"
        : input.includes("uber")
          ? "Transportation"
          : "Other",
      date: new Date().toISOString().split("T")[0],
    };

    setParsedTransaction(mockParsed);
    setIsProcessing(false);
  };

  const handleConfirm = () => {
    // In real implementation, this would save the transaction
    setParsedTransaction(null);
    setInput("");
  };

  const handleCancel = () => {
    setParsedTransaction(null);
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">AI Transaction Entry</p>
            <p className="text-xs text-muted-foreground">
              Type naturally, like &quot;Spent $15 on coffee at Starbucks&quot;
            </p>
          </div>
        </div>

        {!parsedTransaction ? (
          <div className="flex gap-2">
            <Input
              placeholder='Try: "Paid $50 for Uber yesterday" or "$120 grocery shopping"'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="flex-1 bg-background"
            />
            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || isProcessing}
              className="gap-2"
            >
              {isProcessing ? (
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Parse
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="gap-1">
                {parsedTransaction.name}
              </Badge>
              <Badge variant="outline" className="gap-1">
                ${Math.abs(parsedTransaction.amount).toFixed(2)}
              </Badge>
              <Badge variant="outline" className="gap-1">
                {parsedTransaction.category}
              </Badge>
              <Badge variant="outline" className="gap-1">
                {parsedTransaction.date}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleConfirm} className="gap-2" size="sm">
                <Check className="h-4 w-4" />
                Confirm & Save
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm" className="gap-2 bg-transparent">
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
