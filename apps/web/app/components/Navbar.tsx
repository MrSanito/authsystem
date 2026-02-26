"use client"
import React, { useState } from 'react'
import { GiHamburgerMenu } from "react-icons/gi";


const Navbar = () => {

    const [sideBarOpen, setsideBarOpen] = useState(false)
    const openSiderBar = () => { 
        setsideBarOpen((prev) => !prev)
        console.log("opened")
     }
  return (
    <div className=" text-white ">
      <div className=" min-h-[10vh] w-full border border-red-900 absolute flex justify-between  items-center">
        <div className="px-9">Logo  </div>
        <div className="px-9 hidden md:block"> Options</div>
        <div className="px-9  md:hidden" onClick={openSiderBar}>
          <GiHamburgerMenu />
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
        className={`fixed top-0 left-0 min-h-screen w-1/2 text-white bg-red-900 z-50 transform transition-transform duration-300 ease-in-out ${
          sideBarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        boom bam
      </div>
    </div>
  );
}

export default Navbar