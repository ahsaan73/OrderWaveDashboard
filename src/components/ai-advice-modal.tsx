"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from './ui/button';
import { getAdviceAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Sparkles } from 'lucide-react';
import type { OperationalAdviceInput } from "@/ai/flows/operational-advice";

interface AiAdviceModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  section: 'Menu' | 'Staff' | 'Kitchen' | 'Stock';
}

export function AiAdviceModal({ isOpen, setIsOpen, section }: AiAdviceModalProps) {
  const [advice, setAdvice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && section) {
      const fetchAdvice = async () => {
        setIsLoading(true);
        setAdvice('');
        const result = await getAdviceAction({ section });
        setIsLoading(false);

        if (result.success && result.data) {
          setAdvice(result.data.advice);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: result.error || "Failed to get AI advice.",
          });
          setIsOpen(false);
        }
      };
      fetchAdvice();
    }
  }, [isOpen, section, setIsOpen, toast]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-accent"/>
            AI Advice for {section}
          </DialogTitle>
          <DialogDescription>
            Here is some AI-powered advice to improve your restaurant operations.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse w-full"></div>
              <div className="h-4 bg-muted rounded animate-pulse w-5/6"></div>
              <div className="h-4 bg-muted rounded animate-pulse w-full"></div>
            </div>
          ) : (
            <p className="text-sm text-foreground whitespace-pre-wrap">{advice}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
