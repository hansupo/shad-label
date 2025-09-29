"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export interface Product {
  id: number
  name: string
  attributes: Record<string, any>
  createdAt: string
  updatedAt: string
}

// Create columns function that takes the filter state as parameters
const createColumns = (
  klassFilter: string,
  setKlassFilter: (value: string) => void,
  klassValues: string[],
  attributes: Array<{
    id: number
    name: string
    label: string
    priority: number
  }>
): ColumnDef<Product>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "id",
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
  },
  {
    id: "artikkel",
    accessorFn: (row) => row.attributes?.["Artikkel"] || "",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Artikkel
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const attributes = row.original.attributes as Record<string, any>
      return <div className="font-medium">{attributes?.["Artikkel"] || "-"}</div>
    },
  },
  {
    id: "nimi",
    accessorFn: (row) => row.attributes?.["Nimi"] || row.name || "",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nimi
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const attributes = row.original.attributes as Record<string, any>
      return <div className="font-medium">{attributes?.["Nimi"] || row.original.name}</div>
    },
  },
  {
    id: "klass",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <span>Klass</span>
          <Select value={klassFilter} onValueChange={setKlassFilter}>
            <SelectTrigger className="w-[120px] h-8">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {klassValues.map((klass) => (
                <SelectItem key={klass} value={klass}>
                  {klass}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )
    },
    cell: ({ row }) => {
      const attributes = row.original.attributes as Record<string, any>
      return <div className="font-medium">{attributes?.["Klass"] || "-"}</div>
    },
  },
  {
    id: "attributes",
    header: "Attributes",
    cell: ({ row }) => {
      const productAttributes = row.original.attributes as Record<string, any>
      const attributeCount = productAttributes ? Object.keys(productAttributes).length : 0
      
      // Get attributes with priorities inline
      const getAttributesWithPriority = (productAttributes: Record<string, any>): AttributeWithPriority[] => {
        return Object.entries(productAttributes)
          .map(([label, value]) => {
            // Find the attribute definition by label
            const attributeDef = attributes.find(attr => attr.label === label)
            return {
              name: attributeDef?.name || label,
              label,
              value,
              priority: attributeDef?.priority || 50
            }
          })
          .sort((a, b) => b.priority - a.priority) // Sort by priority descending (highest first)
      }
      
      const attributesWithPriority = productAttributes ? getAttributesWithPriority(productAttributes) : []
      
      return (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="cursor-help">
                  {attributeCount} attributes
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-2">
                  <p className="font-medium">Product Attributes (by priority):</p>
                  {attributesWithPriority.length > 0 ? (
                    <div className="space-y-1">
                      {attributesWithPriority.map((attr) => (
                        <div key={attr.label} className="text-sm flex items-center justify-between">
                          <div className="flex-1">
                            <span className="font-medium">{attr.label}:</span> {String(attr.value)}
                          </div>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            P{attr.priority}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No attributes</div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>Product Attributes</DialogTitle>
                <DialogDescription>
                  All attributes for this product, ordered by priority (highest to lowest)
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-y-auto max-h-[60vh] pr-2">
                {attributesWithPriority.length > 0 ? (
                  <div className="space-y-4">
                    {attributesWithPriority.map((attr, index) => (
                      <div key={attr.label} className="border rounded-lg p-4 bg-card">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{attr.label}</h4>
                            <p className="text-sm text-muted-foreground">Attribute Name: {attr.name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              Priority {attr.priority}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              #{index + 1}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-3 p-3 bg-muted rounded-md">
                          <p className="text-sm font-medium text-muted-foreground mb-1">Value:</p>
                          <p className="text-lg font-mono break-words">{String(attr.value)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-lg">No attributes found</p>
                    <p className="text-sm">This product doesn't have any attributes defined.</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )
    },
  },
  {
    id: "hind",
    accessorFn: (row) => row.attributes?.["Hind"] || "",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Hind
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const attributes = row.original.attributes as Record<string, any>
      return <div className="font-medium">{attributes?.["Hind"] || "-"}</div>
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const product = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(product.id.toString())}
            >
              Copy product ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Edit product</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Delete product</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

interface ProductsDataTableProps {
  data: Product[]
  attributes?: Array<{
    id: number
    name: string
    label: string
    priority: number
  }>
}

interface AttributeWithPriority {
  name: string
  label: string
  value: any
  priority: number
}

export function ProductsDataTable({ data, attributes = [] }: ProductsDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [klassFilter, setKlassFilter] = React.useState<string>("all")
  const [globalFilter, setGlobalFilter] = React.useState<string>("")

  // Get unique Klass values from the data
  const klassValues = React.useMemo(() => {
    const values = new Set<string>()
    data.forEach(product => {
      if (product.attributes?.["Klass"]) {
        values.add(product.attributes["Klass"])
      }
    })
    return Array.from(values).sort()
  }, [data])


  // Filter data based on Klass selection
  const filteredData = React.useMemo(() => {
    if (klassFilter === "all") {
      return data
    }
    return data.filter(product => product.attributes?.["Klass"] === klassFilter)
  }, [data, klassFilter])

  // Create columns with the current state
  const columns = React.useMemo(() => 
    createColumns(klassFilter, setKlassFilter, klassValues, attributes), 
    [klassFilter, setKlassFilter, klassValues, attributes]
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: (row, columnId, value) => {
      const product = row.original
      const searchValue = value.toLowerCase()
      
      // Search in product name
      if (product.name.toLowerCase().includes(searchValue)) {
        return true
      }
      
      // Search in attributes
      if (product.attributes) {
        const attributeValues = Object.values(product.attributes)
          .map(val => String(val).toLowerCase())
          .join(' ')
        if (attributeValues.includes(searchValue)) {
          return true
        }
      }
      
      return false
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-4">
        <Input
          placeholder="Filter products..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                // Map column IDs to display names
                const getDisplayName = (id: string) => {
                  switch (id) {
                    case "id": return "ID"
                    case "artikkel": return "Artikkel"
                    case "nimi": return "Nimi"
                    case "klass": return "Klass"
                    case "attributes": return "Attributes"
                    case "hind": return "Hind"
                    default: return id
                  }
                }
                
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {getDisplayName(column.id)}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
