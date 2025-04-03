import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Tags,
  Share,
  Users,
  BarChart,
  Settings,
  LogOut,
  Menu,
  Bell,
  ChevronDown,
  Store,
  ShoppingCart,
  TicketIcon,
  History,
  UserCircle,
  RefreshCw, // Replaced Sync with RefreshCw
  Loader2, // Added for loading animation
  ChevronUp,
  Wifi,
  WifiOff,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

type SidebarLayoutProps = {
  children: ReactNode;
  title: string;
};

export default function SidebarLayout({ children, title }: SidebarLayoutProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  // For development - create a mock user if no user is logged in
  const mockUser = user || {
    id: 1,
    role: location.startsWith("/owner")
      ? "owner"
      : location.startsWith("/employee")
        ? "employee"
        : location.startsWith("/customer")
          ? "customer"
          : "owner",
    fullName: "Development User",
    username: "dev_user",
  };

  // Always use user data (either real or mock)

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const [voucherStockOpen, setVoucherStockOpen] = useState(false);
  const [dataUserOpen, setDataUserOpen] = useState(false);
  const [dataStockOpen, setDataStockOpen] = useState(false);

  // Get relevant links based on user role
  const getNavLinks = () => {
    if (mockUser.role === "owner") {
      return [
        {
          href: "/owner/dashboard",
          label: "Dasbor",
          icon: <LayoutDashboard className="mr-2 h-5 w-5" />,
        },
        {
          isSubmenu: true,
          label: "Stok Voucher",
          icon: <Tags className="mr-2 h-5 w-5" />,
          open: voucherStockOpen,
          toggle: () => setVoucherStockOpen(!voucherStockOpen),
          items: [
            {
              href: "/owner/voucher-stock",
              label: "Stok Voucher Online",
              icon: <Wifi className="mr-2 h-4 w-4" />,
            },
            {
              href: "/owner/offline-voucher-stock",
              label: "Stok Voucher Offline",
              icon: <WifiOff className="mr-2 h-4 w-4" />,
            },
          ],
        },
        {
          href: "/owner/distribution",
          label: "Distribusi",
          icon: <Share className="mr-2 h-5 w-5" />,
        },
        // Data User submenu with two options: Karyawan and Pelanggan
        {
          isSubmenu: true,
          label: "Data User",
          icon: <Users className="mr-2 h-5 w-5" />,
          open: dataUserOpen,
          toggle: () => setDataUserOpen(!dataUserOpen),
          items: [
            {
              href: "/owner/employees",
              label: "Karyawan",
              icon: <UserCircle className="mr-2 h-4 w-4" />,
            },
            {
              href: "/owner/customers",
              label: "Pelanggan",
              icon: <Users className="mr-2 h-4 w-4" />,
            },
          ],
        },
        {
          isSubmenu: true,
          label: "Data Stok",
          icon: <Tags className="mr-2 h-5 w-5" />,
          open: dataStockOpen,
          toggle: () => setDataStockOpen(!dataStockOpen),
          items: [
            {
              href: "/owner/stock-owner",
              label: "Stok Owner",
              icon: <Store className="mr-2 h-4 w-4" />,
            },
            {
              href: "/owner/employee-stock",
              label: "Stok Karyawan",
              icon: <UserCircle className="mr-2 h-4 w-4" />,
            },
            {
              href: "/owner/customer-stock",
              label: "Stok Pelanggan",
              icon: <Users className="mr-2 h-4 w-4" />,
            },
          ],
        },
        {
          href: "/owner/reports",
          label: "Laporan",
          icon: <BarChart className="mr-2 h-5 w-5" />,
        },
        {
          href: "/owner/settings",
          label: "Pengaturan",
          icon: <Settings className="mr-2 h-5 w-5" />,
        },
        {
          href: "/owner/download",
          label: "Download Project",
          icon: <Download className="mr-2 h-5 w-5" />,
        },
      ];
    } else if (mockUser.role === "employee") {
      return [
        {
          href: "/employee/dashboard",
          label: "Dasbor",
          icon: <LayoutDashboard className="mr-2 h-5 w-5" />,
        },
        {
          href: "/employee/my-stock",
          label: "Stok Saya",
          icon: <Tags className="mr-2 h-5 w-5" />,
        },
        // Additional employee links
        {
          href: "#",
          label: "Penjualan",
          icon: <ShoppingCart className="mr-2 h-5 w-5" />,
        },
        {
          href: "#",
          label: "Pelanggan",
          icon: <Users className="mr-2 h-5 w-5" />,
        },
        {
          href: "#",
          label: "Sinkronisasi Data",
          icon: <RefreshCw className="mr-2 h-5 w-5" />,
        },
      ];
    } else {
      // customer
      return [
        {
          href: "/customer/dashboard",
          label: "Dasbor",
          icon: <LayoutDashboard className="mr-2 h-5 w-5" />,
        },
        // Additional customer links
        {
          href: "#",
          label: "Voucher Saya",
          icon: <TicketIcon className="mr-2 h-5 w-5" />,
        },
        {
          href: "#",
          label: "Beli Voucher",
          icon: <ShoppingCart className="mr-2 h-5 w-5" />,
        },
        {
          href: "#",
          label: "Riwayat Transaksi",
          icon: <History className="mr-2 h-5 w-5" />,
        },
        {
          href: "#",
          label: "Profil",
          icon: <UserCircle className="mr-2 h-5 w-5" />,
        },
      ];
    }
  };

  // Get appropriate theme color based on user role
  const getRoleColor = () => {
    switch (mockUser.role) {
      case "owner":
        return "bg-green-700";
      case "employee":
        return "bg-blue-700";
      case "customer":
        return "bg-yellow-700";
      default:
        return "bg-gray-700";
    }
  };

  // Get light theme color for active links
  const getActiveLinkColor = () => {
    switch (mockUser.role) {
      case "owner":
        return "bg-green-100 text-green-900";
      case "employee":
        return "bg-blue-100 text-blue-900";
      case "customer":
        return "bg-yellow-100 text-yellow-900";
      default:
        return "bg-gray-100 text-gray-900";
    }
  };

  // Get hover color for links
  const getHoverColor = () => {
    switch (mockUser.role) {
      case "owner":
        return "hover:bg-green-600 hover:text-white";
      case "employee":
        return "hover:bg-blue-600 hover:text-white";
      case "customer":
        return "hover:bg-yellow-600 hover:text-white";
      default:
        return "hover:bg-gray-600 hover:text-white";
    }
  };

  // Get action button color
  const getButtonColor = () => {
    switch (mockUser.role) {
      case "owner":
        return "bg-green-600 hover:bg-green-700";
      case "employee":
        return "bg-blue-600 hover:bg-blue-700";
      case "customer":
        return "bg-yellow-600 hover:bg-yellow-700";
      default:
        return "bg-gray-600 hover:bg-gray-700";
    }
  };

  const links = getNavLinks();
  const roleColor = getRoleColor();
  const activeLinkColor = getActiveLinkColor();
  const hoverColor = getHoverColor();
  const buttonColor = getButtonColor();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={cn(
          "text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out z-20",
          roleColor,
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex items-center space-x-4 px-4 mb-8">
          <Store className="h-6 w-6" />
          <span className="text-2xl font-bold">VoucherStock</span>
        </div>

        <nav className="space-y-1">
          {links.map((link, index) =>
            link.isSubmenu ? (
              <Collapsible
                key={index}
                open={link.open}
                onOpenChange={link.toggle}
                className="w-full"
              >
                <CollapsibleTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center justify-between w-full py-2.5 px-4 rounded transition duration-200 text-white",
                      hoverColor,
                    )}
                  >
                    <div className="flex items-center">
                      {link.icon}
                      {link.label}
                    </div>
                    {link.open ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 space-y-1 mt-1">
                  {link.items.map((item, itemIndex) => (
                    <Link
                      key={`${index}-${itemIndex}`}
                      href={item.href}
                      onClick={() => {
                        if (item.href.startsWith("#")) {
                          toast({
                            title: "Segera Hadir",
                            description: "Fitur ini sedang dalam pengembangan",
                            variant: "default",
                          });
                        }
                      }}
                    >
                      <a
                        className={cn(
                          "block py-2 px-4 rounded transition duration-200",
                          location === item.href
                            ? activeLinkColor
                            : "text-white",
                          hoverColor,
                        )}
                      >
                        {item.icon}
                        {item.label}
                      </a>
                    </Link>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <Link
                key={index}
                href={link.href}
                onClick={() => {
                  if (link.href.startsWith("#")) {
                    toast({
                      title: "Segera Hadir",
                      description: "Fitur ini sedang dalam pengembangan",
                      variant: "default",
                    });
                  }
                  setIsMobileMenuOpen(false);
                }}
              >
                <a
                  className={cn(
                    "block py-2.5 px-4 rounded transition duration-200",
                    location === link.href ? activeLinkColor : "text-white",
                    hoverColor,
                  )}
                >
                  {link.icon}
                  {link.label}
                </a>
              </Link>
            ),
          )}
        </nav>

        <div className="absolute bottom-0 w-full px-4 py-4">
          <Separator className="mb-4 bg-white/20" />
          <div className="flex items-center space-x-4 mb-4">
            <div
              className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center",
                mockUser.role === "owner"
                  ? "bg-green-100"
                  : mockUser.role === "employee"
                    ? "bg-blue-100"
                    : "bg-yellow-100",
              )}
            >
              {mockUser.role === "owner" ? (
                <Store className={cn("h-5 w-5", "text-green-800")} />
              ) : mockUser.role === "employee" ? (
                <Users className={cn("h-5 w-5", "text-blue-800")} />
              ) : (
                <UserCircle className={cn("h-5 w-5", "text-yellow-800")} />
              )}
            </div>
            <div>
              <h4 className="font-semibold">{mockUser.fullName}</h4>
              <p
                className={cn(
                  "text-xs",
                  mockUser.role === "owner"
                    ? "text-green-200"
                    : mockUser.role === "employee"
                      ? "text-blue-200"
                      : "text-yellow-200",
                )}
              >
                {mockUser.role === "owner"
                  ? "Pemilik"
                  : mockUser.role === "employee"
                    ? "Karyawan"
                    : "Pelanggan"}
              </p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className={cn("w-full text-white", buttonColor)}
          >
            {logoutMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            Keluar
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center">
              <Button
                variant="ghost"
                className="text-gray-500 focus:outline-none focus:text-gray-700 md:hidden"
                onClick={toggleMobileMenu}
              >
                <Menu className="h-6 w-6" />
              </Button>
              <div className="ml-4 md:ml-0">
                <h1 className="text-lg font-semibold">{title}</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                className="text-gray-500 hover:text-gray-700 focus:outline-none relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>
              <div className="relative">
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {mockUser.fullName}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  );
}
