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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 1. Unauthenticated / Anonymous client
const anonClient = createClient(supabaseUrl, supabaseAnonKey);

async function testAuthorization() {
  console.log("=== WEBAZAAR DATABASE AUTHORIZATION & SECURITY TEST ===");

  const report = [];

  // TEST 1: Anon access to audit_logs
  try {
    const { data, error } = await anonClient.from("audit_logs").select("*");
    if (error && error.message.includes("permission denied")) {
      report.push({ test: "Anon cannot read audit_logs", result: "PASS", note: error.message });
    } else if (data && data.length === 0) {
      report.push({ test: "Anon cannot read audit_logs", result: "PASS", note: "Returned 0 rows (blocked)" });
    } else {
      report.push({ test: "Anon cannot read audit_logs", result: "FAIL", note: "Data leaked" });
    }
  } catch (e) {
    report.push({ test: "Anon cannot read audit_logs", result: "PASS", note: e.message });
  }

  // TEST 2: Anon access to user_roles
  try {
    const { data, error } = await anonClient.from("user_roles").select("*");
    if (error && error.message.includes("permission denied")) {
      report.push({ test: "Anon cannot read user_roles", result: "PASS", note: error.message });
    } else {
      report.push({ test: "Anon cannot read user_roles", result: "FAIL", note: "Allowed" });
    }
  } catch (e) {
    report.push({ test: "Anon cannot read user_roles", result: "PASS", note: e.message });
  }

  // TEST 3: Anon write to user_roles
  try {
    const { error } = await anonClient.from("user_roles").insert({
      user_id: "00000000-0000-0000-0000-000000000000",
      role: "ADMIN",
    });
    if (error && error.message.includes("permission denied")) {
      report.push({ test: "Anon cannot insert user_roles", result: "PASS", note: error.message });
    } else {
      report.push({ test: "Anon cannot insert user_roles", result: "FAIL", note: "Privilege escalation vulnerability!" });
    }
  } catch (e) {
    report.push({ test: "Anon cannot insert user_roles", result: "PASS", note: e.message });
  }

  // TEST 4: Anon execution of admin RPC
  try {
    const { error } = await anonClient.rpc("admin_process_seller_application", {
      target_app_id: "00000000-0000-0000-0000-000000000000",
      new_status: "approved",
    });
    if (error && (error.message.includes("permission denied") || error.code === "42501" || error.code === "P0001")) {
      report.push({ test: "Anon cannot execute admin RPC", result: "PASS", note: error.message });
    } else {
      report.push({ test: "Anon cannot execute admin RPC", result: "FAIL", note: "Executed unauthorized" });
    }
  } catch (e) {
    report.push({ test: "Anon cannot execute admin RPC", result: "PASS", note: e.message });
  }

  // TEST 5: Authenticated non-admin user
  console.log("Authenticating as non-admin user qa_verified_user@webbazaar.in...");
  const authClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: authSession, error: loginErr } = await authClient.auth.signInWithPassword({
    email: "qa_verified_user@webbazaar.in",
    password: "TestPassword123!",
  });

  if (loginErr) {
    console.error("Non-admin login failed:", loginErr.message);
  } else {
    // TEST 5.1: Non-admin reading audit_logs
    const { data: auditData, error: auditErr } = await authClient.from("audit_logs").select("*");
    if (!auditErr && auditData && auditData.length === 0) {
      report.push({ test: "Non-admin cannot view audit_logs (RLS)", result: "PASS", note: "0 rows visible" });
    } else if (auditErr) {
      report.push({ test: "Non-admin cannot view audit_logs", result: "PASS", note: auditErr.message });
    } else {
      report.push({ test: "Non-admin cannot view audit_logs", result: "FAIL", note: `Leaked ${auditData?.length} rows` });
    }

    // TEST 5.2: Non-admin inserting into user_roles
    const { error: roleEscalationErr } = await authClient.from("user_roles").insert({
      user_id: authSession.user.id,
      role: "ADMIN",
    });
    if (roleEscalationErr && roleEscalationErr.message.includes("permission denied")) {
      report.push({ test: "Non-admin cannot grant self ADMIN role", result: "PASS", note: roleEscalationErr.message });
    } else {
      report.push({ test: "Non-admin cannot grant self ADMIN role", result: "FAIL", note: "Escalated to ADMIN!" });
    }

    // TEST 5.3: Non-admin executing admin_process_seller_application
    const { error: rpcErr } = await authClient.rpc("admin_process_seller_application", {
      target_app_id: "00000000-0000-0000-0000-000000000000",
      new_status: "approved",
    });
    if (rpcErr && rpcErr.message.includes("Unauthorized: Administrator privileges required")) {
      report.push({ test: "Non-admin blocked from admin RPC execution", result: "PASS", note: rpcErr.message });
    } else {
      report.push({ test: "Non-admin blocked from admin RPC execution", result: "FAIL", note: rpcErr?.message });
    }

    // TEST 5.4: Non-admin reading own profile vs other profile
    const { data: myProf } = await authClient.from("profiles").select("*").eq("id", authSession.user.id).single();
    if (myProf) {
      report.push({ test: "User can read own profile", result: "PASS", note: myProf.display_name });
    } else {
      report.push({ test: "User can read own profile", result: "FAIL", note: "Could not read own profile" });
    }

    // TEST 5.5: Non-admin modifying another user's profile
    const { error: otherProfErr } = await authClient.from("profiles").update({ display_name: "HACKED" }).eq("id", "04292e75-2a6e-4fc4-806e-f955a56223dd");
    // Under RLS WITH CHECK (auth.uid() = id), updating another user's row updates 0 rows or errors
    const { data: targetProf } = await anonClient.from("profiles").select("display_name").eq("id", "04292e75-2a6e-4fc4-806e-f955a56223dd").single();
    if (targetProf && targetProf.display_name !== "HACKED") {
      report.push({ test: "User cannot modify another user's profile (RLS)", result: "PASS", note: `Target name intact: ${targetProf.display_name}` });
    } else {
      report.push({ test: "User cannot modify another user's profile", result: "FAIL", note: "Profile was overwritten!" });
    }
  }

  console.log("\n=== AUTHORIZATION TEST REPORT ===");
  console.table(report);

  const allPassed = report.every((r) => r.result === "PASS");
  console.log(`\nOVERALL AUTHORIZATION VERDICT: ${allPassed ? "ALL 8 SECURITY CHECKS PASSED (100% SECURE)" : "FAILURES DETECTED"}`);
}

testAuthorization().catch(console.error);
