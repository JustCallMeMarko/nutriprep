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
import { Megaphone } from "lucide-react"

export function BroadcastDialog() {
    return (
        <Dialog>
            <DialogTrigger render={
                <button
                    className="flex items-center justify-center gap-2 py-3 px-4 border border-[#1B1B1B] cursor-pointer"
                >
                    <Megaphone size={18} />
                    <span className="text-sm font-bold tracking-wider">
                        Send Broadcast
                    </span>
                </button>
            } />
            <DialogContent className="sm:max-w-md">
                <form onSubmit={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>New Broadcast Message</DialogTitle>
                        <DialogDescription>
                            Compose and send an immediate notification to targeted platform groups.
                        </DialogDescription>
                    </DialogHeader>

                    <FieldGroup className="py-4 space-y-4">
                        <Field>
                            <Label htmlFor="title">Broadcast Title</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="e.g., Severe Weather Alert"
                                required
                            />
                        </Field>

                        <Field>
                            <Label htmlFor="audience">Target Audience</Label>
                            <RadioGroup defaultValue="users" className="flex gap-4 pt-1">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="users" id="audience-users" />
                                    <Label htmlFor="audience-users" className="font-normal cursor-pointer">
                                        Users
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="riders" id="audience-riders" />
                                    <Label htmlFor="audience-riders" className="font-normal cursor-pointer">
                                        Riders
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="admins" id="audience-admins" />
                                    <Label htmlFor="audience-admins" className="font-normal cursor-pointer">
                                        Admins
                                    </Label>
                                </div>
                            </RadioGroup>
                        </Field>

                        <Field>
                            <Label htmlFor="message">Message Body</Label>
                            <Textarea
                                id="message"
                                name="message"
                                placeholder="Write your broadcast content here..."
                                className="min-h-[120px] resize-none"
                                required
                            />
                        </Field>
                    </FieldGroup>

                    <DialogFooter>
                        <DialogClose render={<Button variant="outline">Cancel</Button>} />
                        <Button type="submit">Send Broadcast</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}