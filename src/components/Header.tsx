"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Header = () => {
  // useUser is a client-side hook that provides the signed-in user and metadata
  const { user } = useUser();
  const pathname = usePathname();

  const isAdmin = user?.publicMetadata?.role === "admin";
  const isAdminPage = pathname.startsWith("/admin");

  return (
    <div className="flex flex-row w-full mx-auto justify-between items-center px-10 py-4 h-16 shadow-sm bg-white">
      <h1 className="font-bold text-2xl">Leaves Tracker</h1>

      <div className="flex justify-center items-center p-4 gap-6">
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
        {isAdmin && (
          <>
            {!isAdminPage ? (
              <Link
                href="/admin"
                className="bg-red-600 cursor-pointer text-white rounded-sm py-2 px-4 text-sm font-medium"
              >
                Admin Dashboard
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="bg-red-600 cursor-pointer text-white rounded-sm py-2 px-4 text-sm font-medium"
              >
                User Dashboard
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Header;
