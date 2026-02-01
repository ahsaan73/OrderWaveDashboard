"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookMarked,
  ChefHat,
  Users,
  Boxes,
  Sparkles,
  Tv,
  QrCode,
  ClipboardList,
  ShoppingCart,
  UserCog,
  LogOut,
  Home,
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
import { useUser } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const allMenuItems = (role?: string) => [
    { id: "Dashboard", label: "Dashboard", href: "/", icon: Home, roles: ["manager", "admin", "cashier"] },
    { id: "Cashier", label: "New Walk-in", icon: ShoppingCart, href: "/cashier", roles: ["manager", "admin"] },
    { id: "Waiter", label: "Table View", icon: ClipboardList, href: "/waiter", roles: ["waiter", "manager", "admin"] },
    { id: "Menu", label: "Edit Menu", icon: BookMarked, href: "/menu", roles: ["manager", "admin"] },
    { id: "Stock", label: role === 'admin' ? "Stock" : "Manage Stock", icon: Boxes, href: "/stock", roles: ["manager", "admin"] },
    { id: "TableCodes", label: "Table Codes", icon: QrCode, href: "/table-codes", roles: ["manager", "admin"] },
    { id: "Admin", label: "User Management", icon: UserCog, href: "/admin", roles: ["admin"] },
    { id: "KitchenDisplay", label: "Kitchen Display", icon: Tv, href: "/kitchen-display", roles: ["manager", "admin", "kitchen"] },
    { id: "KitchenAI", label: "Kitchen AI", icon: ChefHat, href: "#", roles: ["manager", "admin"] }, // AI context
  ];


const aiSections = ["Menu", "Stock", "KitchenAI"] as const;
type AiSection = (typeof aiSections)[number];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useUser();

  const [activeSection, setActiveSection] = React.useState<AiSection | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  React.useEffect(() => {
    if (!loading && !user) {
        router.replace('/login');
    }
  }, [user, loading, router]);

  const handleMenuClick = (id: string) => {
    if (aiSections.includes(id as AiSection)) {
      setActiveSection(id as AiSection);
    } else {
      setActiveSection(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    router.push('/login');
  }

  const getInitials = (name?: string | null) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  }

  if (loading || !user) {
    return <div className="flex h-screen w-screen items-center justify-center">Loading...</div>;
  }
  
  const userRole = user.role || 'waiter';
  const menuItems = allMenuItems(userRole).filter(item => item.roles.includes(userRole));
  const isManagerOrAdmin = userRole === 'manager' || userRole === 'admin';


  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
             <div className="flex items-center gap-3 p-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <ChefHat className="w-6 h-6 text-primary-foreground" />
                </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">Islamabad Bites</span>
                <span className="text-xs text-muted-foreground">Restaurant Dashboard</span>
              </div>
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
                        (item.href !== '/' && pathname.startsWith(item.href)) ||
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
          <SidebarFooter className="p-2 flex flex-col gap-2">
            {user && <div className="flex items-center gap-2 p-2">
                <Avatar className="h-9 w-9">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col truncate">
                    <span className="font-medium text-sm truncate">{user.displayName || 'User'}</span>
                    <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                </div>
            </div>}
            
            {isManagerOrAdmin && (
                <Button
                onClick={() => setIsModalOpen(true)}
                disabled={!activeSection}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                <Sparkles className="mr-2 h-4 w-4" />
                Get AI Advice
                </Button>
            )}
            <Button variant="ghost" className="justify-start gap-2" onClick={handleLogout}>
                <LogOut />
                <span>Logout</span>
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
      {activeSection && isManagerOrAdmin && (
        <AiAdviceModal
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          section={activeSection === 'Stock' ? 'Stock' : activeSection === 'Menu' ? 'Menu' : 'Kitchen'}
        />
      )}
    </SidebarProvider>
  );
}
