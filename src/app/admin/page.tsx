import { getCurrentUserWithRole } from "@/lib/roles";
import { redirect } from "next/navigation";
import { pool } from "@/lib/db";

export default async function AdminPage() {
  const user = await getCurrentUserWithRole();

  if (user?.role !== "admin") {
    redirect("/dashboard");
  }

  const result = await pool.query(`
    SELECT user_id, COUNT(*) as total
    FROM leaves
    WHERE status = 'taken'
    GROUP BY user_id
  `);

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-5">Admin Dashboard</h1>

      {result.rows.map((row: any) => (
        <div key={row.user_id}>
          {row.user_id} → {row.total} leaves taken
        </div>
      ))}
    </div>
  );
}
