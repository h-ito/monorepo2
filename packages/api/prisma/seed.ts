import { PrismaClient, Prisma } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

// モデルの型定義
interface BaseModel {
  id?: number;
}

interface User extends BaseModel {
  createdAt: string | Date;
  email: string;
  name?: string | null;
}

interface Company extends BaseModel {
  name?: string | null;
  address?: string | null;
}

// シードデータの型定義
interface SeedData {
  users?: User[];
  companies?: Company[];
  [key: string]: any;
}

// Prismaモデルの型
type PrismaModel = {
  deleteMany: () => Promise<Prisma.BatchPayload>;
  findFirst: (args: any) => Promise<any>;
  create: (args: any) => Promise<any>;
  count: () => Promise<number>;
};

// データベースモデルの設定
const MODEL_CONFIG = {
  users: {
    model: prisma.user as PrismaModel,
    uniqueFields: ["email"],
    dateFields: ["createdAt"],
  },
  companies: {
    model: prisma.company as PrismaModel,
    uniqueFields: [],
    dateFields: [],
  },
} as const;

type ModelName = keyof typeof MODEL_CONFIG;

// シードデータの読み込み
function loadSeedData(modelName: ModelName): any[] {
  const filePath = path.join(__dirname, "seed-data", `${modelName}.json`);
  try {
    const rawData = fs.readFileSync(filePath, "utf8");
    const seedData: SeedData = JSON.parse(rawData);
    return seedData[modelName] || [];
  } catch (error) {
    console.error(`Error loading seed data for ${modelName}:`, error);
    throw error;
  }
}

// データベースのクリーンアップとシーケンスのリセット
async function cleanup(modelName: ModelName): Promise<void> {
  console.log(`Cleaning up ${modelName}...`);
  try {
    const model = MODEL_CONFIG[modelName].model;
    await model.deleteMany();

    // PostgreSQLのシーケンスリセット
    try {
      const sequenceName = `${
        modelName.charAt(0).toUpperCase() + modelName.slice(1)
      }_id_seq`;
      await prisma.$queryRaw`SELECT setval('"${sequenceName}"', 1, false);`;
    } catch (error) {
      console.warn(
        `Failed to reset sequence for ${modelName}, continuing...`,
        error
      );
    }

    console.log(`Cleanup completed for ${modelName}`);
  } catch (error) {
    console.error(`Error during cleanup for ${modelName}:`, error);
    throw error;
  }
}

// データの変換処理
function transformData(data: any, modelName: ModelName): any {
  const { dateFields } = MODEL_CONFIG[modelName];
  const transformed = { ...data };

  // 日付フィールドの変換
  dateFields.forEach((field) => {
    if (transformed[field]) {
      transformed[field] = new Date(transformed[field]);
    }
  });

  return transformed;
}

// エンティティのシード処理
async function seedEntity(modelName: ModelName): Promise<void> {
  console.log(`Seeding ${modelName}...`);
  try {
    const config = MODEL_CONFIG[modelName];
    const records = loadSeedData(modelName);

    for (const record of records) {
      // ユニークフィールドによる既存レコードチェック
      const whereCondition = config.uniqueFields.reduce(
        (acc: Record<string, any>, field: string) => {
          if (record[field]) {
            acc[field] = record[field];
          }
          return acc;
        },
        {}
      );

      const existingRecord =
        Object.keys(whereCondition).length > 0
          ? await config.model.findFirst({ where: whereCondition })
          : null;

      if (existingRecord) {
        console.log(
          `${modelName} with ${JSON.stringify(
            whereCondition
          )} already exists, skipping...`
        );
        continue;
      }

      // データ変換とレコード作成
      const transformedData = transformData(record, modelName);
      const createdRecord = await config.model.create({
        data: transformedData,
      });

      console.log(`Created ${modelName}:`, createdRecord);
    }

    const count = await config.model.count();
    console.log(`Seeding completed for ${modelName}. Total count: ${count}`);
  } catch (error) {
    console.error(`Error seeding ${modelName}:`, error);
    throw error;
  }
}

// メインのシード処理
async function main(): Promise<void> {
  console.log("Starting seed process...");

  try {
    // 開発環境でのみクリーンアップを実行
    if (process.env.NODE_ENV === "development") {
      for (const modelName of Object.keys(MODEL_CONFIG) as ModelName[]) {
        await cleanup(modelName);
      }
    }

    // 全エンティティのシード実行
    for (const modelName of Object.keys(MODEL_CONFIG) as ModelName[]) {
      await seedEntity(modelName);
    }

    console.log("Seed process completed successfully.");
  } catch (error) {
    console.error("Error during seed process:", error);
    throw error;
  }
}

// シード処理の実行
main()
  .catch((error: Error) => {
    console.error("Fatal error during seed process:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
