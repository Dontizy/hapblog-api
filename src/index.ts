import dotenv from 'dotenv';
import express from "express";
import "dotenv/config";
import { connectDB } from './config/database.js';
import userRoute from './routes/userRoutes.js';
import blogRoute from './routes/blogRoutes.js'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './config/swagger.js';
import errorHandler from './middleware/errorHandlerMiddleWare.js';

const app = express();

const port = Number(process.env.PORT) || 3000;
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/user', userRoute)
app.use('/blog', blogRoute)
app.use(errorHandler)

app.get("/",(req, res)=>{
    res.send("Welcome To Hapblog")
})

const startServer = async()=>{
    
    try {
        await connectDB();
        const server = app.listen(port,()=>console.log(`Server running @ http://localhost:${port}`))
       server.on("error", (err)=>{
          console.error("Server error:",err)
          process.exit(1)
       })
        
    } catch (err) {
        console.error("Startup error:", err)
        process.exit(1)
    }
}

startServer()