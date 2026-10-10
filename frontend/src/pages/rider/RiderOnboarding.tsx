import * as React from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { useUser } from "@clerk/react"
import { Bike, Loader2, RefreshCw, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ROUTES } from "@/constants/routes"
import { useApi } from "@/lib/api"

interface RiderProfileResponse {
  plateNumber: string | null
  phoneNumber: string | null
  available: boolean
}

const PH_MOBILE_DIGITS = /^9\d{9}$/
const PHONE_CHARACTERS = /[^\d\s\-()+]/g

// Keeps the field forgiving while typing; the number is normalised to +63 on submit.
function sanitizePhoneInput(value: string) {
  return value.replace(PHONE_CHARACTERS, "").slice(0, 25)
}

// Reduces any accepted PH format (0917..., 917..., 63917..., +63 917...) to the
// 10-digit mobile number that is sent as +63.
function toLocalDigits(value: string) {
  let digits = value.replace(/\D/g, "")
  if (digits.startsWith("63")) digits = digits.slice(2)
  else if (digits.startsWith("0")) digits = digits.slice(1)
  return digits.slice(0, 10)
}

export default function RiderOnboarding() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { makeRequest } = useApi()
  const navigate = useNavigate()

  const [plateNumber, setPlateNumber] = React.useState("")
  const [phoneNumber, setPhoneNumber] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const alreadyOnboarded = user?.publicMetadata?.riderOnboarded === true

  React.useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    let isActive = true

    void (async () => {
      try {
        const profile = (await makeRequest("profile")) as RiderProfileResponse
        if (!isActive) return
        setPlateNumber(profile.plateNumber ?? "")
        setPhoneNumber(profile.phoneNumber ?? "")
      } catch {
        // No rider profile yet, start from an empty form.
      } finally {
        if (isActive) setIsLoading(false)
      }
    })()

    return () => {
      isActive = false
    }
  }, [isLoaded, isSignedIn, makeRequest])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const localDigits = toLocalDigits(phoneNumber)
    if (!PH_MOBILE_DIGITS.test(localDigits)) {
      setError("Enter a valid PH mobile number, e.g. +63 917 123 4567.")
      return
    }

    setIsSaving(true)
    setError(null)
    try {
      await makeRequest("profile", {
        method: "PUT",
        body: JSON.stringify({
          plate_number: plateNumber.trim(),
          phone_number: `+63${localDigits}`,
        }),
      })
      await user?.reload()
      navigate(ROUTES.RIDER_DASHBOARD, { replace: true })
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save your rider profile."
      )
      setIsSaving(false)
    }
  }

  if (!isLoaded) {
    return (
      <section className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <RefreshCw size={16} className="animate-spin" />
          Loading your account...
        </div>
      </section>
    )
  }

  if (!isSignedIn || user?.publicMetadata?.role !== "rider") {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <form onSubmit={handleSubmit} className="w-full max-w-lg">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <Bike size={24} />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
            {alreadyOnboarded ? "Rider profile" : "Set up your rider profile"}
          </h1>
          <p className="mt-1 max-w-md text-sm font-medium text-slate-600">
            {alreadyOnboarded
              ? "Update the details dispatch uses to reach you."
              : "Tell dispatch which vehicle you ride and how to reach you before your first delivery."}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle & contact</CardTitle>
            <CardDescription>
              These details appear on every order assigned to you.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="plate_number">Vehicle / plate number</Label>
              <Input
                id="plate_number"
                value={plateNumber}
                onChange={(event) => {
                  setPlateNumber(event.target.value)
                  setError(null)
                }}
                placeholder="E-Bike #04"
                maxLength={50}
                required
                disabled={isLoading || isSaving}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone_number">Phone number</Label>
              <Input
                id="phone_number"
                type="tel"
                value={phoneNumber}
                onChange={(event) => {
                  setPhoneNumber(sanitizePhoneInput(event.target.value))
                  setError(null)
                }}
                placeholder="+63 912 345 6789"
                required
                disabled={isLoading || isSaving}
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <p
            className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800"
            role="alert"
          >
            <ShieldAlert size={16} className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}

        <div className="mt-6 flex items-center justify-end">
          <Button type="submit" disabled={isSaving || isLoading} className="min-w-40">
            {isSaving && <Loader2 className="size-4 animate-spin" />}
            {isSaving
              ? "Saving..."
              : alreadyOnboarded
                ? "Save changes"
                : "Complete onboarding"}
          </Button>
        </div>
      </form>
    </section>
  )
}
