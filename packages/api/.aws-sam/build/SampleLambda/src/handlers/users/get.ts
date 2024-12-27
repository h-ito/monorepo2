import { APIGatewayProxyHandler } from "aws-lambda";
import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

export const handler: APIGatewayProxyHandler = async () => {
  console.log("testaaaa");
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Successfully retrieved users",
    }),
    headers: {
      "Content-Type": "application/json",
    },
  };
  //   try {
  //     // データベースからユーザー一覧を取得する例
  //     const users = await prisma.user.findMany();
  //     return {
  //       statusCode: 200,
  //       body: JSON.stringify({
  //         message: "Successfully retrieved users",
  //         data: users,
  //       }),
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     };
  //   } catch (error) {
  //     console.error("Error:", error);
  //     return {
  //       statusCode: 500,
  //       body: JSON.stringify({
  //         message: "Internal server error",
  //         error: error instanceof Error ? error.message : "Unknown error",
  //       }),
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     };
  //   } finally {
  //     await prisma.$disconnect();
  //   }
};
