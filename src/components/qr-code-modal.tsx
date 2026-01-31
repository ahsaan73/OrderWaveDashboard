'use client';

import { useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import QRCode from 'react-qr-code';
import type { Table } from '@/lib/data';
import { Printer } from 'lucide-react';

interface QrCodeModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  table: Table;
  url: string;
}

export function QrCodeModal({ isOpen, setIsOpen, table, url }: QrCodeModalProps) {
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = qrCodeRef.current;
    if (printContent) {
      const windowUrl = 'about:blank';
      const uniqueName = new Date().getTime();
      const windowName = 'Print' + uniqueName;
      
      const printWindow = window.open(windowUrl, windowName, 'width=600,height=600');

      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print QR Code</title>
              <style>
                @media print {
                  body {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                  }
                  .print-container {
                    text-align: center;
                  }
                  @page {
                    size: 4in 4in;
                    margin: 10mm;
                  }
                }
              </style>
            </head>
            <body>
              <div class="print-container">
                ${printContent.innerHTML}
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code for {table.name}</DialogTitle>
          <DialogDescription>
            Print this code and place it on the table.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center p-4 bg-white" ref={qrCodeRef}>
          <div className="text-center">
            <QRCode
              value={url}
              size={256}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox={`0 0 256 256`}
            />
            <p className="font-bold text-xl mt-4 text-black">{table.name}</p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handlePrint} className="w-full">
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
