import { auth, currentUser } from "@clerk/nextjs/server";

export async function getCurrentUserWithRole() {
  const { userId } = await auth();

  if (!userId) return null;

  const user = await currentUser();

  return {
    id: user?.id,
    role: user?.publicMetadata?.role || "employee",
  };
}
