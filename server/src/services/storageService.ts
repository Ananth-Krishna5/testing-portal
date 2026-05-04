import {
  S3Client,
  CreateBucketCommand,
  HeadBucketCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../config/env.js";
import { log } from "../lib/logger.js";

const client = new S3Client({
  region: "us-east-1",
  endpoint: `http${env.MINIO_USE_SSL ? "s" : ""}://${env.MINIO_ENDPOINT}:${env.MINIO_PORT}`,
  forcePathStyle: true,
  credentials: {
    accessKeyId: env.MINIO_ACCESS_KEY,
    secretAccessKey: env.MINIO_SECRET_KEY,
  },
});

let ensured = false;

export async function ensureBucket(): Promise<void> {
  if (ensured) return;
  try {
    await client.send(new HeadBucketCommand({ Bucket: env.MINIO_BUCKET }));
  } catch {
    try {
      await client.send(new CreateBucketCommand({ Bucket: env.MINIO_BUCKET }));
      log.info("Created MinIO bucket", env.MINIO_BUCKET);
    } catch (e) {
      log.warn("Could not ensure bucket (may already exist or permissions)", e);
    }
  }
  ensured = true;
}

export async function putTextArtifact(key: string, body: string, contentType: string): Promise<string> {
  await ensureBucket();
  await client.send(
    new PutObjectCommand({
      Bucket: env.MINIO_BUCKET,
      Key: key,
      Body: Buffer.from(body, "utf8"),
      ContentType: contentType,
    })
  );
  return `s3://${env.MINIO_BUCKET}/${key}`;
}

export async function presignGetUrl(key: string, expiresSec = 3600): Promise<string> {
  await ensureBucket();
  const cmd = new GetObjectCommand({ Bucket: env.MINIO_BUCKET, Key: key });
  return getSignedUrl(client, cmd, { expiresIn: expiresSec });
}
