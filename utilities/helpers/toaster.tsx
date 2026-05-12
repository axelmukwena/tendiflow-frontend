import { Check, Clipboard } from "lucide-react";
import React, { MouseEvent, ReactNode, useEffect, useState } from "react";
import { Action, toast } from "sonner";

import { TendiflowLink } from "@/components/common/tendiflow-link";

import { copyTextToClipboard } from "./clipboard";

const CopyLinkButton: React.FC<{
  linkPathname: string;
  onCopy: (e: MouseEvent<HTMLAnchorElement>) => void;
}> = ({ linkPathname, onCopy }) => {
  const [buttonState, setButtonState] = useState<"copy" | "copied">("copy");

  const handleClick = (e: MouseEvent<HTMLAnchorElement>): void => {
    onCopy(e);
    setButtonState("copied");
  };

  useEffect(() => {
    if (buttonState === "copied") {
      const timer = setTimeout(() => setButtonState("copy"), 2000);
      return (): void => clearTimeout(timer);
    }
    return undefined;
  }, [buttonState]);

  return (
    <TendiflowLink
      href={linkPathname}
      rel="noopener noreferrer"
      onClick={handleClick}
      className="copy-sonner-link text-xs font-medium"
    >
      {buttonState === "copy" ? "Copy Link" : "Copied!"}
    </TendiflowLink>
  );
};

const ClipboardButton: React.FC<{
  onCopy: (e: MouseEvent<HTMLButtonElement>) => void;
}> = ({ onCopy }) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = (e: MouseEvent<HTMLDivElement>): void => {
    onCopy(e as unknown as MouseEvent<HTMLButtonElement>);
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 1500);
  };

  return (
    <div
      className="absolute w-[40px] h-[30px] right-[10px] inline-flex items-center justify-center p-1 rounded-md hover:bg-gray-100 transition-all duration-150 group cursor-pointer"
      aria-label={isClicked ? "Copied to clipboard" : "Copy to clipboard"}
      onClick={handleClick}
    >
      {isClicked ? (
        <Check className="h-4 w-4 text-green-600 transition-colors duration-150" />
      ) : (
        <Clipboard className="h-4 w-4 text-gray-500 group-hover:text-gray-700 transition-colors duration-150" />
      )}
    </div>
  );
};

interface NotifyProps {
  message: string;
  type?: "error" | "warning" | "success" | "info";
  linkPathname?: string;
  linkLabel?: string;
}

/**
 * Displays a toast notification with an optional link and a "Copy Link" button.
 */
export const notify = ({
  message,
  type = "info",
  linkPathname,
  linkLabel,
}: NotifyProps): void => {
  const currentOrigin =
    typeof window !== "undefined" ? window.location.origin : "";
  const link = linkPathname ? `${currentOrigin}${linkPathname}` : null;
  const copyValue = link ?? message;

  const handleCopy = (
    e: MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
  ): void => {
    e.stopPropagation();
    e.preventDefault();
    copyTextToClipboard(copyValue);
  };

  const action: Action | undefined =
    !linkPathname || !linkLabel
      ? {
          label: <ClipboardButton onCopy={handleCopy} />,
          onClick: (): void => {}, // Handled by ClipboardButton
        }
      : undefined;

  const description: ReactNode =
    linkPathname && linkLabel ? (
      <div className="flex flex-col items-start justify-start space-y-2">
        <span className="text-sm text-gray-900">{message}</span>
        <div className="flex flex-row items-center justify-start space-x-2">
          <TendiflowLink
            href={linkPathname}
            rel="noopener noreferrer"
            className="text-xs font-medium"
          >
            {linkLabel}
          </TendiflowLink>
          <span className="text-xs text-gray-400">•</span>
          <CopyLinkButton linkPathname={linkPathname} onCopy={handleCopy} />
        </div>
      </div>
    ) : (
      <div className="flex items-center justify-between w-full">
        <span className="text-sm text-gray-900 pr-2">{message}</span>
      </div>
    );

  const durations: Record<Required<NotifyProps>["type"], number> = {
    info: 8_000,
    success: 6_000,
    warning: 12_000,
    error: 20_000,
  };

  const toastOptions = {
    description,
    duration: durations[type],
    action,
    className: "group toast-custom",
    style: {
      background: "white",
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      padding: "12px 16px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    },
  };

  switch (type) {
    case "info":
      toast.info(undefined, toastOptions);
      break;
    case "success":
      toast.success(undefined, {
        ...toastOptions,
        style: {
          ...toastOptions.style,
          borderLeft: "4px solid #10b981",
        },
      });
      break;
    case "warning":
      toast.warning(undefined, {
        ...toastOptions,
        style: {
          ...toastOptions.style,
          borderLeft: "4px solid #f59e0b",
        },
      });
      break;
    case "error":
      toast.error(undefined, {
        ...toastOptions,
        style: {
          ...toastOptions.style,
          borderLeft: "4px solid #ef4444",
        },
      });
      break;
    default:
      throw new Error(`Invalid notification type: ${type}`);
  }
};
