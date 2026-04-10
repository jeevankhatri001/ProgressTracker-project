import React from 'react';
import { Box, Typography, Card, CardContent, Button, Dialog, DialogTitle, DialogContent, DialogActions, useState } from '@mui/material';
import { useUser, usePlan } from '../hooks';
import DeleteIcon from '@mui/icons-material/Delete';

export default function Settings() {
  const { user, deleteUser } = useUser();
  const { plan, deletePlan } = usePlan();
  const [openDeleteUser, setOpenDeleteUser] = React.useState(false);
  const [openDeletePlan, setOpenDeletePlan] = React.useState(false);

  const handleDeleteUser = async () => {
    await deleteUser();
    setOpenDeleteUser(false);
  };

  const handleDeletePlan = async () => {
    await deletePlan();
    setOpenDeletePlan(false);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Settings
      </Typography>

      {plan && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Workout Plan</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>{plan.plan_name}</Typography>
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<DeleteIcon />}
              onClick={() => setOpenDeletePlan(true)}
            >
              Delete Plan
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Account</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>User: {user?.name}</Typography>
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<DeleteIcon />}
            onClick={() => setOpenDeleteUser(true)}
          >
            Delete Profile
          </Button>
        </CardContent>
      </Card>

      {/* Delete User Dialog */}
      <Dialog open={openDeleteUser} onClose={() => setOpenDeleteUser(false)}>
        <DialogTitle>Delete Profile?</DialogTitle>
        <DialogContent>
          <Typography>This will delete your profile and all associated data. This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteUser(false)}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Plan Dialog */}
      <Dialog open={openDeletePlan} onClose={() => setOpenDeletePlan(false)}>
        <DialogTitle>Delete Plan?</DialogTitle>
        <DialogContent>
          <Typography>This will delete your workout plan. Your session history will remain.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeletePlan(false)}>Cancel</Button>
          <Button onClick={handleDeletePlan} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
