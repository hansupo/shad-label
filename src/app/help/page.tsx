import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Book, MessageCircle, Mail, Search } from "lucide-react"

export default function HelpPage() {
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
                <h1 className="text-3xl font-bold">Get Help</h1>
                <p className="text-muted-foreground">Find answers and get support for your label management needs</p>
              </div>
              
              <div className="px-4 lg:px-6">
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input 
                      placeholder="Search help articles..." 
                      className="pl-10 w-full max-w-md"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Book className="h-5 w-5" />
                        Documentation
                      </CardTitle>
                      <CardDescription>
                        Comprehensive guides and tutorials
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">
                          Getting Started Guide
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          Label Creation Tutorial
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          API Reference
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Community
                      </CardTitle>
                      <CardDescription>
                        Connect with other users
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">
                          Community Forum
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          Feature Requests
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          Bug Reports
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Contact Support
                      </CardTitle>
                      <CardDescription>
                        Get direct help from our team
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">
                          Email Support
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          Live Chat
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          Schedule Call
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                    <CardDescription>Quick answers to common questions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">How do I create a custom label?</h4>
                      <p className="text-sm text-muted-foreground">
                        Use the &quot;Custom Label&quot; button in the sidebar to access the label creator tool.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Can I import data from CSV files?</h4>
                      <p className="text-sm text-muted-foreground">
                        Yes, use the &quot;Import CSV&quot; button to upload and process CSV data.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">How do I manage product attributes?</h4>
                      <p className="text-sm text-muted-foreground">
                        Navigate to the &quot;Attributes&quot; section to create and manage product attributes.
                      </p>
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
