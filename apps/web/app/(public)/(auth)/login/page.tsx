"use client";

import React, { useEffect, useState } from "react";
import api from "../../../lib/api";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();

  useEffect(() => {
    console.log("fresh project");

    console.error("fresh project error");
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setBtnLoading(true);
      console.log("here we are", "email", email, "password : ", password);

      const { data } = await api.post<{ message: string }>("/auth/login", {
        email,
        password,
      });
      console.log(data);
      toast.success(data.message);
      localStorage.setItem("email", email);
      router.push("/verifyotp");
    } catch (error: any) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center">
      <form
        onSubmit={submitHandler}
        className="w-full max-w-md bg-gray-900 p-8 rounded-xl shadow-lg relative z-10"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center text-white">Login Form</h2>

        <div className="mb-5">
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-white">
            Your email
          </label>
          <input
            type="email"
            id="email"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="name@example.com"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
        </div>

        <div className="mb-5">
          <label htmlFor="password" className="block mb-2 text-sm font-medium text-white">
            Your password
          </label>
          <input
            type="password"
            id="password"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
        </div>

        <label className="flex items-center mb-5 text-sm text-white">
          <input type="checkbox" className="mr-2" required />I agree with the
          terms and conditions
        </label>

        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md transition"
          disabled={btnLoading}
        >
          {btnLoading ? "Submitting..." : "Log In"}
        </button>
      </form>
    </div>
  );
};

export default Page;
