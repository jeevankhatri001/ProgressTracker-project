import { Box, Typography, Card, CardContent, TextField, Button, Grid, CircularProgress, Alert } from '@mui/material';
import { useUser, usePlan } from '../hooks';

export default function Setup() {
  const { user, loading } = useUser();

  if (loading) {
    return <CircularProgress />;
  }

  if (user) {
    return (
      <Box>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
          User Profile
        </Typography>
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography color="text.secondary">Name</Typography>
                <Typography variant="h6">{user.name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography color="text.secondary">Age</Typography>
                <Typography variant="h6">{user.age}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography color="text.secondary">Weight</Typography>
                <Typography variant="h6">{user.weight} kg</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography color="text.secondary">Height</Typography>
                <Typography variant="h6">{user.height} m</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography color="text.secondary">Experience</Typography>
                <Typography variant="h6">{user.training_experience_years} years</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography color="text.secondary">Training Days/Week</Typography>
                <Typography variant="h6">{user.training_days_per_week}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Workout Plan Setup */}
        <Box sx={{ mt: 4 }}>
          <WorkoutPlanSetup />
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Get Started
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Create your user profile to begin tracking your gym progress.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Name" variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Age" type="number" variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Weight (kg)" type="number" variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Height (m)" type="number" variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Training Days/Week" type="number" variant="outlined" />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" fullWidth size="large">
                Create Profile
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}

function WorkoutPlanSetup() {
  const { plan } = usePlan();

  if (plan) {
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
          {plan.plan_name}
        </Typography>
        <Card>
          <CardContent>
            {plan.workout_days.map((day, idx) => (
              <Box key={idx} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {day.day_name.charAt(0).toUpperCase() + day.day_name.slice(1)} - {day.workout_label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {day.exercises.length} exercises
                </Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Alert severity="info">
      Create a workout plan after setting up your profile.
    </Alert>
  );
}
