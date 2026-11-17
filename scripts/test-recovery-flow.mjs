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

async function testRecoveryFlow() {
  const recoveryToken = "rec_8fda9b79a02b0c145377199f3ad2a50deed2edc555e596ea";
  const userEmail = "wb_audit_1794832382145@gmail.com";
  const newPassword = "NewSecurePassword999!@";

  console.log("=== TESTING PASSWORD RECOVERY OTP VERIFY & UPDATE ===");
  console.log("1. Verifying Recovery OTP token:", recoveryToken);

  const { data: verifyData, error: verifyErr } = await supabase.auth.verifyOtp({
    token_hash: recoveryToken,
    type: "recovery",
  });

  if (verifyErr) {
    console.error("Recovery Verification Failed:", verifyErr.message);
    return;
  }

  console.log("   Recovery OTP Verification SUCCESS!");
  console.log("   User:", verifyData.user?.email);
  console.log("   Session established:", !!verifyData.session);

  // 2. Update password for the recovered session
  console.log("\n2. Updating password to new secret...");
  const { data: updateData, error: updateErr } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateErr) {
    console.error("Password Update Failed:", updateErr.message);
    return;
  }

  console.log("   Password successfully updated in Supabase Auth!");

  // 3. Sign Out
  console.log("\n3. Signing out of recovery session...");
  await supabase.auth.signOut();
  console.log("   Signed out.");

  // 4. Test Sign In with OLD password (Must fail)
  console.log("\n4. Verifying OLD password no longer works...");
  const { error: oldLoginErr } = await supabase.auth.signInWithPassword({
    email: userEmail,
    password: "SecurePassword123!@",
  });
  if (oldLoginErr) {
    console.log("   Old password rejected as expected:", oldLoginErr.message);
  } else {
    console.error("   SECURITY FAILURE: Old password was accepted!");
  }

  // 5. Test Sign In with NEW password (Must succeed)
  console.log("\n5. Testing Sign In with NEW password...");
  const { data: newLoginData, error: newLoginErr } = await supabase.auth.signInWithPassword({
    email: userEmail,
    password: newPassword,
  });

  if (newLoginErr) {
    console.error("   New password login failed:", newLoginErr.message);
  } else {
    console.log("   Login with NEW password SUCCEEDED!");
    console.log("   User ID:", newLoginData.user.id);
    console.log("   Session Access Token:", newLoginData.session.access_token.substring(0, 25) + "...");
    await supabase.auth.signOut();
    console.log("\n=== PASSWORD RECOVERY FULL CYCLE: 100% VERIFIED ===");
  }
}

testRecoveryFlow().catch(console.error);
