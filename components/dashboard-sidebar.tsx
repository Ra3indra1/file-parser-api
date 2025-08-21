"use client"
import { useState } from "react"
import { Files, Upload, History, Settings, BarChart3, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface DashboardSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  fileStats: {
    total: number
    processing: number
    completed: number
    failed: number
  }
  searchQuery: string
  onSearchChange: (query: string) => void
  className?: string
}

export function DashboardSidebar({
  activeSection,
  onSectionChange,
  fileStats,
  searchQuery,
  onSearchChange,
  className,
}: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  const navigationItems = [
    {
      id: "files",
      label: "My Files",
      icon: Files,
      badge: fileStats.total > 0 ? fileStats.total : undefined,
    },
    {
      id: "upload",
      label: "Upload",
      icon: Upload,
      badge: fileStats.processing > 0 ? fileStats.processing : undefined,
    },
    {
      id: "history",
      label: "History",
      icon: History,
      badge: fileStats.completed > 0 ? fileStats.completed : undefined,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
    },
  ]

  return (
    <div
      className={cn(
        "bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className,
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            {!collapsed && <h2 className="font-serif text-lg font-semibold text-sidebar-foreground">File Manager</h2>}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="p-4 border-b border-sidebar-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sidebar-foreground/50" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 bg-sidebar-primary border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/50"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id

              return (
                <li key={item.id}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                      collapsed && "justify-center px-2",
                    )}
                    onClick={() => onSectionChange(item.id)}
                  >
                    <Icon className={cn("h-4 w-4", !collapsed && "mr-3")} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </Button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer Stats */}
        {!collapsed && fileStats.total > 0 && (
          <div className="p-4 border-t border-sidebar-border">
            <div className="space-y-2 text-sm text-sidebar-foreground/70">
              <div className="flex justify-between">
                <span>Total Files:</span>
                <span className="font-medium">{fileStats.total}</span>
              </div>
              {fileStats.processing > 0 && (
                <div className="flex justify-between">
                  <span>Processing:</span>
                  <span className="font-medium text-accent">{fileStats.processing}</span>
                </div>
              )}
              {fileStats.completed > 0 && (
                <div className="flex justify-between">
                  <span>Completed:</span>
                  <span className="font-medium text-green-600">{fileStats.completed}</span>
                </div>
              )}
              {fileStats.failed > 0 && (
                <div className="flex justify-between">
                  <span>Failed:</span>
                  <span className="font-medium text-destructive">{fileStats.failed}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
