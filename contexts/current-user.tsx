"use client";

import React, { createContext, FC, ReactNode, useContext } from "react";

import { CurrentUserContextType } from "@/api/services/tendiflow/profile/types";
import { User } from "@/api/services/tendiflow/users/types";
import { getCurrentUserPermissions } from "@/hooks/profile/current";

const CurrentUserContext = createContext<CurrentUserContextType | undefined>(
  undefined,
);

interface CurrentUserContextProviderProps {
  children: ReactNode;
  initialCurrentUser?: User | null;
}

export const CurrentUserContextProvider: FC<
  CurrentUserContextProviderProps
> = ({ children, initialCurrentUser }) => {
  const { organisationIds, currentOrganisationId, permission } =
    getCurrentUserPermissions(initialCurrentUser);

  const contextValue: CurrentUserContextType = {
    currentUser: initialCurrentUser ?? null,
    isLoading: false,
    error: "",
    mutateCurrentUser: () => Promise.resolve(),
    organisationIds,
    currentOrganisationId,
    currentOrganisationPermission: permission,
  };

  return (
    <CurrentUserContext.Provider value={contextValue}>
      {children}
    </CurrentUserContext.Provider>
  );
};

/**
 * Hook to access current user context
 * @returns {CurrentUserContextType} Current user context
 */
export const useCurrentUserContext = (): CurrentUserContextType => {
  const context = useContext(CurrentUserContext);
  if (context === undefined) {
    throw new Error(
      "useCurrentUserContext must be used within a CurrentUserProvider",
    );
  }
  return context;
};
