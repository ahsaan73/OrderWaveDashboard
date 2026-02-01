'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareLinkModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  title: string;
  description: string;
  url: string;
}

export function ShareLinkModal({ isOpen, setIsOpen, title, description, url }: ShareLinkModalProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    toast({ title: 'Copied!', description: 'The link has been copied to your clipboard.' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input id="link" defaultValue={url} readOnly />
          </div>
          <Button type="submit" size="icon" className="px-3" onClick={handleCopy}>
            <span className="sr-only">Copy</span>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <DialogFooter className="sm:justify-start">
            <Button asChild>
                <a href={url} target="_blank" rel="noopener noreferrer">
                    Open Link
                </a>
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
