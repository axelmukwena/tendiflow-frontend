import { MessageSquare, Star } from "lucide-react";
import { FC } from "react";

import { Footer } from "../footer";

interface FeedbackFormScreenProps {
  feedbackRating: number;
  onRatingChange: (value: number) => void;
  feedbackComment: string;
  onCommentChange: (value: string) => void;
  feedbackError: string | null;
  feedbackSubmitting: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

export const FeedbackFormScreen: FC<FeedbackFormScreenProps> = ({
  feedbackRating,
  onRatingChange,
  feedbackComment,
  onCommentChange,
  feedbackError,
  feedbackSubmitting,
  onSubmit,
  onCancel,
}) => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <div className="flex-grow flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm max-w-md w-full overflow-hidden">
        <div className="px-4 py-5 sm:p-6 text-center">
          <MessageSquare className="mx-auto size-12 text-blue-500" />
          <h3 className="mt-2 text-base/7 font-medium text-gray-900">
            Share your feedback
          </h3>
          <p className="mt-1 text-sm/6 text-gray-500">
            How did the meeting go? Your input goes to the organiser.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="px-4 py-5 sm:p-6 border-t border-gray-200 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onRatingChange(n)}
                  aria-label={`${n} star${n === 1 ? "" : "s"}`}
                  className="p-1 focus:outline-none focus:ring-2 focus:ring-ring rounded"
                >
                  <Star
                    className={`size-8 ${
                      n <= feedbackRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="feedback-comment"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Comment (optional)
            </label>
            <textarea
              id="feedback-comment"
              rows={4}
              value={feedbackComment}
              onChange={(e) => onCommentChange(e.target.value)}
              placeholder="What stood out? Anything we could improve?"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {feedbackError && (
            <p className="text-sm text-red-600" role="alert">
              {feedbackError}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={feedbackSubmitting || feedbackRating < 1}
              className="flex-1 inline-flex justify-center items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 disabled:bg-gray-400"
            >
              {feedbackSubmitting ? "Submitting..." : "Submit feedback"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={feedbackSubmitting}
              className="inline-flex justify-center items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
    <Footer />
  </div>
);
