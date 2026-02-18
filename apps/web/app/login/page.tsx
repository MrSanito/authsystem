"use client";

import React, { useEffect, useState } from "react";

const Page = () => {
  useEffect(() => {
    console.log("fresh project");
    console.error("fresh project error");
  }, []);

const [email, setEmail] = useState("")
const [password, setPassword] = useState("")


  const clickHandler = (e) => {
    e.preventDefault();
    console.log("here we are");
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-black">
      <form
        onSubmit={clickHandler}
        className="w-full max-w-md bg-gray-900 p-8 rounded-xl shadow-lg"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">Login Form</h2>

        <div className="mb-5">
          <label htmlFor="email" className="block mb-2 text-sm font-medium">
            Your email
          </label>
          <input
            type="email"
            id="email"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="name@example.com"
            required
            value={email}
            onClick={(e)=>{
              setEmail(e.target.value)
            }

            }
          />
        </div>

        <div className="mb-5">
          <label htmlFor="password" className="block mb-2 text-sm font-medium">
            Your password
          </label>
          <input
            type="password"
            id="password"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="••••••••"
            required
          />
        </div>

        <label className="flex items-center mb-5 text-sm">
          <input type="checkbox" className="mr-2" required />I agree with the
          terms and conditions
        </label>

        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Page;
