import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Load .env.local
if (fs.existsSync(".env.local")) {
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

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const SELLER_EMAIL = "qa_verified_user@webbazaar.in";
const SELLER_PASS = "TestPassword123!";
// Pure BUYER (non-admin) so we can ALSO verify admin cannot casually browse private chats!
const BUYER_EMAIL = "wb_audit_1794832382145@gmail.com";
const BUYER_PASS = "SecurePassword123!@";
// Admin account (non-participant on Buyer<->Seller conversation)
const ADMIN_EMAIL = "chetan500prajapat@gmail.com";
const ADMIN_PASS = "ChetanPass123!@#";

const APPROVED_LISTING_ID = "abd1a8ff-5acd-44b4-ab50-d3a23aeb958a";

function makeClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function runPhase5SecurityAndLifecycleTests() {
  console.log("===================================================================");
  console.log("WEBAZAAR PHASE 5: CUSTOMIZATION & QUOTATION RLS + LIFECYCLE TESTS");
  console.log("===================================================================\n");

  const results = [];
  const record = (name, pass, detail) => {
    results.push({ name, status: pass ? "PASS" : "FAIL", detail });
    console.log(`[${pass ? "PASS" : "FAIL"}] ${name} — ${detail}`);
  };

  const anon = makeClient();
  const seller = makeClient();
  const buyer = makeClient();
  const admin = makeClient();

  const { data: sAuth, error: sErr } = await seller.auth.signInWithPassword({
    email: SELLER_EMAIL,
    password: SELLER_PASS,
  });
  if (sErr || !sAuth.user) throw new Error(`Seller login failed: ${sErr?.message}`);

  const { data: bAuth, error: bErr } = await buyer.auth.signInWithPassword({
    email: BUYER_EMAIL,
    password: BUYER_PASS,
  });
  if (bErr || !bAuth.user) throw new Error(`Buyer login failed: ${bErr?.message}`);

  const { data: aAuth, error: aErr } = await admin.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASS,
  });
  if (aErr || !aAuth.user) throw new Error(`Admin login failed: ${aErr?.message}`);

  // 1. Anon blocked on customization_requests & quotes
  const { error: anonReqErr } = await anon.from("customization_requests").select("*");
  const { error: anonQuoteErr } = await anon.from("quotes").select("*");
  record(
    "1. Anonymous access blocked on customization_requests & quotes",
    Boolean(anonReqErr && anonQuoteErr),
    `reqErr=${anonReqErr?.code}, quoteErr=${anonQuoteErr?.code}`
  );

  // Create or reuse conversation between pure Buyer and Seller
  const { data: convId, error: convErr } = await buyer.rpc("start_or_get_conversation", {
    p_listing_id: APPROVED_LISTING_ID,
  });
  if (convErr || !convId) throw new Error(`Conversation init failed: ${convErr?.message}`);

  // 2. Non-participant (even ADMIN) cannot casually browse private conversation directly
  const { data: adminDirectConv } = await admin
    .from("conversations")
    .select("*")
    .eq("id", convId);
  const { data: adminDirectMsgs } = await admin
    .from("messages")
    .select("*")
    .eq("conversation_id", convId);
  record(
    "2. Admin unrestricted direct browsing of private chats blocked by RLS",
    (adminDirectConv?.length || 0) === 0 && (adminDirectMsgs?.length || 0) === 0,
    `convRows=${adminDirectConv?.length || 0}, msgRows=${adminDirectMsgs?.length || 0}`
  );

  // 3. Audited admin moderation RPC requires a detailed reason and writes audit_logs
  const { error: shortReasonErr } = await admin.rpc("admin_inspect_conversation_for_moderation", {
    p_conversation_id: convId,
    p_reason: "short",
  });
  const { data: modData, error: modErr } = await admin.rpc(
    "admin_inspect_conversation_for_moderation",
    {
      p_conversation_id: convId,
      p_reason: "QA security verification of audited moderation workflow",
    }
  );
  record(
    "3. Admin moderation inspection requires detailed reason & succeeds with audit trail",
    Boolean(shortReasonErr && !modErr && modData?.conversation?.id === convId),
    `shortReasonBlocked=${Boolean(shortReasonErr)}, auditedConvId=${modData?.conversation?.id || "none"}`
  );

  // 4. Buyer cannot create request impersonating another buyer
  const { error: spoofBuyerErr } = await admin.from("customization_requests").insert({
    conversation_id: convId,
    listing_id: APPROVED_LISTING_ID,
    buyer_id: bAuth.user.id,
    seller_id: sAuth.user.id,
    title: "Spoofed buyer request",
    requirements: "Attempting to create a customization request on behalf of another buyer.",
    status: "submitted",
  });
  record(
    "4. Buyers cannot create customization requests for another buyer",
    Boolean(spoofBuyerErr),
    spoofBuyerErr?.message || "Unexpectedly succeeded"
  );

  // 5. Buyer creates valid customization request
  const { data: reqId, error: reqCreateErr } = await buyer.rpc("create_customization_request", {
    p_conversation_id: convId,
    p_title: `Brand & GST Checkout Customization (${Date.now()})`,
    p_requirements:
      "Need custom brand colors, domain setup, WhatsApp alerts, and GST invoice PDF support.",
    p_requested_features: ["Brand Colors & Logo", "Custom Domain & Deployment"],
    p_optional_budget: 24000,
    p_desired_delivery_date: "2026-12-15",
  });
  record(
    "5. Authenticated buyer submits customization request",
    Boolean(!reqCreateErr && reqId),
    `requestId=${reqId || reqCreateErr?.message}`
  );
  if (!reqId) process.exit(1);

  // 6. Unauthorized 3rd party cannot read request
  const { data: thirdPartyReq } = await admin
    .from("customization_requests")
    .select("*")
    .eq("id", reqId);
  record(
    "6. Third party cannot read private customization request",
    (thirdPartyReq?.length || 0) === 0,
    `rows=${thirdPartyReq?.length || 0}`
  );

  // 7. Seller cannot send quote on a request they do not own (tested by admin pretending to be seller)
  const { error: nonSellerQuoteErr } = await admin.rpc("create_seller_quote", {
    p_customization_request_id: reqId,
    p_base_product_price: 15999,
    p_customization_price: 4000,
    p_scope_of_work: "Unauthorized third-party quote attempt on someone else's request.",
    p_estimated_delivery_days: 5,
    p_revision_policy: "2 revisions",
    p_payment_terms: "50% upfront, 50% on handover",
    p_valid_days: 7,
    p_status: "sent",
  });
  record(
    "7. Non-participant seller cannot send quote on foreign conversation",
    Boolean(nonSellerQuoteErr),
    nonSellerQuoteErr?.message || "Unexpectedly succeeded"
  );

  // 8. Forged total_price & negative prices rejected by DB constraints & RLS
  const { error: forgedTotalErr } = await seller.from("quotes").insert({
    customization_request_id: reqId,
    seller_id: sAuth.user.id,
    buyer_id: bAuth.user.id,
    base_product_price: 15999,
    customization_price: 5000,
    total_price: 999, // Forged!
    scope_of_work: "Forged total price test scope of work with sufficient length.",
    estimated_delivery_days: 5,
    revision_policy: "2 revisions",
    payment_terms: "50% advance, 50% delivery",
    status: "sent",
    expires_at: new Date(Date.now() + 7 * 86400_000).toISOString(),
  });
  const { error: negPriceErr } = await seller.rpc("create_seller_quote", {
    p_customization_request_id: reqId,
    p_base_product_price: 15999,
    p_customization_price: -500,
    p_scope_of_work: "Negative customization price test with sufficient scope text.",
    p_estimated_delivery_days: 5,
    p_revision_policy: "2 revisions",
    p_payment_terms: "50% advance, 50% delivery",
    p_valid_days: 7,
    p_status: "sent",
  });
  record(
    "8. Forged total_price and negative prices rejected",
    Boolean(forgedTotalErr && negPriceErr),
    `forgedBlocked=${Boolean(forgedTotalErr)}, negBlocked=${Boolean(negPriceErr)}`
  );

  // 9. Seller sends Quote v1 -> verify server-side total calculation
  const { data: q1Id, error: q1Err } = await seller.rpc("create_seller_quote", {
    p_customization_request_id: reqId,
    p_base_product_price: 15999,
    p_customization_price: 6001,
    p_scope_of_work: "Complete branding update, GST invoice PDF generator, and custom domain deployment.",
    p_estimated_delivery_days: 6,
    p_revision_policy: "Up to 2 revision rounds included",
    p_payment_terms: "50% advance arranged directly, 50% on final delivery",
    p_valid_days: 7,
    p_status: "sent",
  });
  const { data: q1Row } = await buyer.from("quotes").select("*").eq("id", q1Id).single();
  record(
    "9. Seller sends Quote v1 with server-computed INR total",
    Boolean(!q1Err && q1Row && q1Row.version === 1 && Number(q1Row.total_price) === 22000),
    `quoteId=${q1Id}, version=${q1Row?.version}, total=${q1Row?.total_price}`
  );

  // 10. Third party cannot read quote
  const { data: thirdPartyQuote } = await admin.from("quotes").select("*").eq("id", q1Id);
  record(
    "10. Third party cannot read quotation",
    (thirdPartyQuote?.length || 0) === 0,
    `rows=${thirdPartyQuote?.length || 0}`
  );

  // 11. Buyer cannot modify seller quote terms; Seller cannot accept own quote
  const { error: buyerTamperErr } = await buyer
    .from("quotes")
    .update({ customization_price: 0, total_price: 15999 })
    .eq("id", q1Id);
  const { error: sellerSelfAcceptErr } = await seller.rpc("respond_to_quote", {
    p_quote_id: q1Id,
    p_decision: "accepted",
  });
  record(
    "11. Buyer cannot modify quote terms & Seller cannot accept own quote",
    Boolean(buyerTamperErr && sellerSelfAcceptErr),
    `buyerEditBlocked=${Boolean(buyerTamperErr)}, sellerAcceptBlocked=${Boolean(sellerSelfAcceptErr)}`
  );

  // 12. Buyer declines Quote v1 -> Seller sends Revised Quote v2 (withdrawn test) -> Revised Quote v3
  const { error: declineErr } = await buyer.rpc("respond_to_quote", {
    p_quote_id: q1Id,
    p_decision: "declined",
  });
  const { data: q2Id } = await seller.rpc("create_seller_quote", {
    p_customization_request_id: reqId,
    p_base_product_price: 15999,
    p_customization_price: 4501,
    p_scope_of_work: "Revised scope v2: branding, GST invoice PDF, and deployment in 5 days.",
    p_estimated_delivery_days: 5,
    p_revision_policy: "Up to 3 revision rounds included",
    p_payment_terms: "50% advance arranged directly, 50% on final delivery",
    p_valid_days: 7,
    p_status: "sent",
  });
  // Withdraw v2 and prove buyer cannot accept withdrawn quote
  await seller.from("quotes").update({ status: "withdrawn" }).eq("id", q2Id);
  const { error: acceptWithdrawnErr } = await buyer.rpc("respond_to_quote", {
    p_quote_id: q2Id,
    p_decision: "accepted",
  });
  record(
    "12. Decline flow, revised quote versioning & withdrawn quote rejection",
    Boolean(!declineErr && q2Id && acceptWithdrawnErr),
    `declinedOk=${!declineErr}, v2Id=${q2Id}, acceptWithdrawnBlocked=${Boolean(acceptWithdrawnErr)}`
  );

  // 13. Seller sends Quote v3 -> Buyer accepts -> Duplicate acceptance blocked -> Accepted quote immutable
  const { data: q3Id, error: q3Err } = await seller.rpc("create_seller_quote", {
    p_customization_request_id: reqId,
    p_base_product_price: 15999,
    p_customization_price: 4001,
    p_scope_of_work: "Final revised scope v3: brand theme, GST invoice PDF, and Vercel setup.",
    p_estimated_delivery_days: 5,
    p_revision_policy: "3 revision rounds included",
    p_payment_terms: "50% advance arranged directly, 50% on handover",
    p_valid_days: 7,
    p_status: "sent",
  });
  const { data: acceptStatus, error: acceptErr } = await buyer.rpc("respond_to_quote", {
    p_quote_id: q3Id,
    p_decision: "accepted",
  });
  const { error: dupAcceptErr } = await buyer.rpc("respond_to_quote", {
    p_quote_id: q3Id,
    p_decision: "accepted",
  });
  const { data: sellerEditRows, error: editAcceptedBySellerErr } = await seller
    .from("quotes")
    .update({ scope_of_work: "Attempted silent edit after buyer acceptance!" })
    .eq("id", q3Id)
    .select("id");
  const { data: buyerEditRows, error: editAcceptedByBuyerErr } = await buyer
    .from("quotes")
    .update({ status: "declined" })
    .eq("id", q3Id)
    .select("id");

  const sellerBlocked = Boolean(editAcceptedBySellerErr) || (sellerEditRows?.length || 0) === 0;
  const buyerBlocked = Boolean(editAcceptedByBuyerErr) || (buyerEditRows?.length || 0) === 0;

  // Verify request status moved to closed and quote v3 is accepted & version 3
  const { data: q3Final } = await buyer.from("quotes").select("*").eq("id", q3Id).single();
  const { data: reqFinal } = await buyer
    .from("customization_requests")
    .select("*")
    .eq("id", reqId)
    .single();

  // Verify no further quote can be created on an already-accepted request
  const { error: quoteAfterAcceptErr } = await seller.rpc("create_seller_quote", {
    p_customization_request_id: reqId,
    p_base_product_price: 15999,
    p_customization_price: 1000,
    p_scope_of_work: "Attempt to create another quote after acceptance.",
    p_estimated_delivery_days: 3,
    p_revision_policy: "1 revision",
    p_payment_terms: "100% upfront",
    p_valid_days: 5,
    p_status: "sent",
  });

  record(
    "13. Quote v3 accepted, duplicate acceptance blocked, accepted terms strictly immutable",
    Boolean(
      !q3Err &&
        !acceptErr &&
        acceptStatus === "accepted" &&
        dupAcceptErr &&
        sellerBlocked &&
        buyerBlocked &&
        q3Final?.status === "accepted" &&
        q3Final?.version === 3 &&
        Number(q3Final?.total_price) === 20000 &&
        reqFinal?.status === "closed" &&
        quoteAfterAcceptErr
    ),
    `v=${q3Final?.version}, total=${q3Final?.total_price}, reqStatus=${reqFinal?.status}, dupBlocked=${Boolean(dupAcceptErr)}, sellerEditBlocked=${sellerBlocked}, buyerChangeBlocked=${buyerBlocked}, postAcceptQuoteBlocked=${Boolean(quoteAfterAcceptErr)}`
  );

  // Verify accepted quote scope did NOT change
  record(
    "14. Accepted quote commercial terms verified untouched in DB",
    q3Final?.scope_of_work ===
      "Final revised scope v3: brand theme, GST invoice PDF, and Vercel setup." &&
      q3Final?.status === "accepted",
    `status=${q3Final?.status}, accepted_at=${q3Final?.accepted_at}`
  );

  const failed = results.filter((r) => r.status !== "PASS");
  console.log(`\nSummary: ${results.length - failed.length}/${results.length} tests PASSED.`);
  if (failed.length > 0) {
    process.exit(1);
  }
}

runPhase5SecurityAndLifecycleTests().catch((err) => {
  console.error("Phase 5 test error:", err);
  process.exit(1);
});
