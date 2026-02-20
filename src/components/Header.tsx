"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import Link from "next/link";

const Header = () => {
  // useUser is a client-side hook that provides the signed-in user and metadata
  const { user } = useUser();

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
        {user && user.publicMetadata?.role === "admin" && (
        <button className="bg-red-600 text-white rounded-sm py-2 px-3">
          <Link href="/admin" className="text-base font-medium ">
            Admin Dashboard
          </Link>
        </button>
      )}
      </div>

      
    </div>
  );
};

export default Header;
