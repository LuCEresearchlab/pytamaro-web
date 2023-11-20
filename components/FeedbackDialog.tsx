import FeedbackIcon from '@mui/icons-material/Feedback';
import {
  IconButton, Stack, Tooltip,
} from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import * as Sentry from '@sentry/nextjs';
import { useRouter } from 'next/router';
import { useState } from 'react';
import useLocalProfile from '../src/localStorage/useLocalProfile';
import { EventName, alwaysStoreDbEvent } from '../src/storeDbEvent';
import CustomSnackbar from './CustomSnackbar';
import NetworkErrorSnackbar from './NetworkErrorSnackbar';

export default function FeedbackDialog() {
  const [open, setOpen] = useState(false);
  const [errorMessageRequired, setErrorMessageRequired] = useState(false);
  const [feedbackReceivedVisibile, setFeedbackReceivedVisible] = useState(false);
  const [feedbackErrorVisible, setFeedbackErrorVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const { pathname } = useRouter();
  const { metadata } = useLocalProfile();

  const clearFeedback = () => {
    setName('');
    setEmail('');
    setMessage('');
    setErrorMessageRequired(false);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSend = async () => {
    if (!message) {
      setErrorMessageRequired(true);
      return;
    }
    const eventId = Sentry.captureMessage('User Feedback');
    Sentry.captureUserFeedback({
      event_id: eventId,
      name,
      email,
      comments: message,
    });
    const success = await alwaysStoreDbEvent(EventName.UserFeedback, metadata, {
      name, email, message, pathname,
    });
    if (success) {
      handleClose();
      clearFeedback();
      setFeedbackReceivedVisible(true);
    } else {
      setFeedbackErrorVisible(true);
    }
  };

  return (
    <div>
      <Tooltip arrow title="Send Feedback">
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
              error={errorMessageRequired && message === ''}
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
      <NetworkErrorSnackbar visible={feedbackErrorVisible} setVisible={setFeedbackErrorVisible} />
    </div>
  );
}
