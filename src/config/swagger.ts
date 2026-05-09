import dotenv from "dotenv";
import { Options } from "swagger-jsdoc";
import swaggerJSDoc from "swagger-jsdoc";

dotenv.config();
const swaggerPort = Number(process.env.PORT) || 3000;

export const swaggerOptions:Options = {
    definition:{
        openapi:'3.0.0',
        info:{
            title:"Simple blog app",
            description:"A blog app to learn how to use express with typescript",
            version:"1.0.0"
        },

        servers:[{
            url:`http://localhost:${swaggerPort}`,
            description:'Development server'
        }],

        components:{
            securitySchemes:{
                bearerAuth:{
                    type:'http',
                    scheme:'bearer',
                    bearerFormat:'JWT'
                }
            }
        },

        security:[{
            bearerAuth:[]
        }],
    },
    apis: ['./src/routes/*.ts', './src/models/*.ts'],
}

export const swaggerSpec = swaggerJSDoc(swaggerOptions)