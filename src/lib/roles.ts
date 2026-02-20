import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function getCurrentUserWithRole() {
  const { userId } = await auth();
  if (!userId) return null;

  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  return {
    id: userId,
    role: user.publicMetadata?.role || "employee",
  };
}
