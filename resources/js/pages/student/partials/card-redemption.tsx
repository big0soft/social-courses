import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';

interface ValidationResult {
   valid: boolean;
   can_redeem?: boolean;
   message: string;
   card?: {
      code: string;
      card_type: 'single_course' | 'bundle';
      title: string | null;
      description: string | null;
      price: number;
      currency: string;
      course?: {
         id: number;
         title: string;
      };
      bundleCourses?: Array<{
         id: number;
         title: string;
      }>;
      alreadyEnrolled: number[];
   };
}

const CardRedemption = () => {
   const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
   const [isValidating, setIsValidating] = useState(false);

   const { data, setData, post, processing, errors, reset } = useForm({
      code: '',
   });

   const formatCardCode = (value: string) => {
      const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const segments = [];
      if (cleaned.startsWith('BETA')) {
         segments.push('BETA');
         const remaining = cleaned.substring(4);
         for (let i = 0; i < remaining.length; i += 4) {
            segments.push(remaining.substring(i, i + 4));
         }
      } else {
         for (let i = 0; i < cleaned.length; i += 4) {
            segments.push(cleaned.substring(i, i + 4));
         }
      }
      return segments.join('-');
   };

   const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatCardCode(e.target.value);
      setData('code', formatted);
   };

   const handleValidate = async () => {
      setIsValidating(true);
      setValidationResult(null);

      try {
         const response = await fetch(route('card.redeem.validate'), {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({ code: data.code }),
         });

         const result = await response.json();
         setValidationResult(result);
      } catch (error) {
         setValidationResult({
            valid: false,
            message: 'Failed to validate card. Please try again.',
         });
      } finally {
         setIsValidating(false);
      }
   };

   const handleRedeem = (e: React.FormEvent) => {
      e.preventDefault();
      post(route('card.redeem.activate'), {
         onSuccess: () => {
            reset();
            setValidationResult(null);
            router.visit(route('student.index', { tab: 'courses' }));
         },
      });
   };

   return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Redemption Form */}
         <div className="lg:col-span-2">
            <Card className="p-6">
               <h2 className="text-lg font-semibold mb-4">Enter Your Card Code</h2>

               <div className="space-y-4">
                  <div>
                     <Label>Card Code *</Label>
                     <div className="flex gap-2 mt-1">
                        <Input
                           type="text"
                           placeholder="BETA-XXXX-XXXX-XXXX"
                           value={data.code}
                           onChange={handleCodeChange}
                           maxLength={19}
                           className="font-mono text-lg"
                        />
                        <Button onClick={handleValidate} disabled={isValidating || data.code.length < 19} type="button">
                           {isValidating ? 'Validating...' : 'Validate'}
                        </Button>
                     </div>
                     <p className="text-sm text-muted-foreground mt-1">
                        Enter the 16-character code from your prepaid card
                     </p>
                     {errors.code && <p className="text-sm text-red-600 mt-1">{errors.code}</p>}
                  </div>

                  {/* Validation Result */}
                  {validationResult && (
                     <div
                        className={`p-4 rounded-lg ${
                           validationResult.valid
                              ? 'bg-green-50 border border-green-200 dark:bg-green-950 dark:border-green-800'
                              : 'bg-red-50 border border-red-200 dark:bg-red-950 dark:border-red-800'
                        }`}
                     >
                        <p
                           className={`font-medium ${
                              validationResult.valid
                                 ? 'text-green-800 dark:text-green-200'
                                 : 'text-red-800 dark:text-red-200'
                           }`}
                        >
                           {validationResult.message}
                        </p>

                        {validationResult.valid && validationResult.card && validationResult.can_redeem && (
                           <div className="mt-4 space-y-3">
                              <div className="grid grid-cols-2 gap-4">
                                 <div>
                                    <span className="text-sm text-muted-foreground">Type:</span>
                                    <p className="font-medium">
                                       {validationResult.card.card_type === 'single_course' ? 'Single Course' : 'Bundle'}
                                    </p>
                                 </div>
                                 <div>
                                    <span className="text-sm text-muted-foreground">Value:</span>
                                    <p className="font-medium">
                                       {validationResult.card.price} {validationResult.card.currency}
                                    </p>
                                 </div>
                              </div>

                              {validationResult.card.card_type === 'single_course' && validationResult.card.course && (
                                 <div>
                                    <span className="text-sm text-muted-foreground">Course:</span>
                                    <p className="font-medium">{validationResult.card.course.title}</p>
                                 </div>
                              )}

                              {validationResult.card.card_type === 'bundle' && (
                                 <div>
                                    <span className="text-sm text-muted-foreground">Bundle:</span>
                                    <p className="font-medium">{validationResult.card.title}</p>
                                    {validationResult.card.bundleCourses && (
                                       <ul className="mt-2 space-y-1">
                                          {validationResult.card.bundleCourses.map((course) => (
                                             <li key={course.id} className="text-sm flex items-center gap-2">
                                                {validationResult.card!.alreadyEnrolled.includes(course.id) ? (
                                                   <>
                                                      <span className="text-green-600">✓</span>
                                                      <span className="text-muted-foreground line-through">
                                                         {course.title}
                                                      </span>
                                                   </>
                                                ) : (
                                                   <>
                                                      <span className="text-blue-600">•</span>
                                                      <span>{course.title}</span>
                                                   </>
                                                )}
                                             </li>
                                          ))}
                                       </ul>
                                    )}
                                 </div>
                              )}

                              <form onSubmit={handleRedeem} className="mt-4 pt-4 border-t">
                                 <Button type="submit" disabled={processing} className="w-full">
                                    {processing ? 'Redeeming...' : 'Redeem Card & Enroll'}
                                 </Button>
                              </form>
                           </div>
                        )}
                     </div>
                  )}
               </div>
            </Card>
         </div>

         {/* Instructions */}
         <div>
            <Card className="p-6">
               <h3 className="font-semibold mb-3">How to Redeem</h3>
               <ol className="space-y-2 text-sm">
                  <li className="flex gap-2">
                     <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                        1
                     </span>
                     <span>Enter your 16-character card code</span>
                  </li>
                  <li className="flex gap-2">
                     <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                        2
                     </span>
                     <span>Click "Validate" to check the card</span>
                  </li>
                  <li className="flex gap-2">
                     <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                        3
                     </span>
                     <span>Review the course(s) included</span>
                  </li>
                  <li className="flex gap-2">
                     <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                        4
                     </span>
                     <span>Click "Redeem" to activate</span>
                  </li>
                  <li className="flex gap-2">
                     <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                        5
                     </span>
                     <span>Start learning immediately!</span>
                  </li>
               </ol>
            </Card>
         </div>
      </div>
   );
};

export default CardRedemption;
