import { Box, Typography, Card, CardContent, CircularProgress } from '@mui/material';
import { useSessions } from '../hooks';

export default function History() {
  const { sessions, loading } = useSessions();

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Workout History
      </Typography>
      {sessions.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary">No sessions logged yet. Start by logging your first workout!</Typography>
          </CardContent>
        </Card>
      ) : (
        sessions.map((session, idx) => (
          <Card key={idx} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{session.date} - {session.workout_label}</Typography>
              <Typography color="text.secondary">{session.exercise_logs.length} exercises</Typography>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
}
