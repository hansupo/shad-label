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

  // Parse loop configuration from data attribute
  const parseLoopConfig = (configString: string) => {
    const config: {
      priorityMin?: number
      priorityMax?: number
      limit?: number
      type?: string[]
      required?: boolean
    } = {}
    
    if (!configString) return config
    
    const pairs = configString.split(';').map(pair => pair.trim())
    pairs.forEach(pair => {
      const [key, value] = pair.split(':').map(s => s.trim())
      switch (key) {
        case 'priorityMin':
          config.priorityMin = parseInt(value)
          break
        case 'priorityMax':
          config.priorityMax = parseInt(value)
          break
        case 'limit':
          config.limit = parseInt(value)
          break
        case 'type':
          config.type = value.split(',').map(t => t.trim())
          break
        case 'required':
          config.required = value === 'true'
          break
      }
    })
    
    return config
  }

  // Get filtered and sorted attributes for loops
  const getFilteredAttributes = (config: {
    priorityMin?: number
    priorityMax?: number
    limit?: number
    type?: string[]
    required?: boolean
  }) => {
    if (!selectedProduct) return []
    
    // Get all attributes that have values in the product
    const availableAttributes = attributes.filter(attr => {
      const value = selectedProduct.attributes[attr.label]
      return value && String(value).trim() !== ''
    })
    
    // Apply filters
    let filtered = availableAttributes.filter(attr => {
      if (config.priorityMin !== undefined && attr.priority < config.priorityMin) return false
      if (config.priorityMax !== undefined && attr.priority > config.priorityMax) return false
      if (config.type && !config.type.includes(attr.type)) return false
      if (config.required !== undefined && attr.required !== config.required) return false
      return true
    })
    
    // Sort by priority (descending) and apply limit
    filtered = filtered.sort((a, b) => b.priority - a.priority)
    if (config.limit) {
      filtered = filtered.slice(0, config.limit)
    }
    
    return filtered.map(attr => ({
      attribute: attr,
      value: selectedProduct.attributes[attr.label]
    }))
  }

  // Process attribute loops in HTML
  const processAttributeLoops = (html: string) => {
    // Find all elements with data-attribute-loop using a more compatible approach
    const loopRegex = /<([^>]+)\s+data-attribute-loop(?:="([^"]*)")?[^>]*>([\s\S]*?)<\/\1>/g
    let processedHtml = html
    
    let match
    while ((match = loopRegex.exec(html)) !== null) {
      const [fullMatch, tagName, configString, content] = match
      const config = parseLoopConfig(configString || '')
      const filteredAttributes = getFilteredAttributes(config)
      
      // Generate HTML for each attribute
      const loopContent = filteredAttributes.map(({ attribute, value }) => {
        return content
          .replace(/\{\{attributeLabel\}\}/g, attribute.label)
          .replace(/\{\{attributeValue\}\}/g, String(value))
          .replace(/\{\{attributeName\}\}/g, attribute.name)
          .replace(/\{\{attributeType\}\}/g, attribute.type)
      }).join('')
      
      // Replace the loop with generated content
      processedHtml = processedHtml.replace(fullMatch, loopContent)
    }
    
    return processedHtml
  }

  const getPreviewHtml = () => {
    if (!selectedProduct) {
      return html || "<p>Select a product to preview...</p>"
    }

    let previewHtml = html
    
    // Process attribute loops first
    previewHtml = processAttributeLoops(previewHtml)
    
    // Group attributes by label for priority handling (for single placeholders)
    const attributesByLabel: Record<string, Array<{attribute: Attribute, value: any}>> = {}
    
    // Map product attributes to their corresponding attribute definitions
    // Product attributes are stored with LABELS as keys, not names
    Object.entries(selectedProduct.attributes).forEach(([key, value]) => {
      const attribute = attributes.find(attr => attr.label === key)
      if (attribute && value && String(value).trim() !== '') {
        if (!attributesByLabel[attribute.label]) {
          attributesByLabel[attribute.label] = []
        }
        attributesByLabel[attribute.label].push({ attribute, value })
      }
    })

    // For each label, select the attribute with highest priority
    Object.keys(attributesByLabel).forEach(label => {
      const candidates = attributesByLabel[label]
      if (candidates.length > 0) {
        // Sort by priority (descending) and take the first one
        const selected = candidates.sort((a, b) => b.attribute.priority - a.attribute.priority)[0]
        const labelPlaceholder = new RegExp(`\\{\\{${label}\\}\\}`, 'g')
        const replacement = String(selected.value)
        previewHtml = previewHtml.replace(labelPlaceholder, replacement)
        console.log(`Replaced {{${label}}} with: ${replacement}`)
      }
    })
    
    // Debug: log any remaining placeholders
    const remainingPlaceholders = previewHtml.match(/\{\{[^}]+\}\}/g)
    if (remainingPlaceholders) {
      console.log('Remaining placeholders:', remainingPlaceholders)
      console.log('Available attributes:', Object.keys(attributesByLabel))
    }
    
    // Replace common placeholders
    previewHtml = previewHtml.replace(/\{\{productName\}\}/g, selectedProduct.name)
    
    return previewHtml
  }

  // ----- Lightweight colorized HTML editor (contenteditable) -----
  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/\'/g, "&#39;")

  const renderHighlighted = (raw: string) => {
    const src = escapeHtml(raw)
      .replace(/\{\{[^}]+\}\}/g, (m) => `<span class=\"hl-placeholder\">${m}</span>`)
      .replace(/(&lt;\/?)([a-zA-Z0-9-]+)(?=[\s&gt;])/g, (_, p1, p2) => `${p1}<span class=\"hl-tag\">${p2}</span>`)
      .replace(/(\s)([a-zA-Z_:][-a-zA-Z0-9_:.]*)(=)/g, (_, sp, name, eq) => `${sp}<span class=\"hl-attr\">${name}</span>${eq}`)
      .replace(/(=\")([^\"]*)(\")/g, (_, a, v, b) => `${a}<span class=\"hl-value\">${v}</span>${b}`)
    return src
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
      // Get the processed HTML with product data (includes loop processing)
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
              <div className="ml-auto flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      Loop Help
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-96 p-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Attribute Loops</h4>
                      <p className="text-sm text-muted-foreground">
                        Use data-attribute-loop to dynamically render multiple attributes:
                      </p>
                      <div className="space-y-2 text-xs font-mono bg-muted p-2 rounded">
                        <div>&lt;div data-attribute-loop&gt;</div>
                        <div>  &lt;span&gt;&#123;&#123;attributeLabel&#125;&#125;&lt;/span&gt;: &lt;span&gt;&#123;&#123;attributeValue&#125;&#125;&lt;/span&gt;</div>
                        <div>&lt;/div&gt;</div>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div><strong>Filters:</strong></div>
                        <div>• priorityMin:70; priorityMax:80</div>
                        <div>• limit:10</div>
                        <div>• type:text,url</div>
                        <div>• required:true</div>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div><strong>Placeholders:</strong></div>
                        <div>• &#123;&#123;attributeLabel&#125;&#125; - Display label</div>
                        <div>• &#123;&#123;attributeValue&#125;&#125; - Attribute value</div>
                        <div>• &#123;&#123;attributeName&#125;&#125; - Internal name</div>
                        <div>• &#123;&#123;attributeType&#125;&#125; - Type (text, url, etc.)</div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <Popover open={attributeSearchOpen} onOpenChange={setAttributeSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
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
                    <CommandList className="max-h-64 overflow-auto">
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
            </div>
            <Textarea
              id="template-html"
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              placeholder="Enter your HTML template here...

Example with loops:
<div data-attribute-loop='priorityMin:70; limit:5'>
  <div>{{attributeLabel}}: {{attributeValue}}</div>
</div>

Example with type filtering:
<div data-attribute-loop='type:text,url; limit:3'>
  <span>{{attributeLabel}}</span>: <span>{{attributeValue}}</span>
</div>"
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
