"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building2, Save, MapPin, Phone, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CompanyData {
  id: string
  name: string
  email: string | null
  phone: string | null
  website: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
  tax_id: string | null
  industry: string | null
  description: string | null
  operator_id: string | null
  rrc_number: string | null
  federal_id: string | null
  insurance_provider: string | null
  emergency_contact: string | null
  created_at: string
  updated_at: string
}

export default function CompanySettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<CompanyData>>({})

  // Fetch company data
  useEffect(() => {
    async function fetchCompanyData() {
      if (!user) return

      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/company", {
          method: "GET",
          credentials: "include",
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `HTTP error ${response.status}`)
        }

        const data = await response.json()
        setCompany(data.company)
        setFormData(data.company || {})
      } catch (err: any) {
        console.error("Failed to fetch company data:", err)
        setError(err.message || "Failed to load company data")
      } finally {
        setLoading(false)
      }
    }

    fetchCompanyData()
  }, [user])

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id.replace("company-", "")]: value }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    try {
      setSaving(true)

      const response = await fetch("/api/company", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error ${response.status}`)
      }

      const data = await response.json()
      setCompany(data.company)

      toast({
        title: "Success",
        description: "Company information updated successfully",
      })
    } catch (err: any) {
      console.error("Failed to update company data:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to update company information",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading company information...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="h-8 w-8 text-destructive mb-4" />
        <h3 className="text-lg font-medium mb-2">Failed to load company data</h3>
        <p className="text-muted-foreground text-center max-w-md">{error}</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="h-8 w-8 text-amber-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">No Company Found</h3>
        <p className="text-muted-foreground text-center max-w-md">
          You don't have a company associated with your account. Please contact your administrator.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <PageHeader title="Company Settings" description="Manage your company information and preferences">
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </PageHeader>

      <div className="flex-1 space-y-4 p-4">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Company Information
              </CardTitle>
              <CardDescription>Basic company details and identification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input id="company-name" value={formData.name || ""} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-tax_id">Tax ID / EIN</Label>
                <Input id="company-tax_id" value={formData.tax_id || ""} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-industry">Industry</Label>
                <Input id="company-industry" value={formData.industry || ""} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-description">Company Description</Label>
                <Textarea
                  id="company-description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contact Information
              </CardTitle>
              <CardDescription>Primary contact details for your company</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-phone">Phone Number</Label>
                <Input id="company-phone" value={formData.phone || ""} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-email">Email Address</Label>
                <Input id="company-email" type="email" value={formData.email || ""} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-website">Website</Label>
                <Input id="company-website" value={formData.website || ""} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-emergency_contact">Emergency Contact</Label>
                <Input
                  id="company-emergency_contact"
                  value={formData.emergency_contact || ""}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Address Information
              </CardTitle>
              <CardDescription>Physical and mailing address details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-address">Street Address</Label>
                <Input id="company-address" value={formData.address || ""} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-city">City</Label>
                  <Input id="company-city" value={formData.city || ""} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-state">State</Label>
                  <Input id="company-state" value={formData.state || ""} onChange={handleChange} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-zip">ZIP Code</Label>
                  <Input id="company-zip" value={formData.zip || ""} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-country">Country</Label>
                  <Input id="company-country" value={formData.country || ""} onChange={handleChange} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Regulatory Information */}
          <Card>
            <CardHeader>
              <CardTitle>Regulatory Information</CardTitle>
              <CardDescription>Compliance and regulatory details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-operator_id">Operator ID</Label>
                <Input id="company-operator_id" value={formData.operator_id || ""} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-rrc_number">Railroad Commission Number</Label>
                <Input id="company-rrc_number" value={formData.rrc_number || ""} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-federal_id">Federal Operator ID</Label>
                <Input id="company-federal_id" value={formData.federal_id || ""} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-insurance_provider">Insurance Provider</Label>
                <Input
                  id="company-insurance_provider"
                  value={formData.insurance_provider || ""}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
