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

  // Development mode flag
  const isDev = process.env.NODE_ENV === "development"

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
        if (isDev) {
          console.log("AuthProvider: Initializing auth...")
        }

        // Get initial session without triggering auth state change
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (!mountedRef.current) return

        if (error) {
          console.error("Error getting initial session:", error)
          if (isDev) {
            console.log("AuthProvider: Session error details:", {
              message: error.message,
              status: error.status,
              name: error.name,
            })
          }
        } else {
          if (isDev) {
            console.log("AuthProvider: Initial session:", session?.user?.email || "No user")
          }
          setSession(session)
          setUser(session?.user ?? null)
        }

        setInitialized(true)
      } catch (error) {
        console.error("Error in initializeAuth:", error)
        if (isDev) {
          console.log("AuthProvider: Initialization error details:", error)
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false)
          authCallInProgress.current = false
        }
      }
    }

    // Set up auth state listener only once
    if (!subscriptionRef.current) {
      if (isDev) {
        console.log("AuthProvider: Setting up auth state listener...")
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mountedRef.current) return

        if (isDev) {
          console.log("AuthProvider: Auth state changed:", event, session?.user?.email || "No user")
        }

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
        if (isDev) {
          console.log("AuthProvider: Cleaning up auth subscription...")
        }
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
    }
  }, [isDev]) // Add isDev to dependencies

  const signIn = async (email: string, password: string) => {
    if (authCallInProgress.current) {
      return { error: new Error("Authentication in progress") }
    }

    authCallInProgress.current = true

    try {
      if (isDev) {
        console.log("AuthProvider: Signing in user:", email)
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Sign in error:", error)
        if (isDev) {
          console.log("AuthProvider: Sign in error details:", {
            message: error.message,
            status: error.status,
            name: error.name,
          })
        }
        return { error }
      }

      if (isDev) {
        console.log("AuthProvider: Sign in successful:", data.user?.email)
      }
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
      if (isDev) {
        console.log("AuthProvider: Signing up user:", email)
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        console.error("Sign up error:", error)
        return { error }
      }

      if (isDev) {
        console.log("AuthProvider: Sign up successful:", data.user?.email)
      }
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
      if (isDev) {
        console.log("AuthProvider: Signing out user...")
      }

      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Sign out error:", error)
      } else if (isDev) {
        console.log("AuthProvider: Sign out successful")
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
