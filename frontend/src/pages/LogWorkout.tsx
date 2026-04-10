import { Box, Typography, Card, CardContent, Button, Grid, CircularProgress } from '@mui/material';
import { useSessions } from '../hooks';

export default function LogWorkout() {
  const { loading } = useSessions();

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Log Workout
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Select a workout day from your plan and log your exercises.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Button variant="contained" fullWidth size="large">
                Start Logging
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
