import React, { useEffect, useState } from 'react';
import { Avatar, Card, CardContent, Typography, Box, Divider } from '@mui/material';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from './../../firebase'; // Assuming firebase is properly initialized
import { Timestamp } from 'firebase/firestore'; // Import Timestamp if needed
import PublicMenu from './../../components/Chat/ChatBar/PublicMenu/PublicMenu';
import AddMember from './../../assets/921359.png';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../../../store/chatStore';
import Chat from '../../../../../../types/Chat';
import { useAuthState } from 'react-firebase-hooks/auth';
import axios from 'axios';

// Define the expected types
interface User {
  _id: string;
  name: string;
  photoURL: string;
  lastSeen?: Timestamp; // Optional last seen timestamp
}

interface ChatType {
  id: string; // Chat ID
  members: string[]; // Array of user IDs
  groupName: string; // Group name
}

interface ChatCardProps {
  currentChat: ChatType;
  renderLastSeen: (lastSeen?: Timestamp) => string; // Modify to accept a Timestamp
}

function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

const apiUrl = import.meta.env.VITE_SERVER_URL;

const ChatCard: React.FC<ChatCardProps> = ({ currentChat, renderLastSeen }) => {
  const [members, setMembers] = useState<User[]>([]);
  const [chatID, setCurrentChatId] = useState<string>();
  const chats = useSelector((state: AppState) => state.chats.chats);
  const [chat, setChat] = useState<Chat>();
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!Array.isArray(currentChat.members)) {
        console.log('Invalid members array');
        return;
      }

      const membersData: User[] = [];
      //   for (const memberId of currentChat.members) {
      //     // Check if memberId is a string
      //     if (typeof memberId !== 'string') {
      //       console.log(`Invalid member ID: ${memberId}`);
      //       continue; // Skip this iteration if memberId is not a string
      //     }

      //     const userRef = doc(db, 'users', memberId);
      //     const docSnapshot = await getDoc(userRef);

      //     if (docSnapshot.exists()) {
      //       const member = docSnapshot.data() as User;
      //       membersData.push(member);
      //     } else {
      //       console.log(`No user found with ID: ${memberId}`);
      //     }
      //   }

      // try {
      //   // Ensure all member IDs are valid strings
      //   const validMemberIds = currentChat.members.map(
      //     (memberId) => {

      //       return typeof memberId === 'string' ? memberId : null
      //     },
      //   )
      //   const membersData = []

      //   if (validMemberIds.length > 0) {
      //     const usersRef = collection(db, 'users')

      //     // Helper function to split array into chunks of 30
      //     console.log('Member ID chunks:', validMemberIds)
      //     // const memberIdChunks = chunkArray(validMemberIds, 30)
      //     const promises = validMemberIds.map(async(chunk) => {
      //       const memberDocRef = doc(db, 'users', chunk);

      //       const memberSnapshot = await getDoc(memberDocRef);
      //       console.log('Member ID:', memberSnapshot.exists())
      //       return memberSnapshot.exists() ? memberSnapshot : null
      //     });

      //     // Await all batch queries and merge results
      //     const allSnapshots = await Promise.all(promises)
      //     allSnapshots.forEach((querySnapshot) => {
      //       querySnapshot?.forEach((doc) => {
      //         const member = doc.data()
      //         membersData.push(member)
      //       })
      //     })
      //   } else {
      //     console.log('No valid member IDs found.')
      //   }
      // } catch (error) {
      //   console.error('Error fetching members data:', error)
      // }

      // console.log('Fetched members data:', membersData)

      const response = await axios.post(`${apiUrl}/api/student/userByIds`, { ids: JSON.stringify(currentChat.members) });

      if (response.data && Array.isArray(response.data)) {
        response.data.forEach((member) => {
          // console.log('Member:', member);
          membersData.push({
            _id: member._id,
            name: member.Full_Name || `${member.First_Name} ${member.Last_Name}`,
            photoURL: member.photoURL
          });
        });
      } else {
        console.log('Invalid response data:', response.data);
      }

      // console.log('Fetched members data:', membersData);

      setMembers(membersData);
    };

    fetchMembers();
  }, [currentChat.members]);

  useEffect(() => {
    if (currentChat?.id) {
      setCurrentChatId(currentChat?.id);
    }
    if (chats.length) {
      const selectedChat = chats.find((chat) => chat.id === chatID);
      setChat(selectedChat);
    }
  }, [currentChat]);

  // console.log(members, 'the mebers of chat');

  return (
    <Card style={{ maxWidth: 400, marginBottom: 16, borderRadius: 12 }}>
      <CardContent style={{ padding: '16px' }}>
        <Typography variant="h5" style={{ fontWeight: 'bold', marginBottom: 8 }}>
          {currentChat.groupName}
        </Typography>
        <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
          {members.length} {members.length === 1 ? 'Member' : 'Members'}
        </Typography>
        <Divider />
        <Box display="flex" style={{ overflow: 'auto', height: '100vh' }} flexDirection="column" marginTop={2}>
          <Box display="flex" alignItems="center" key={'fghfhfghfg'} marginBottom={1}>
            <Avatar
              alt={'Add Member'}
              src={AddMember}
              style={{
                width: 40,
                height: 40,
                marginRight: 16
              }}
            />
            <Typography variant="body1">
              <PublicMenu chat={currentChat} members={members} isOwner={chat?.createdBy === user.uid} infoPage={true} />
            </Typography>
          </Box>
          {members.map((member) => (
            <Box display="flex" alignItems="center" key={member._id} marginBottom={1}>
              <Avatar
                alt={member.name}
                src={member.photoURL}
                style={{
                  width: 40,
                  height: 40,
                  marginRight: 16
                }}
              />
              <Typography variant="body1">{member.name}</Typography>
            </Box>
          ))}
        </Box>
        {/* Render last seen if available */}
      </CardContent>
    </Card>
  );
};

// Example renderLastSeen function
const renderLastSeen = (lastSeen?: Timestamp) => {
  if (!lastSeen) return 'No last seen info';
  const date = lastSeen.toDate(); // Convert to JavaScript Date return date.toLocaleString(); // Format the date as needed
};

export default ChatCard;
