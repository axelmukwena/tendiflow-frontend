import { FC, Fragment, ReactNode } from "react";

import { getCurrentUserServerSide } from "@/api/services/weaver/profile/fetchers";
import { Toaster } from "@/components/toaster";
import { CurrentOrganisationContextProvider } from "@/contexts/current-organisation";
import { CurrentUserContextProvider } from "@/contexts/current-user";
import { UserCredentialsContextProvider } from "@/contexts/user-credentials";
import { RequireAuth } from "@/guards/auth";
import JotaiRootWrapper from "@/store/JotaiRootWrapper";
import { ensureServerIdToken } from "@/utilities/helpers/csrf";

interface ProvidersProps {
  children: ReactNode;
}

export const Providers: FC<ProvidersProps> = async ({ children }) => {
  const token = await ensureServerIdToken();
  const user = await getCurrentUserServerSide({
    token,
  });

  return (
    <Fragment>
      <Toaster />
      <JotaiRootWrapper>
        <UserCredentialsContextProvider>
          <CurrentUserContextProvider initialCurrentUser={user}>
            <CurrentOrganisationContextProvider>
              <RequireAuth>{children}</RequireAuth>
            </CurrentOrganisationContextProvider>
          </CurrentUserContextProvider>
        </UserCredentialsContextProvider>
      </JotaiRootWrapper>
    </Fragment>
  );
};
