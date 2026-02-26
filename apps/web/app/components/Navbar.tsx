"use client"
import React, { useState } from 'react'
import { GiHamburgerMenu } from "react-icons/gi";
import { AppData } from "../context/appContext";
import Link from "next/link";

const Navbar = () => {
    const { isAuth, logOutUser } = AppData();

    const [sideBarOpen, setsideBarOpen] = useState(false)
    const openSiderBar = () => { 
        setsideBarOpen((prev) => !prev)
        console.log("opened")
     }
  return (
    <div className=" text-white ">
      <div className=" min-h-[10vh] w-full border-b border-white/10 absolute flex justify-between items-center bg-black/60 backdrop-blur-md z-40">
        <div className="px-9 font-bold text-xl"><Link href="/">Logo</Link></div>
        <div className="px-9 hidden md:flex items-center gap-4">
          {!isAuth ? (
            <>
              <Link href="/login" className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition">
                Login
              </Link>
              <Link href="/register" className="px-5 py-2 bg-transparent border border-white/30 hover:bg-white/10 text-white rounded-md transition">
                Register
              </Link>
            </>
          ) : (
             <button onClick={logOutUser} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition">
               Logout
             </button>
          )}
        </div>
        <div className="px-9 md:hidden cursor-pointer" onClick={openSiderBar}>
          <GiHamburgerMenu size={24} />
        </div>
      </div>
      {/* THE OVERLAY: Renders only when sidebar is open */}
      {sideBarOpen && (
        <div
          className="fixed inset-0  z-40"
          onClick={() => setsideBarOpen(false)}
        ></div>
      )}

      <div
        className={`fixed top-0 left-0 min-h-screen w-64 text-white bg-black/80 backdrop-blur-xl z-50 transform transition-transform duration-300 ease-in-out border-r border-white/10 ${
          sideBarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col p-8 gap-6 mt-12">
          {!isAuth ? (
            <>
              <Link href="/login" onClick={() => setsideBarOpen(false)} className="w-full text-center px-4 py-3 bg-red-600 hover:bg-red-700 rounded-md transition text-lg font-medium">
                Login
              </Link>
              <Link href="/register" onClick={() => setsideBarOpen(false)} className="w-full text-center px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-md transition text-lg font-medium">
                Register
              </Link>
            </>
          ) : (
            <button onClick={() => { logOutUser(); setsideBarOpen(false); }} className="w-full text-center px-4 py-3 bg-red-600 hover:bg-red-700 rounded-md transition text-lg font-medium">
               Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar