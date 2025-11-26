import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getPageSection, getPropertyArray } from '@/lib/page';
import { IntroPageProps } from '@/types/page';
import { usePage } from '@inertiajs/react';
import Section from '../section';
import { cn } from '@/lib/utils';
import { HelpCircle } from 'lucide-react';

const FAQs = () => {
   const { props } = usePage<IntroPageProps>();
   const { page, customize, direction } = props;
   const faqsSection = getPageSection(page, 'faqs') || getPageSection(page, 'prime_faqs');
   const isRTL = direction === 'rtl';
   const faqs = getPropertyArray(faqsSection);

   return (
      <Section customize={customize} pageSection={faqsSection} containerClass="py-16">
         <div className={cn('mb-10', isRTL ? 'text-right' : 'text-center')}>
            <div className={cn('mb-4 flex items-center gap-2', isRTL ? 'justify-end' : 'justify-center')}>
               <HelpCircle className="h-5 w-5 text-primary" />
               <p className="text-sm font-semibold uppercase tracking-[0.3em] text-secondary-foreground">
                  {faqsSection?.title || (isRTL ? 'الأسئلة الشائعة' : 'Frequently Asked Questions')}
               </p>
            </div>
            <h2 className="mt-2 text-3xl font-semibold">{faqsSection?.sub_title || (isRTL ? 'الأسئلة الشائعة' : 'FAQs')}</h2>
            <p className="mt-2 text-muted-foreground">{faqsSection?.description}</p>
         </div>

         {faqs.length === 0 ? (
            <div className="rounded-3xl border border-dashed p-10 text-center text-muted-foreground">
               {isRTL ? 'أضف إدخالات الأسئلة الشائعة إلى هذا القسم لعرض الأسئلة الشائعة' : 'Add FAQ entries to this section to display frequently asked questions.'}
            </div>
         ) : (
            <div className={cn('mx-auto max-w-4xl', isRTL && 'text-right')}>
               <Accordion type="single" collapsible className="w-full space-y-4">
                  {faqs.map((faq: any, index: number) => (
                     <AccordionItem
                        key={`faq-${index}`}
                        value={`faq-${index}`}
                        className="bg-background border-border rounded-2xl border px-6 shadow-sm transition hover:shadow-md"
                     >
                        <AccordionTrigger
                           className={cn(
                              'cursor-pointer py-5 text-base font-semibold hover:no-underline',
                              isRTL && 'flex-row-reverse'
                           )}
                        >
                           {faq.title}
                        </AccordionTrigger>
                        <AccordionContent className={cn('text-muted-foreground pt-0 pb-5 text-sm leading-relaxed', isRTL && 'text-right')}>
                           {faq.description}
                        </AccordionContent>
                     </AccordionItem>
                  ))}
               </Accordion>
            </div>
         )}
      </Section>
   );
};

export default FAQs;

