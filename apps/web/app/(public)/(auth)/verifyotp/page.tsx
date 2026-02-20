"use client";

import OtpInput from "@/components/tailgrids/core/otp-input";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import api from "../../../lib/api";
import { AppData } from "@/app/context/appContext";

const Page = () => {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const router = useRouter();

  const {setIsAuth, setUser} = AppData()

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (email) {
       setEmail(email);
    }
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setBtnLoading(true);
    try {
      console.log("Verifying OTP:", otp);

      const { data } = await api.post<{ message: string, user: any }>(
        "/auth/verifyOtp",
        {
          email,
          otp,
        },
        {
          withCredentials: true,
        },
      );

      console.log(data);
      toast.success(data.message);
      localStorage.removeItem("email");
      setIsAuth(true);
      setUser(data.user)
      
      router.push("/dashboard");
    } catch (error: any) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center">
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-xl shadow-lg relative z-10">
        <h2 className="text-2xl font-semibold mb-6 text-center text-white">
          Verify OTP
        </h2>
        <p className="text-gray-400 text-center mb-6 text-sm">
          Enter the 6-digit code sent to your email.
        </p>

        <form onSubmit={handleVerify} className="flex flex-col gap-6">
          <div className="flex justify-center">
            <OtpInput
              label=""
              digitLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              hint=""
              className="!border-gray-700 !bg-gray-800 !text-white focus:!border-blue-500 focus:!ring-blue-500/20"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md transition font-medium disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={btnLoading}
          >
            {btnLoading ? "Verifying..." : "Verify Code"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            className="text-sm text-gray-500 hover:text-white transition"
            onClick={() => toast.info("Resend feature coming soon")}
          >
            Didn't receive code? Resend
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;
