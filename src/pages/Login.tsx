import * as React from "react"
import { Sparkles } from "lucide-react"
import { Navigate, useLocation, useNavigate } from "react-router-dom"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { AuthApiError } from "@/lib/auth-client"
import { useAuth } from "@/lib/auth-context"

export function Login() {
  const { user, isLoading, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  if (!isLoading && user) {
    const from = (location.state as { from?: Location })?.from?.pathname ?? "/dashboard"
    return <Navigate to={from} replace />
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await login(email, password)
      navigate("/dashboard", { replace: true })
    } catch (err) {
      setError(
        err instanceof AuthApiError
          ? err.message
          : "Something went wrong. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4.5" />
          </span>
          <h1 className="font-heading text-xl font-semibold">Cafis Admin</h1>
          <p className="text-sm text-muted-foreground">
            Sign in with your administrator account
          </p>
        </div>

        <Card className="ring-foreground/10">
          <CardContent>
            <form onSubmit={handleSubmit} noValidate>
              <FieldGroup>
                {error ? (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}

                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@cafis.app"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </Field>

                <Field>
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? <Spinner /> : null}
                    Sign in
                  </Button>
                  <FieldDescription className="text-center">
                    Admin accounts are provisioned by your team, not self-service.
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Login
