import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, FileText, Tag, Package } from "lucide-react"

export default function SearchPage() {
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
                <h1 className="text-3xl font-bold">Search</h1>
                <p className="text-muted-foreground">Search across all your labels, products, and attributes</p>
              </div>
              
              <div className="px-4 lg:px-6">
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input 
                      placeholder="Search labels, products, attributes..." 
                      className="pl-10 w-full max-w-2xl"
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                    <Button variant="outline" size="sm">Recent</Button>
                    <Button variant="outline" size="sm">Saved</Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Labels
                      </CardTitle>
                      <CardDescription>Search results for labels</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Tag className="h-4 w-4 text-gray-400" />
                            <div>
                              <h4 className="font-medium">Product Label Template</h4>
                              <p className="text-sm text-muted-foreground">Standard product identification label</p>
                            </div>
                          </div>
                          <Badge variant="secondary">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Tag className="h-4 w-4 text-gray-400" />
                            <div>
                              <h4 className="font-medium">Shipping Label</h4>
                              <p className="text-sm text-muted-foreground">Shipping and delivery information</p>
                            </div>
                          </div>
                          <Badge variant="secondary">Active</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Products
                      </CardTitle>
                      <CardDescription>Search results for products</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Package className="h-4 w-4 text-gray-400" />
                            <div>
                              <h4 className="font-medium">Sample Product 1</h4>
                              <p className="text-sm text-muted-foreground">SKU: SP001 | Electronics</p>
                            </div>
                          </div>
                          <Badge variant="secondary">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Package className="h-4 w-4 text-gray-400" />
                            <div>
                              <h4 className="font-medium">Sample Product 2</h4>
                              <p className="text-sm text-muted-foreground">SKU: SP002 | Clothing</p>
                            </div>
                          </div>
                          <Badge variant="outline">Draft</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
