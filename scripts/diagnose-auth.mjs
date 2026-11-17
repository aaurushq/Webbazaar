import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Read .env.local manually if not in process.env
if (!process.env.NEXT_PUBLIC_SUPABASE_URL && fs.existsSync(".env.local")) {
  const content = fs.readFileSync(".env.local", "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        process.env[key] = val;
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl);
console.log("Anon key present:", !!supabaseAnonKey);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnose() {
  const testEmail = `test_wb_${Date.now()}@gmail.com`;
  const testPassword = "Password123!@#";

  console.log("\n--- Testing Sign Up ---");
  console.log("Email:", testEmail);

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        full_name: "Test User",
      },
      emailRedirectTo: "http://localhost:3000/auth/confirm",
    },
  });

  if (signUpError) {
    console.error("SignUp Error Object:", JSON.stringify(signUpError, null, 2));
    console.error("SignUp Error Message:", signUpError.message);
    console.error("SignUp Error Status:", signUpError.status);
    console.error("SignUp Error Code:", signUpError.code);
  } else {
    console.log("SignUp SUCCESS!");
    console.log("User ID:", signUpData.user?.id);
    console.log("User Email:", signUpData.user?.email);
    console.log("Email Confirmed At:", signUpData.user?.email_confirmed_at);
    console.log("Session:", !!signUpData.session);
    console.log("Identities:", signUpData.user?.identities);
  }

  // Check if profile was created
  if (signUpData?.user?.id) {
    console.log("\n--- Checking Profile Trigger ---");
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", signUpData.user.id)
      .single();

    if (profileErr) {
      console.error("Profile Query Error:", profileErr);
    } else {
      console.log("Profile created by trigger:", profile);
    }

    const { data: roles, error: rolesErr } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", signUpData.user.id);

    if (rolesErr) {
      console.error("User Roles Query Error:", rolesErr);
    } else {
      console.log("Roles assigned by trigger:", roles);
    }
  }

  console.log("\n--- Testing Sign In with unverified account ---");
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInError) {
    console.log("SignIn result (expected if email confirmation enabled):", signInError.message, "(code:", signInError.code, "status:", signInError.status, ")");
  } else {
    console.log("SignIn succeeded! Session active:", !!signInData.session);
  }
}

diagnose().catch(console.error);
