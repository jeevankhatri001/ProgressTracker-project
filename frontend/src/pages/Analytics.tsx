import React from 'react';
import { Box, Typography, Card, CardContent, Grid, CircularProgress } from '@mui/material';
import { useAnalytics } from '../hooks';

export default function Analytics() {
  const { personalRecords, volumeSummary, loading } = useAnalytics();

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Analytics & Progress
      </Typography>

      <Grid container spacing={3}>
        {volumeSummary && (
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>Total Volume</Typography>
                <Typography variant="h5">{volumeSummary.total_volume?.toFixed(0)}</Typography>
                <Typography variant="caption">kg×reps</Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {personalRecords?.records && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Personal Records</Typography>
                {personalRecords.records.map((record: any, idx: number) => (
                  <Box key={idx} sx={{ mb: 1, pb: 1, borderBottom: '1px solid #eee' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{record.exercise}</Typography>
                    <Typography variant="caption" color="text.secondary">{record.max_weight} kg × {record.reps} reps</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
