import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import StoreViewPage from '@/components/store/store-view-page';

export const metadata = {
  title: 'Dashboard: Loja',
};

type PageProps = { params: Promise<{ storeId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  return (
    <PageContainer scrollable>
      <div className="flex-1 space-y-4">
        <Suspense fallback={<FormCardSkeleton />}>
          <StoreViewPage storeId={params.storeId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}