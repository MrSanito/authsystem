"use client";

import api from "@/app/lib/api";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";

const Page = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");
  const router = useRouter();

  const params = useParams<{ token: string }>();
  const { token } = params;

  const verifyToken = async () => {
    try {
      const { data } = await api.post<any>(`/auth/verify/${token}`);
      setStatus("success");
      setMessage(data.message || "Your email has been verified successfully!");
      toast.success(data.message);
    } catch (error: any) {
      setStatus("error");
      setMessage(error?.response?.data?.message || "Something went wrong.");
      toast.error(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    if (token) verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl p-8 text-center text-white">
        {status === "loading" && (
          <>
            <div className="animate-spin w-12 h-12 border-4 border-white/20 border-t-white rounded-full mx-auto mb-6" />
            <h2 className="text-xl font-semibold">Verifying your account...</h2>
            <p className="text-sm text-gray-400 mt-2">
              Please wait while we confirm your email.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-green-400 text-5xl mb-4">✓</div>
            <h2 className="text-2xl font-semibold mb-2">
              Verification Successful
            </h2>
            <p className="text-gray-300 mb-6">{message}</p>

            <button
              onClick={() => router.push("/login")}
              className="w-full bg-white text-black py-3 rounded-xl font-medium hover:scale-105 transition-transform duration-200"
            >
              Go to Login
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-red-400 text-5xl mb-4">✕</div>
            <h2 className="text-2xl font-semibold mb-2">Verification Failed</h2>
            <p className="text-gray-300 mb-6">{message}</p>

            <button
              onClick={() => router.push("/")}
              className="w-full bg-red-500 py-3 rounded-xl font-medium hover:bg-red-600 transition"
            >
              Go Home
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Page;
