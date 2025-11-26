import { cn } from '@/lib/utils';
import { SharedData } from '@/types/global';
import { usePage } from '@inertiajs/react';

const AppLogo = ({ className, theme }: { theme?: 'light' | 'dark'; className?: string }) => {
   const { system } = usePage<SharedData>().props;

   // Use Beta E-Learning logo
   const betaLogo = '/assets/icons/beta-logo.svg';

   if (theme && theme === 'dark') {
      return <img src={betaLogo} alt="Beta E-Learning" className={cn('block w-[70px]', className)} />;
   }

   if (theme && theme === 'light') {
      return <img src={betaLogo} alt="Beta E-Learning" className={cn('block w-[70px]', className)} />;
   }

   return (
      <>
         <img src={betaLogo} alt="Beta E-Learning" className={cn('block w-[70px] ', className)} />
      </>
   );
};

export default AppLogo;
