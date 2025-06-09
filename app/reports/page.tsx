"use client"

import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Calendar, BarChart3, PieChart, TrendingUp } from "lucide-react"

export default function ReportsPage() {
  const reportTypes = [
    {
      title: "Production Report",
      description: "Monthly production summary by well and region",
      icon: BarChart3,
      frequency: "Monthly",
      lastGenerated: "2024-01-15",
      status: "Available",
    },
    {
      title: "Revenue Report",
      description: "Detailed revenue breakdown and analysis",
      icon: TrendingUp,
      frequency: "Monthly",
      lastGenerated: "2024-01-15",
      status: "Available",
    },
    {
      title: "Owner Distribution Report",
      description: "Distribution statements for all owners",
      icon: PieChart,
      frequency: "Monthly",
      lastGenerated: "2024-01-15",
      status: "Available",
    },
    {
      title: "Regulatory Compliance Report",
      description: "State and federal compliance documentation",
      icon: FileText,
      frequency: "Quarterly",
      lastGenerated: "2024-01-01",
      status: "Pending",
    },
    {
      title: "Tax Report",
      description: "Annual tax documentation and summaries",
      icon: Calendar,
      frequency: "Annual",
      lastGenerated: "2023-12-31",
      status: "Available",
    },
    {
      title: "Expense Analysis",
      description: "Operational expense breakdown and trends",
      icon: BarChart3,
      frequency: "Monthly",
      lastGenerated: "2024-01-15",
      status: "Available",
    },
  ]

  return (
    <div className="flex flex-col">
      <PageHeader title="Reports" description="Generate and download various business reports">
        <Button>
          <FileText className="w-4 h-4 mr-2" />
          Custom Report
        </Button>
      </PageHeader>

      <div className="flex-1 space-y-4 p-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Reports</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-gray-600">Ready for download</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">1</div>
              <p className="text-xs text-gray-600">In generation queue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Jan 15</div>
              <p className="text-xs text-gray-600">2024</p>
            </CardContent>
          </Card>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTypes.map((report, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <report.icon className="w-5 h-5 text-blue-600" />
                  {report.title}
                </CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Frequency:</span>
                    <Badge variant="outline">{report.frequency}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Last Generated:</span>
                    <span className="text-sm">{report.lastGenerated}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge variant={report.status === "Available" ? "default" : "secondary"}>{report.status}</Badge>
                  </div>
                  <Button
                    className="w-full"
                    variant={report.status === "Available" ? "default" : "secondary"}
                    disabled={report.status !== "Available"}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {report.status === "Available" ? "Download" : "Generate"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
