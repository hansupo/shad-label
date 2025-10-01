"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, FileText, History } from "lucide-react"
import { useState, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"

interface Attribute {
  id: number
  name: string
  label: string
  type: string
  required: boolean
  priority: number
}

interface ImportHistory {
  id: number
  filename: string
  status: string
  importedAt: string
  recordsCount: number
}

export default function ImportCsvPage() {
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [csvData, setCsvData] = useState<string[][]>([])
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [headerMappings, setHeaderMappings] = useState<Record<string, string>>({})
  const [importHistory, setImportHistory] = useState<ImportHistory[]>([])
  const [detectedDelimiter, setDetectedDelimiter] = useState<string>(',')
  const [isImporting, setIsImporting] = useState(false)
  const [previewLimit, setPreviewLimit] = useState<number | 'all'>(10)

  // Fetch attributes for header mapping
  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const response = await fetch('/api/attributes')
        if (!response.ok) {
          setAttributes([])
          return
        }
        const data = await response.json()
        setAttributes(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error fetching attributes:', error)
      }
    }
    fetchAttributes()
  }, [])

  // Mock import history data
  useEffect(() => {
    setImportHistory([
      {
        id: 1,
        filename: 'products_2024.csv',
        status: 'Completed',
        importedAt: '2024-01-15 10:30:00',
        recordsCount: 150
      },
      {
        id: 2,
        filename: 'inventory_update.csv',
        status: 'Failed',
        importedAt: '2024-01-14 14:20:00',
        recordsCount: 0
      },
      {
        id: 3,
        filename: 'new_products.csv',
        status: 'Completed',
        importedAt: '2024-01-13 09:15:00',
        recordsCount: 75
      }
    ])
  }, [])

  // Parse CSV/TSV line properly handling quoted fields and different delimiters
  const parseCSVLine = (line: string, delimiter: string = ','): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === delimiter && !inQuotes) {
        // Clean up the field: trim whitespace and handle empty values
        const cleaned = current.trim()
        result.push(cleaned === '' ? '' : cleaned)
        current = ''
      } else {
        current += char
      }
    }
    
    // Add the last field
    const cleaned = current.trim()
    result.push(cleaned === '' ? '' : cleaned)
    return result
  }

  // Detect delimiter (comma, tab, or semicolon)
  const detectDelimiter = (line: string): string => {
    const commaCount = (line.match(/,/g) || []).length
    const tabCount = (line.match(/\t/g) || []).length
    const semicolonCount = (line.match(/;/g) || []).length
    
    if (semicolonCount > commaCount && semicolonCount > tabCount) {
      return ';'
    } else if (tabCount > commaCount) {
      return '\t'
    } else {
      return ','
    }
  }

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length > 0) {
        // Detect delimiter from the first line
        const delimiter = detectDelimiter(lines[0])
        setDetectedDelimiter(delimiter)
        
        // Parse headers and data with the detected delimiter
        const headers = parseCSVLine(lines[0], delimiter)
        const data = lines.slice(1).map(line => parseCSVLine(line, delimiter))
        
        // Filter out completely empty rows
        const filteredData = data.filter(row => row.some(cell => cell.trim() !== ''))
        
        setCsvHeaders(headers)
        setCsvData(filteredData)
        
        // Auto-map headers to attributes
        const mappings: Record<string, string> = {}
        headers.forEach(header => {
          if (header.trim() !== '') { // Only try to map non-empty headers
            const matchingAttribute = attributes.find(attr => 
              attr.name.toLowerCase() === header.toLowerCase() ||
              attr.label.toLowerCase() === header.toLowerCase()
            )
            if (matchingAttribute) {
              mappings[header] = matchingAttribute.name
            }
          }
        })
        setHeaderMappings(mappings)
      }
    }
    reader.readAsText(file)
  }

  // Handle header mapping change
  const handleHeaderMappingChange = (header: string, value: string) => {
    if (value === "__no_mapping__") {
      setHeaderMappings(prev => {
        const newMappings = { ...prev }
        delete newMappings[header]
        return newMappings
      })
    } else {
      setHeaderMappings(prev => ({
        ...prev,
        [header]: value
      }))
    }
  }

  // Determine if a header already corresponds to an attribute
  const findAttributeForHeader = (header: string): Attribute | undefined => {
    const lower = header.toLowerCase()
    return attributes.find(a => a.name.toLowerCase() === lower || a.label.toLowerCase() === lower)
  }

  // Create attribute from a CSV header via API
  const createAttributeFromHeader = async (
    header: string,
    form: { name: string; label: string; type: string; priority: number; required: boolean }
  ) => {
    try {
      const response = await fetch('/api/attributes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        alert(err.error || 'Failed to create attribute')
        return
      }
      const created: Attribute = await response.json()
      setAttributes(prev => [...prev, created])
      // Auto-map this header to the newly created attribute name
      setHeaderMappings(prev => ({ ...prev, [header]: created.name }))
    } catch (e) {
      console.error('Error creating attribute:', e)
      alert('Failed to create attribute')
    }
  }

  // Handle CSV import
  const handleImportCSV = async () => {
    if (csvData.length === 0) return

    setIsImporting(true)
    try {
      // Process the CSV data with attribute matching and priority handling
      const processedData = csvData.map((row, index) => {
        const productData: any = {}
        
        // Group attributes by label for priority handling
        const attributesByLabel: Record<string, Array<{attribute: Attribute, value: string}>> = {}
        
        csvHeaders.forEach((header, headerIndex) => {
          const mappedAttributeName = headerMappings[header]
          if (mappedAttributeName && row[headerIndex]) {
            const attribute = attributes.find(attr => attr.name === mappedAttributeName)
            if (attribute) {
              const value = row[headerIndex].trim()
              if (value && value !== '0' && value !== '0.00') { // Only include non-empty and non-zero values
                if (!attributesByLabel[attribute.label]) {
                  attributesByLabel[attribute.label] = []
                }
                attributesByLabel[attribute.label].push({ attribute, value })
              }
            }
          }
        })

        // For each label, select the attribute with highest priority
        Object.keys(attributesByLabel).forEach(label => {
          const candidates = attributesByLabel[label]
          if (candidates.length > 0) {
            // Sort by priority (descending) and take the first one
            const selected = candidates.sort((a, b) => b.attribute.priority - a.attribute.priority)[0]
            // Use the attribute label as the key, not the name
            productData[selected.attribute.label] = selected.value
          }
        })

        // Use the first mapped attribute as product name, or generate one
        const productName = Object.values(productData)[0] || `Product ${index + 1}`

        return {
          name: productName,
          attributes: productData
        }
      })

      // Send to API
      const response = await fetch('/api/products/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products: processedData }),
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Successfully imported ${result.count} products!`)
        
        // Reset form
        setCsvData([])
        setCsvHeaders([])
        setHeaderMappings({})
        
        // Update import history
        setImportHistory(prev => [{
          id: Date.now(),
          filename: 'imported_products.csv',
          status: 'Completed',
          importedAt: new Date().toLocaleString(),
          recordsCount: result.count
        }, ...prev])
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to import products')
      }
    } catch (error) {
      console.error('Error importing CSV:', error)
      alert('Failed to import products')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <h1 className="text-3xl font-bold">Import CSV Data</h1>
                <p className="text-muted-foreground">Upload and process CSV files for bulk operations</p>
              </div>
              
              <div className="px-4 lg:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Upload CSV File
                      </CardTitle>
                      <CardDescription>
                        Select a CSV file to import data
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-sm text-gray-600 mb-2">Drag and drop your CSV file here</p>
                        <p className="text-xs text-gray-500">or click to browse</p>
                        <Input 
                          type="file" 
                          accept=".csv" 
                          className="mt-4" 
                          onChange={handleFileUpload}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="delimiter">CSV Delimiter</Label>
                        <Input 
                          id="delimiter" 
                          placeholder="," 
                          value={detectedDelimiter}
                          readOnly
                          className="bg-gray-50"
                        />
                        <p className="text-xs text-gray-500">
                          {detectedDelimiter === '\t' 
                            ? 'Tab-separated (TSV)' 
                            : detectedDelimiter === ';' 
                            ? 'Semicolon-separated (CSV)' 
                            : 'Comma-separated (CSV)'
                          } - Auto-detected
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Import History
                      </CardTitle>
                      <CardDescription>
                        View your recent CSV imports
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {importHistory.length === 0 ? (
                          <div className="text-center py-4 text-gray-500">
                            <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">No imports yet</p>
                          </div>
                        ) : (
                          importHistory.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium text-sm">{item.filename}</p>
                                <p className="text-xs text-gray-500">
                                  {item.importedAt} • {item.recordsCount} records
                                </p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                item.status === 'Completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {item.status}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* CSV Preview Table */}
                {csvData.length > 0 && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>CSV Preview & Header Mapping</CardTitle>
                      <CardDescription>
                        Map CSV headers to your attributes. Headers are auto-matched but can be changed manually.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {csvHeaders.map((header, index) => {
                                const existing = findAttributeForHeader(header)
                                return (
                                  <TableHead key={index} className="min-w-[240px] align-top">
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <div className="font-medium text-sm">{header}</div>
                                        {!existing && (
                                          <Popover>
                                            <PopoverTrigger asChild>
                                              <Button variant="outline" size="sm">+ Add attribute</Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-80">
                                              <div className="space-y-3">
                                                <div className="grid gap-2">
                                                  <Label htmlFor={`name-${index}`}>Name</Label>
                                                  <Input id={`name-${index}`} defaultValue={header} 
                                                    onChange={(e) => {
                                                      const val = e.target.value
                                                      setHeaderMappings(prev => ({ ...prev, [header]: val }))
                                                    }}
                                                  />
                                                </div>
                                                <div className="grid gap-2">
                                                  <Label htmlFor={`label-${index}`}>Label</Label>
                                                  <Input id={`label-${index}`} defaultValue={header} />
                                                </div>
                                                <div className="grid gap-2">
                                                  <Label>Type</Label>
                                                  <Select defaultValue="text" onValueChange={(value) => {
                                                    // Store temporarily on the element dataset
                                                    const el = document.getElementById(`type-${index}`) as HTMLInputElement | null
                                                    if (el) el.value = value
                                                  }}>
                                                    <SelectTrigger>
                                                      <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value="text">Text</SelectItem>
                                                      <SelectItem value="url">URL</SelectItem>
                                                      <SelectItem value="qrcode">QR Code</SelectItem>
                                                      <SelectItem value="barcode">Barcode</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                  <input id={`type-${index}`} type="hidden" defaultValue="text" />
                                                </div>
                                                <div className="grid gap-2">
                                                  <Label htmlFor={`priority-${index}`}>Priority</Label>
                                                  <Input id={`priority-${index}`} type="number" defaultValue={50} min={1} max={100} />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                  <Switch id={`required-${index}`} />
                                                  <Label htmlFor={`required-${index}`}>Required</Label>
                                                </div>
                                                <Button
                                                  onClick={() => {
                                                    const nameEl = document.getElementById(`name-${index}`) as HTMLInputElement
                                                    const labelEl = document.getElementById(`label-${index}`) as HTMLInputElement
                                                    const typeEl = document.getElementById(`type-${index}`) as HTMLInputElement
                                                    const priorityEl = document.getElementById(`priority-${index}`) as HTMLInputElement
                                                    const requiredEl = document.getElementById(`required-${index}`) as HTMLInputElement
                                                    createAttributeFromHeader(header, {
                                                      name: nameEl?.value || header,
                                                      label: labelEl?.value || header,
                                                      type: typeEl?.value || 'text',
                                                      priority: Number(priorityEl?.value || 50),
                                                      required: !!requiredEl?.checked,
                                                    })
                                                  }}
                                                  className="w-full"
                                                >
                                                  Create attribute
                                                </Button>
                                              </div>
                                            </PopoverContent>
                                          </Popover>
                                        )}
                                      </div>
                                      <Select
                                        value={headerMappings[header] || (existing ? existing.name : undefined)}
                                        onValueChange={(value) => handleHeaderMappingChange(header, value)}
                                      >
                                        <SelectTrigger className="h-8">
                                          <SelectValue placeholder="Select attribute" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="__no_mapping__">No mapping</SelectItem>
                                          {attributes.map((attr) => (
                                            <SelectItem key={attr.id} value={attr.name}>
                                              {attr.label} ({attr.name})
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </TableHead>
                                )
                              })}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(previewLimit === 'all' ? csvData : csvData.slice(0, previewLimit)).map((row, rowIndex) => (
                              <TableRow key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                  <TableCell key={cellIndex} className="text-sm">
                                    {cell === '' ? (
                                      <span className="text-gray-400 italic">(empty)</span>
                                    ) : (
                                      cell
                                    )}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                            {previewLimit !== 'all' && csvData.length > (previewLimit as number) && (
                              <TableRow>
                                <TableCell colSpan={csvHeaders.length} className="text-center text-gray-500 text-sm">
                                  ... and {csvData.length - (previewLimit as number)} more rows
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                      <div className="mt-4 pt-4 border-t flex items-center gap-3">
                        <Button 
                          onClick={handleImportCSV}
                          disabled={isImporting || csvData.length === 0}
                        >
                          {isImporting ? 'Importing...' : 'Import CSV to Products'}
                        </Button>
                        <div className="flex items-center gap-2 ml-auto">
                          <Label className="text-sm">Preview rows:</Label>
                          <Select
                            value={previewLimit === 'all' ? 'all' : String(previewLimit)}
                            onValueChange={(value) => {
                              if (value === 'all') setPreviewLimit('all')
                              else setPreviewLimit(parseInt(value, 10))
                            }}
                          >
                            <SelectTrigger className="h-8 w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5</SelectItem>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="20">20</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                              <SelectItem value="100">100</SelectItem>
                              <SelectItem value="all">All</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
