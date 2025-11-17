import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';


const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const groupId = 'your-group-id';

  useEffect(() => {
    const socketIo = io('http://localhost:5000');

    socketIo.emit('joinGroup', groupId);

    socketIo.on('receiveMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, []);

  const handleSendMessage = () => {
    if (newMessage) {
      socket.emit('sendMessage', { groupId, senderId: 'user-id', message: newMessage });
      setNewMessage('');
    }
  };

  return (
    <div>
      <div>
        {messages.map((msg) => (
          <div key={msg._id}>
            <strong>{msg.sender.name}</strong>: {msg.message}
          </div>
        ))}
      </div>
      <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type your message" />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default ChatComponent;
