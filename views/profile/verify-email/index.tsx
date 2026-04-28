"use client";

import { useRouter } from "next/navigation";
import { FC, Suspense, useEffect } from "react";

import { LinearLoader } from "@/components/loaders/linear";
import { LogoVertical } from "@/components/logos/vertical";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUserContext } from "@/contexts/current-user";
import { usePreviousPathname } from "@/hooks/utilities/previous-pathname";
import { ClientPathname } from "@/types/paths";

import { VerifyEmailForm } from "./form";

const VerifyEmailLoadingSkeleton: FC = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-64" />
    </div>
    <div className="space-y-4">
      <div className="flex gap-2 justify-center">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-12 rounded-md" />
        ))}
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  </div>
);

export const VerifyEmailView: FC = () => {
  const { currentUser } = useCurrentUserContext();
  const { previousPathname } = usePreviousPathname();
  const router = useRouter();

  if (!currentUser) {
    return null;
  }

  useEffect(() => {
    if (currentUser.email_verified_datetime) {
      if (previousPathname === ClientPathname.ACCOUNT_SETTINGS_VERIFY_EMAIL) {
        router.push(ClientPathname.HOME);
        return;
      }
      router.push(previousPathname || ClientPathname.HOME);
    }
  }, [currentUser.email_verified_datetime, previousPathname, router]);

  if (currentUser.email_verified_datetime) {
    return <LinearLoader />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-lg mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center">
              <LogoVertical wordWidth={110} showWord={false} />
            </div>
            <CardTitle className="text-xl font-semibold">
              Verify your email
            </CardTitle>
            <CardDescription className="text-center">
              We sent a verification code to{" "}
              <span className="font-semibold">{currentUser.email}</span>.
              <br />
              Please enter the code to verify your email.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Suspense fallback={<VerifyEmailLoadingSkeleton />}>
              <VerifyEmailForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
