"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { IconChevronDown, IconPlus, IconFileDownload } from "@tabler/icons-react"

interface LabelTemplate {
  id: number
  name: string
  html: string
  createdAt: string
  updatedAt: string
}

interface Attribute {
  id: number
  name: string
  label: string
  type: string
  required: boolean
  priority: number
}

interface Product {
  id: number
  name: string
  attributes: Record<string, any>
}

interface LabelTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: LabelTemplate | null
  onSave: (template: Omit<LabelTemplate, "id" | "createdAt" | "updatedAt">) => void
}

export function LabelTemplateDialog({
  open,
  onOpenChange,
  template,
  onSave,
}: LabelTemplateDialogProps) {
  const [name, setName] = useState("")
  const [html, setHtml] = useState("")
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [attributeSearchOpen, setAttributeSearchOpen] = useState(false)
  const [productSearchOpen, setProductSearchOpen] = useState(false)
  const [attributeSearchValue, setAttributeSearchValue] = useState("")
  const [productSearchValue, setProductSearchValue] = useState("")

  useEffect(() => {
    if (template) {
      setName(template.name)
      setHtml(template.html)
    } else {
      setName("")
      setHtml("")
    }
  }, [template])

  useEffect(() => {
    if (open) {
      fetchAttributes()
      fetchProducts()
    }
  }, [open])

  const fetchAttributes = async () => {
    try {
      const response = await fetch("/api/attributes")
      if (response.ok) {
        const data = await response.json()
        setAttributes(data)
      }
    } catch (error) {
      console.error("Error fetching attributes:", error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const handleSave = () => {
    if (!name.trim() || !html.trim()) {
      return
    }

    onSave({ name: name.trim(), html: html.trim() })
    onOpenChange(false)
  }

  const insertAttribute = (attribute: Attribute) => {
    // Use human-friendly label in templates
    const attributeTag = `{{${attribute.label}}}`
    const textarea = document.getElementById("template-html") as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newHtml = html.substring(0, start) + attributeTag + html.substring(end)
      setHtml(newHtml)
      
      // Set cursor position after the inserted attribute
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + attributeTag.length, start + attributeTag.length)
      }, 0)
    }
    setAttributeSearchOpen(false)
  }

  const getPreviewHtml = () => {
    if (!selectedProduct) {
      return html || "<p>Select a product to preview...</p>"
    }

    let previewHtml = html
    // Replace attribute placeholders that use LABELS with actual product values mapped from attribute NAMEs
    attributes.forEach((attribute) => {
      const value = (selectedProduct.attributes as Record<string, any>)[attribute.name]
      const labelPlaceholder = new RegExp(`\\{\\{${attribute.label}\\}\\}`, 'g')
      const namePlaceholder = new RegExp(`\\{\\{${attribute.name}\\}\\}`, 'g')
      if (labelPlaceholder.test(previewHtml)) {
        previewHtml = previewHtml.replace(labelPlaceholder, String(value ?? ''))
      }
      if (namePlaceholder.test(previewHtml)) {
        previewHtml = previewHtml.replace(namePlaceholder, String(value ?? ''))
      }
    })
    
    // Replace common placeholders
    previewHtml = previewHtml.replace(/\{\{productName\}\}/g, selectedProduct.name)
    
    return previewHtml
  }

  const generatePDF = async () => {
    if (!selectedProduct) {
      alert("Please select a product to generate PDF")
      return
    }

    if (!html.trim()) {
      alert("Please add some HTML content to generate PDF")
      return
    }

    try {
      // Get the processed HTML with product data
      const processedHtml = getPreviewHtml()
      
      // Generate filename
      const filename = `${template?.name || 'label'}_${selectedProduct.name.replace(/[^a-z0-9]/gi, '_')}.pdf`
      
      // Call server-side PDF generation API
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: processedHtml,
          filename: filename
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      // Create blob from response
      const blob = await response.blob()
      
      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-[95vw] h-[95vh] flex flex-col !max-w-[95vw]">
        <DialogHeader>
          <DialogTitle>
            {template ? "Edit Label Template" : "Create Label Template"}
          </DialogTitle>
          <DialogDescription>
            Create or edit your label template using HTML. The preview will update in real-time.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 flex gap-4 min-h-0">
          {/* HTML Editor Column */}
          <div className="flex-1 flex flex-col">
            <Label htmlFor="template-name" className="mb-2">
              Template Name
            </Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter template name..."
              className="mb-4"
            />
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="template-html">
                HTML Template
              </Label>
              <Popover open={attributeSearchOpen} onOpenChange={setAttributeSearchOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-auto">
                    <IconPlus className="h-4 w-4 mr-1" />
                    Add Attribute
                    <IconChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <Command>
                    <CommandInput
                      placeholder="Search attributes..."
                      value={attributeSearchValue}
                      onValueChange={setAttributeSearchValue}
                    />
                    <CommandList>
                      <CommandEmpty>No attributes found.</CommandEmpty>
                      <CommandGroup>
                        {attributes
                          .filter(attr => 
                            attr.name.toLowerCase().includes(attributeSearchValue.toLowerCase()) ||
                            attr.label.toLowerCase().includes(attributeSearchValue.toLowerCase())
                          )
                          .map((attribute) => (
                            <CommandItem
                              key={attribute.id}
                              onSelect={() => insertAttribute(attribute)}
                              className="flex items-center justify-between"
                            >
                              <div>
            <div className="font-medium">{attribute.label}</div>
                                <div className="text-sm text-muted-foreground">
                                  {attribute.name} ({attribute.type})
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {`{{${attribute.label}}}`}
                              </Badge>
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <Textarea
              id="template-html"
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              placeholder="Enter your HTML template here..."
              className="flex-1 font-mono text-sm"
            />
          </div>
          
          {/* Preview Column */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <Label>Preview</Label>
              <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-auto">
                    {selectedProduct ? selectedProduct.name : "Select Product"}
                    <IconChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <Command>
                    <CommandInput
                      placeholder="Search products..."
                      value={productSearchValue}
                      onValueChange={setProductSearchValue}
                    />
                    <CommandList>
                      <CommandEmpty>No products found.</CommandEmpty>
                      <CommandGroup>
                        {products
                          .filter(product => 
                            product.name.toLowerCase().includes(productSearchValue.toLowerCase())
                          )
                          .map((product) => (
                            <CommandItem
                              key={product.id}
                              onSelect={() => {
                                setSelectedProduct(product)
                                setProductSearchOpen(false)
                              }}
                              className="flex items-center justify-between"
                            >
                              <div>
                                <div className="font-medium">{product.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {Object.keys(product.attributes).length} attributes
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex-1 border rounded-md p-4 bg-white overflow-auto">
              <div
                dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
                className="min-h-full"
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            variant="outline" 
            onClick={generatePDF}
            disabled={!selectedProduct || !html.trim()}
            className="flex items-center gap-2"
          >
            <IconFileDownload className="h-4 w-4" />
            Generate PDF
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || !html.trim()}>
            {template ? "Update" : "Create"} Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
