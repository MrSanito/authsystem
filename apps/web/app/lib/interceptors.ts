import api from "./api";

let isRefreshing = false;
let isRefreshingCSRFToken = false;

interface FailedRequest {
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}

let failedQueue: FailedRequest[] = [];
let csrfFailedQueue: FailedRequest[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom: FailedRequest) => {
    if (error) {
        prom.reject(error)
        
    }
    else{prom.resolve(token)}

  });
  failedQueue=[]
};

const processCSRFQueue = (error: any, token: string | null = null) => {
  csrfFailedQueue.forEach((prom: FailedRequest) => {
    if (error) {
        prom.reject(error)
        
    }
    else{prom.resolve(token)}

  });
  csrfFailedQueue=[]
};


api.interceptors.response.use((response) => response,
    async(error)=>{
        const originalRequest = error.config;
        
        if(error.response?.status === 403 && !originalRequest._retry){
            if(isRefreshing){
                return new Promise ((resolve, reject)=> {
                    failedQueue.push({resolve, reject})
                }).then(() => { 
                    return api(originalRequest)
                 })
            }
            originalRequest._retry = true;
            isRefreshing = true;
            
            try {
                await api.post("/auth/refresh")
                processQueue(null);
                return api(originalRequest)
                
            } catch (error) {

                processQueue(error, null)
                return Promise.reject(error)
                
            }
            finally{
                isRefreshing = false;
            }

        }

        return Promise.reject(error)
    }
  )


 export default api;