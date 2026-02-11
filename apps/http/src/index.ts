import cookieParser from "cookie-parser";
 import { config } from "dotenv";
import  express  from "express";
import type { Request, Response } from "express";
import router from "./routes/index.js";
 

const app = express();
 
app.use(cookieParser())
const port = 3000;
app.use((req, res, next) => {
  console.log(`🔔 Incoming Request: ${req.method} ${req.url}`);
  next();
});


app.use("/api/v1", router )

app.get("/", (req: Request, res : Response) => {
  res.json({
    success : true, 
    message: "here we are here",
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
