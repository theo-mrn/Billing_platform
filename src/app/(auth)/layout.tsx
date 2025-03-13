import { Header } from "@/components/sections/Headerwithoutconnection";
import { ClientAnimationWrapper } from "@/components/client/ClientAnimationWrapper";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header name="Auth" />
      <ClientAnimationWrapper>
        {children}
      </ClientAnimationWrapper>
    </>
  );
} 