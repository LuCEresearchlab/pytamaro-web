import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from 'react';
import {
  IconButton, Stack, Tooltip,
} from '@mui/material';
import FeedbackIcon from '@mui/icons-material/Feedback';
import * as Sentry from '@sentry/nextjs';
import CustomSnackbar from './CustomSnackbar';

export default function FeedbackDialog() {
  const [open, setOpen] = useState(false);
  const [feedbackReceivedVisibile, setFeedbackReceivedVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const clearFeedback = () => {
    setName('');
    setEmail('');
    setMessage('');
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSend = async () => {
    const eventId = Sentry.captureMessage('User Feedback');
    Sentry.captureUserFeedback({
      event_id: eventId,
      name,
      email,
      comments: message,
    });
    handleClose();
    clearFeedback();
    setFeedbackReceivedVisible(true);
  };

  return (
    <div>
      <Tooltip title="Send Feedback">
        <IconButton color="neutral" aria-label="feedback" sx={{ ml: 1 }} onClick={handleClickOpen}>
          <FeedbackIcon />
        </IconButton>
      </Tooltip>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Send Feedback</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <DialogContentText>
              Do you have an idea for a new activity?
              Have you just bumped into a bug with our platform
              or found problematic content?
              <br />
              We welcome your feedback!
            </DialogContentText>
            <TextField
              id="message"
              label="Message"
              variant="filled"
              required
              multiline
              minRows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <TextField
              id="name"
              label="Name (optional)"
              variant="filled"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              id="email"
              label="Email (optional)"
              type="email"
              variant="filled"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSend}>Send</Button>
        </DialogActions>
      </Dialog>
      <CustomSnackbar visible={feedbackReceivedVisibile} setVisible={setFeedbackReceivedVisible} severity="success" message="Feedback received!" />
    </div>
  );
}
