"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Page() {
  const supabase = createClient()
  const router = useRouter()
  
  // Estados para el formulario de Login
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // --- INICIO: Estados para el formulario de reseteo de contraseña ---
  const [resetEmail, setResetEmail] = useState("")
  const [isSubmittingReset, setIsSubmittingReset] = useState(false)
  const [resetMessage, setResetMessage] = useState("")
  const [resetError, setResetError] = useState("")
  // --- FIN: Estados para el formulario de reseteo de contraseña ---

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      // Redirección exitosa, router.refresh() en un layout superior se encargará
      // de actualizar la UI si es necesario.
      router.push("/dashboard") // O la ruta a la que quieras ir post-login
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }
  
  // --- INICIO: Función para manejar la solicitud de reseteo ---
  const handlePasswordResetRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmittingReset(true)
    setResetMessage("")
    setResetError("")

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setResetError(error.message)
    } else {
      setResetMessage("Si existe una cuenta con este correo, recibirás un enlace para restablecer tu contraseña.")
    }
    setIsSubmittingReset(false)
  }
  // --- FIN: Función para manejar la solicitud de reseteo ---

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          {/* Card de Login (código original) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>Enter your email below to login to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link href="/auth/sign-up" className="underline underline-offset-4">
                    Sign up
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* --- INICIO: Card para "Olvidé mi contraseña" --- */}
          <Card>
            <CardHeader>
              <CardTitle>Forgot Password?</CardTitle>
              <CardDescription>
                Enter your email address and we will send you a link to reset your password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordResetRequest}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                    />
                  </div>
                  {resetMessage && <p className="text-sm text-green-500">{resetMessage}</p>}
                  {resetError && <p className="text-sm text-red-500">{resetError}</p>}
                  <Button type="submit" className="w-full" disabled={isSubmittingReset}>
                    {isSubmittingReset ? "Sending..." : "Send Reset Link"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          {/* --- FIN: Card para "Olvidé mi contraseña" --- */}
        </div>
      </div>
    </div>
  )
}

