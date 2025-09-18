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
import { Textarea } from "@/components/ui/textarea"

export default function CustomLabelPage() {
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
                <h1 className="text-3xl font-bold">Custom Label Creator</h1>
                <p className="text-muted-foreground">Create and customize your own labels</p>
              </div>
              
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Label Details</CardTitle>
                    <CardDescription>
                      Enter the information for your custom label
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="label-name">Label Name</Label>
                        <Input id="label-name" placeholder="Enter label name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="label-type">Label Type</Label>
                        <Input id="label-type" placeholder="Enter label type" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="label-description">Description</Label>
                      <Textarea 
                        id="label-description" 
                        placeholder="Enter label description"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button>Create Label</Button>
                      <Button variant="outline">Preview</Button>
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
