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
const BUYER_EMAIL = "chetan500prajapat@gmail.com";
const BUYER_PASS = "ChetanPass123!@#";
const INTRUDER_EMAIL = "wb_audit_1794832382145@gmail.com";
const INTRUDER_PASS = "SecurePassword123!@";

const APPROVED_LISTING_ID = "abd1a8ff-5acd-44b4-ab50-d3a23aeb958a";
const DRAFT_LISTING_ID = "13a474bb-3f6e-462a-bb26-b7c16b933b04";

function makeClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function runTests() {
  console.log("=============================================================");
  console.log("WEBAZAAR PHASE 4: RLS, SECURITY & REALTIME MESSAGING TESTS");
  console.log("=============================================================\n");

  const results = [];
  const record = (name, pass, detail) => {
    results.push({ name, status: pass ? "PASS" : "FAIL", detail });
    console.log(`[${pass ? "PASS" : "FAIL"}] ${name} — ${detail}`);
  };

  const anon = makeClient();
  const seller = makeClient();
  const buyer = makeClient();
  const intruder = makeClient();

  // Authenticate real test accounts
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

  const { data: iAuth, error: iErr } = await intruder.auth.signInWithPassword({
    email: INTRUDER_EMAIL,
    password: INTRUDER_PASS,
  });
  if (iErr || !iAuth.user) throw new Error(`Intruder login failed: ${iErr?.message}`);

  // 1. Anon blocked from reading conversations & messages
  const { error: anonConvErr } = await anon.from("conversations").select("*");
  const { error: anonMsgErr } = await anon.from("messages").select("*");
  record(
    "1. Anonymous access blocked on conversations & messages",
    Boolean(anonConvErr && anonMsgErr),
    `convErr=${anonConvErr?.code || anonConvErr?.message}, msgErr=${anonMsgErr?.code || anonMsgErr?.message}`
  );

  // 2. Unapproved/draft listing blocked
  const { error: draftErr } = await buyer.rpc("start_or_get_conversation", {
    p_listing_id: DRAFT_LISTING_ID,
  });
  record(
    "2. Unapproved (draft) listing conversation rejected",
    Boolean(draftErr),
    draftErr?.message || "Unexpectedly succeeded"
  );

  // 3. Self-messaging blocked
  const { error: selfErr } = await seller.rpc("start_or_get_conversation", {
    p_listing_id: APPROVED_LISTING_ID,
  });
  record(
    "3. Seller self-messaging blocked",
    Boolean(selfErr),
    selfErr?.message || "Unexpectedly succeeded"
  );

  // 4. Direct INSERT with spoofed seller_id blocked by RLS
  const { error: spoofErr } = await buyer.from("conversations").insert({
    listing_id: APPROVED_LISTING_ID,
    buyer_id: bAuth.user.id,
    seller_id: iAuth.user.id, // Wrong seller!
    status: "active",
  });
  record(
    "4. Spoofed seller_id rejected by RLS",
    Boolean(spoofErr),
    spoofErr?.message || "Unexpectedly succeeded"
  );

  // 5. Buyer initiates conversation & duplicate prevention
  const { data: convId1, error: convErr1 } = await buyer.rpc("start_or_get_conversation", {
    p_listing_id: APPROVED_LISTING_ID,
  });
  const { data: convId2, error: convErr2 } = await buyer.rpc("start_or_get_conversation", {
    p_listing_id: APPROVED_LISTING_ID,
  });
  record(
    "5. Conversation created & deduplicated on repeat call",
    Boolean(convId1 && convId1 === convId2 && !convErr1 && !convErr2),
    `convId1=${convId1}, convId2=${convId2}`
  );

  const conversationId = String(convId1);

  // 6. Unauthorized 3rd-party user cannot read conversation or messages
  const { data: intrConv } = await intruder
    .from("conversations")
    .select("*")
    .eq("id", conversationId);
  const { data: intrMsgs } = await intruder
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId);
  record(
    "6. Unauthorized 3rd-party user cannot read conversation/messages",
    (intrConv?.length || 0) === 0 && (intrMsgs?.length || 0) === 0,
    `convRows=${intrConv?.length || 0}, msgRows=${intrMsgs?.length || 0}`
  );

  // 7. Unauthorized 3rd-party user cannot send messages
  const { error: intrSendErr } = await intruder.from("messages").insert({
    conversation_id: conversationId,
    sender_id: iAuth.user.id,
    body: "Unauthorized message injection attempt",
  });
  record(
    "7. Unauthorized 3rd-party user cannot send messages",
    Boolean(intrSendErr),
    intrSendErr?.message || "Unexpectedly succeeded"
  );

  // 8. Empty / oversized message validation at DB level
  const { error: emptyErr } = await buyer.from("messages").insert({
    conversation_id: conversationId,
    sender_id: bAuth.user.id,
    body: "    ",
  });
  const { error: longErr } = await buyer.from("messages").insert({
    conversation_id: conversationId,
    sender_id: bAuth.user.id,
    body: "x".repeat(2005),
  });
  record(
    "8. Message length & non-empty validation enforced by Postgres",
    Boolean(emptyErr && longErr),
    `emptyBlocked=${Boolean(emptyErr)}, oversizedBlocked=${Boolean(longErr)}`
  );

  // 9. Live Supabase Realtime delivery test (Buyer -> Seller & Seller -> Buyer)
  let sellerReceivedRealtime = null;
  let buyerReceivedRealtime = null;

  const sellerChannel = seller
    .channel(`test-seller-${Date.now()}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        if (payload.new?.sender_id === bAuth.user.id) {
          sellerReceivedRealtime = payload.new;
        }
      }
    );

  const buyerChannel = buyer
    .channel(`test-buyer-${Date.now()}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        if (payload.new?.sender_id === sAuth.user.id) {
          buyerReceivedRealtime = payload.new;
        }
      }
    );

  // Ensure Realtime WebSockets explicitly carry each authenticated user's JWT
  if (sAuth.session?.access_token) {
    seller.realtime.setAuth(sAuth.session.access_token);
  }
  if (bAuth.session?.access_token) {
    buyer.realtime.setAuth(bAuth.session.access_token);
  }

  await Promise.all([
    new Promise((resolve) => sellerChannel.subscribe((s) => s === "SUBSCRIBED" && resolve())),
    new Promise((resolve) => buyerChannel.subscribe((s) => s === "SUBSCRIBED" && resolve())),
  ]);
  // Give Realtime WALRUS 1s to register filter bindings after SUBSCRIBED
  await new Promise((r) => setTimeout(r, 1000));

  const buyerMsgText = `Hi! Is the SpiceBite website customizable for our brand? [${Date.now()}]`;
  const { data: sentByBuyer, error: buySendErr } = await buyer
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: bAuth.user.id,
      body: buyerMsgText,
    })
    .select("*")
    .single();

  // Wait up to 4s for Realtime delivery to Seller
  for (let i = 0; i < 20 && !sellerReceivedRealtime; i++) {
    await new Promise((r) => setTimeout(r, 200));
  }

  record(
    "9a. Buyer sends message & Seller receives via Supabase Realtime",
    Boolean(!buySendErr && sentByBuyer && sellerReceivedRealtime?.id === sentByBuyer.id),
    `sentId=${sentByBuyer?.id}, realtimeId=${sellerReceivedRealtime?.id || "none"}`
  );

  const sellerReplyText = `Yes! We can customize branding and setup in 3 days. [${Date.now()}]`;
  const { data: sentBySeller, error: sellSendErr } = await seller
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: sAuth.user.id,
      body: sellerReplyText,
    })
    .select("*")
    .single();

  // Wait up to 4s for Realtime delivery to Buyer
  for (let i = 0; i < 20 && !buyerReceivedRealtime; i++) {
    await new Promise((r) => setTimeout(r, 200));
  }

  record(
    "9b. Seller replies & Buyer receives via Supabase Realtime without refresh",
    Boolean(!sellSendErr && sentBySeller && buyerReceivedRealtime?.id === sentBySeller.id),
    `sentId=${sentBySeller?.id}, realtimeId=${buyerReceivedRealtime?.id || "none"}`
  );

  await seller.removeChannel(sellerChannel);
  await buyer.removeChannel(buyerChannel);

  // 10. Mark as read updates unread status accurately
  const { data: markedCount, error: readErr } = await buyer.rpc(
    "mark_conversation_messages_read",
    { p_conversation_id: conversationId }
  );
  record(
    "10. Recipient marks incoming messages as read",
    !readErr && Number(markedCount) >= 1,
    `markedReadCount=${markedCount}`
  );

  // 11. Existing seller listing management remains intact
  const { data: sellerListings, error: listErr } = await seller
    .from("listings")
    .select("id, status")
    .eq("seller_id", sAuth.user.id);
  record(
    "11. Existing seller listing management intact",
    !listErr && (sellerListings?.length || 0) >= 1,
    `sellerListingsCount=${sellerListings?.length || 0}`
  );

  const failed = results.filter((r) => r.status !== "PASS");
  console.log(`\nSummary: ${results.length - failed.length}/${results.length} tests PASSED.`);
  if (failed.length > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test harness error:", err);
  process.exit(1);
});
