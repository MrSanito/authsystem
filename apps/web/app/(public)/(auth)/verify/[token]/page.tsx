"use client";
import api from "@/app/lib/api";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useParams } from "next/navigation";


const Page = () => {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

 const params = useParams<{ token: string }>();
 const { token } = params;

  const verifyToken = async () => {
    try {
      const { data } = await api.get(`/auth/verify/${token}`);

      toast.success(data.message);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);


  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="text-white">here is the verify page</div>
      <div>here we are</div>
    </div>
  );
};

export default Page;
