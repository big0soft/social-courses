import Combobox from '@/components/combobox';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import languages from '@/data/languages';
import { SharedData } from '@/types/global';
import { useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const AddLanguage = () => {
   const { props } = usePage<SharedData>();
   const { translate } = props;
   const { button, common, input } = translate;
   const [open, setOpen] = useState(false);

   // RTL language codes
   const rtlLanguages = ['ar', 'he', 'fa', 'ur', 'yi', 'ji', 'iw', 'arc', 'az', 'dv', 'ku', 'ps'];

   const { data, setData, post, errors, clearErrors } = useForm({
      code: 'en',
      name: 'English',
      nativeName: 'English',
      direction: 'ltr' as 'ltr' | 'rtl',
   });

   const submit = (e: React.FormEvent) => {
      e.preventDefault();
      clearErrors();

      post(route('language.store'), {
         onSuccess() {
            setOpen(false);
         },
      });
   };

   const transformedLanguages = languages.map((lang) => ({
      label: lang.name,
      value: lang.name,
   }));

   const detectDirection = (code: string): 'ltr' | 'rtl' => {
      return rtlLanguages.includes(code.toLowerCase()) ? 'rtl' : 'ltr';
   };

   return (
      <Dialog open={open} onOpenChange={setOpen}>
         <DialogTrigger>
            <Button>{button.add_language}</Button>
         </DialogTrigger>
         <DialogContent>
            <DialogHeader>
               <DialogTitle className="text-xl font-medium">{button.add_language}</DialogTitle>
            </DialogHeader>

            <form onSubmit={submit} className="flex h-full flex-col justify-between">
               <div className="space-y-4">
                  <div>
                     <Label>{common.language}</Label>

                     <Combobox
                        data={transformedLanguages}
                        placeholder="Select a language"
                        defaultValue={languages.find((lang) => lang.code === data.code)?.name}
                        onSelect={(selected) => {
                           const lang = languages.find((lang) => lang.name === selected.value);
                           if (lang) {
                              setData('code', lang.code as string);
                              setData('name', lang.name as string);
                              setData('nativeName', lang.nativeName as string);
                              // Auto-detect direction based on language code
                              setData('direction', detectDirection(lang.code));
                           }
                        }}
                     />

                     <InputError message={errors.code} />
                  </div>

                  <div>
                     <Label>Direction</Label>
                     <Select
                        value={data.direction}
                        onValueChange={(value) => setData('direction', value as 'ltr' | 'rtl')}
                     >
                        <SelectTrigger>
                           <SelectValue placeholder="Select direction" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="ltr">LTR (Left to Right)</SelectItem>
                           <SelectItem value="rtl">RTL (Right to Left)</SelectItem>
                        </SelectContent>
                     </Select>
                     <InputError message={errors.direction} />
                  </div>
               </div>

               <div className="mt-10 flex justify-end gap-4">
                  <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                     {button.cancel}
                  </Button>
                  <Button type="submit">{button.create}</Button>
               </div>
            </form>
         </DialogContent>
      </Dialog>
   );
};

export default AddLanguage;
