"use client";

import React from "react"

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    count?: number;
    message?: string;
  } | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (
      droppedFile &&
      (droppedFile.name.endsWith(".csv") || droppedFile.name.endsWith(".ofx"))
    ) {
      setFile(droppedFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsProcessing(true);

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setResult({
      success: true,
      count: 24,
      message: "Successfully imported 24 transactions",
    });
    setIsProcessing(false);
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Transactions</DialogTitle>
          <DialogDescription>
            Upload a CSV or OFX file from your bank to import transactions.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25",
                file && "border-success bg-success/5"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-success" />
                  </div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile(null)}
                    className="mt-2"
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium">Drop your file here</p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supports CSV, OFX, QFX formats
                  </p>
                  <input
                    type="file"
                    accept=".csv,.ofx,.qfx"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={!file || isProcessing}>
                {isProcessing ? (
                  <>
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  "Import"
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-6 text-center">
            <div
              className={cn(
                "w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4",
                result.success ? "bg-success/10" : "bg-destructive/10"
              )}
            >
              {result.success ? (
                <Check className="h-8 w-8 text-success" />
              ) : (
                <AlertCircle className="h-8 w-8 text-destructive" />
              )}
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {result.success ? "Import Complete" : "Import Failed"}
            </h3>
            <p className="text-muted-foreground">{result.message}</p>
            <Button onClick={handleClose} className="mt-6">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
