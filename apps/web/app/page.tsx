"use client"

import Image from "next/image";
import { AppData } from "./context/appContext";
import Loading from "./Loading"

export default function Home() {
  const { isAuth, loading } = AppData();

  return loading ? (
    <Loading />
  ) : (
    <div className="min-h-screen flex justify-center items-center">
      Home page
    </div>
  );
}
