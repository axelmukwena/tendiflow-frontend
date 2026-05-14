import { CheckCircle } from "lucide-react";
import { FC } from "react";

import { Footer } from "../footer";

interface FeedbackSubmittedScreenProps {
  onBackToCheckin: () => void;
}

export const FeedbackSubmittedScreen: FC<FeedbackSubmittedScreenProps> = ({
  onBackToCheckin,
}) => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <div className="flex-grow flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm max-w-md w-full overflow-hidden">
        <div className="bg-green-50 px-4 py-5 sm:p-6 text-center">
          <CheckCircle className="mx-auto size-12 text-green-500" />
          <h3 className="mt-2 text-base/7 font-medium text-gray-900">
            Thanks for the feedback
          </h3>
          <p className="mt-1 text-sm/6 text-gray-500">
            We&apos;ve passed it along to the organiser.
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <button
            type="button"
            onClick={onBackToCheckin}
            className="w-full inline-flex justify-center items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50"
          >
            Back to check-in
          </button>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);
