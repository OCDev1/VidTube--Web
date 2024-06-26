import React, { useState, useEffect } from 'react';
import './CommentSection.css';
import Comment from './Comment';
import defaultImg from '../anonymous-user.jpg'; // Import the default image

function CommentSection({ videoId, loggedInUser, calculateTimeAgo }) {
  const [commentText, setCommentText] = useState('');
  const [videoComments, setVideoComments] = useState([]);

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:12345/api/comments`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      const data = await response.json();
      setVideoComments(data); // Assuming data is an array of comments
    } catch (error) {
      console.error('Error fetching comments:', error);
      // Handle error state or retry logic
    }
  };

  const handleInputChange = (e) => {
    setCommentText(e.target.value);
  };

  const handleCommentClick = async () => {
    if (!loggedInUser) return;

    if (commentText) {
      const newComment = {
        text: commentText,
        username: loggedInUser.displayName,
        date: new Date().toISOString(),
        img: loggedInUser.profilePicture,
        videoId,
      };

      console.log('New Comment:', newComment); // Log the newComment object

      try {
        const response = await fetch(`/api/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newComment),
        });
        if (response.ok) {
          await fetchComments(); // Fetch updated comments after posting
          setCommentText('');
        } else {
          throw new Error('Failed to post comment');
        }
      } catch (error) {
        console.error('Error posting comment:', error.message);
      }
    }
  };

  const handleCancelClick = () => {
    setCommentText('');
  };

  const handleEditComment = async (commentId, newText) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newText }),
      });
      if (response.ok) {
        await fetchComments(); // Fetch updated comments after editing
      } else {
        throw new Error('Failed to edit comment');
      }
    } catch (error) {
      console.error('Error editing comment:', error.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await fetchComments(); // Fetch updated comments after deletion
      } else {
        throw new Error('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error.message);
    }
  };

  const commentList = videoComments.map((comment, key) => (
    <Comment
      {...comment}
      key={key}
      onEdit={handleEditComment}
      onDelete={handleDeleteComment}
      loggedInUser={loggedInUser}
      calculateTimeAgo={calculateTimeAgo}
    />
  ));

  return (
    <div className="commentSection">
      <div>{videoComments.length} Comments</div>
      <div className="addCommentContainer">
        <img src={loggedInUser ? loggedInUser.profilePicture : defaultImg} className="userPicture" alt="" />
        <input
          className="textField"
          placeholder={loggedInUser ? 'Add a comment...' : 'Log in to comment'}
          value={commentText}
          onChange={handleInputChange}
          disabled={!loggedInUser}
        />
        <button className="cancelBtn" onClick={handleCancelClick}>
          Cancel
        </button>
        <button className="commentBtn" onClick={handleCommentClick} disabled={!loggedInUser}>
          Comment
        </button>
      </div>
      {commentList.reverse()}
    </div>
  );
}

export default CommentSection;
