import { trpc } from '../../../app/_trpc/client';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { ChatThread } from '../chat/chat-thread';

type CustomerChatHistoryProps = {
  customerId: string;
};

export default function CustomerChatHistory(props: CustomerChatHistoryProps) {
  const { data, isLoading } = trpc.chat.getMessageHistory.useQuery({
    patientId: props.customerId,
  });

  return (
    <Card>
      <CardHeader title="Messages" />
      <Divider />
      {isLoading && (
        <Box sx={{ p: 2 }}>
          <Typography variant="body2">Loading messages...</Typography>
        </Box>
      )}

      {!data && !isLoading && (
        <Box sx={{ p: 2 }}>
          <Typography variant="body2">No messages found</Typography>
        </Box>
      )}

      {data && (
        <ChatThread threadKey={data.id} showToolbar={false} />
      )}
    </Card>
  );
}
