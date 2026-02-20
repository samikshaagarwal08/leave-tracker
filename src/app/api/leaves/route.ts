import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getCurrentUserWithRole } from "@/lib/roles";

export async function POST(req: Request) {
  const user = await getCurrentUserWithRole();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { date } = await req.json();

  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    return NextResponse.json(
      { error: "Cannot select past date" },
      { status: 400 }
    );
  }

  await pool.query(
    `
    INSERT INTO leaves (user_id, leave_date, status)
    VALUES ($1, $2, 'planned')
    ON CONFLICT (user_id, leave_date) DO NOTHING
    `,
    [user.id, date]
  );

  return NextResponse.json({ success: true });
}

export async function GET() {
  const user = await getCurrentUserWithRole();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Auto convert planned → taken
  await pool.query(`
    UPDATE leaves
    SET status = 'taken'
    WHERE leave_date < CURRENT_DATE
    AND status = 'planned'
  `);

  const result =
    user.role === "admin"
      ? await pool.query(`SELECT * FROM leaves`)
      : await pool.query(
          `SELECT * FROM leaves WHERE user_id = $1`,
          [user.id]
        );

  return NextResponse.json(result.rows);
}
