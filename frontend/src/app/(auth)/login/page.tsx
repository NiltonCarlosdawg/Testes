"use client";
import PageMeta from "@/components/PageMeta";
import AuthLayout from "@/components/auth/auth-layout";
import SignInForm from "@/components/auth/sign-in-form";
import Cookies from "js-cookie";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useEffect } from "react";
import { useRouter } from "next/navigation"; 

export default function SignIn() {
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
        title="React.js SignIn"
        description="This is React.js SignIn "
      />
      <AuthLayout>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
          <SignInForm />
        </GoogleOAuthProvider>
      </AuthLayout>
    </>
  );
}