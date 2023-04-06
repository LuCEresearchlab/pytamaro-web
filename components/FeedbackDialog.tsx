import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from 'react';
import {
  Alert, IconButton, Stack, Tooltip,
} from '@mui/material';
import FeedbackIcon from '@mui/icons-material/Feedback';
import * as Sentry from '@sentry/nextjs';

export default function FeedbackDialog() {
  const [open, setOpen] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackError, setFeedbackError] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const clearFeedbackResults = () => {
    setFeedbackSent(false);
    setFeedbackError(false);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    clearFeedbackResults();
  };

  const handleSend = async () => {
    clearFeedbackResults();

    try {
      const eventId = Sentry.captureMessage('User Feedback');
      Sentry.captureUserFeedback({
        event_id: eventId,
        name,
        email,
        comments: message,
      });
      setFeedbackSent(true);
    } catch {
      setFeedbackError(true);
    }
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
            {feedbackSent ? <Alert severity="success">We got your feedback. Thanks!</Alert> : null}
            {feedbackError ? <Alert severity="error">Something went wrong while sending the feedback. Try again!</Alert> : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSend}>Send</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
