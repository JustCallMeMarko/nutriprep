import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function SubscriptionFaq({ faqs }) {
  return (
    <Accordion type="single" collapsible className="mx-auto w-full max-w-[700px]">
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
  );
}