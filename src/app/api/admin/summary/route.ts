import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getCurrentUserWithRole } from "@/lib/roles";
import { clerkClient } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  const currentUser = await getCurrentUserWithRole();
  if (!currentUser)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const userIdParam = searchParams.get("userId");

  const client = await clerkClient();

  // ========================================
  // 🔹 CASE 1: SELF SUMMARY (user dashboard)
  // ========================================
  if (userIdParam === "me") {
    const values: any[] = [currentUser.id];

    let query = `
      SELECT
        COUNT(*) as total_marked,
        COUNT(*) FILTER (WHERE status='taken') as total_taken,
        COUNT(*) FILTER (
          WHERE status='planned'
          ${!from || !to ? "AND leave_date >= CURRENT_DATE" : ""}
        ) as upcoming
      FROM leaves
      WHERE user_id = $1
    `;

    if (from && to) {
      query += ` AND leave_date BETWEEN $2 AND $3`;
      values.push(from, to);
    }

    const result = await pool.query(query, values);

    return NextResponse.json(
      result.rows[0] || {
        total_marked: 0,
        total_taken: 0,
        upcoming: 0,
      }
    );
  }

  // ========================================
  // 🔹 CASE 2: SINGLE EMPLOYEE (admin)
  // ========================================
  if (userIdParam && currentUser.role === "admin") {
    const values: any[] = [userIdParam];

    let query = `
      SELECT
        COUNT(*) as total_marked,
        COUNT(*) FILTER (WHERE status='taken') as total_taken,
        COUNT(*) FILTER (
          WHERE status='planned'
          ${!from || !to ? "AND leave_date >= CURRENT_DATE" : ""}
        ) as upcoming
      FROM leaves
      WHERE user_id = $1
    `;

    if (from && to) {
      query += ` AND leave_date BETWEEN $2 AND $3`;
      values.push(from, to);
    }

    const result = await pool.query(query, values);

    return NextResponse.json(
      result.rows[0] || {
        total_marked: 0,
        total_taken: 0,
        upcoming: 0,
      }
    );
  }

  // ========================================
  // 🔹 CASE 3: ALL EMPLOYEES (admin list)
  // ========================================
  if (currentUser.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clerkUsers = await client.users.getUserList({
    limit: 100,
  });

  let query = `
    SELECT 
      user_id,
      COUNT(*) as total_marked,
      COUNT(*) FILTER (WHERE status='taken') as total_taken,
      COUNT(*) FILTER (
        WHERE status='planned'
        ${!from || !to ? "AND leave_date >= CURRENT_DATE" : ""}
      ) as upcoming
    FROM leaves
    WHERE 1=1
  `;

  const values: any[] = [];

  if (from && to) {
    query += ` AND leave_date BETWEEN $1 AND $2`;
    values.push(from, to);
  }

  query += ` GROUP BY user_id`;

  const result = await pool.query(query, values);

  // Convert to map for fast lookup
  const summaryMap = new Map(
    result.rows.map((row: any) => [
      row.user_id,
      {
        total_marked: Number(row.total_marked),
        total_taken: Number(row.total_taken),
        upcoming: Number(row.upcoming),
      },
    ])
  );

  // Merge Clerk users with leave data
  const employees = clerkUsers.data.map((clerkUser) => {
    const leaveData = summaryMap.get(clerkUser.id);

    return {
      id: clerkUser.id,
      name:
        clerkUser.firstName && clerkUser.lastName
          ? `${clerkUser.firstName} ${clerkUser.lastName}`
          : clerkUser.emailAddresses[0]?.emailAddress,

      total_marked: leaveData?.total_marked ?? 0,
      total_taken: leaveData?.total_taken ?? 0,
      upcoming: leaveData?.upcoming ?? 0,
    };
  });

  return NextResponse.json(employees);
}
