"use client"

import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, PieChart, Activity } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col">
      <PageHeader title="Analytics" description="Advanced analytics and reporting for your oil & gas operations">
        <Button>
          <BarChart3 className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </PageHeader>

      <div className="flex-1 space-y-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Production Analytics
              </CardTitle>
              <CardDescription>Track production trends and efficiency metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Production charts coming soon</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-blue-600" />
                Revenue Breakdown
              </CardTitle>
              <CardDescription>Analyze revenue by well, region, and time period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Revenue analytics coming soon</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                Performance Metrics
              </CardTitle>
              <CardDescription>Monitor KPIs and operational efficiency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Performance metrics coming soon</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
