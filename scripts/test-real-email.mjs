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

async function testEmail() {
  const timestamp = Date.now();
  const testEmail = `wb_audit_${timestamp}@gmail.com`;

  console.log("Testing SignUp email dispatch to:", testEmail);
  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: "SecurePassword123!@",
    options: {
      data: { full_name: "Email Audit User" },
      emailRedirectTo: "http://localhost:3000/auth/confirm?next=/dashboard/buyer",
    },
  });

  if (error) {
    console.log("SignUp Result: ERROR");
    console.log("Message:", error.message);
    console.log("Status:", error.status);
    console.log("Code:", error.code);
  } else {
    console.log("SignUp Result: SUCCESS");
    console.log("User ID:", data.user?.id);
    console.log("Email:", data.user?.email);
    console.log("Confirmation Sent At:", data.user?.confirmation_sent_at);
  }
}

testEmail().catch(console.error);
