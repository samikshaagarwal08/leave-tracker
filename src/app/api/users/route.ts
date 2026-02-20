import { clerkClient } from "@clerk/nextjs/server";
import { getCurrentUserWithRole } from "@/lib/roles";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getCurrentUserWithRole();
  if (user?.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await clerkClient();
  const users = await client.users.getUserList();

  const simplified = users.data.map((u) => ({
    id: u.id,
    email: u.emailAddresses[0]?.emailAddress,
  }));

  return NextResponse.json(simplified);
}
