"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppData } from "../context/appContext";
import Loading from "../Loading";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { isAuth, loading } = AppData();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuth) {
      router.replace("/login");
    }
  }, [loading, isAuth, router]);

  if (loading) return <Loading />;

  if (!isAuth) return null;

  return <>{children}</>;
}
