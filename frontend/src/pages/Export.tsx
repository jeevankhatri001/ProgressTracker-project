import React from 'react';
import { Box, Typography, Card, CardContent, Button, Grid, CircularProgress } from '@mui/material';
import { useSessions, useUser, usePlan } from '../hooks';
import api from '../services/api';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

export default function Export() {
  const { user, loading: userLoading } = useUser();
  const { plan, loading: planLoading } = usePlan();
  const { sessions, loading: sessionsLoading } = useSessions();
  const [exporting, setExporting] = React.useState(false);

  const handleExport = async (exportFn: () => Promise<Blob>, filename: string) => {
    setExporting(true);
    try {
      const blob = await exportFn();
      api.downloadFile(blob, filename);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  if (userLoading || planLoading || sessionsLoading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Export Data
      </Typography>

      <Grid container spacing={3}>
        {user && (
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>User Profile</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Export your profile information as CSV
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<FileDownloadIcon />}
                  disabled={exporting}
                  onClick={() => handleExport(() => api.exportUserProfileCSV(), 'user_profile.csv')}
                >
                  {exporting ? 'Exporting...' : 'Export CSV'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}

        {sessions.length > 0 && (
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>Workout Sessions</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Export all {sessions.length} sessions as CSV
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<FileDownloadIcon />}
                  disabled={exporting}
                  onClick={() => handleExport(() => api.exportSessionsCSV(), 'sessions.csv')}
                >
                  {exporting ? 'Exporting...' : 'Export CSV'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}

        {plan && (
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>Workout Plan</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Export your plan structure as CSV
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<FileDownloadIcon />}
                  disabled={exporting}
                  onClick={() => handleExport(() => api.exportPlanCSV(), 'plan.csv')}
                >
                  {exporting ? 'Exporting...' : 'Export CSV'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}

        {user && sessions.length > 0 && (
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>Progress Report</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Generate full progress report with analytics
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<FileDownloadIcon />}
                  disabled={exporting}
                  onClick={() => handleExport(() => api.exportProgressReport(), 'progress_report.txt')}
                >
                  {exporting ? 'Exporting...' : 'Export Report'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
