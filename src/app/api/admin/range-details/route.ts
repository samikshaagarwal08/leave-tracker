import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getCurrentUserWithRole } from "@/lib/roles";
import { clerkClient } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  const user = await getCurrentUserWithRole();
  if (!user || user.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to)
    return NextResponse.json([]);

  const result = await pool.query(
    `
    SELECT * FROM leaves
    WHERE leave_date BETWEEN $1 AND $2
    ORDER BY leave_date ASC
    `,
    [from, to],
  );

  const client = await clerkClient();

  const enriched = await Promise.all(
    result.rows.map(async (leave: any) => {
      const clerkUser = await client.users.getUser(leave.user_id);

      return {
        ...leave,
        employeeName:
          clerkUser.firstName && clerkUser.lastName
            ? `${clerkUser.firstName} ${clerkUser.lastName}`
            : clerkUser.emailAddresses[0]?.emailAddress,
      };
    }),
  );

  return NextResponse.json(enriched);
}
