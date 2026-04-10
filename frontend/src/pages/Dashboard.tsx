import { Box, Card, CardContent, Grid, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { useUser, usePlan, useSessions } from '../hooks';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

export default function Dashboard() {
  const { user, loading: userLoading } = useUser();
  const { plan, loading: planLoading } = usePlan();
  const { sessions, loading: sessionsLoading } = useSessions();

  if (userLoading || planLoading || sessionsLoading) {
    return <CircularProgress />;
  }

  const totalSessions = sessions.length;
  const totalExercises = plan
    ? plan.workout_days.reduce((sum, day) => sum + day.exercises.length, 0)
    : 0;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>
        Dashboard
      </Typography>

      {!plan && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Create a workout plan to get started logging sessions.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* User Stats Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Weight
              </Typography>
              <Typography variant="h5">{user?.weight} kg</Typography>
              <Typography variant="caption" color="text.secondary">
                BMI: {user?.bmi} ({user?.bmi_category})
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Experience Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Experience
              </Typography>
              <Typography variant="h5">{user?.training_experience_years} yrs</Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.experience_level}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Sessions Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Sessions Logged
              </Typography>
              <Typography variant="h5">{totalSessions}</Typography>
              <Typography variant="caption" color="text.secondary">
                Total workouts completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Exercises Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Exercises
              </Typography>
              <Typography variant="h5">{totalExercises}</Typography>
              <Typography variant="caption" color="text.secondary">
                In your workout plan
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Action Card */}
        {plan && (
          <Grid item xs={12}>
            <Card sx={{ backgroundColor: 'primary.light', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6">Ready to Work Out?</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {user?.training_days_per_week} days per week planned
                    </Typography>
                  </Box>
                  <Button variant="contained" color="inherit" startIcon={<FitnessCenterIcon />}>
                    Log Workout
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
