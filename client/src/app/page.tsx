"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Home from "@/features/home/Home";

export default function Homepage({
  // eslint-disable-next-line
  params,
  // eslint-disable-next-line
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  // eslint-disable-next-line
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/signin");
    }
  }, [user, router]);

  if (!user) return null; // Prevents flicker before redirect

  return <Home />;
}
