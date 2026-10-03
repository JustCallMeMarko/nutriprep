import * as React from "react"
import {
    Bot,
    Send,
    Sparkles,
    User,
    RotateCcw,
    X,
    Sparkle,
    ArrowUpRight
} from "lucide-react"
import {
    Message,
    MessageAvatar,
    MessageContent,
    MessageHeader,
} from "@/components/ui/message"
import {
    Bubble,
    BubbleContent,
} from "@/components/ui/bubble"
import {
    MessageScrollerProvider, // FIX: required root, was missing
    MessageScroller,
    MessageScrollerViewport,
    MessageScrollerContent,
    MessageScrollerItem,
    MessageScrollerButton,
} from "@/components/ui/message-scroller"
import {
    Marker,
    MarkerIcon,
    MarkerContent,
} from "@/components/ui/marker"

interface ChatMessage {
    id: string
    sender: "user" | "bot"
    text: string
    timestamp: string
    suggestedActions?: string[]
}

const INITIAL_MESSAGES: ChatMessage[] = [
    {
        id: "m-welcome",
        sender: "bot",
        text: "Hello! I'm your NutriPrep assistant. Ask me anything about our meal prep catalog, macronutrient targets, low-carb options, or your subscription credits.",
        timestamp: "Just now",
        suggestedActions: [
            "High-protein meals",
            "Low-carb diet options",
            "How do credits work?",
            "Daily macro goals"
        ]
    }
]

const now = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

// Word-start match so "again" doesn't trigger "gain"
const hasAny = (query: string, words: string[]) =>
    words.some((w) => new RegExp(`\\b${w}`, "i").test(query))

function generateBotReply(userQuery: string): { text: string; suggestedActions?: string[] } {
    const query = userQuery.toLowerCase()
    if (hasAny(query, ["protein", "muscle", "gain"])) {
        return {
            text: "For high protein, try the Steak & Whole Egg Power Skillet (48g protein) or Grilled Chicken Quinoa Bowl (42g protein). Both support optimal muscle repair and steady energy.",
            suggestedActions: ["Low-carb diet options", "Daily macro goals"]
        }
    }
    if (hasAny(query, ["carb", "keto"])) {
        return {
            text: "Great low-carb choices include the Avocado & Salmon Keto Bowl (under 9g net carbs) and Turkey & Cheese Frittata. Clean macros and steady all-day fuel.",
            suggestedActions: ["High-protein meals", "How do credits work?"]
        }
    }
    if (hasAny(query, ["credit", "balance", "token", "subscription"])) {
        return {
            text: "Each meal is redeemed using prep credits from your plan. Your current balance is displayed at the top of the Catalog and Plan tabs.",
            suggestedActions: ["High-protein meals", "Low-carb diet options"]
        }
    }
    if (hasAny(query, ["calorie", "goal", "macro", "track"])) {
        return {
            text: "Your daily dashboard tracks Calories, Protein, Carbs, and Fats live against your target goal. You can adjust your targets anytime in your profile settings.",
            suggestedActions: ["High-protein meals", "How do credits work?"]
        }
    }
    return {
        text: `Got it! I've noted: "${userQuery}". Explore all fresh meals in the catalog or ask for custom macro combos!`,
        suggestedActions: ["High-protein meals", "Low-carb diet options"]
    }
}

export default function ChatBot() {
    const [open, setOpen] = React.useState(false)
    const [messages, setMessages] = React.useState<ChatMessage[]>(INITIAL_MESSAGES)
    const [input, setInput] = React.useState("")
    const [isTyping, setIsTyping] = React.useState(false)
    const chatContainerRef = React.useRef<HTMLDivElement | null>(null)
    const inputRef = React.useRef<HTMLInputElement | null>(null)
    const replyTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
    const idCounterRef = React.useRef(0)

    const nextId = (prefix: string) => `${prefix}-${++idCounterRef.current}`

    // Focus input on open
    React.useEffect(() => {
        if (!open) return
        const t = setTimeout(() => inputRef.current?.focus(), 100)
        return () => clearTimeout(t)
    }, [open])

    // Outside click + Escape
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                open &&
                chatContainerRef.current &&
                !chatContainerRef.current.contains(event.target as Node)
            ) {
                setOpen(false)
            }
        }
        const handleKeyDown = (event: KeyboardEvent) => {
            if (open && event.key === "Escape") setOpen(false)
        }
        document.addEventListener("mousedown", handleClickOutside)
        document.addEventListener("keydown", handleKeyDown)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            document.removeEventListener("keydown", handleKeyDown)
        }
    }, [open])

    // Clear any pending reply on unmount
    React.useEffect(() => {
        return () => {
            if (replyTimerRef.current) clearTimeout(replyTimerRef.current)
        }
    }, [])

    const handleSendMessage = (textToSend?: string) => {
        if (isTyping) return // one pending reply at a time
        const messageText = (textToSend ?? input).trim()
        if (!messageText) return

        setMessages((prev) => [
            ...prev,
            { id: nextId("msg-user"), sender: "user", text: messageText, timestamp: now() },
        ])
        if (textToSend === undefined) setInput("")
        setIsTyping(true)

        replyTimerRef.current = setTimeout(() => {
            const reply = generateBotReply(messageText)
            setMessages((prev) => [
                ...prev,
                {
                    id: nextId("msg-bot"),
                    sender: "bot",
                    text: reply.text,
                    timestamp: now(),
                    suggestedActions: reply.suggestedActions,
                },
            ])
            setIsTyping(false)
            replyTimerRef.current = null
        }, 650)
    }

    const handleResetChat = () => {
        // FIX: cancel pending reply so it can't land in the fresh chat
        if (replyTimerRef.current) {
            clearTimeout(replyTimerRef.current)
            replyTimerRef.current = null
        }
        setIsTyping(false)
        setMessages(INITIAL_MESSAGES)
        setInput("")
    }

    // Only the latest bot message keeps clickable suggestions
    const lastMessageId = messages[messages.length - 1]?.id

    return (
        <div ref={chatContainerRef} className="fixed bottom-5 right-5 md:bottom-8 md:right-8 z-50">
            {open && (
                <div
                    role="dialog"
                    aria-modal="false"
                    aria-label="NutriPrep AI Assistant"
                    className="absolute bottom-16 right-0 w-[calc(100vw-2.5rem)] sm:w-[390px] h-[520px] max-h-[calc(100vh-6rem)] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150"
                >
                    {/* Header */}
                    <div className="bg-[#1B1B1B] text-white px-4 py-3 flex items-center justify-between shrink-0 border-b border-zinc-800">
                        <div className="flex items-center gap-2.5">
                            <div className="size-7 rounded-lg bg-blue-600 flex items-center justify-center">
                                <Sparkles className="size-3.5 text-white" />
                            </div>
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                                    NutriPrep AI
                                    <span className="inline-block size-1.5 rounded-full bg-emerald-400"></span>
                                </div>
                                <p className="text-[11px] text-zinc-400">Meal & Nutrition Assistant</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={handleResetChat}
                                title="Reset conversation"
                                aria-label="Reset conversation"
                                className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                                <RotateCcw className="size-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                title="Close"
                                aria-label="Close"
                                className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                    </div>

                    {/* FIX: Provider wraps MessageScroller */}
                    <MessageScrollerProvider autoScroll>
                        <MessageScroller className="flex-1 min-h-0 bg-slate-50/30">
                            <MessageScrollerViewport className="p-3">
                                <MessageScrollerContent className="gap-3">
                                    {messages.map((msg) => {
                                        const isBot = msg.sender === "bot"
                                        const showActions =
                                            isBot &&
                                            msg.id === lastMessageId &&
                                            !isTyping &&
                                            !!msg.suggestedActions?.length

                                        return (
                                            <MessageScrollerItem
                                                key={msg.id}
                                                messageId={msg.id} // FIX: required by the scroller
                                            >
                                                <Message align={isBot ? "start" : "end"} className="gap-2 items-start">
                                                    <MessageAvatar
                                                        className={`size-7 min-w-7 rounded-full text-white shadow-2xs shrink-0 mt-0.5 ${
                                                            isBot ? "bg-blue-600" : "bg-slate-800"
                                                        }`}
                                                    >
                                                        {isBot ? <Bot className="size-3.5" /> : <User className="size-3.5" />}
                                                    </MessageAvatar>

                                                    <MessageContent className="gap-1">
                                                        <MessageHeader className="gap-1 px-1 text-[10px] text-slate-500">
                                                            <span className="font-semibold text-slate-700">
                                                                {isBot ? "NutriPrep AI" : "You"}
                                                            </span>
                                                            <span>&bull;</span>
                                                            <span>{msg.timestamp}</span>
                                                        </MessageHeader>

                                                        <Bubble
                                                            variant={isBot ? "outline" : "default"}
                                                            align={isBot ? "start" : "end"}
                                                            className={`max-w-[85%] ${
                                                                isBot
                                                                    ? "bg-white text-slate-800 border-slate-200/90 shadow-2xs rounded-xl rounded-tl-xs"
                                                                    : "bg-blue-600 text-white shadow-2xs rounded-xl rounded-tr-xs"
                                                            }`}
                                                        >
                                                            <BubbleContent className="text-xs px-3 py-2 leading-relaxed">
                                                                <p className="whitespace-pre-wrap">{msg.text}</p>
                                                            </BubbleContent>
                                                        </Bubble>

                                                        {showActions && (
                                                            <div className="flex flex-wrap gap-1 pt-1">
                                                                {msg.suggestedActions!.map((action) => (
                                                                    <button
                                                                        key={action}
                                                                        type="button"
                                                                        onClick={() => handleSendMessage(action)}
                                                                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 rounded-full text-[11px] font-medium transition-colors cursor-pointer shadow-2xs text-left"
                                                                    >
                                                                        <span>{action}</span>
                                                                        <ArrowUpRight className="size-2.5 opacity-60" />
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </MessageContent>
                                                </Message>
                                            </MessageScrollerItem>
                                        )
                                    })}

                                    {isTyping && (
                                        <MessageScrollerItem messageId="typing-indicator">
                                            <Message align="start" className="gap-2 items-start">
                                                <MessageAvatar className="size-7 min-w-7 rounded-full bg-blue-600 text-white shadow-2xs shrink-0 mt-0.5">
                                                    <Bot className="size-3.5" />
                                                </MessageAvatar>
                                                <MessageContent>
                                                    <Marker className="py-0">
                                                        <div className="px-3 py-2 bg-white border border-slate-200/90 rounded-xl rounded-tl-xs flex items-center gap-1.5 text-xs text-slate-500 shadow-2xs w-fit">
                                                            <MarkerIcon>
                                                                <Sparkle className="size-3 animate-spin text-blue-600" />
                                                            </MarkerIcon>
                                                            <MarkerContent className="text-xs text-slate-500 font-medium">
                                                                Thinking...
                                                            </MarkerContent>
                                                        </div>
                                                    </Marker>
                                                </MessageContent>
                                            </Message>
                                        </MessageScrollerItem>
                                    )}
                                </MessageScrollerContent>
                            </MessageScrollerViewport>

                            <MessageScrollerButton className="bg-white shadow-sm border-slate-200" />
                        </MessageScroller>
                    </MessageScrollerProvider>

                    {/* Input */}
                    <div className="p-2.5 bg-white border-t border-slate-200 shrink-0">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                handleSendMessage()
                            }}
                            className="flex items-center gap-1.5"
                        >
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your nutrition query..."
                                className="flex-1 bg-slate-100 hover:bg-slate-50 focus:bg-white text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all placeholder:text-slate-400"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isTyping}
                                aria-label="Send message"
                                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl disabled:opacity-30 transition-all cursor-pointer flex items-center justify-center shadow-xs"
                            >
                                <Send className="size-3.5" />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating trigger */}
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                aria-label={open ? "Close AI Assistant" : "Open AI Assistant"}
                className={`bg-blue-600 text-white p-3.5 rounded-full shadow-lg cursor-pointer transition-all duration-150 hover:bg-blue-700 hover:scale-105 active:scale-95 flex items-center justify-center ring-4 ring-blue-600/20${open ? " rotate-90" : ""}`}
            >
                {open ? <X className="size-5" /> : <Sparkles className="size-5 text-white" />}
            </button>
        </div>
    )
}