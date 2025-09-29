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
import { ProductsDataTable, Product } from "@/components/products-data-table"
import { useState, useEffect } from "react"

interface Attribute {
  id: number
  name: string
  label: string
  priority: number
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [loading, setLoading] = useState(true)
  const [isFlushing, setIsFlushing] = useState(false)

  // Fetch products
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (!response.ok) {
        console.error('Failed to fetch products:', await response.text())
        setProducts([])
        return
      }
      const data = await response.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

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
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchAttributes()
  }, [])

  // Handle flush products
  const handleFlushProducts = async () => {
    if (!confirm('Are you sure you want to delete ALL products? This action cannot be undone.')) {
      return
    }

    setIsFlushing(true)
    try {
      const response = await fetch('/api/products/flush', {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('All products have been deleted successfully!')
        await fetchProducts() // Refresh the list
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete products')
      }
    } catch (error) {
      console.error('Error flushing products:', error)
      alert('Failed to delete products')
    } finally {
      setIsFlushing(false)
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
                <h1 className="text-3xl font-bold">Products Management</h1>
                <p className="text-muted-foreground">Manage your product catalog and labels</p>
              </div>
              
              <div className="px-4 lg:px-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2">
                    <Input placeholder="Search products..." className="w-64" />
                    <Button variant="outline">Filter</Button>
                    <Button variant="outline">Export</Button>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="destructive" 
                      onClick={handleFlushProducts}
                      disabled={isFlushing || products.length === 0}
                    >
                      {isFlushing ? 'Flushing...' : 'Debug: Flush Products'}
                    </Button>
                    <Button>Add Product</Button>
                  </div>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Product List</CardTitle>
                    <CardDescription>Manage your product inventory and labeling</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8">Loading products...</div>
                    ) : products.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No products found. Import some products from CSV to get started.
                      </div>
                    ) : (
                      <ProductsDataTable data={products} attributes={attributes} />
                    )}
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