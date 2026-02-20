import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getCurrentUserWithRole } from "@/lib/roles";
import { clerkClient } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  const user = await getCurrentUserWithRole();
  if (!user || user.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  const client = await clerkClient();

  if (userId) {
    const result = await pool.query(
      `
    SELECT
      COUNT(*) as total_marked,
      COUNT(*) FILTER (WHERE status='taken') as total_taken,
      COUNT(*) FILTER (
        WHERE status='planned' AND leave_date >= CURRENT_DATE
      ) as upcoming
    FROM leaves
    WHERE user_id = $1
    `,
      [userId],
    );

    return NextResponse.json(
      result.rows[0] || {
        total_marked: 0,
        total_taken: 0,
        upcoming: 0,
      },
    );
  }

  const result = await pool.query(`
  SELECT 
    user_id,
    COUNT(*) as total_marked,
    COUNT(*) FILTER (WHERE status='taken') as total_taken,
    COUNT(*) FILTER (
      WHERE status='planned' AND leave_date >= CURRENT_DATE
    ) as upcoming
  FROM leaves
  GROUP BY user_id
`);

  const users = await Promise.all(
    result.rows.map(async (row: any) => {
      const clerkUser = await client.users.getUser(row.user_id);

      return {
        id: row.user_id,
        name:
          clerkUser.firstName && clerkUser.lastName
            ? `${clerkUser.firstName} ${clerkUser.lastName}`
            : clerkUser.emailAddresses[0]?.emailAddress,
        total_marked: row.total_marked,
        total_taken: row.total_taken,
        upcoming: row.upcoming,
      };
    }),
  );

  return NextResponse.json(users);
}
