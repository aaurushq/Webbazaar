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

async function testPasswordRecovery() {
  const targetEmail = "wb_audit_1794832382145@gmail.com";
  console.log("=== TESTING COMPLETE PASSWORD RECOVERY ===");
  console.log("1. Requesting password reset email for:", targetEmail);

  const { data: reqData, error: reqErr } = await supabase.auth.resetPasswordForEmail(targetEmail, {
    redirectTo: "http://localhost:3000/auth/confirm?next=/reset-password",
  });

  if (reqErr) {
    console.error("Password reset request error:", reqErr);
    return;
  }
  console.log("   Password reset email dispatched successfully!");

  // Wait 2 seconds for database record to commit
  await new Promise((r) => setTimeout(r, 2000));
}

testPasswordRecovery().catch(console.error);
