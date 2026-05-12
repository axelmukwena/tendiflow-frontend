"use client";

import React, { createContext, FC, ReactNode, useContext } from "react";

import { CurrentOrganisationContextType } from "@/api/services/tendiflow/organisations/types";
import { LinearLoader } from "@/components/loaders/linear";
import { useCurrentOrganisation } from "@/hooks/organisations/current";

const CurrentOrganisationContext = createContext<
  CurrentOrganisationContextType | undefined
>(undefined);

interface CurrentOrganisationContextProviderProps {
  children: ReactNode;
}

export const CurrentOrganisationContextProvider: FC<
  CurrentOrganisationContextProviderProps
> = ({ children }) => {
  const {
    currentOrganisation,
    isLoading,
    error,
    setCurrentOrganisation,
    mutateCurrentOrganisation,
  } = useCurrentOrganisation();

  // Show loader while fetching current organisation data
  if (isLoading) {
    return <LinearLoader />;
  }

  const contextValue: CurrentOrganisationContextType = {
    currentOrganisation,
    isLoading,
    error,
    setCurrentOrganisation,
    mutateCurrentOrganisation,
  };

  return (
    <CurrentOrganisationContext.Provider value={contextValue}>
      {children}
    </CurrentOrganisationContext.Provider>
  );
};

/**
 * Hook to access current organisation context
 * @returns {CurrentOrganisationContextType} Current organisation context
 */
export const useCurrentOrganisationContext =
  (): CurrentOrganisationContextType => {
    const context = useContext(CurrentOrganisationContext);
    if (context === undefined) {
      throw new Error(
        "useCurrentOrganisationContext must be used within a CurrentOrganisationProvider",
      );
    }
    return context;
  };
