'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import QRCode from 'react-qr-code';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

export default function OnlineOrderQrPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const qrCodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userLoading && !['manager', 'admin'].includes(user?.role || '')) {
      router.replace('/');
    }
  }, [user, userLoading, router]);
  
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const url = `${origin}/online-order`;

  const handlePrint = () => {
    const printContent = qrCodeRef.current;
    if (printContent) {
      const printWindow = window.open('', '', 'width=600,height=600');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Online Order QR Code</title>
              <style>
                body {
                  font-family: sans-serif;
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
                 h1 {
                   font-size: 2rem;
                   font-weight: bold;
                 }
                @page {
                  size: 5in 7in;
                  margin: 20mm;
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

  if (userLoading || !user || !['manager', 'admin'].includes(user.role || '')) {
    return <DashboardLayout><div>Loading...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">
              Online Ordering QR Code
            </h1>
            <p className="text-muted-foreground mt-2">
              Print this QR code for your customers to scan and order online.
            </p>
          </div>
          <Button onClick={handlePrint} size="lg">
            <Printer className="mr-2" /> Print QR Code
          </Button>
        </div>
        
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Scan to Order Online</CardTitle>
            <CardDescription className="text-center">
              Point your phone's camera at the code below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-white rounded-lg" ref={qrCodeRef}>
                <div className="text-center text-black">
                     <h1 className="text-3xl font-bold mb-4">Order Online!</h1>
                     <QRCode
                        value={url}
                        size={256}
                        style={{ height: "auto", maxWidth: "100%", width: "100%", margin: "0 auto" }}
                        viewBox={`0 0 256 256`}
                    />
                    <p className="font-semibold mt-4">{url}</p>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
