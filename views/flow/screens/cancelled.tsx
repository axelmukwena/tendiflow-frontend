import { XCircle } from "lucide-react";
import { FC } from "react";

import { Footer } from "../footer";

export const CancelledScreen: FC = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <div className="flex-grow flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm max-w-md w-full overflow-hidden">
        <div className="bg-red-50 px-4 py-5 sm:p-6 text-center">
          <XCircle className="mx-auto size-12 text-red-500" />
          <h3 className="mt-2 text-base/7 font-medium text-gray-900">
            Check-in cancelled
          </h3>
          <p className="mt-1 text-sm/6 text-gray-500">
            Your check-in for this meeting has been cancelled. If you change
            your mind, you can re-check in.
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full inline-flex justify-center items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90"
          >
            Re-check in
          </button>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);
