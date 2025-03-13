import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { isSubscribed: true }
    });

    // If user doesn't exist, return default subscription status (true)
    return NextResponse.json({
      subscribed: user?.isSubscribed ?? true,
    });
  } catch (error) {
    console.log("Error checking subscription status:", error);
    return NextResponse.json(
      { error: "Error checking subscription status" },
      { status: 500 }
    );
  }
}