"use client";

import { FC, useEffect } from "react";

import { LinearLoader } from "@/components/loaders/linear";
import { useUserCredentialsContext } from "@/contexts/user-credentials";
import { ClientPathname } from "@/types/paths";

export const LogoutView: FC = () => {
  const { logout } = useUserCredentialsContext();

  const handleLogout = async (): Promise<void> => {
    await logout();
    window.location.pathname = ClientPathname.LOGIN;
  };

  useEffect(() => {
    handleLogout();
  }, []);

  return <LinearLoader />;
};
