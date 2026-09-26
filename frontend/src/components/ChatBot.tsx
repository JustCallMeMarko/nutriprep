import { Sparkles } from 'lucide-react'

export default function ChatBot() {
    return (
        <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50">
            <button className="bg-blue-600 text-white p-3 rounded-full shadow-lg cursor-pointer transition-colors ease-in-out hover:bg-blue-500">
                <Sparkles className="size-5" />
            </button>
        </div>
    )
}
