"use client";

import { Playground } from "@/features/playground/playground";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useRouter } from "next/navigation";

import { useEffect } from "react";
import Home from "@/features/home/Home";
import { NotificationProvider } from "@/contexts/NotificationContext";

export default function ChallengePage({
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

  const { slug } = useParams();
  const normalizedSlug: string | undefined = Array.isArray(slug) ? slug[0] : slug;

  useEffect(() => {
    if (!user) {
      router.push("/signin");
    }
    if (!slug || slug === "") {
      router.push("/");
    }
  }, [user, router]);

  if (!user) return null; // Prevents flicker before redirect
  
  return normalizedSlug ? <NotificationProvider><Playground challengeId={normalizedSlug} /></NotificationProvider> : <Home />;

}
