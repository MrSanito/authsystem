"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import api from "@/app/lib/api";

const Page = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    setBtnLoading(true);
    e.preventDefault();


    // API logic will be implemented later

    
    console.log("Register data:", { name, email, password });

    const {data} = await api.post("/auth/register", {
      name, email , password
    })
    toast.success(data.message);
    setBtnLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center">
      <form
        onSubmit={submitHandler}
        className="w-full max-w-md bg-gray-900 p-8 rounded-xl shadow-lg relative z-10"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center text-white">
          Register
        </h2>

        <div className="mb-5">
          <label htmlFor="name" className="block mb-2 text-sm font-medium text-white">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="John Doe"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="mb-5">
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-white">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="name@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-5">
          <label htmlFor="password" className="block mb-2 text-sm font-medium text-white">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md transition"
          disabled={btnLoading}
        >
          {btnLoading ? "Creating Account..." : "Create Account"}
        </button>

        <p className="mt-6 text-center text-gray-400 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:underline hover:text-blue-300 transition-colors">
            Log in here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Page;