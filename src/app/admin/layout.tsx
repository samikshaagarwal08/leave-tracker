import { redirect } from "next/navigation";
import { getCurrentUserWithRole } from "@/lib/roles";
import Header from "@/components/Header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserWithRole();

  if (!user || user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-100">
          <Header />

        {children}
    </div>
  );
}
