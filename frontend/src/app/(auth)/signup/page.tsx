"use client";
import PageMeta from "@/components/PageMeta";
import AuthLayout from "@/components/auth/auth-layout";
import SignUpForm from "@/components/auth/sign-up-form";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignUp() {
  const router = useRouter(); 

  useEffect(() => {
    const token = Cookies.get("access_token");
    if (token) {
      router.push("/"); 
    }
  }, [router]);


  return (
    <>
      <PageMeta
        title="React.js SignUp Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js SignUp Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}