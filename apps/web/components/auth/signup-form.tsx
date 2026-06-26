"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import authClient from "@/lib/auth-client"

export function SignupForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedName = name.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName || !trimmedEmail || !password) {
      setError("Please fill in all required fields")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      const { data, error: signUpError } = await authClient.signUp.email({
        name: trimmedName,
        email: trimmedEmail,
        password,
      })

      if (signUpError || !data?.user) {
        setError(signUpError?.message ?? "Sign up failed")
        return
      }

      toast.success('Registration successful' ,{
        description:
          'You have successfully registered. Please check your email to verify your account.'
      });
      router.push("/register/success")
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message || "Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Sign Up for an Account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your details below to create a new account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <Input id="name" type="text" placeholder="John Doe" required value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <FieldDescription>
            We&apos;ll use this to contact you. We will not share your email
            with anyone else.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          <FieldDescription>
            Must be at least 8 characters long.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
          <Input id="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          <FieldDescription>Please confirm your password.</FieldDescription>
        </Field>
        <FieldGroup>
          <Field>
            <Button type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create Account'}</Button>
            <FieldDescription className="px-6 text-center">
              Already have an account? <Link href="/auth/login">Sign in</Link>
            </FieldDescription>
            {error && <div className="text-sm text-destructive mt-2">{error}</div>}
          </Field>
        </FieldGroup>
      </FieldGroup>
    </form>
  )
}
