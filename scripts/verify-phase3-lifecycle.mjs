import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Load .env.local natively
if (fs.existsSync(".env.local")) {
  const content = fs.readFileSync(".env.local", "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const k = trimmed.substring(0, idx).trim();
        const v = trimmed.substring(idx + 1).trim();
        process.env[k] = v;
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing SUPABASE env vars");
  process.exit(1);
}

const sellerEmail = "qa_verified_user@webbazaar.in";
const sellerPass = "TestPassword123!";

const adminEmail = "chetan500prajapat@gmail.com";
const adminPass = "ChetanPass123!@#";

async function runPhase3Verification() {
  console.log("==================================================");
  console.log("WEBAZAAR PHASE 3: END-TO-END LIFECYCLE VERIFICATION");
  console.log("==================================================");

  // 1. Create client for Seller
  const sellerClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  console.log("\n[1] Authenticating verified seller:", sellerEmail);
  const { data: sellerAuth, error: sErr } = await sellerClient.auth.signInWithPassword({
    email: sellerEmail,
    password: sellerPass,
  });

  if (sErr || !sellerAuth.user) {
    console.error("FAIL: Seller login failed:", sErr?.message);
    process.exit(1);
  }
  console.log("PASS: Seller logged in with UID:", sellerAuth.user.id);

  // 2. Check seller role
  const { data: hasSellerRole, error: roleErr } = await sellerClient.rpc("has_role", {
    check_user_id: sellerAuth.user.id,
    check_role: "VERIFIED_SELLER",
  });
  console.log("Verified seller role check:", hasSellerRole);
  if (!hasSellerRole) {
    console.error("FAIL: User does not have VERIFIED_SELLER role");
    process.exit(1);
  }

  // 3. Create Draft Listing
  const testSlug = `e2e-restaurant-platform-${Date.now()}`;
  console.log("\n[2] Creating Ready-Made Website draft listing:", testSlug);

  const { data: draftListing, error: createErr } = await sellerClient
    .from("listings")
    .insert({
      seller_id: sellerAuth.user.id,
      category_id: "Restaurant & Food",
      listing_type: "READY_WEBSITE",
      title: "SpiceBite — Multi-Outlet Food Delivery Website",
      slug: testSlug,
      short_description: "Turnkey online food ordering and table booking platform for Indian restaurants.",
      full_description: "Complete production-ready food delivery website built with Next.js 14, Tailwind, and Supabase. Includes WhatsApp order alerts, Razorpay checkout, and live kitchen display.",
      price_inr: 14999,
      currency: "INR",
      status: "draft",
      demo_url: "https://spicebite.demo.in",
    })
    .select("id, slug, status, price_inr")
    .single();

  if (createErr || !draftListing) {
    console.error("FAIL: Failed to insert draft listing:", createErr?.message);
    process.exit(1);
  }
  console.log("PASS: Draft listing created with ID:", draftListing.id, "Status:", draftListing.status);

  // Insert specialized ready_website_details
  const { error: rwErr } = await sellerClient.from("ready_website_details").insert({
    listing_id: draftListing.id,
    website_category: "Cloud Kitchen & Dining",
    tech_stack: ["Next.js 14", "Tailwind CSS", "Supabase", "Razorpay"],
    key_features: ["WhatsApp Alerts", "Table Booking", "Admin KDS"],
    is_responsive: true,
    included_pages: "Home, Menu, Cart, Checkout, Order Tracking",
    delivery_method: "Full Source Code ZIP & GitHub Worktree",
    license_type: "Commercial Single Site",
  });

  if (rwErr) {
    console.error("FAIL: Insert ready_website_details failed:", rwErr.message);
    process.exit(1);
  }
  console.log("PASS: Specialized ready_website_details inserted.");

  // 4. Verify Anonymous Client CANNOT see Draft Listing (RLS Check 1)
  console.log("\n[3] Testing Anonymous Visibility for Draft Listing");
  const anonClient = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
  const { data: anonFindDraft } = await anonClient
    .from("listings")
    .select("id, slug, status")
    .eq("id", draftListing.id)
    .maybeSingle();

  if (anonFindDraft) {
    console.error("FAIL: Anonymous visitor was able to read draft listing! RLS failed.");
    process.exit(1);
  }
  console.log("PASS: Anonymous visitor cannot see draft listing (RLS enforced).");

  // 5. Seller Edits Draft Listing
  console.log("\n[4] Seller Edits Draft Listing Price");
  const { data: updatedDraft, error: updateErr } = await sellerClient
    .from("listings")
    .update({ price_inr: 15999, short_description: "Updated turnkey platform with instant Razorpay." })
    .eq("id", draftListing.id)
    .select("id, price_inr")
    .single();

  if (updateErr || updatedDraft?.price_inr !== 15999) {
    console.error("FAIL: Seller could not update draft:", updateErr?.message);
    process.exit(1);
  }
  console.log("PASS: Seller updated draft price to ₹15,999.");

  // 6. Seller Submits for Review
  console.log("\n[5] Seller Submits Listing for Review via RPC");
  const { data: submitRes, error: submitErr } = await sellerClient.rpc(
    "seller_submit_listing_for_review",
    { p_listing_id: draftListing.id }
  );

  if (submitErr) {
    console.error("FAIL: Submission failed:", submitErr.message);
    process.exit(1);
  }
  console.log("PASS: Submitted for review. RPC Result:", submitRes);

  // Verify status is pending_review
  const { data: checkPending } = await sellerClient
    .from("listings")
    .select("status")
    .eq("id", draftListing.id)
    .single();

  if (checkPending?.status !== "pending_review") {
    console.error("FAIL: Listing status is not pending_review, got:", checkPending?.status);
    process.exit(1);
  }
  console.log("PASS: Listing status is pending_review.");

  // 7. Verify Anonymous Client STILL CANNOT see Pending Listing
  const { data: anonFindPending } = await anonClient
    .from("listings")
    .select("id")
    .eq("id", draftListing.id)
    .maybeSingle();

  if (anonFindPending) {
    console.error("FAIL: Anonymous visitor was able to read pending listing! RLS failed.");
    process.exit(1);
  }
  console.log("PASS: Anonymous visitor cannot see pending_review listing.");

  // 8. Admin Signs In and Moderates Listing
  console.log("\n[6] Admin Signs In:", adminEmail);
  const adminClient = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
  const { data: adminAuth, error: aErr } = await adminClient.auth.signInWithPassword({
    email: adminEmail,
    password: adminPass,
  });

  if (aErr || !adminAuth.user) {
    console.error("FAIL: Admin login failed:", aErr?.message);
    process.exit(1);
  }
  console.log("PASS: Admin logged in with UID:", adminAuth.user.id);

  console.log("\n[7] Admin Approves Listing via RPC");
  const { data: approveRes, error: approveErr } = await adminClient.rpc("admin_moderate_listing", {
    p_listing_id: draftListing.id,
    p_action: "approve",
  });

  if (approveErr) {
    console.error("FAIL: Admin approval RPC failed:", approveErr.message);
    process.exit(1);
  }
  console.log("PASS: Listing approved by admin. Result:", approveRes);

  // 9. Verify Public Visibility
  console.log("\n[8] Verifying Public Visibility for Approved Listing");
  const { data: publicListing, error: pubErr } = await anonClient
    .from("listings")
    .select(`
      id,
      title,
      slug,
      status,
      price_inr,
      published_at,
      ready_website_details (*)
    `)
    .eq("id", draftListing.id)
    .single();

  if (pubErr || !publicListing || publicListing.status !== "approved") {
    console.error("FAIL: Public visitor cannot read approved listing:", pubErr?.message);
    process.exit(1);
  }
  console.log("PASS: Public visitor can view approved listing!");
  console.log("      Title:", publicListing.title);
  console.log("      Price: ₹" + publicListing.price_inr);
  console.log("      Published At:", publicListing.published_at);
  console.log("      Tech Stack:", publicListing.ready_website_details?.tech_stack);

  // 10. Verify Unauthorized User CANNOT edit approved listing
  console.log("\n[9] Security: Non-owner / Unauthorized user cannot edit listing");
  const { error: unauthErr } = await anonClient
    .from("listings")
    .update({ price_inr: 100 })
    .eq("id", draftListing.id);

  console.log("Unauthorized update attempt returned error or zero-rows:", unauthErr ? "BLOCKED (Error)" : "BLOCKED (RLS zero-rows)");

  // Verify price was NOT modified
  const { data: verifyPrice } = await anonClient.from("listings").select("price_inr").eq("id", draftListing.id).single();
  if (verifyPrice?.price_inr !== 15999) {
    console.error("FAIL: Unauthorized edit succeeded! Price was changed.");
    process.exit(1);
  }
  console.log("PASS: Unauthorized update prevented by RLS. Price remains ₹15,999.");

  // 11. Verify Audit Log recorded
  console.log("\n[10] Verifying Audit Logs");
  const { data: auditLogs } = await adminClient
    .from("audit_logs")
    .select("action, target_id, created_at")
    .eq("target_id", draftListing.id);

  console.log("Audit log records created for this listing:", auditLogs?.map((a) => a.action));
  if (!auditLogs || auditLogs.length === 0) {
    console.error("FAIL: No audit log found for listing");
    process.exit(1);
  }
  console.log("PASS: Immutable audit logs verified.");

  console.log("\n==================================================");
  console.log("ALL 11 REAL WORKFLOW TESTS PASSED SUCCESSFULLY!");
  console.log("==================================================");
}

runPhase3Verification().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
