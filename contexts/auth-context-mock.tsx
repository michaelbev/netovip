"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User, Session } from "@supabase/supabase-js"

// Mock user data for demo
const MOCK_USER: User = {
  id: "demo-user-123",
  email: "demo@oilgasaccounting.com",
  user_metadata: {
    full_name: "Demo User",
    company: "Demo Oil & Gas Company",
  },
  app_metadata: {},
  aud: "authenticated",
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
  email_confirmed_at: "2024-01-01T00:00:00.000Z",
  last_sign_in_at: "2024-01-01T00:00:00.000Z",
  role: "authenticated",
  confirmation_sent_at: "2024-01-01T00:00:00.000Z",
}

const MOCK_SESSION: Session = {
  access_token: "demo-access-token",
  refresh_token: "demo-refresh-token",
  expires_in: 3600,
  expires_at: Date.now() / 1000 + 3600,
  token_type: "bearer",
  user: MOCK_USER,
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading then set mock data
    const timer = setTimeout(() => {
      setUser(MOCK_USER)
      setSession(MOCK_SESSION)
      setLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    setUser(MOCK_USER)
    setSession(MOCK_SESSION)
    setLoading(false)
    return { error: null }
  }

  const signUp = async (email: string, password: string) => {
    setLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    setUser(MOCK_USER)
    setSession(MOCK_SESSION)
    setLoading(false)
    return { error: null }
  }

  const signOut = async () => {
    // For demo, don't actually sign out
    console.log("Mock sign out - staying signed in for demo")
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
