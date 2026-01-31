"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookMarked,
  ChefHat,
  Users,
  Boxes,
  Sparkles,
  Tv,
  LayoutDashboard,
  LogOut,
  QrCode,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import { AiAdviceModal } from "./ai-advice-modal";
import type { OperationalAdviceInput } from "@/ai/flows/operational-advice";

const menuItems = [
  { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { id: "Menu", label: "Menu", icon: BookMarked, href: "/menu" },
  { id: "Staff", label: "Staff", icon: Users, href: "/staff" },
  { id: "Kitchen", label: "Kitchen", icon: ChefHat, href: "#" },
  { id: "Stock", label: "Stock", icon: Boxes, href: "/stock" },
  { id: "TableCodes", label: "Table Codes", icon: QrCode, href: "/table-codes" },
];

const aiSections = ["Menu", "Staff", "Kitchen", "Stock"] as const;
type AiSection = (typeof aiSections)[number];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = React.useState<AiSection | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleMenuClick = (id: string) => {
    if (aiSections.includes(id as AiSection)) {
      setActiveSection(id as AiSection);
    } else {
      setActiveSection(null);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold font-headline text-primary">Islamabad Bites</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <Link href={item.href} passHref>
                    <SidebarMenuButton
                      onClick={() => handleMenuClick(item.id)}
                      isActive={
                        pathname === item.href ||
                        activeSection === item.id
                      }
                      tooltip={item.label}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarSeparator />
          <SidebarFooter className="p-4 flex flex-col gap-2">
             <Button 
              variant="outline" 
              className="justify-start gap-2"
              asChild
             >
                <Link href="/kitchen-display">
                    <Tv />
                    <span>Kitchen TV</span>
                </Link>
             </Button>
            <Button
              onClick={() => setIsModalOpen(true)}
              disabled={!activeSection}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Get AI Advice
            </Button>
            <SidebarSeparator/>
            <Button
                variant="ghost"
                className="justify-start gap-2"
                asChild
            >
                <Link href="/login">
                    <LogOut />
                    <span>Logout</span>
                </Link>
            </Button>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
            <header className="flex items-center justify-between p-4 border-b md:hidden">
                 <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <ChefHat className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <h1 className="text-lg font-bold font-headline text-primary">Islamabad Bites</h1>
                </div>
                <SidebarTrigger/>
            </header>
            <div className="p-4 sm:p-6 lg:p-8">
                {children}
            </div>
        </SidebarInset>
      </div>
      {activeSection && (
        <AiAdviceModal
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          section={activeSection}
        />
      )}
    </SidebarProvider>
  );
}
