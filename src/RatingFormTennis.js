import React, { useState } from 'react';
import { getCurrentUserId } from './firebase';
import { ref, update, getDatabase } from 'firebase/database';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Rating from '@mui/material/Rating';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Container, Typography } from '@mui/material';

const RatingForm = () => {
  const [rating, setRating] = useState(3);
  const [comment, setComment] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  

  const handleSubmit = async () => {
    const userId = getCurrentUserId();
    const databaseRef = getDatabase();
    const fieldId = location.state?.fieldId;
    console.log(fieldId)

    console.log("UserID:", userId);
  
    if (!userId) {
      console.error("User not logged in");
      return;
    }
  
    try {
      const fieldRatingRef = ref(databaseRef, `tennisfields/${fieldId}/ratings/${userId}`);
      const ratingData = { rating, comment };
      console.log("Rating Data: ", ratingData); // Verify the data being sent
      console.log("Firebase Ref: ", fieldRatingRef); // Check the Firebase reference
      await update(fieldRatingRef, ratingData);
      console.log("Data successfully updated in Firebase");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating Firebase:", error);
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '20px' }}>
      <Typography variant="h5" style={{ marginBottom: '20px' }}>Rate the Field</Typography>
      <Box component="fieldset" mb={3} borderColor="transparent">
        <Typography component="legend">Your Rating</Typography>
        <Rating
          name="simple-controlled"
          value={rating}
          onChange={(event, newValue) => {
            setRating(newValue);
          }}/>
        </Box>
        <TextField
            label="Comment"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            margin="normal"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{ marginBottom: '20px' }}
        />
        <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSubmit}
            fullWidth
        >
            Submit
        </Button>
        </Container>
    );
};

export default RatingForm;
