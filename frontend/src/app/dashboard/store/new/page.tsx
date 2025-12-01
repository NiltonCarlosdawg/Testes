import StoreForm from '@/components/store/store-form';
import { Separator } from '@/components/ui/separator';

export const metadata = {
  title: 'Dashboard: Nova Loja'
};

export default function NewStorePage() {
  return (
      <div className='space-y-4 p-4'>
        <Separator />
        <StoreForm />
      </div>
  );
}