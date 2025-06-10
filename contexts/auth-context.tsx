"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase" // Import the singleton instance directly
import type { User, Session } from "@supabase/supabase-js"

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
  const [initialized, setInitialized] = useState(false)

  // Prevent multiple simultaneous auth calls
  const authCallInProgress = useRef(false)
  const mountedRef = useRef(true)
  const subscriptionRef = useRef<any>(null)

  useEffect(() => {
    mountedRef.current = true

    // Prevent multiple initialization calls
    if (initialized || authCallInProgress.current) {
      return
    }

    const initializeAuth = async () => {
      if (authCallInProgress.current) return

      authCallInProgress.current = true

      try {
        console.log("Initializing auth...")

        // Get initial session without triggering auth state change
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (!mountedRef.current) return

        if (error) {
          console.error("Error getting initial session:", error)
        } else {
          console.log("Initial session:", session?.user?.email || "No user")
          setSession(session)
          setUser(session?.user ?? null)
        }

        setInitialized(true)
      } catch (error) {
        console.error("Error in initializeAuth:", error)
      } finally {
        if (mountedRef.current) {
          setLoading(false)
          authCallInProgress.current = false
        }
      }
    }

    // Set up auth state listener only once
    if (!subscriptionRef.current) {
      console.log("Setting up auth state listener...")

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mountedRef.current) return

        console.log("Auth state changed:", event, session?.user?.email || "No user")

        setSession(session)
        setUser(session?.user ?? null)

        if (!initialized) {
          setInitialized(true)
        }

        setLoading(false)
      })

      subscriptionRef.current = subscription
    }

    // Initialize auth after setting up listener
    initializeAuth()

    return () => {
      mountedRef.current = false
      if (subscriptionRef.current) {
        console.log("Cleaning up auth subscription...")
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
    }
  }, []) // Remove initialized from dependencies to prevent re-initialization

  const signIn = async (email: string, password: string) => {
    if (authCallInProgress.current) {
      return { error: new Error("Authentication in progress") }
    }

    authCallInProgress.current = true

    try {
      console.log("Signing in user:", email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Sign in error:", error)
        return { error }
      }

      console.log("Sign in successful:", data.user?.email)
      return { error: null }
    } catch (error) {
      console.error("Sign in exception:", error)
      return { error }
    } finally {
      authCallInProgress.current = false
    }
  }

  const signUp = async (email: string, password: string) => {
    if (authCallInProgress.current) {
      return { error: new Error("Authentication in progress") }
    }

    authCallInProgress.current = true

    try {
      console.log("Signing up user:", email)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        console.error("Sign up error:", error)
        return { error }
      }

      console.log("Sign up successful:", data.user?.email)
      return { error: null }
    } catch (error) {
      console.error("Sign up exception:", error)
      return { error }
    } finally {
      authCallInProgress.current = false
    }
  }

  const signOut = async () => {
    if (authCallInProgress.current) return

    authCallInProgress.current = true

    try {
      console.log("Signing out user...")

      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Sign out error:", error)
      } else {
        console.log("Sign out successful")
      }
    } catch (error) {
      console.error("Sign out exception:", error)
    } finally {
      authCallInProgress.current = false
    }
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
