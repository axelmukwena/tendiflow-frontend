"use client";

import { getCookie } from "cookies-next";
import { Copy } from "lucide-react";
import { FC } from "react";

import { DataDisplayContainer } from "@/components/data-display/container";
import { DateDisplayRow } from "@/components/data-display/date";
import { TextDisplayRow } from "@/components/data-display/text";
import { Button } from "@/components/ui/button";
import { useCurrentUserContext } from "@/contexts/current-user";
import { copyTextToClipboard } from "@/utilities/helpers/clipboard";
import { CookieKey } from "@/utilities/helpers/enums";
import { notify } from "@/utilities/helpers/toaster";

export const ProfileSessionView: FC = () => {
  const { currentUser: user } = useCurrentUserContext();

  if (!user) {
    return null;
  }

  const handleCopyIdToken = async (): Promise<void> => {
    const token = await getCookie(CookieKey.TENDIFLOW_ID_TOKEN);
    if (!token) {
      notify({
        message: "No ID token found — try logging in again.",
        type: "error",
      });
      return;
    }
    const ok = await copyTextToClipboard(token);
    notify({
      message: ok ? "ID token copied to clipboard" : "Failed to copy ID token",
      type: ok ? "success" : "error",
    });
  };

  return (
    <div className="w-full">
      <DataDisplayContainer
        title="System Information"
        description="Activity and record metadata"
        className="mb-8"
      >
        <DateDisplayRow
          label="Last Logged In"
          value={user.last_logged_in_at}
          format="datetime"
        />
        <DateDisplayRow
          label="Last Active"
          value={user.last_active_at}
          format="datetime"
        />
        <DateDisplayRow
          label="Date Created"
          value={user.created_at}
          format="datetime"
        />
        <DateDisplayRow
          label="Last Updated"
          value={user.updated_at}
          format="datetime"
        />
        <TextDisplayRow
          label="User ID"
          caption="Unique identifier"
          value={user.id}
        />
      </DataDisplayContainer>

      <DataDisplayContainer
        title="Session"
        description="Tools for API testing with the current session"
      >
        <div className="flex items-center justify-between gap-3 px-4 py-6 sm:px-6">
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-900">ID Token</div>
            <div className="text-xs text-gray-500">
              Bearer JWT for the current session. Treat it like a password.
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleCopyIdToken}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
        </div>
      </DataDisplayContainer>
    </div>
  );
};
