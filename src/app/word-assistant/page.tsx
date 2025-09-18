import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Wand2 } from "lucide-react"

export default function WordAssistantPage() {
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
                <h1 className="text-3xl font-bold">Word Assistant</h1>
                <p className="text-muted-foreground">AI-powered text generation and editing for labels</p>
              </div>
              
              <div className="px-4 lg:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Wand2 className="h-5 w-5" />
                        Text Generator
                      </CardTitle>
                      <CardDescription>
                        Generate label text using AI assistance
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Product Description</label>
                        <Textarea 
                          placeholder="Enter product details..."
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Label Type</label>
                        <Input placeholder="e.g., Product Label, Warning Label" />
                      </div>
                      <Button className="w-full">
                        <Wand2 className="h-4 w-4 mr-2" />
                        Generate Text
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Generated Content
                      </CardTitle>
                      <CardDescription>
                        Review and edit the generated text
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="min-h-[200px] p-4 border rounded-lg bg-gray-50">
                        <p className="text-sm text-gray-500">
                          Generated text will appear here...
                        </p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="outline">Copy</Button>
                        <Button size="sm">Use Text</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Recent Generations</CardTitle>
                    <CardDescription>Your recent AI-generated label texts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No recent generations. Start creating to see your history here.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
