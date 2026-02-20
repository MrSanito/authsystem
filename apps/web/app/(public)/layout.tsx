"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppData } from "../context/appContext";
import Loading from "../Loading";

export default function PublicLayout({ children }: { children: ReactNode }) {
  const { isAuth, loading } = AppData();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuth) {
      router.replace("/dashboard");
    }
  }, [loading, isAuth, router]);

  if (loading) return <Loading />;

  if (isAuth) return null;

  return <>{children}</>;
}
