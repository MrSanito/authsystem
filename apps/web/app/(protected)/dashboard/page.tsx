"use client";
import { AppData } from "@/app/context/appContext";
import React from "react";

const page = () => {
  const { logOutUser , user} = AppData();

  return (
    <div className="min-h-screen w-full flex justify-center items-center">
      <button
        onClick={logOutUser}
        className="bg-red-600 px-6 py-2 rounded-md text-white font-medium hover:bg-red-700 transition-colors"
      >
        Logout
      </button>

      {user && user.role && (
        <button
          onClick={logOutUser}
          className="bg-red-600 px-6 py-2 rounded-md text-white font-medium hover:bg-red-700 transition-colors"
        >
          Admin
        </button>
      )}
    </div>
  );
};

export default page;
