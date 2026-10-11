import * as React from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Bike, Check, Coins, KeyRound, Pencil, Wallet, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useApi } from "@/lib/api"

type RiderPayoutRow = {
  id: string
  name: string
  phone: string
  vehicle: string
  hasProfile: boolean
  unpaidDeliveries: number
  unpaidCredits: number
  payout: number
  lastPaidAt: string | null
}

type PayoutsResponse = {
  rate: number
  riders: RiderPayoutRow[]
}

type PayoutRate = {
  rate: number
  updatedAt: string | null
}

type PendingPayout = {
  rider: RiderPayoutRow
  payoutId: number
  pin: string
  amount: number
}

const peso = (value: number) => `₱${value.toLocaleString()}`

const formatDate = (value: string | null) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Never"

export default function AdminPayout() {
  const { makeRequest } = useApi()
  const queryClient = useQueryClient()

  const rateQuery = useQuery<PayoutRate>({
    queryKey: ["admin-payout-rate"],
    queryFn: () => makeRequest("payout-rate"),
  })
  const payoutsQuery = useQuery<PayoutsResponse>({
    queryKey: ["admin-payouts"],
    queryFn: () => makeRequest("payouts"),
  })

  const riders = payoutsQuery.data?.riders ?? []
  const rate = rateQuery.data?.rate ?? payoutsQuery.data?.rate
  const totalOwed = riders.reduce((sum, rider) => sum + rider.payout, 0)
  const ridersOwed = riders.filter((rider) => rider.payout > 0).length

  const [toastMessage, setToastMessage] = React.useState<string | null>(null)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [editingRate, setEditingRate] = React.useState(false)
  const [rateInput, setRateInput] = React.useState("")
  const [savingRate, setSavingRate] = React.useState(false)
  const [initiatingRiderId, setInitiatingRiderId] = React.useState<string | null>(null)
  const [pendingPayout, setPendingPayout] = React.useState<PendingPayout | null>(null)
  const [pinInput, setPinInput] = React.useState("")
  const [pinError, setPinError] = React.useState<string | null>(null)
  const [confirming, setConfirming] = React.useState(false)

  const showToast = React.useCallback((message: string) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(null), 3500)
  }, [])

  const refresh = React.useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["admin-payouts"] })
    void queryClient.invalidateQueries({ queryKey: ["admin-payout-rate"] })
  }, [queryClient])

  const startEditingRate = () => {
    setRateInput(rate ? String(rate) : "")
    setEditingRate(true)
  }

  const parsedRate = Number(rateInput)
  const rateIsValid = Number.isInteger(parsedRate) && parsedRate > 0

  const handleSaveRate = async () => {
    if (!rateIsValid) return
    setSavingRate(true)
    setErrorMessage(null)
    try {
      const result: PayoutRate & { notifiedRiders: number } = await makeRequest("payout-rate", {
        method: "PUT",
        body: JSON.stringify({ rate: parsedRate }),
      })
      setEditingRate(false)
      refresh()
      showToast(
        result.notifiedRiders > 0
          ? `Rate set to ${peso(result.rate)} per credit. ${result.notifiedRiders} rider${result.notifiedRiders === 1 ? "" : "s"} notified.`
          : `Rate set to ${peso(result.rate)} per credit.`
      )
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to update payout rate.")
    } finally {
      setSavingRate(false)
    }
  }

  const handleInitiate = async (rider: RiderPayoutRow) => {
    setInitiatingRiderId(rider.id)
    setErrorMessage(null)
    try {
      const result: { payoutId: number; pin: string; amount: number } = await makeRequest(
        `payouts/${rider.id}/initiate`,
        { method: "POST" }
      )
      setPinInput("")
      setPinError(null)
      setPendingPayout({ rider, ...result })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to start payout.")
    } finally {
      setInitiatingRiderId(null)
    }
  }

  const handleConfirm = async () => {
    if (!pendingPayout || pinInput.length !== 6) return
    setConfirming(true)
    setPinError(null)
    try {
      const result: { amount: number } = await makeRequest(
        `payouts/${pendingPayout.rider.id}/confirm`,
        { method: "POST", body: JSON.stringify({ pin: pinInput }) }
      )
      showToast(`Paid ${peso(result.amount)} to ${pendingPayout.rider.name}.`)
      setPendingPayout(null)
      refresh()
    } catch (error) {
      setPinError(error instanceof Error ? error.message : "Failed to confirm payout.")
    } finally {
      setConfirming(false)
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.02em] text-[#1B1B1B]">
            Rider Payouts
          </h1>
          <p className="text-sm text-[#4C4546] mt-0.5">
            Set the credit-to-peso earnings rate and settle unpaid rider earnings with a PIN confirmation.
          </p>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 bg-blue-600 text-white text-xs font-semibold rounded-xl shadow-md flex items-center justify-between transition-all animate-in fade-in">
          <span className="flex items-center gap-2">
            <Check className="size-4 shrink-0" />
            {toastMessage}
          </span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 cursor-pointer hover:bg-blue-700 rounded-md"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-xl flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="p-1 cursor-pointer hover:bg-red-100 rounded-md"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex flex-col justify-between p-5 rounded-xl border border-[#E2E2E2] bg-white">
          <div className="flex justify-between items-start pb-3">
            <span className="text-xs font-bold tracking-wider text-[#4C4546] uppercase">
              Credit-to-Peso Rate
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Coins size={18} />
            </div>
          </div>
          {editingRate ? (
            <form
              className="flex flex-col gap-2"
              onSubmit={(event) => {
                event.preventDefault()
                void handleSaveRate()
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-[#1B1B1B]">₱</span>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  autoFocus
                  value={rateInput}
                  onChange={(event) => setRateInput(event.target.value)}
                  aria-label="Pesos per credit"
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">/ credit</span>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingRate(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!rateIsValid || savingRate}
                  className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  {savingRate ? "Saving..." : "Save & Notify Riders"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex items-end justify-between gap-2">
              <div>
                <p className="text-2xl font-bold tracking-tight text-[#1B1B1B]">
                  {rate !== undefined ? `${peso(rate)} / credit` : "—"}
                </p>
                <p className="text-xs font-medium text-amber-600 mt-0.5">
                  Updated {formatDate(rateQuery.data?.updatedAt ?? null)}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={startEditingRate}
                disabled={rate === undefined}
                className="cursor-pointer text-xs font-semibold"
              >
                <Pencil size={13} className="mr-1" />
                Edit
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between p-5 rounded-xl border border-[#E2E2E2] bg-white">
          <div className="flex justify-between items-start pb-3">
            <span className="text-xs font-bold tracking-wider text-[#4C4546] uppercase">
              Total Owed
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Wallet size={18} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight text-[#1B1B1B]">{peso(totalOwed)}</p>
            <p className="text-xs font-medium text-blue-600 mt-0.5">Unpaid delivered orders</p>
          </div>
        </div>

        <div className="flex flex-col justify-between p-5 rounded-xl border border-[#E2E2E2] bg-white">
          <div className="flex justify-between items-start pb-3">
            <span className="text-xs font-bold tracking-wider text-[#4C4546] uppercase">
              Riders Awaiting Payout
            </span>
            <div className="p-2 rounded-lg bg-green-50 text-green-600">
              <Bike size={18} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight text-[#1B1B1B]">
              {ridersOwed} of {riders.length}
            </p>
            <p className="text-xs font-medium text-green-600 mt-0.5">Riders with a balance</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#E2E2E2] bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold uppercase text-xs tracking-wider">Rider</TableHead>
              <TableHead className="font-bold uppercase text-xs tracking-wider">Phone / Vehicle</TableHead>
              <TableHead className="font-bold uppercase text-xs tracking-wider">Unpaid Deliveries</TableHead>
              <TableHead className="font-bold uppercase text-xs tracking-wider">Last Paid</TableHead>
              <TableHead className="font-bold uppercase text-xs tracking-wider text-right">Current Payout</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {payoutsQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
                  Loading riders...
                </TableCell>
              </TableRow>
            ) : payoutsQuery.isError ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-sm text-destructive">
                  {payoutsQuery.error instanceof Error ? payoutsQuery.error.message : "Failed to load payouts."}
                </TableCell>
              </TableRow>
            ) : riders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
                  No riders yet.
                </TableCell>
              </TableRow>
            ) : (
              riders.map((rider) => (
                <TableRow key={rider.id}>
                  <TableCell>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-sm text-foreground truncate">{rider.name}</span>
                      <span className="text-[11px] text-muted-foreground font-mono truncate">{rider.id}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs">
                      <span className="font-medium text-foreground">{rider.phone || "—"}</span>
                      <span className="text-muted-foreground">{rider.vehicle}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-medium text-foreground">
                    {rider.unpaidDeliveries} ({rider.unpaidCredits} credits)
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(rider.lastPaidAt)}</TableCell>
                  <TableCell className="text-right font-bold text-sm text-foreground">
                    {peso(rider.payout)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => void handleInitiate(rider)}
                      disabled={rider.payout <= 0 || initiatingRiderId === rider.id}
                      className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    >
                      {initiatingRiderId === rider.id ? "Starting..." : "Pay"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!pendingPayout}
        onOpenChange={(open) => {
          if (!open) setPendingPayout(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="size-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mb-2 border border-blue-200">
              <KeyRound size={20} />
            </div>
            <DialogTitle>Confirm Payout</DialogTitle>
            <DialogDescription>
              Pay <strong>{peso(pendingPayout?.amount ?? 0)}</strong> to {pendingPayout?.rider.name}. Re-type the PIN below to confirm.
            </DialogDescription>
          </DialogHeader>

          <form
            id="confirm-payout-form"
            className="space-y-3 py-2"
            onSubmit={(event) => {
              event.preventDefault()
              void handleConfirm()
            }}
          >
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Payout PIN
              </p>
              <p className="mt-1 font-mono text-3xl font-bold tracking-[0.4em] text-[#1B1B1B]">
                {pendingPayout?.pin}
              </p>
            </div>
            <div>
              <label htmlFor="payout-pin" className="text-xs font-semibold text-foreground block mb-1.5">
                Enter PIN
              </label>
              <Input
                id="payout-pin"
                inputMode="numeric"
                autoComplete="off"
                maxLength={6}
                autoFocus
                value={pinInput}
                onChange={(event) => {
                  setPinInput(event.target.value.replace(/\D/g, "").slice(0, 6))
                  setPinError(null)
                }}
                placeholder="6-digit PIN"
                aria-invalid={!!pinError}
                className="font-mono tracking-[0.3em]"
              />
              {pinError && <p className="mt-1.5 text-xs font-medium text-destructive">{pinError}</p>}
            </div>
          </form>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setPendingPayout(null)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="confirm-payout-form"
              disabled={pinInput.length !== 6 || confirming}
              className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {confirming ? "Confirming..." : "Confirm Payout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
