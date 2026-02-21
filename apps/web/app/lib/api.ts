import axios from "axios";

const getCookie =  (name : string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if(parts.length === 2) return parts.pop()?.split(';').shift();
  
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (config.method === "post" || config.method === "put" || config.method === "delete") {
    const token = getCookie("csrfToken");
    if (token) {
      if (config.headers) {
        config.headers["x-csrf-token"] = token;
      }
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});


let isRefreshing = false;
let isRefreshingCSRFToken = false;

interface FailedRequest {
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}

let failedQueue: FailedRequest[] = [];
let csrfFailedQueue : FailedRequest[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const processCSRFQueue = (error: any) => {
  csrfFailedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(null);
    }
  });
  csrfFailedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 403 && !originalRequest._retry) {
const errorCode = error.response.data?.code || "";
if(errorCode.startsWith("CSRF_")){
  if (isRefreshingCSRFToken) {
    return new Promise((resolve, reject) => {
      csrfFailedQueue.push({ resolve, reject });
    }).then(()=> api(originalRequest))
    
  }

  originalRequest._retry = true;
  isRefreshingCSRFToken = true;
try {
  await api.post( "/auth/refresh-csrf")
  processCSRFQueue(null);
  return api(originalRequest)
  
} catch (error) {

  processCSRFQueue(error);
  console.error("failed to refresh csrf toekn ", error)
  return Promise.reject(error)
  
}
finally{
  isRefreshingCSRFToken = false;
}

}

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return api(originalRequest);
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/auth/refresh");
        processQueue(null);
        return api(originalRequest);
      } catch (error) {
        processQueue(error, null);
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);


export default api;
