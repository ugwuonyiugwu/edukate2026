"use client";

import { useSignIn } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SignInPage = () => {

  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error("Error signing in:", err.errors[0].message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="p-8 bg-white shadow-xl rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Login to EduKate</h1>
        <input 
          type="email" 
          onChange={(e) => setEmail(e.target.value)} 
          className="border p-2 w-full mb-4" 
          placeholder="Email"
        />
        <input 
          type="password" 
          onChange={(e) => setPassword(e.target.value)} 
          className="border p-2 w-full mb-4" 
          placeholder="Password"
        />
        <button type="submit" className="bg-blue-800 text-white p-2 w-full">
          Login
        </button>
      </form>
    </div>
  );
}

export default SignInPage;