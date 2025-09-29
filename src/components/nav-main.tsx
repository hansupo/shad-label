"use client"

import { IconChevronRight, type Icon } from "@tabler/icons-react"
import { useMemo, useState } from "react"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {/* Removed special buttons; items now live in app-sidebar config */}
        <SidebarMenu>
          {items.map((item) => (
            <NavItem key={item.title} item={item} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

function NavItem({
  item,
}: {
  item: {
    title: string
    url: string
    icon?: Icon
    items?: { title: string; url: string }[]
  }
}) {
  const pathname = usePathname()
  const isActive = useMemo(() => {
    if (!pathname) return false
    // Exact match or the current path starts with the item's url for parent sections
    return pathname === item.url || (item.items && pathname.startsWith(item.url))
  }, [pathname, item.url, item.items])

  return (
    <SidebarMenuItem>
      {item.items ? (
        <NavMainSubMenu item={item} />
      ) : (
        <SidebarMenuButton asChild tooltip={item.title} className={isActive ? "bg-primary text-primary-foreground" : undefined}>
          <a href={item.url}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
          </a>
        </SidebarMenuButton>
      )}
    </SidebarMenuItem>
  )
}

function NavMainSubMenu({
  item,
}: {
  item: {
    title: string
    url: string
    icon?: Icon
    items?: {
      title: string
      url: string
    }[]
  }
}) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <SidebarMenuButton
        onClick={() => setIsOpen(!isOpen)}
        tooltip={item.title}
        className={pathname?.startsWith(item.url) ? "bg-primary text-primary-foreground" : undefined}
      >
        {item.icon && <item.icon />}
        <span>{item.title}</span>
        <IconChevronRight
          className={`ml-auto transition-transform duration-200 ${
            isOpen ? "rotate-90" : ""
          }`}
        />
      </SidebarMenuButton>
      {isOpen && (
        <SidebarMenuSub>
          {(item.items ?? []).map((subItem) => (
            <SidebarMenuSubItem key={subItem.title}>
              <SidebarMenuSubButton asChild className={pathname === subItem.url ? "bg-primary text-primary-foreground" : undefined}>
                <a href={subItem.url}>
                  <span>{subItem.title}</span>
                </a>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      )}
    </>
  )
}
