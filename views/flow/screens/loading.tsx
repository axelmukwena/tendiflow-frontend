import { FC } from "react";

import { Spinner } from "@/components/loaders/spinner";

export const LoadingScreen: FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="animate-pulse text-center max-w-sm">
      <Spinner size="4" />
      <h3 className="mt-4 text-base/7 font-medium text-gray-900">
        Loading meeting...
      </h3>
      <p className="mt-2 text-sm text-gray-500">
        This can take up to 30 seconds the first time. If it&apos;s still
        loading after a minute, please refresh the page.
      </p>
    </div>
  </div>
);
