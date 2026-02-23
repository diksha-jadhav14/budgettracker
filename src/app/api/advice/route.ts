import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Groq from "groq-sdk";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a helpful and wise financial advisor. Give a short, one-sentence financial advice to the user. Keep it brief, motivational, and actionable.",
        },
        {
          role: "user",
          content: "Give me a practical financial tip for today.",
        },
      ],
      model: "llama3-8b-8192", // Using a faster/commonly available free model on Groq
    });

    const advice =
      chatCompletion.choices[0]?.message?.content ||
      "Save a penny, earn a penny.";

    return NextResponse.json({ advice });
  } catch (error) {
    console.error("Error fetching advice:", error);
    return NextResponse.json(
      { advice: "Stay on top of your budget today!" },
      { status: 500 },
    ); // Fallback advice
  }
}
