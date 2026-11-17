import { createClient } from "@supabase/supabase-js";
import fs from "fs";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL && fs.existsSync(".env.local")) {
  const content = fs.readFileSync(".env.local", "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        process.env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
      }
    }
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function verifyEmailToken() {
  const tokenHash = "9847a18cfb23ecd7ad39b8c7974914cf4c12d2336e37f2a609f4e7f9";
  console.log("Verifying token_hash from real confirmation email:", tokenHash);

  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "email",
  });

  if (error) {
    console.error("Verification Error:", error.message);
  } else {
    console.log("Email Verification SUCCESS!");
    console.log("User:", data.user?.email);
    console.log("Email Confirmed At:", data.user?.email_confirmed_at);
    console.log("Session established:", !!data.session);
    console.log("Access Token:", data.session?.access_token?.substring(0, 25) + "...");

    // Now test logging in with the verified account
    console.log("\nTesting Sign In with newly verified account...");
    const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
      email: "wb_audit_1794832382145@gmail.com",
      password: "SecurePassword123!@",
    });

    if (loginErr) {
      console.error("Login Failed:", loginErr.message);
    } else {
      console.log("Login SUCCESS! Logged in as:", loginData.user.email);
      console.log("Session active:", !!loginData.session);

      // Query buyer profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", loginData.user.id)
        .single();

      console.log("Buyer Profile fetched successfully:", profile);

      // Sign out
      await supabase.auth.signOut();
      console.log("Sign Out SUCCESS!");
    }
  }
}

verifyEmailToken().catch(console.error);
