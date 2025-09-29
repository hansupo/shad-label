"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, Tag } from "lucide-react"
import { useState, useEffect } from "react"

interface Attribute {
  id: number
  name: string
  label: string
  type: string
  required: boolean
  priority: number
  createdAt: string
  updatedAt: string
}

export default function AttributesPage() {
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isFlushing, setIsFlushing] = useState(false)
  const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    type: '',
    required: false,
    priority: 50
  })

  // Fetch attributes
  const fetchAttributes = async () => {
    try {
      const response = await fetch('/api/attributes')
      if (!response.ok) {
        console.error('Failed to fetch attributes:', await response.text())
        setAttributes([])
        return
      }
      const data = await response.json()
      setAttributes(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching attributes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttributes()
  }, [])

  // Handle flush attributes
  const handleFlushAttributes = async () => {
    if (!confirm('Are you sure you want to delete ALL attributes? This action cannot be undone.')) {
      return
    }

    setIsFlushing(true)
    try {
      const response = await fetch('/api/attributes', { method: 'DELETE' })
      if (response.ok) {
        alert('All attributes have been deleted successfully!')
        await fetchAttributes()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete attributes')
      }
    } catch (error) {
      console.error('Error flushing attributes:', error)
      alert('Failed to delete attributes')
    } finally {
      setIsFlushing(false)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingAttribute ? `/api/attributes/${editingAttribute.id}` : '/api/attributes'
      const method = editingAttribute ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchAttributes()
        setIsDialogOpen(false)
        setEditingAttribute(null)
        setFormData({ name: '', label: '', type: '', required: false, priority: 50 })
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save attribute')
      }
    } catch (error) {
      console.error('Error saving attribute:', error)
      alert('Failed to save attribute')
    }
  }

  // Handle edit
  const handleEdit = (attribute: Attribute) => {
    setEditingAttribute(attribute)
    setFormData({
      name: attribute.name,
      label: attribute.label,
      type: attribute.type,
      required: attribute.required,
      priority: attribute.priority
    })
    setIsDialogOpen(true)
  }

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this attribute?')) return

    try {
      const response = await fetch(`/api/attributes/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchAttributes()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete attribute')
      }
    } catch (error) {
      console.error('Error deleting attribute:', error)
      alert('Failed to delete attribute')
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({ name: '', label: '', type: '', required: false, priority: 50 })
    setEditingAttribute(null)
  }

  const openDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  // Handle name change and auto-update label
  const handleNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      name: value,
      label: prev.label === prev.name ? value : prev.label // Only auto-update if label matches name
    }))
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
                <h1 className="text-3xl font-bold">Attributes Management</h1>
                <p className="text-muted-foreground">Manage product attributes and their properties</p>
              </div>
              
              <div className="px-4 lg:px-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2">
                    <Input placeholder="Search attributes..." className="w-64" />
                    <Button variant="outline">Filter</Button>
                    <Button variant="outline">Export</Button>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="destructive" 
                      onClick={handleFlushAttributes}
                      disabled={isFlushing || attributes.length === 0}
                    >
                      {isFlushing ? 'Flushing...' : 'Debug: Flush Attributes'}
                    </Button>
                    <Button onClick={openDialog}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Attribute
                    </Button>
                  </div>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Attribute List</CardTitle>
                    <CardDescription>Manage your product attributes and their configurations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8">Loading attributes...</div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Attribute Name</TableHead>
                            <TableHead>Attribute Label</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Required</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {attributes.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                No attributes found. Create your first attribute to get started.
                              </TableCell>
                            </TableRow>
                          ) : (
                            attributes.map((attribute) => (
                              <TableRow key={attribute.id}>
                                <TableCell className="font-medium flex items-center gap-2">
                                  <Tag className="h-4 w-4" />
                                  {attribute.name}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {attribute.label}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">{attribute.type}</Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={attribute.required ? "secondary" : "outline"}>
                                    {attribute.required ? "Yes" : "No"}
                                  </Badge>
                                </TableCell>
                                <TableCell>{attribute.priority}</TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleEdit(attribute)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="destructive"
                                      onClick={() => handleDelete(attribute.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Add/Edit Attribute Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingAttribute ? 'Edit Attribute' : 'Add New Attribute'}
            </DialogTitle>
            <DialogDescription>
              {editingAttribute 
                ? 'Update the attribute details below.' 
                : 'Create a new attribute by filling in the details below.'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Attribute Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter attribute name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="label">Attribute Label</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="Enter display label (defaults to name)"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select attribute type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="url">URL</SelectItem>
                    <SelectItem value="qrcode">QR Code</SelectItem>
                    <SelectItem value="barcode">Barcode</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority (1-100)</Label>
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 50 })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="required"
                  checked={formData.required}
                  onCheckedChange={(checked) => setFormData({ ...formData, required: checked })}
                />
                <Label htmlFor="required">Required</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingAttribute ? 'Update' : 'Create'} Attribute
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
