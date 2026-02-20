// import { NextResponse } from "next/server";
// import { pool } from "@/lib/db";
// import { getCurrentUserWithRole } from "@/lib/roles";

// export async function POST(req: Request) {
//   const user = await getCurrentUserWithRole();
//   if (!user)
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   const body = await req.json();
//   const { date, leaveType, halfDayType, reason, targetUserId, status } = body;

//   const selectedDate = new Date(date);
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);

//   if (selectedDate < today && user.role !== "admin") {
//     return NextResponse.json(
//       { error: "Cannot select past date" },
//       { status: 400 },
//     );
//   }

//   const userId = user.role === "admin" && targetUserId ? targetUserId : user.id;

//   await pool.query(
//     `
//   INSERT INTO leaves (user_id, leave_date, status, leave_type, half_day_type, reason)
//   VALUES ($1, $2, $3, $4, $5, $6)
//   ON CONFLICT (user_id, leave_date)
//   DO UPDATE SET
//     status = EXCLUDED.status,
//     leave_type = EXCLUDED.leave_type,
//     half_day_type = EXCLUDED.half_day_type,
//     reason = EXCLUDED.reason
//   `,
//     [
//       userId,
//       date,
//       status || "planned",
//       leaveType,
//       leaveType === "half" ? halfDayType : null,
//       reason || null,
//     ],
//   );

//   return NextResponse.json({ success: true });
// }

// export async function GET(req: Request) {
//   const user = await getCurrentUserWithRole();
//   if (!user)
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   const { searchParams } = new URL(req.url);
//   const userId = searchParams.get("userId");

//   await pool.query(`
//     UPDATE leaves
//     SET status = 'taken'
//     WHERE leave_date < CURRENT_DATE
//     AND status = 'planned'
//   `);

//   let result;

//   if (user.role === "admin" && userId) {
//     result = await pool.query(`SELECT * FROM leaves WHERE user_id = $1`, [
//       userId,
//     ]);
//   } else if (user.role === "admin") {
//     result = await pool.query(`SELECT * FROM leaves`);
//   } else {
//     result = await pool.query(`SELECT * FROM leaves WHERE user_id = $1`, [
//       user.id,
//     ]);
//   }

//   return NextResponse.json(result.rows);
// }

// export async function DELETE(req: Request) {
//   const user = await getCurrentUserWithRole();
//   if (!user)
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   const { id } = await req.json();

//   if (user.role === "admin") {
//     await pool.query(`DELETE FROM leaves WHERE id = $1`, [id]);
//   } else {
//     await pool.query(
//       `DELETE FROM leaves WHERE id = $1 AND user_id = $2`,
//       [id, user.id]
//     );
//   }

//   return NextResponse.json({ success: true });
// }

import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getCurrentUserWithRole } from "@/lib/roles";
import { clerkClient } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  const user = await getCurrentUserWithRole();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  const client = await clerkClient();

  if (user.role === "admin") {
    const result = await pool.query(`SELECT * FROM leaves`);

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

  const result = await pool.query(`SELECT * FROM leaves WHERE user_id = $1`, [
    user.id,
  ]);

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
