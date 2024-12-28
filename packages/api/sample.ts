import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const handler = async () => {
  try {
    // データベースからユーザー一覧を取得する例
    const users = await prisma.user.findMany();
    console.log(users);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Successfully retrieved users",
        data: users,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    };
  } finally {
    await prisma.$disconnect();
  }
};

handler();
