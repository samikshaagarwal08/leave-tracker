import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>You are logged in 🎉</p>
    </div>
  );
}
