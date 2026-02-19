import React from 'react';
import { Container, Stack, Typography } from '@mui/material';

import ServiceLogForm from './components/ServiceLogForm';
import ServiceLogsTable from './components/ServiceLogsTable';

const App: React.FC = () => (
  <Container maxWidth="lg" sx={{ py: 4 }}>
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h4" fontWeight={700}>
          MediDrive Service Log Manager
        </Typography>
        <Typography color="text.secondary">
          Drafts auto-save as you type and persist across reloads.
        </Typography>
      </Stack>
      <ServiceLogForm />
      <ServiceLogsTable />
    </Stack>
  </Container>
);

export default App;
