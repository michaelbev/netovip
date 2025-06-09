"use client"

import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, Building2, Users, Bell, Shield, Database, Palette } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const settingsCategories = [
    {
      title: "Company Settings",
      description: "Manage company information and business details",
      icon: Building2,
      href: "/settings/company",
      status: "Active",
    },
    {
      title: "Team Management",
      description: "Add and manage team members and permissions",
      icon: Users,
      href: "/settings/team",
      status: "Active",
    },
    {
      title: "Notifications",
      description: "Configure email and system notifications",
      icon: Bell,
      href: "/settings/notifications",
      status: "Coming Soon",
    },
    {
      title: "Security",
      description: "Manage security settings and access controls",
      icon: Shield,
      href: "/settings/security",
      status: "Coming Soon",
    },
    {
      title: "Data Management",
      description: "Configure data backup and export settings",
      icon: Database,
      href: "/settings/data",
      status: "Coming Soon",
    },
    {
      title: "Appearance",
      description: "Customize the look and feel of your dashboard",
      icon: Palette,
      href: "/settings/appearance",
      status: "Coming Soon",
    },
  ]

  return (
    <div className="flex flex-col">
      <PageHeader title="Settings" description="Manage your account and application preferences">
        <Button variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          Quick Setup
        </Button>
      </PageHeader>

      <div className="flex-1 space-y-4 p-4">
        {/* Settings Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Settings</CardTitle>
              <Settings className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-gray-600">Configured modules</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-gray-600">Active users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Score</CardTitle>
              <Shield className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">85%</div>
              <p className="text-xs text-gray-600">Good security level</p>
            </CardContent>
          </Card>
        </div>

        {/* Settings Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {settingsCategories.map((category, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <category.icon className="w-5 h-5 text-blue-600" />
                  {category.title}
                </CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <Badge variant={category.status === "Active" ? "default" : "secondary"}>{category.status}</Badge>
                </div>
                <Button
                  className="w-full"
                  variant={category.status === "Active" ? "default" : "secondary"}
                  disabled={category.status !== "Active"}
                  asChild={category.status === "Active"}
                >
                  {category.status === "Active" ? <Link href={category.href}>Configure</Link> : "Coming Soon"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common settings and configuration tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2" asChild>
                <Link href="/settings/company">
                  <Building2 className="w-6 h-6" />
                  <span>Update Company Info</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2" asChild>
                <Link href="/settings/team">
                  <Users className="w-6 h-6" />
                  <span>Manage Team</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2" disabled>
                <Bell className="w-6 h-6" />
                <span>Setup Notifications</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2" disabled>
                <Shield className="w-6 h-6" />
                <span>Security Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
