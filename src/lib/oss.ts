// OSS只能在服务器端使用
let OSS: any;
if (typeof window === "undefined") {
  OSS = require("ali-oss");
}

interface OSSConfig {
  region: string;
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
}

const getOSSConfig = (): OSSConfig => {
  return {
    region: process.env.NEXT_PUBLIC_OSS_REGION || "oss-cn-hangzhou",
    accessKeyId: process.env.OSS_ACCESS_KEY_ID || "",
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || "",
    bucket: process.env.OSS_BUCKET || "",
  };
};

export const createOSSClient = () => {
  if (typeof window !== "undefined") {
    throw new Error("OSS客户端只能在服务器端使用");
  }

  const config = getOSSConfig();

  if (!config.accessKeyId || !config.accessKeySecret || !config.bucket) {
    throw new Error("OSS配置不完整，请检查环境变量");
  }

  return new OSS(config);
};

export const uploadImageToOSS = async (file: File): Promise<string> => {
  const client = createOSSClient();

  const fileName = `assets/${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name}`;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await client.put(fileName, buffer, {
      headers: {
        "Content-Type": file.type || "image/jpg",
        "Content-Disposition": "inline",
      },
    });
    console.log("result", result);
    return result.url;
  } catch (error) {
    console.error("OSS上传失败:", error);
    throw new Error("图片上传失败");
  }
};

export const deleteImageFromOSS = async (imageUrl: string): Promise<void> => {
  const client = createOSSClient();

  try {
    const fileName = imageUrl.split("/").pop();
    if (fileName) {
      await client.delete(`assets/${fileName}`);
    }
  } catch (error) {
    console.error("OSS删除失败:", error);
  }
};
