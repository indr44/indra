import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, QrCode, Ticket } from "lucide-react";

interface VoucherCardProps {
  title: string;
  value: string;
  expiryDate: string;
  status?: "active" | "pending" | "expired" | "used";
  variant?: "owner" | "employee" | "customer";
  isAvailable?: boolean;
  price?: string;
  onAction?: () => void;
  actionLabel?: string;
}

export function VoucherCard({
  title,
  value,
  expiryDate,
  status = "active",
  variant = "customer",
  isAvailable = false,
  price,
  onAction,
  actionLabel = "View Code",
}: VoucherCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "used":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getVariantColor = () => {
    switch (variant) {
      case "owner":
        return {
          background: "bg-gradient-to-r from-green-50 to-green-100 border-green-200",
          button: "bg-green-600 hover:bg-green-700 text-white",
          icon: "bg-green-500 text-white",
        };
      case "employee":
        return {
          background: "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200",
          button: "bg-blue-600 hover:bg-blue-700 text-white",
          icon: "bg-blue-500 text-white",
        };
      case "customer":
      default:
        return {
          background: "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200",
          button: "bg-yellow-600 hover:bg-yellow-700 text-white",
          icon: "bg-yellow-500 text-white",
        };
    }
  };

  const variantColors = getVariantColor();
  const statusColor = getStatusColor();

  return (
    <div
      className={cn(
        "rounded-lg p-4 border",
        isAvailable ? "bg-white border-gray-200" : variantColors.background
      )}
    >
      <div className="flex flex-col md:flex-row justify-between">
        <div className="mb-4 md:mb-0">
          <div className="flex items-center">
            <div className={cn("rounded-full p-2 mr-2", variantColors.icon)}>
              <Ticket className="h-4 w-4" />
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{value}</p>
          <div className="flex items-center mt-1 text-gray-600 text-sm">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            <p>Valid until: {expiryDate}</p>
          </div>
        </div>
        <div className="flex flex-col justify-between">
          {!isAvailable && status && (
            <span className={cn("px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center justify-center mb-2", statusColor)}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          )}
          <div className="flex items-center">
            {price && <span className="text-xl font-bold text-gray-700 mr-4">{price}</span>}
            <Button onClick={onAction} className={variantColors.button}>
              {isAvailable ? (
                <>
                  <Ticket className="mr-2 h-4 w-4" />
                  Purchase
                </>
              ) : (
                <>
                  <QrCode className="mr-2 h-4 w-4" />
                  {actionLabel}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
