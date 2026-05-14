import { CheckCircle, Mail, MessageSquare } from "lucide-react";
import { FC } from "react";

import { OtpChannel } from "@/api/services/tendiflow/attendees/types";

import { Footer } from "../footer";

interface AwaitingOtpScreenProps {
  otpCode: string;
  onCodeChange: (value: string) => void;
  otpError: string | null;
  otpExpiresAt: string | null;
  otpEmailSentTo: string | null;
  otpChannel: OtpChannel;
  otpPhoneSentTo: string | null;
  isSubmitting: boolean;
  onSubmit: () => void;
  onResend: () => void;
  onBack: () => void;
}

/**
 * Single-input OTP per Apple HIG and to avoid the iOS 26.x split-six-input
 * autocomplete="one-time-code" bug. The browser still surfaces the code in
 * the keyboard suggestion bar when the message arrives.
 */
export const AwaitingOtpScreen: FC<AwaitingOtpScreenProps> = ({
  otpCode,
  onCodeChange,
  otpError,
  otpExpiresAt,
  otpEmailSentTo,
  otpChannel,
  otpPhoneSentTo,
  isSubmitting,
  onSubmit,
  onResend,
  onBack,
}) => {
  const isSms = otpChannel === "sms";
  const ChannelIcon = isSms ? MessageSquare : Mail;
  const channelLabel = isSms ? "phone" : "email";
  const destination = isSms
    ? otpPhoneSentTo || "your phone"
    : otpEmailSentTo || "your email";

  return (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <div className="flex-grow flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm max-w-md w-full overflow-hidden">
        <div className="px-4 py-5 sm:p-6 text-center">
          <ChannelIcon className="mx-auto size-12 text-blue-500" />
          <h3 className="mt-2 text-base/7 font-medium text-gray-900">
            {isSms ? "Check your messages" : "Check your email"}
          </h3>
          <p className="mt-1 text-sm/6 text-gray-500">
            We sent a 6-digit code to your {channelLabel}{" "}
            <span className="font-medium text-gray-700">({destination})</span>
            . Enter it below to complete check-in.
          </p>
        </div>

        <div className="px-4 py-5 sm:p-6 border-t border-gray-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            <label
              htmlFor="otp-code"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Verification code
            </label>
            <input
              id="otp-code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              value={otpCode}
              onChange={(e) =>
                onCodeChange(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              autoFocus
              aria-invalid={!!otpError}
              aria-describedby={otpError ? "otp-error" : undefined}
              className="block w-full rounded-md border border-gray-300 px-3 py-3 text-center text-2xl font-mono tracking-[0.5em] focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="000000"
            />
            {otpError && (
              <p
                id="otp-error"
                role="alert"
                className="mt-2 text-sm text-red-600"
              >
                {otpError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || otpCode.length !== 6}
              className="mt-6 w-full flex justify-center items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-green-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:bg-gray-400"
            >
              <CheckCircle className="mr-1.5 size-4" />
              {isSubmitting ? "Verifying..." : "Verify & Check in"}
            </button>
          </form>

          <div className="mt-4 flex flex-col items-center gap-2 text-sm">
            <button
              type="button"
              onClick={onResend}
              disabled={isSubmitting}
              className="text-primary hover:text-primary/80 disabled:text-gray-400 underline-offset-2 hover:underline"
            >
              Send a new code
            </button>
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Back to edit details
            </button>
          </div>

          {otpExpiresAt && (
            <p className="mt-4 text-xs text-gray-400 text-center">
              Code expires at{" "}
              {new Date(otpExpiresAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
              .
            </p>
          )}
        </div>
      </div>
    </div>
    <Footer />
  </div>
  );
};
