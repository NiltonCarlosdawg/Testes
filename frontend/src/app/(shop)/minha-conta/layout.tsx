import AccountLayout from './AccountLayout';

export default function MinhaContaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AccountLayout>{children}</AccountLayout>;
}