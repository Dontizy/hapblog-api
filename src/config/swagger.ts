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

      schemas: {
        Blog: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "6a68a51068e2335e502a002c",
            },
            title: {
              type: "string",
              example: "Getting Started with React",
            },
            content: {
              type: "string",
              example:
                "React is a JavaScript library for building user interfaces.",
            },
            imageUrl: {
              type: "string",
              nullable: true,
              example:
                "https://res.cloudinary.com/dxdtdqxse/image/upload/v1785402582/hapblog/example.webp",
            },
            category: {
              type: "string",
              example: "Programming",
            },
            likesCount: {
              type: "integer",
              example: 24,
            },
            commentsCount: {
              type: "integer",
              example: 8,
            },
            isLiked: {
              type: "boolean",
              example: false,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2026-08-03T10:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2026-08-03T10:00:00.000Z",
            },
            author: {
              type: "object",
              properties: {
                _id: {
                  type: "string",
                  example: "6a09809669c2942339c9007d",
                },
                name: {
                  type: "string",
                  example: "Ola Lucky Star",
                },
                avatar: {
                  type: "string",
                  example:
                    "https://res.cloudinary.com/dxdtdqxse/image/upload/v1785402582/hapblog/avatar.png",
                },
                bio: {
                  type: "string",
                  example: "Full-stack developer and writer.",
                },
              },
            },
          },
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



// import dotenv from "dotenv";
// import { Options } from "swagger-jsdoc";
// import swaggerJSDoc from "swagger-jsdoc";

// dotenv.config();
// const swaggerPort = Number(process.env.PORT) || 3000;

// export const swaggerOptions: Options = {
//   definition: {
//     openapi: "3.0.0",
//     info: {
//       title: "Hapblog API",
//       description:
//         "A RESTful blogging platform API that enables users to create and manage blog posts, interact through comments and replies, bookmark content, follow other users, and receive real-time notifications.",
//       version: "1.0.0",
//     },

//     servers: [
//       {
//         url: "https://hapblog-api.onrender.com",
//         description: "Production server",
//       },
//       {
//         url: `http://localhost:${swaggerPort}`,
//         description: "Development server",
//       },
//     ],

//     components: {
//       securitySchemes: {
//         bearerAuth: {
//           type: "http",
//           scheme: "bearer",
//           bearerFormat: "JWT",
//         },
//       },


//     },

//     security: [
//       {
//         bearerAuth: [],
//       },
//     ],
//   },
//   apis: ["./src/routes/*.ts", "./src/models/*.ts"],
// };

// export const swaggerSpec = swaggerJSDoc(swaggerOptions);
