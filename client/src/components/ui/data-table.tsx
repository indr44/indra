import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search,
  Download,
  Filter
} from "lucide-react";

interface DataTableColumn<T> {
  header: string;
  accessorKey: keyof T | ((row: T) => string | number | JSX.Element);
  cell?: (row: T) => JSX.Element;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  searchable?: boolean;
  pagination?: boolean;
  exportable?: boolean;
  filterable?: boolean;
  itemsPerPage?: number;
  primaryColor?: string;
}

export function DataTable<T>({
  data,
  columns,
  searchable = false,
  pagination = true,
  exportable = false,
  filterable = false,
  itemsPerPage = 10,
  primaryColor = "primary",
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter data based on search term
  const filteredData = searchTerm
    ? data.filter((item) =>
        Object.entries(item).some(([key, value]) => {
          // Skip non-string and non-number values
          if (typeof value !== "string" && typeof value !== "number") {
            return false;
          }
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      )
    : data;

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedData = pagination
    ? filteredData.slice(startIndex, startIndex + itemsPerPage)
    : filteredData;

  // Determine color class for buttons
  const getColorClass = () => {
    switch (primaryColor) {
      case "green":
        return "bg-green-600 hover:bg-green-700 text-white";
      case "blue":
        return "bg-blue-600 hover:bg-blue-700 text-white";
      case "yellow":
        return "bg-yellow-600 hover:bg-yellow-700 text-white";
      default:
        return "bg-primary hover:bg-primary/90 text-primary-foreground";
    }
  };

  const buttonColorClass = getColorClass();

  return (
    <div className="space-y-4">
      {/* Table controls */}
      {(searchable || exportable || filterable) && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {searchable && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Cari..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1); // Reset to first page on search
                }}
              />
            </div>
          )}
          <div className="flex items-center space-x-2">
            {filterable && (
              <Button className={buttonColorClass}>
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            )}
            {exportable && (
              <Button className={buttonColorClass}>
                <Download className="mr-2 h-4 w-4" />
                Ekspor
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index} className="font-semibold">
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex}>
                      {column.cell
                        ? column.cell(row)
                        : typeof column.accessorKey === "function"
                        ? column.accessorKey(row)
                        : String(row[column.accessorKey] || "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Tidak ada data ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between py-2">
          <div className="text-sm text-gray-700">
            Menampilkan <span className="font-medium">{startIndex + 1}</span> sampai{" "}
            <span className="font-medium">
              {Math.min(startIndex + itemsPerPage, filteredData.length)}
            </span>{" "}
            dari <span className="font-medium">{filteredData.length}</span> hasil
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show pages around the current page
              let pageToShow = 0;
              if (totalPages <= 5) {
                // Show all pages if there are 5 or less
                pageToShow = i + 1;
              } else if (page <= 3) {
                // At the beginning
                pageToShow = i + 1;
              } else if (page >= totalPages - 2) {
                // At the end
                pageToShow = totalPages - 4 + i;
              } else {
                // In the middle
                pageToShow = page - 2 + i;
              }

              return (
                <Button
                  key={i}
                  variant={page === pageToShow ? "default" : "outline"}
                  size="sm"
                  className={page === pageToShow ? buttonColorClass : ""}
                  onClick={() => setPage(pageToShow)}
                >
                  {pageToShow}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
