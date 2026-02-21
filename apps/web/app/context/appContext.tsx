"use client"

import { createContext, useContext, useEffect, useState ,Dispatch, SetStateAction} from "react";
import api from "../lib/api";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";


interface AuthContextType {
  isAuth: boolean;
  setIsAuth: Dispatch<SetStateAction<boolean>>;
  user: User | null; 
  setUser: Dispatch<SetStateAction<User | null>>;
  loading: boolean;
  logOutUser : any ;
}

interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
}



const AppContext =  createContext<AuthContextType | null>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  async function fetchUser() {
    setLoading(true);
    try {

      
      const { data } = await api.get("auth/me", {
        withCredentials: true,
      });

      setUser(data as User)
      setIsAuth(true)
    } catch (error) {
        console.log(error)
    }finally{
        setLoading(false)
    }
  }

  async function logOutUser (){
    try {
      const {data} = await api.post("/auth/logout", {
        withCredentials: true,
      })
      toast.success("LogOut SuccessFull")
      setIsAuth(false)
      setUser(null)
      router.push("/login")
      
    } catch (error) {
      console.log(error)
      toast.error("something went wrong")
      
    }
  }

  useEffect(() => {

    
  
    fetchUser()
  }, [])
  

  return <AppContext.Provider value={{setIsAuth, isAuth , user, setUser, loading, logOutUser}}>
    {children}
  </AppContext.Provider>
};

export const AppData = () => { 
    const context = useContext(AppContext);

    if(!context){
        throw new Error("App Data must be used withing an AppProvider");

    }
    return context;
 }
