"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Mail, UserPlus, UserX, Shield, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react"

export default function TeamManagementPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [invitations, setInvitations] = useState<any[]>([])
  const [newInvite, setNewInvite] = useState({ email: "", role: "viewer" })
  const [userProfile, setUserProfile] = useState<any>(null)
  const [companyData, setCompanyData] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [envError, setEnvError] = useState(false)

  useEffect(() => {
    // Check if environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setEnvError(true)
      setLoading(false)
      return
    }

    async function fetchData() {
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error("Not authenticated")

        // Get user profile with company_id
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        setUserProfile(profile)

        if (!profile?.company_id) throw new Error("No company associated")

        // Get company data
        const { data: company } = await supabase.from("companies").select("*").eq("id", profile.company_id).single()

        setCompanyData(company)

        // Get all users in the company
        const { data: companyUsers } = await supabase.from("profiles").select("*").eq("company_id", profile.company_id)

        setUsers(companyUsers || [])

        // Get pending invitations
        const { data: pendingInvites } = await supabase
          .from("tenant_invitations")
          .select("*")
          .eq("company_id", profile.company_id)

        setInvitations(pendingInvites || [])
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleInviteUser = async () => {
    if (!newInvite.email || !userProfile?.company_id) return

    setLoading(true)
    try {
      // Generate a unique token
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

      // Set expiration to 7 days from now
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      // Create invitation
      const { data, error } = await supabase
        .from("tenant_invitations")
        .insert({
          company_id: userProfile.company_id,
          email: newInvite.email,
          role: newInvite.role,
          token: token,
          expires_at: expiresAt.toISOString(),
          created_by: userProfile.id,
        })
        .select()

      if (error) throw error

      // In a real app, you would send an email with the invitation link
      // For now, we'll just show the token
      toast({
        title: "Invitation created",
        description: `Invitation sent to ${newInvite.email}. Token: ${token}`,
      })

      // Update invitations list
      setInvitations([...(data || []), ...invitations])
      setNewInvite({ email: "", role: "viewer" })
      setIsDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveUser = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this user?")) return

    setLoading(true)
    try {
      // Update the user's profile to remove company association
      const { error } = await supabase.from("profiles").update({ company_id: null }).eq("id", userId)

      if (error) throw error

      toast({
        title: "User removed",
        description: "User has been removed from your company",
      })

      // Update users list
      setUsers(users.filter((user) => user.id !== userId))
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.from("tenant_invitations").delete().eq("id", invitationId)

      if (error) throw error

      toast({
        title: "Invitation cancelled",
        description: "The invitation has been cancelled",
      })

      // Update invitations list
      setInvitations(invitations.filter((invite) => invite.id !== invitationId))
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId)

      if (error) throw error

      toast({
        title: "Role updated",
        description: "User role has been updated",
      })

      // Update users list
      setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-red-500">
            <ShieldAlert className="w-3 h-3 mr-1" /> Admin
          </Badge>
        )
      case "accountant":
        return (
          <Badge className="bg-purple-500">
            <ShieldCheck className="w-3 h-3 mr-1" /> Accountant
          </Badge>
        )
      case "operator":
        return (
          <Badge className="bg-blue-500">
            <Shield className="w-3 h-3 mr-1" /> Operator
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-500">
            <ShieldQuestion className="w-3 h-3 mr-1" /> Viewer
          </Badge>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  if (envError) {
    return (
      <div className="container mx-auto py-6 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Environment Error</CardTitle>
            <CardDescription>Missing Supabase configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-yellow-100 text-yellow-800 rounded-md text-sm">
              <p className="font-medium">Environment variables not configured.</p>
              <p className="mt-2">Please set the following environment variables in your Vercel project:</p>
              <ul className="list-disc pl-5 mt-2">
                <li>NEXT_PUBLIC_SUPABASE_URL</li>
                <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
          <p className="text-gray-500">Manage users and permissions for {companyData?.name}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to join your company. They'll receive instructions to create an account.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={newInvite.email}
                  onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newInvite.role} onValueChange={(value) => setNewInvite({ ...newInvite, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="accountant">Accountant</SelectItem>
                    <SelectItem value="operator">Operator</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleInviteUser} disabled={!newInvite.email}>
                <Mail className="mr-2 h-4 w-4" />
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Users with access to {companyData?.name} ({users.length}/{companyData?.max_users || "∞"})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name || "Unnamed User"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.id === userProfile?.id ? (
                      getRoleBadge(user.role)
                    ) : (
                      <Select
                        defaultValue={user.role}
                        onValueChange={(value) => handleUpdateUserRole(user.id, value)}
                        disabled={userProfile?.role !== "admin"}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder={user.role} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="accountant">Accountant</SelectItem>
                          <SelectItem value="operator">Operator</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.id !== userProfile?.id && userProfile?.role === "admin" && (
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveUser(user.id)}>
                        <UserX className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>Invitations that have been sent but not yet accepted</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell className="font-medium">{invite.email}</TableCell>
                    <TableCell>{getRoleBadge(invite.role)}</TableCell>
                    <TableCell>{new Date(invite.expires_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleCancelInvitation(invite.id)}>
                        Cancel
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
