import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getCurrentUserWithRole } from "@/lib/roles";
import { clerkClient } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  const user = await getCurrentUserWithRole();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userIdParam = searchParams.get("userId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let baseQuery = `SELECT * FROM leaves WHERE user_id = $1`;
  const values: any[] = [];

  // 🔹 ALWAYS default to current user
  let targetUserId = user.id;

  // 🔹 Admin can override if explicitly provided
  if (user.role === "admin" && userIdParam && userIdParam !== "me") {
    targetUserId = userIdParam;
  }

  values.push(targetUserId);

  // 🔹 Date filter
  if (from && to) {
    baseQuery += ` AND leave_date BETWEEN $2 AND $3`;
    values.push(from, to);
  }

  baseQuery += ` ORDER BY leave_date ASC`;

  const result = await pool.query(baseQuery, values);

  return NextResponse.json(result.rows);
}


export async function POST(req: Request) {
  const user = await getCurrentUserWithRole();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { date, leaveType, halfDayType, reason, targetUserId, status } = body;

  const selectedUser =
    user.role === "admin" && targetUserId ? targetUserId : user.id;

  await pool.query(
    `
    INSERT INTO leaves (user_id, leave_date, status, leave_type, half_day_type, reason)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (user_id, leave_date)
    DO UPDATE SET
      status = EXCLUDED.status,
      leave_type = EXCLUDED.leave_type,
      half_day_type = EXCLUDED.half_day_type,
      reason = EXCLUDED.reason
    `,
    [
      selectedUser,
      date,
      status || "planned",
      leaveType || "full",
      leaveType === "half" ? halfDayType : null,
      reason || null,
    ],
  );

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUserWithRole();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();

  if (user.role === "admin") {
    await pool.query(`DELETE FROM leaves WHERE id = $1`, [id]);
  } else {
    await pool.query(`DELETE FROM leaves WHERE id = $1 AND user_id = $2`, [
      id,
      user.id,
    ]);
  }

  return NextResponse.json({ success: true });
}
