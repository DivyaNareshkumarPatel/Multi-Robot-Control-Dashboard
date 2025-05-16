import React, { useEffect, useState, useRef } from 'react';
import { getAllChats } from '../api/api';

export default function LiveChatDashboard() {
  const [chats, setChats] = useState([]);
  const messagesEndRef = useRef(null); 

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await getAllChats();
        setChats(response.data); 
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };

    fetchChats();

    console.log('Connecting to WebSocket server...');
    const ws = new WebSocket('ws://localhost:5000/chat');
    
    ws.onopen = () => {
      console.log('WebSocket connection established');
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        console.log('Message type:', data.type);
        
        if (data.type === 'chat-update') {
          setChats(prevChats => {
            const updatedChats = prevChats.map(chat => {
              if (chat._id === data.data._id) {
                return data.data; 
              }
              return chat;
            });
            
            if (!prevChats.some(chat => chat._id === data.data._id)) {
              return [...prevChats, data.data];
            }
            
            return updatedChats;
          });
        } else if (data.type === 'chat-history') {
          setChats(data.data);
        } else if (data.type === 'new-message') {
          setChats(prevChats => {
            const updatedChats = prevChats.map(chat => {
              if (chat._id === data.chatId) {
                return {
                  ...chat,
                  messages: [...chat.messages, data.message]
                };
              }
              return chat;
            });
            return updatedChats;
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setSocket(null);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats]);

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
        {Array.isArray(chats) && chats.length > 0 ? (
          chats.map((chat) => (
            Array.isArray(chat?.messages) ? (
              chat.messages.map((message, index) => (
                <div
                  key={`${chat._id || 'unknown'}-${index}`}
                  style={message.sender === "user" ? userMessageStyles : botMessageStyles}
                >
                  <p>{message.text || ''}</p>
                </div>
              ))
            ) : null
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>No chat messages available</p>
          </div>
        )}
        {/* Scroll indicator element */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
