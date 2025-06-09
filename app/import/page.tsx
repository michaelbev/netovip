"use client"

import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, Database, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react"

export default function ImportPage() {
  const importTypes = [
    {
      title: "Well Data",
      description: "Import well information, locations, and specifications",
      icon: Database,
      format: "CSV, Excel",
      status: "Ready",
    },
    {
      title: "Production Data",
      description: "Upload monthly production volumes and metrics",
      icon: FileSpreadsheet,
      format: "CSV, Excel",
      status: "Ready",
    },
    {
      title: "Revenue Data",
      description: "Import revenue transactions and payments",
      icon: Database,
      format: "CSV, Excel",
      status: "Ready",
    },
    {
      title: "Owner Information",
      description: "Upload owner details and ownership percentages",
      icon: FileSpreadsheet,
      format: "CSV, Excel",
      status: "Ready",
    },
    {
      title: "Expense Records",
      description: "Import operational expenses and costs",
      icon: Database,
      format: "CSV, Excel",
      status: "Ready",
    },
  ]

  const recentImports = [
    {
      id: 1,
      type: "Production Data",
      file: "production_dec_2023.csv",
      status: "Completed",
      date: "2024-01-15",
      records: 245,
    },
    {
      id: 2,
      type: "Revenue Data",
      file: "revenue_dec_2023.xlsx",
      status: "Completed",
      date: "2024-01-14",
      records: 89,
    },
    { id: 3, type: "Well Data", file: "new_wells_q4.csv", status: "Failed", date: "2024-01-13", records: 0 },
    {
      id: 4,
      type: "Owner Information",
      file: "owners_update.xlsx",
      status: "Processing",
      date: "2024-01-12",
      records: 156,
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "Failed":
        return <AlertCircle className="w-4 h-4 text-red-600" />
      case "Processing":
        return <Database className="w-4 h-4 text-blue-600" />
      default:
        return <Database className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="flex flex-col">
      <PageHeader title="Data Import" description="Import data from external sources and files">
        <Button>
          <Upload className="w-4 h-4 mr-2" />
          Upload File
        </Button>
      </PageHeader>

      <div className="flex-1 space-y-4 p-4">
        {/* Import Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {importTypes.map((importType, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <importType.icon className="w-5 h-5 text-blue-600" />
                  {importType.title}
                </CardTitle>
                <CardDescription>{importType.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Supported Formats:</span>
                    <Badge variant="outline">{importType.format}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge variant="default">{importType.status}</Badge>
                  </div>
                  <Button className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Import {importType.title}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Imports */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Imports</CardTitle>
            <CardDescription>Track the status of your recent data imports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentImports.map((importItem) => (
                <div key={importItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(importItem.status)}
                    <div>
                      <p className="font-medium">{importItem.file}</p>
                      <p className="text-sm text-gray-600">{importItem.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        importItem.status === "Completed"
                          ? "default"
                          : importItem.status === "Failed"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {importItem.status}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1">
                      {importItem.records} records • {importItem.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
