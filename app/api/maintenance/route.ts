import { NextResponse } from "next/server"

// Mock maintenance data for demo
const MOCK_MAINTENANCE = [
  {
    id: "maint-1",
    maintenance_type: "Routine Inspection",
    priority: "medium",
    status: "completed",
    scheduled_date: "2024-01-10",
    completed_date: "2024-01-10",
    description: "Monthly well head inspection and pressure check",
    cost: 850,
    well_id: "well-1",
    wells: { name: "Eagle Ford #23" },
  },
  {
    id: "maint-2",
    maintenance_type: "Pump Replacement",
    priority: "high",
    status: "in_progress",
    scheduled_date: "2024-01-15",
    completed_date: null,
    description: "Replace failing downhole pump - urgent repair needed",
    cost: 12500,
    well_id: "well-2",
    wells: { name: "Permian #18" },
  },
  {
    id: "maint-3",
    maintenance_type: "Valve Maintenance",
    priority: "low",
    status: "scheduled",
    scheduled_date: "2024-01-20",
    completed_date: null,
    description: "Routine valve lubrication and testing",
    cost: 450,
    well_id: "well-3",
    wells: { name: "Bakken #31" },
  },
  {
    id: "maint-4",
    maintenance_type: "Safety Inspection",
    priority: "high",
    status: "overdue",
    scheduled_date: "2024-01-05",
    completed_date: null,
    description: "Annual safety equipment inspection - overdue",
    cost: 1200,
    well_id: "well-1",
    wells: { name: "Eagle Ford #23" },
  },
  {
    id: "maint-5",
    maintenance_type: "Flowline Repair",
    priority: "medium",
    status: "completed",
    scheduled_date: "2024-01-08",
    completed_date: "2024-01-09",
    description: "Repair minor leak in production flowline",
    cost: 2800,
    well_id: "well-3",
    wells: { name: "Bakken #31" },
  },
  {
    id: "maint-6",
    maintenance_type: "Equipment Calibration",
    priority: "medium",
    status: "scheduled",
    scheduled_date: "2024-01-25",
    completed_date: null,
    description: "Calibrate pressure gauges and flow meters",
    cost: 650,
    well_id: "well-2",
    wells: { name: "Permian #18" },
  },
]

export async function GET() {
  try {
    // Check if we're in demo mode
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

    if (isDemoMode) {
      // Simulate API delay for realistic demo experience
      await new Promise((resolve) => setTimeout(resolve, 500))

      return NextResponse.json({
        maintenance: MOCK_MAINTENANCE,
        message: "Demo data loaded successfully",
      })
    }

    // In production, this would connect to real database
    // For now, return mock data regardless
    return NextResponse.json({
      maintenance: MOCK_MAINTENANCE,
      message: "Mock data loaded (replace with real database connection)",
    })
  } catch (error) {
    console.error("Maintenance API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch maintenance records",
        maintenance: MOCK_MAINTENANCE, // Fallback to mock data
      },
      { status: 200 }, // Return 200 with fallback data for demo
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // In demo mode, simulate adding maintenance
    const newMaintenance = {
      id: `maint-${Date.now()}`,
      ...body,
      wells: { name: body.well_name || "Demo Well" },
    }

    return NextResponse.json({
      success: true,
      maintenance: newMaintenance,
      message: "Maintenance scheduled successfully (demo mode)",
    })
  } catch (error) {
    console.error("Error creating maintenance:", error)
    return NextResponse.json({ error: "Failed to schedule maintenance" }, { status: 500 })
  }
}
