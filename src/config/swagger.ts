import dotenv from "dotenv";
import { Options } from "swagger-jsdoc";
import swaggerJSDoc from "swagger-jsdoc";

dotenv.config();
const swaggerPort = Number(process.env.PORT) || 3000;

export const swaggerOptions: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Hapblog API",
      description:
        "A RESTful blogging platform API that enables users to create and manage blog posts, interact through comments and replies, bookmark content, follow other users, and receive real-time notifications.",
      version: "1.0.0",
    },

    servers: [
      {
        url: "https://hapblog-api.onrender.com",
        description: "Production server",
      },
      {
        url: `http://localhost:${swaggerPort}`,
        description: "Development server",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/models/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
