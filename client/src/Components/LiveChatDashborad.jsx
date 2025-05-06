import React, { useEffect, useState, useRef } from 'react';
import { getAllChats } from '../api/api';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

export default function LiveChatDashboard() {
  const [chats, setChats] = useState([]);
  const messagesEndRef = useRef(null); // Create a reference for the messages container

  // Fetch existing chats initially
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await getAllChats();
        setChats(response.data); // Assuming the response contains an array of chats
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };

    fetchChats();

    // Listen for new messages via WebSocket
    socket.on('new_message', (newMessage) => {
      setChats((prevChats) => {
        // Find the chat that the new message belongs to
        const updatedChats = prevChats.map((chat) => {
          if (chat._id === newMessage.chatId) {
            return {
              ...chat,
              messages: [...chat.messages, newMessage], // Append the new message to the correct chat
            };
          }
          return chat;
        });
        return updatedChats;
      });
    });

    // Clean up the WebSocket connection when the component unmounts
    return () => {
      socket.off('new_message');
    };
  }, []);

  // Scroll to the bottom whenever the chats state changes (new messages added)
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' }); // Scroll to bottom with smooth animation
    }
  }, [chats]); // Trigger when chats change

  const chatWindowStyles = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#f4f4f4',
    padding: '20px',
  };

  const messagesContainerStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    overflowY: 'scroll',
    flexGrow: '1',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    padding: '10px',
    maxHeight: '500px',
  };

  const messageStyles = {
    maxWidth: '80%',
    padding: '10px',
    borderRadius: '12px',
    wordWrap: 'break-word',
  };

  const userMessageStyles = {
    ...messageStyles,
    backgroundColor: '#e0f7fa',
    alignSelf: 'flex-end',
  };

  const botMessageStyles = {
    ...messageStyles,
    backgroundColor: '#e8e8e8',
    alignSelf: 'flex-start',
  };

  return (
    <div style={chatWindowStyles}>
      <div style={messagesContainerStyles}>
        {chats.map((chat) => (
          chat.messages.map((message, index) => (
            <div
              key={`${chat._id}-${index}`}
              style={message.sender === "user" ? userMessageStyles : botMessageStyles}
            >
              <p>{message.text}</p>
            </div>
          ))
        ))}
        {/* Scroll indicator element */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
