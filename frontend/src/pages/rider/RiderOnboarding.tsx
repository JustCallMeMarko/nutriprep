import * as React from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { useUser } from "@clerk/react"
import { Bike, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ROUTES } from "@/constants/routes"
import { useApi } from "@/lib/api"
import { LIMITS, PH_MOBILE_ERROR, isValidPhMobile, normalizePhMobile, sanitizePhoneInput } from "@/lib/validation"

interface RiderProfileResponse {
  plateNumber: string | null
  phoneNumber: string | null
  available: boolean
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

  const trimmedPlate = plateNumber.trim()
  const fieldErrors = {
    plate_number:
      trimmedPlate && trimmedPlate.length < LIMITS.PLATE_MIN
        ? `Plate / vehicle number must be at least ${LIMITS.PLATE_MIN} characters.`
        : "",
    phone_number: phoneNumber.trim() && !isValidPhMobile(phoneNumber) ? PH_MOBILE_ERROR : "",
  }
  const isFormValid = trimmedPlate !== "" && phoneNumber.trim() !== "" && !Object.values(fieldErrors).some(Boolean)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!isFormValid) return

    setIsSaving(true)
    setError(null)
    try {
      await makeRequest("profile", {
        method: "PUT",
        body: JSON.stringify({
          plate_number: trimmedPlate,
          phone_number: normalizePhMobile(phoneNumber),
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
      <section className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto px-4 py-12" aria-label="Loading your account" aria-busy="true">
        <div className="w-full max-w-lg flex flex-col gap-6">
          <div className="flex flex-col items-center gap-3">
            <Skeleton className="size-14 rounded-2xl" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>
          <div className="rounded-xl border bg-card p-6 flex flex-col gap-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <div className="flex justify-end">
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!isSignedIn || user?.publicMetadata?.role !== "rider") {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return (
    <section className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto px-4 py-12">
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
                maxLength={LIMITS.PLATE_MAX}
                required
                aria-invalid={!!fieldErrors.plate_number || undefined}
                disabled={isLoading || isSaving}
              />
              {fieldErrors.plate_number && <p className="text-xs text-destructive" role="alert">{fieldErrors.plate_number}</p>}
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
                aria-invalid={!!fieldErrors.phone_number || undefined}
                disabled={isLoading || isSaving}
              />
              {fieldErrors.phone_number && <p className="text-xs text-destructive" role="alert">{fieldErrors.phone_number}</p>}
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
          <Button type="submit" disabled={isSaving || isLoading || !isFormValid} className="min-w-40">
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
