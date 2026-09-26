import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

type Faq = {
    id: string;
    question: string;
    answer: string;
};

export function SubscriptionFaq({ faqs }: { faqs: Faq[] }) {
    return (
        <div>
            <h2 className="text-3xl font-bold text-foreground text-center mt-10 mb-2">
                FAQs
            </h2>
            <Accordion className="mx-auto w-full max-w-175">
                {faqs.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id}>
                        <AccordionTrigger className="text-[15px] font-bold text-black">
                            {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-[13px] text-black/60">
                            {faq.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}