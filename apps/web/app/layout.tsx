"use client"

 
import "./globals.css";
import { ToastContainer, toast } from "react-toastify";
import { AppProvider } from "./context/appContext";
import Navbar from "./components/Navbar";
 




export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    
    <html lang="en" suppressHydrationWarning>
      <body
        className={`antialiased`}
        >
          <div className="min-h-screen w-full relative">
            <div
              className="absolute inset-0 z-0"
              style={{
                background: "radial-gradient(125% 125% at 50% 10%, #000000 40%, #0d1a36 100%)",
              }}
            />
            <div className="relative z-10">
              <AppProvider>
                <Navbar/>
                {children}
                <ToastContainer />
              </AppProvider>
            </div>
          </div>  
        </body>
    </html>
  );
}
