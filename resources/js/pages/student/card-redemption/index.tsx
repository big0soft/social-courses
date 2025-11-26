import InputError from '@/components/input-error';
import LoadingButton from '@/components/loading-button';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DashboardLayout from '@/layouts/dashboard/layout';
import { SharedData } from '@/types/global';
import { router, useForm } from '@inertiajs/react';
import { ReactNode, useState } from 'react';

interface Props extends SharedData {
   activations: CardActivation[];
}

interface ValidationResult {
   valid: boolean;
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

const CardRedemption = ({ activations, translate }: Props) => {
   const { dashboard, input, button } = translate;
   const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
   const [isValidating, setIsValidating] = useState(false);

   const { data, setData, post, processing, errors, reset } = useForm({
      code: '',
   });

   const formatCardCode = (value: string) => {
      // Remove all non-alphanumeric characters
      const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');

      // Split into segments (BETA-XXXX-XXXX-XXXX)
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
         },
      });
   };

   return (
      <div>
         <h1 className="text-2xl font-bold mb-6">Redeem Prepaid Card</h1>

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
                           <Button onClick={handleValidate} disabled={isValidating || data.code.length < 19}>
                              {isValidating ? 'Validating...' : 'Validate'}
                           </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                           Enter the 16-character code from your prepaid card
                        </p>
                        <InputError message={errors.code} />
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

                           {validationResult.valid && validationResult.card && (
                              <div className="mt-4 space-y-3">
                                 <div className="grid grid-cols-2 gap-4">
                                    <div>
                                       <span className="text-sm text-muted-foreground">Type:</span>
                                       <p className="font-medium">
                                          {validationResult.card.card_type === 'single_course'
                                             ? 'Single Course'
                                             : 'Bundle'}
                                       </p>
                                    </div>
                                    <div>
                                       <span className="text-sm text-muted-foreground">Value:</span>
                                       <p className="font-medium">
                                          {validationResult.card.price} {validationResult.card.currency}
                                       </p>
                                    </div>
                                 </div>

                                 {validationResult.card.card_type === 'single_course' &&
                                    validationResult.card.course && (
                                       <div>
                                          <span className="text-sm text-muted-foreground">Course:</span>
                                          <p className="font-medium">{validationResult.card.course.title}</p>
                                          {validationResult.card.alreadyEnrolled.includes(
                                             validationResult.card.course.id
                                          ) && (
                                             <p className="text-sm text-orange-600 mt-1">
                                                ⚠️ You are already enrolled in this course
                                             </p>
                                          )}
                                       </div>
                                    )}

                                 {validationResult.card.card_type === 'bundle' && (
                                    <div>
                                       <span className="text-sm text-muted-foreground">Bundle:</span>
                                       <p className="font-medium">{validationResult.card.title}</p>
                                       {validationResult.card.description && (
                                          <p className="text-sm text-muted-foreground mt-1">
                                             {validationResult.card.description}
                                          </p>
                                       )}

                                       <div className="mt-2">
                                          <span className="text-sm font-medium">Included Courses:</span>
                                          <ul className="mt-1 space-y-1">
                                             {validationResult.card.bundleCourses?.map((course) => (
                                                <li key={course.id} className="text-sm flex items-center gap-2">
                                                   {validationResult.card!.alreadyEnrolled.includes(course.id) ? (
                                                      <>
                                                         <span className="text-green-600">✓</span>
                                                         <span className="text-muted-foreground line-through">
                                                            {course.title}
                                                         </span>
                                                         <span className="text-xs text-muted-foreground">
                                                            (Already enrolled)
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
                                       </div>
                                    </div>
                                 )}

                                 <form onSubmit={handleRedeem} className="mt-4 pt-4 border-t">
                                    <LoadingButton loading={processing} className="w-full">
                                       Redeem Card & Enroll in Course{validationResult.card.card_type === 'bundle' ? 's' : ''}
                                    </LoadingButton>
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

               <Card className="p-6 mt-4">
                  <h3 className="font-semibold mb-2 text-sm">Need Help?</h3>
                  <p className="text-sm text-muted-foreground">
                     If you're having trouble redeeming your card, please contact our support team.
                  </p>
               </Card>
            </div>
         </div>

         {/* Activation History */}
         {activations.length > 0 && (
            <Card className="p-6 mt-6">
               <h2 className="text-lg font-semibold mb-4">Your Activation History</h2>
               <div className="overflow-x-auto">
                  <table className="w-full">
                     <thead>
                        <tr className="border-b">
                           <th className="text-left p-3">Card Code</th>
                           <th className="text-left p-3">Type</th>
                           <th className="text-left p-3">Courses Enrolled</th>
                           <th className="text-left p-3">Activated On</th>
                        </tr>
                     </thead>
                     <tbody>
                        {activations.map((activation) => (
                           <tr key={activation.id} className="border-b hover:bg-muted/50">
                              <td className="p-3">
                                 <code className="text-xs bg-muted px-2 py-1 rounded">
                                    {activation.prepaidCard?.code}
                                 </code>
                              </td>
                              <td className="p-3">
                                 <span
                                    className={`text-xs px-2 py-1 rounded-full ${
                                       activation.prepaidCard?.card_type === 'single_course'
                                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                                    }`}
                                 >
                                    {activation.prepaidCard?.card_type === 'single_course' ? 'Single' : 'Bundle'}
                                 </span>
                              </td>
                              <td className="p-3">
                                 <span className="text-sm">
                                    {activation.courses_enrolled.length} course
                                    {activation.courses_enrolled.length !== 1 ? 's' : ''}
                                 </span>
                              </td>
                              <td className="p-3">
                                 <span className="text-sm">{new Date(activation.activated_at).toLocaleString()}</span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </Card>
         )}
      </div>
   );
};

CardRedemption.layout = (page: ReactNode) => <DashboardLayout children={page} />;

export default CardRedemption;
