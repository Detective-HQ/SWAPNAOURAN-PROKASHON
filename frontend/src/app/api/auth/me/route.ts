import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { serverApi } from "@/lib/api-server";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const me = await serverApi("/auth/me", { method: "GET" });
    return NextResponse.json(me);
  } catch (error: any) {
    const status = typeof error?.status === "number" ? error.status : 500;
    return NextResponse.json(
      { message: error?.message || "Failed to fetch profile" },
      { status }
    );
  }
}
