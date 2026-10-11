import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { Check, MapPin, Search, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useApi } from "@/lib/api"
import { useUser } from "@clerk/react"
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"

type Goal = "lose_weight" | "maintain_weight" | "gain_weight"

type Profile = {
  phone_number: string
  height: number
  weight: number
  target_weight: number
  goal: Goal
  delivery_address: string
  delivery_lat?: number | null
  delivery_long?: number | null
}

type SearchResult = {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

const emptyProfile: Profile = {
  phone_number: "",
  height: 0,
  weight: 0,
  target_weight: 0,
  goal: "maintain_weight",
  delivery_address: "",
}

const goalOptions: { value: Goal; label: string; description: string }[] = [
  { value: "lose_weight", label: "Lose weight", description: "Build sustainable habits toward a lower target weight." },
  { value: "maintain_weight", label: "Maintain weight", description: "Keep your current weight with balanced nutrition." },
  { value: "gain_weight", label: "Gain weight", description: "Support healthy weight gain and muscle growth." },
]

const DEFAULT_MAP_CENTER: [number, number] = [14.5995, 120.9842]

function LocationPicker({ onSelect }: { onSelect: (latitude: number, longitude: number) => void }) {
  useMapEvents({
    click(event) {
      onSelect(event.latlng.lat, event.latlng.lng)
    },
  })

  return null
}

function MapViewController({ latitude, longitude }: { latitude: number; longitude: number }) {
  const map = useMap()

  useEffect(() => {
    map.flyTo([latitude, longitude], 16)
  }, [latitude, longitude, map])

  return null
}

export default function UserProfile() {
  const { makeRequest } = useApi()
  const { user } = useUser()
  const [profile, setProfile] = useState<Profile>(emptyProfile)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    let active = true

    const loadProfile = async () => {
      try {
        const existing = await makeRequest("profile")
        if (active) {
          setProfile(existing)
          setIsSaved(true)
        }
      } catch (requestError) {
        if (active && requestError instanceof Error && !requestError.message.toLowerCase().includes("profile does not exist")) {
          setError(requestError.message)
        }
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadProfile()
    return () => {
      active = false
    }
  }, [makeRequest])

  const updateField = <K extends keyof Profile>(field: K, value: Profile[K]) => {
    setProfile((current) => ({ ...current, [field]: value }))
    setIsSaved(false)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setIsSaving(true)

    try {
      await makeRequest("profile", {
        method: isSaved ? "PUT" : "POST",
        body: JSON.stringify(profile),
      })
      setIsSaved(true)
      // The backend flips publicMetadata.onboarded on first save; refresh the
      // cached Clerk user so the layout's onboarding gate sees it without a reload.
      await user?.reload().catch(() => undefined)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save your profile.")
    } finally {
      setIsSaving(false)
    }
  }

  const searchAddress = async () => {
    const query = searchQuery.trim()
    if (!query) return

    setIsSearching(true)
    setError("")
    setSearchResults([])

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(query)}`,
        { headers: { Accept: "application/json" } },
      )
      if (!response.ok) {
        throw new Error("Address search is currently unavailable.")
      }

      const results = await response.json() as SearchResult[]
      setSearchResults(results)
      if (results.length === 0) {
        setError("No matching locations found. Try a more specific address.")
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to search for that address.")
    } finally {
      setIsSearching(false)
    }
  }

  const selectSearchResult = (result: SearchResult) => {
    const latitude = Number(result.lat)
    const longitude = Number(result.lon)
    updateField("delivery_address", result.display_name)
    updateField("delivery_lat", latitude)
    updateField("delivery_long", longitude)
    setSearchQuery(result.display_name)
    setSearchResults([])
  }

  if (isLoading) {
    return (
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-12" aria-label="Loading profile" aria-busy="true">
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-80" />
          </div>
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-6 flex flex-col gap-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-72" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
        <div className="flex justify-end">
          <Skeleton className="h-10 w-32" />
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-12">
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <UserRound className="size-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your nutrition profile</h1>
          <p className="mt-1 text-muted-foreground">Tell us about your goals so we can personalize your meal recommendations.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Body details</CardTitle>
            <CardDescription>Use your current measurements so your plan starts with accurate targets.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="phone_number">Phone number</Label>
              <Input id="phone_number" required value={profile.phone_number} onChange={(event) => updateField("phone_number", event.target.value)} placeholder="+63 912 345 6789" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input id="height" required min="1" step="0.1" type="number" value={profile.height || ""} onChange={(event) => updateField("height", Number(event.target.value))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="weight">Current weight (kg)</Label>
              <Input id="weight" required min="1" step="0.1" type="number" value={profile.weight || ""} onChange={(event) => updateField("weight", Number(event.target.value))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="target_weight">Target weight (kg)</Label>
              <Input id="target_weight" required min="1" step="0.1" type="number" value={profile.target_weight || ""} onChange={(event) => updateField("target_weight", Number(event.target.value))} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nutrition goal</CardTitle>
            <CardDescription>Choose the direction that best describes what you want to achieve.</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={profile.goal} onValueChange={(value) => updateField("goal", value as Goal)} className="grid gap-3 sm:grid-cols-3">
              {goalOptions.map((option) => (
                <Label key={option.value} htmlFor={option.value} className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors hover:bg-muted has-checked:border-primary has-checked:bg-primary/5">
                  <RadioGroupItem id={option.value} value={option.value} className="mt-0.5" />
                  <span className="grid gap-1">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs leading-4 text-muted-foreground">{option.description}</span>
                  </span>
                </Label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MapPin className="size-4" />Delivery address</CardTitle>
            <CardDescription>Enter your delivery address, search for it, or click the map to place your pin.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="delivery_address">Address details</Label>
              <Textarea id="delivery_address" required value={profile.delivery_address} onChange={(event) => updateField("delivery_address", event.target.value)} placeholder="House number, street, barangay, city" rows={3} />
            </div>
            <div className="relative z-0 overflow-hidden rounded-xl border bg-muted">
              <div className="absolute top-3 right-3 left-16 z-[1000] sm:top-5 sm:right-5 sm:left-20">
                <div className="rounded-xl border bg-background/95 p-2 shadow-lg backdrop-blur">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="address_search"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault()
                            void searchAddress()
                          }
                        }}
                        placeholder="Search for a place or landmark"
                        className="h-10 border-0 pl-9 shadow-none focus-visible:ring-0"
                        aria-describedby="address-search-help"
                      />
                    </div>
                    <Button
                      type="button"
                      disabled={isSearching || !searchQuery.trim()}
                      onClick={() => void searchAddress()}
                      className="h-10 px-3"
                    >
                      {isSearching ? "Searching..." : "Search"}
                    </Button>
                  </div>
                  <p id="address-search-help" className="px-2 pt-1 text-xs text-muted-foreground">
                    Search results will update the map pin.
                  </p>
                  {searchResults.length > 0 && (
                    <div className="mt-2 grid max-h-48 overflow-y-auto rounded-lg border bg-background" role="listbox" aria-label="Address search results">
                      {searchResults.map((result) => (
                        <button
                          key={result.place_id}
                          type="button"
                          className="border-b px-3 py-2.5 text-left text-sm last:border-b-0 hover:bg-muted"
                          onClick={() => selectSearchResult(result)}
                        >
                          <span className="line-clamp-2">{result.display_name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <MapContainer
                center={[profile.delivery_lat ?? DEFAULT_MAP_CENTER[0], profile.delivery_long ?? DEFAULT_MAP_CENTER[1]]}
                zoom={profile.delivery_lat != null && profile.delivery_long != null ? 16 : 12}
                scrollWheelZoom
                className="h-96 w-full sm:h-[26rem]"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationPicker onSelect={(latitude, longitude) => {
                  updateField("delivery_lat", latitude)
                  updateField("delivery_long", longitude)
                }} />
                {profile.delivery_lat != null && profile.delivery_long != null && (
                  <MapViewController latitude={profile.delivery_lat} longitude={profile.delivery_long} />
                )}
                {profile.delivery_lat != null && profile.delivery_long != null && (
                  <CircleMarker
                    center={[profile.delivery_lat, profile.delivery_long]}
                    radius={10}
                    pathOptions={{ color: "#306FE6", fillColor: "#306FE6", fillOpacity: 0.85 }}
                  />
                )}
              </MapContainer>
            </div>
            <p className="text-xs text-muted-foreground" aria-live="polite">
              {profile.delivery_lat != null && profile.delivery_long != null
                ? `Pinned location: ${profile.delivery_lat.toFixed(6)}, ${profile.delivery_long.toFixed(6)}`
                : "No location selected yet. Click the map to place your delivery pin."}
            </p>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
        <div className="flex items-center justify-end gap-3">
          {isSaved && <span className="flex items-center gap-1 text-sm text-emerald-600"><Check className="size-4" />Saved</span>}
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : isSaved ? "Update profile" : "Save profile"}
          </Button>
        </div>
      </form>
    </section>
  )
}
