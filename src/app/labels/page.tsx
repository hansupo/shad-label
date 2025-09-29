"use client"

import { useState, useEffect } from "react"
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
import { LabelTemplateDialog } from "@/components/label-template-dialog"

interface LabelTemplate {
  id: number
  name: string
  html: string
  createdAt: string
  updatedAt: string
}

export default function LabelsPage() {
  const [templates, setTemplates] = useState<LabelTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<LabelTemplate | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/label-templates")
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error("Error fetching templates:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = async (templateData: Omit<LabelTemplate, "id" | "createdAt" | "updatedAt">) => {
    try {
      const response = await fetch("/api/label-templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(templateData),
      })

      if (response.ok) {
        await fetchTemplates()
      }
    } catch (error) {
      console.error("Error creating template:", error)
    }
  }

  const handleUpdateTemplate = async (templateData: Omit<LabelTemplate, "id" | "createdAt" | "updatedAt">) => {
    if (!editingTemplate) return

    try {
      const response = await fetch(`/api/label-templates/${editingTemplate.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(templateData),
      })

      if (response.ok) {
        await fetchTemplates()
        setEditingTemplate(null)
      }
    } catch (error) {
      console.error("Error updating template:", error)
    }
  }

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm("Are you sure you want to delete this template?")) return

    try {
      const response = await fetch(`/api/label-templates/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchTemplates()
      }
    } catch (error) {
      console.error("Error deleting template:", error)
    }
  }

  const handleDuplicateTemplate = async (template: LabelTemplate) => {
    const duplicatedTemplate = {
      name: `${template.name} (Copy)`,
      html: template.html,
    }
    await handleCreateTemplate(duplicatedTemplate)
  }

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
                <h1 className="text-3xl font-bold">Label Templates</h1>
                <p className="text-muted-foreground">Create and manage your label templates</p>
              </div>
              
              <div className="px-4 lg:px-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Search templates..." 
                      className="w-64" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button variant="outline">Filter</Button>
                  </div>
                  <Button onClick={() => setDialogOpen(true)}>
                    Create New Template
                  </Button>
                </div>
                
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading templates...
                  </div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No templates found.</p>
                    <p className="text-sm mt-2">Create your first template to get started.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTemplates.map((template) => (
                      <Card key={template.id}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            {template.name}
                            <Badge variant="secondary">Active</Badge>
                          </CardTitle>
                          <CardDescription>
                            Created {new Date(template.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setEditingTemplate(template)
                                setDialogOpen(true)
                              }}
                            >
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDuplicateTemplate(template)}
                            >
                              Duplicate
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleDeleteTemplate(template.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
      
      <LabelTemplateDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) {
            setEditingTemplate(null)
          }
        }}
        template={editingTemplate}
        onSave={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
      />
    </SidebarProvider>
  )
}
