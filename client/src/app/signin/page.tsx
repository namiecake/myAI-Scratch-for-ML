"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FirebaseError } from "firebase/app";

export default function SignIn() {
  const { user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isSigningUp) {
      // Basic validation
      if (password.length < 6) {
        setError("Password must be at least 6 characters long");
        return;
      }

      try {
        setIsSigningUp(true);
        await createUserWithEmailAndPassword(auth, email, password);
        router.push("/");
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof FirebaseError && err !== null) {
          // Handle specific Firebase auth errors
          switch (err.code) {
            case 'auth/email-already-in-use': {
              setError("This email is already registered. Please sign in instead.");
              break;
            }
            case 'auth/invalid-email': {
              setError("Invalid email address.");
              break;
            }
            case 'auth/password-does-not-meet-requirements': {
              const match = err.message.match(/\[(.*?)\]/);
              const requirements = match ? match[1]
                .split(', ')
                .map((req: string) => `• ${req}`)
                .join('\n') : "";
              setError(`Password requirements not met:\n${requirements}`);
              break;
            }
            default:
              setError("Failed to create account. Please try again.");
          }
        }
      }
    } else {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/");
      } catch (err) {
        console.error(err);
        setError("Invalid email or password. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      {/* Welcome Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          Welcome to myAI
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl px-4">
          Learn the foundations and build AI models in an intuitive and engaging manner without needing to know how to code!
        </p>
      </div>

      {/* Sign In Box */}
      <div className="bg-gray-50 p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          {isSigningUp ? "Create Account" : "Sign In"}
        </h2>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm whitespace-pre-line">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-base font-bold text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-gray-900"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-base font-bold text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-gray-900"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-base font-medium"
          >
            {isSigningUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-base">
            {isSigningUp ? "Already have an account?" : "Don't have an account?"}
          </p>
          <button
            onClick={() => {
              setIsSigningUp(!isSigningUp);
              setError("");
            }}
            className="mt-2 w-full bg-gray-50 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-base font-medium border border-gray-300"
          >
            {isSigningUp ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
