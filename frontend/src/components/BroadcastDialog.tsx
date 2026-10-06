import * as React from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Megaphone,
    Send,
    Users,
    Bike,
    ShieldCheck,
    User as UserIcon,
    AlertCircle,
    Bell,
    Check
} from "lucide-react"
import { useApi } from "@/lib/api"

export function BroadcastDialog() {
    const [open, setOpen] = React.useState(false)
    const [title, setTitle] = React.useState("")
    const [audience, setAudience] = React.useState("users")
    const [priority, setPriority] = React.useState<"normal" | "urgent">("normal")
    const [message, setMessage] = React.useState("")
    const [isSent, setIsSent] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const { makeRequest } = useApi()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || !message.trim()) return

        setError(null)
        try {
            await makeRequest("broadcasts", {
                method: "POST",
                body: JSON.stringify({ title, message, audience, priority }),
            })
            window.dispatchEvent(new Event("broadcast-created"))
            setIsSent(true)
            setTimeout(() => {
            setIsSent(false)
            setOpen(false)
            setTitle("")
            setMessage("")
            setAudience("users")
            setPriority("normal")
            }, 1200)
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : "Unable to send broadcast.")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    <button
                        className="flex items-center justify-center gap-2 py-3 px-4 border border-[#1B1B1B] cursor-pointer"
                    >
                        <Megaphone size={18} />
                        <span className="text-sm font-bold tracking-wider">
                            Send Broadcast
                        </span>
                    </button>
                }
            />
            <DialogContent className="sm:max-w-lg p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader className="space-y-1.5 text-left">
                        <div className="flex items-center gap-2.5">
                            <div className="size-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                                <Megaphone size={18} />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold tracking-tight text-[#1B1B1B]">
                                    New Broadcast Announcement
                                </DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground">
                                    Target platform audiences with an instant push notification.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {isSent ? (
                        <div className="py-8 flex flex-col items-center justify-center text-center space-y-2 animate-in fade-in">
                            <div className="size-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-200">
                                <Check size={24} />
                            </div>
                            <p className="text-sm font-bold text-foreground">Broadcast Dispatched!</p>
                            <p className="text-xs text-muted-foreground">Notification queued to {audience.toUpperCase()} audience.</p>
                        </div>
                    ) : (
                        <>
                        {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
                        <FieldGroup className="space-y-4">
                            {/* Broadcast Title */}
                            <Field>
                                <Label htmlFor="broadcast-title" className="text-xs font-semibold text-foreground">
                                    Broadcast Title
                                </Label>
                                <Input
                                    id="broadcast-title"
                                    name="title"
                                    placeholder="e.g., Severe Weather Alert or Holiday Dispatch Notice"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="bg-white text-xs h-9"
                                    required
                                />
                            </Field>

                            {/* Target Audience */}
                            <Field>
                                <Label htmlFor="broadcast-audience" className="text-xs font-semibold text-foreground">
                                    Target Platform Audience
                                </Label>
                                <RadioGroup
                                    value={audience}
                                    onValueChange={setAudience}
                                    className="grid grid-cols-2 gap-2 pt-1"
                                >
                                    <div
                                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                                            audience === "users"
                                                ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600/30"
                                                : "border-zinc-200 bg-white hover:border-zinc-300"
                                        }`}
                                        onClick={() => setAudience("users")}
                                    >
                                        <RadioGroupItem value="users" id="bd-audience-users" />
                                        <Label htmlFor="bd-audience-users" className="text-xs font-medium cursor-pointer flex items-center gap-1.5">
                                            <UserIcon className="size-3.5 text-blue-600" />
                                            <span>Users</span>
                                        </Label>
                                    </div>

                                    <div
                                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                                            audience === "riders"
                                                ? "border-amber-600 bg-amber-50/50 ring-1 ring-amber-600/30"
                                                : "border-zinc-200 bg-white hover:border-zinc-300"
                                        }`}
                                        onClick={() => setAudience("riders")}
                                    >
                                        <RadioGroupItem value="riders" id="bd-audience-riders" />
                                        <Label htmlFor="bd-audience-riders" className="text-xs font-medium cursor-pointer flex items-center gap-1.5">
                                            <Bike className="size-3.5 text-amber-600" />
                                            <span>Riders</span>
                                        </Label>
                                    </div>

                                    <div
                                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                                            audience === "admins"
                                                ? "border-purple-600 bg-purple-50/50 ring-1 ring-purple-600/30"
                                                : "border-zinc-200 bg-white hover:border-zinc-300"
                                        }`}
                                        onClick={() => setAudience("admins")}
                                    >
                                        <RadioGroupItem value="admins" id="bd-audience-admins" />
                                        <Label htmlFor="bd-audience-admins" className="text-xs font-medium cursor-pointer flex items-center gap-1.5">
                                            <ShieldCheck className="size-3.5 text-purple-600" />
                                            <span>Admins</span>
                                        </Label>
                                    </div>

                                    <div
                                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                                            audience === "all"
                                                ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600/30"
                                                : "border-zinc-200 bg-white hover:border-zinc-300"
                                        }`}
                                        onClick={() => setAudience("all")}
                                    >
                                        <RadioGroupItem value="all" id="bd-audience-all" />
                                        <Label htmlFor="bd-audience-all" className="text-xs font-medium cursor-pointer flex items-center gap-1.5">
                                            <Users className="size-3.5 text-zinc-700" />
                                            <span>Everyone (All)</span>
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </Field>

                            {/* Priority Level */}
                            <Field>
                                <Label className="text-xs font-semibold text-foreground">
                                    Priority Level
                                </Label>
                                <div className="grid grid-cols-2 gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setPriority("normal")}
                                        className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium rounded-xl border cursor-pointer transition-all ${
                                            priority === "normal"
                                                ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold ring-1 ring-blue-600/30"
                                                : "border-zinc-200 bg-white text-muted-foreground hover:border-zinc-300"
                                        }`}
                                    >
                                        <Bell size={13} />
                                        Standard Alert
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPriority("urgent")}
                                        className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium rounded-xl border cursor-pointer transition-all ${
                                            priority === "urgent"
                                                ? "border-red-600 bg-red-50 text-red-700 font-semibold ring-1 ring-red-600/30"
                                                : "border-zinc-200 bg-white text-muted-foreground hover:border-zinc-300"
                                        }`}
                                    >
                                        <AlertCircle size={13} />
                                        Urgent / Critical
                                    </button>
                                </div>
                            </Field>

                            {/* Message Body */}
                            <Field>
                                <Label htmlFor="broadcast-message" className="text-xs font-semibold text-foreground">
                                    Message Body
                                </Label>
                                <Textarea
                                    id="broadcast-message"
                                    name="message"
                                    placeholder="Write your broadcast announcement content here..."
                                    className="min-h-24 resize-none text-xs bg-white"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                />
                            </Field>
                        </FieldGroup>
                        </>
                    )}

                    {!isSent && (
                        <DialogFooter className="gap-2 sm:gap-0 pt-2">
                            <DialogClose render={<Button variant="outline" className="cursor-pointer text-xs">Cancel</Button>} />
                            <Button
                                type="submit"
                                className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5"
                            >
                                <Send size={13} />
                                Send Broadcast
                            </Button>
                        </DialogFooter>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    )
}