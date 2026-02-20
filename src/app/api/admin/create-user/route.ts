import { NextResponse } from "next/server";
import { getCurrentUserWithRole } from "@/lib/roles";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const admin = await getCurrentUserWithRole();

  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { firstName, lastName, email, password, role } = await req.json();

  try {
    const client = await clerkClient();

    const user = await client.users.createUser({
      emailAddress: [email],
      password,
      firstName,
      lastName,
      publicMetadata: {
        role: role || "employee",
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.errors?.[0]?.message || "Failed to create user" },
      { status: 400 }
    );
  }
}
