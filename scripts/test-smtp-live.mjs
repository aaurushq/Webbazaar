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

async function check() {
  const testEmail = "test_wb_1794833868683@fldubai.com";
  console.log("Testing Supabase signup with custom SMTP to:", testEmail);
  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: "AcceptanceTestPass123!@",
    options: {
      data: { display_name: "Acceptance QA User" },
      emailRedirectTo: "http://localhost:3000/auth/confirm",
    },
  });

  if (error) {
    console.error("SignUp Error:", error);
    return;
  }
  console.log("SignUp Response Data:", {
    id: data.user?.id,
    email: data.user?.email,
    confirmation_sent_at: data.user?.confirmation_sent_at,
  });
}

check().catch(console.error);
