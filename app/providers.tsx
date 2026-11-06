"use client";
import { TausiNextProvider } from "@tausi-auth/js/next/client";

export function Providers({ baseUrl, publishableKey, children }: { baseUrl: string; publishableKey: string; children: React.ReactNode }) {
  return (
    <TausiNextProvider baseUrl={baseUrl} publishableKey={publishableKey}>
      {children}
    </TausiNextProvider>
  );
}
