import { MessagingWorkspace } from "@/components/messaging/MessagingWorkspace";

export const dynamic = "force-dynamic";

interface ConversationPageProps {
  params: {
    conversationId: string;
  };
}

export default function ConversationThreadPage({ params }: ConversationPageProps) {
  return <MessagingWorkspace activeConversationId={params.conversationId} />;
}
