"use client";

import { useSignUp } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SignUpPage = () => {

  const { isLoaded, signUp, setActive } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      // 1. Create the user
      await signUp.create({
        emailAddress: email,
        password,
      });

      // 2. Since you disabled verification in the dashboard, 
      // the status will jump straight to "complete"
      const completeSignUp = await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      
      // Note: If you have verification DISABLED in Clerk Dashboard, 
      // you can skip prepareEmailAddressVerification and just check status.
      
      if (signUp.status === "complete") {
        await setActive({ session: signUp.createdSessionId });
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error(err.errors[0].message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
       {/* Your Custom HTML/Tailwind Form Here */}
    </div>
  );
}
export default SignUpPage;