process.env.IS_SERVERLESS = "1";
import app from "../server.ts";

export default function handler(req: any, res: any) {
  try {
    return app(req, res);
  } catch (err: any) {
    console.error("Vercel Serverless Function Handler Error:", err);
    return res.status(500).json({
      error: err?.message || "Internal serverless error during function invocation."
    });
  }
}


