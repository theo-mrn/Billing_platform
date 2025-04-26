import { ClientAnimationWrapper } from "@/components/client/ClientAnimationWrapper";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ClientAnimationWrapper>
        {children}
      </ClientAnimationWrapper>
    </>
  );
} 