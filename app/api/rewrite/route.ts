import { NextResponse } from "next/server";
import { templateRewrite } from "@/lib/copy";


type Body = {
  productName?: string;
  points?: string[];
  badgeText?: string;
};

async function callOpenAICompatible(
  baseUrl: string,
  apiKey: string,
  model: string,
  productName: string,
  points: string[],
  badgeText?: string,
): Promise<{ productName: string; points: string[]; badgeText?: string } | null> {
  const prompt = [
    "你是电商主图文案助手。把商品名和卖点改写成适合 800×800 主图展示的短句。",
    "要求：商品名 ≤16 字；每条卖点 ≤14 字；保留原意；不要夸张违禁词；返回纯 JSON。",
    `商品名：${productName}`,
    `卖点：${JSON.stringify(points)}`,
    badgeText ? `角标：${badgeText}` : "",
    '输出格式：{"productName":"...","points":["..."],"badgeText":"...或省略"}',
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      messages: [
        { role: "system", content: "只输出 JSON，不要 markdown。" },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) return null;

  const jsonText = content.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const parsed = JSON.parse(jsonText) as {
    productName?: string;
    points?: string[];
    badgeText?: string;
  };
  if (!parsed.productName || !Array.isArray(parsed.points)) return null;
  return {
    productName: String(parsed.productName).slice(0, 24),
    points: parsed.points.map(String).slice(0, 5),
    badgeText: parsed.badgeText ? String(parsed.badgeText).slice(0, 12) : badgeText,
  };
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "无效请求体" }, { status: 400 });
  }

  const productName = (body.productName ?? "").trim();
  const points = Array.isArray(body.points)
    ? body.points.map((p) => String(p).trim()).filter(Boolean).slice(0, 5)
    : [];
  const badgeText = body.badgeText?.trim() || undefined;

  if (points.length < 1) {
    return NextResponse.json({ error: "至少填写 1 条卖点" }, { status: 400 });
  }

  const dashKey = process.env.DASHSCOPE_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  try {
    if (dashKey) {
      const rewritten = await callOpenAICompatible(
        process.env.DASHSCOPE_BASE_URL ||
          "https://dashscope.aliyuncs.com/compatible-mode/v1",
        dashKey,
        process.env.DASHSCOPE_MODEL || "qwen-plus",
        productName || "商品",
        points,
        badgeText,
      );
      if (rewritten) {
        return NextResponse.json({ ...rewritten, source: "llm" as const });
      }
    } else if (openaiKey) {
      const rewritten = await callOpenAICompatible(
        process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
        openaiKey,
        process.env.OPENAI_MODEL || "gpt-4o-mini",
        productName || "商品",
        points,
        badgeText,
      );
      if (rewritten) {
        return NextResponse.json({ ...rewritten, source: "llm" as const });
      }
    }
  } catch {
    // fall through to template
  }

  const fallback = templateRewrite({ productName, points, badgeText });
  return NextResponse.json(fallback);
}
