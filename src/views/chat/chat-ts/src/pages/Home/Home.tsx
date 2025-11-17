import Chat from '../../components/Chat'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from '../../components/Sidebar/Sidebar'
import {
  Box,
  Drawer,
  Typography,
  Avatar,
  Divider,
  Card,
  CardContent,
  Dialog,
} from '@material-ui/core'
import { useEffect, useState } from 'react'
import User from '../../../../../../types/User'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { getAuth, updateProfile } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth } from '../../firebase'
import { AppState } from '../../../../../../store/chatStore'
import moment from 'moment'
import ChatCard from './ChatCard'
import CreateIcon from '@mui/icons-material/Create'
import { cutText } from '../../utils'
import InputBox from '../../components/InputBox/InputBox'
import { useAuthState } from 'react-firebase-hooks/auth'

const Home = () => {
  const [openSlider, setOpenSlider] = useState(false)
  const [selectedContact, setSelectedContact] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<User>()
  const currentChat = useSelector((state: AppState) => state.chats.currentChat)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [user, loading] = useAuthState(auth)

  const clickContactInfo = async (contactId: string) => {
    let chatDocRef: DocumentReference<DocumentData>

    if (currentChat.type === 'private') {
      let split = contactId.split('-')
      contactId = split.filter((item) => item !== user.uid)[0]
      chatDocRef = doc(db, 'users', contactId)
    } else {
      chatDocRef = doc(db, 'chats', contactId)
    }

    try {
      const chatSnapshot = await getDoc(chatDocRef)
      const member = chatSnapshot.exists() ? chatSnapshot.data() : null

      console.log('contactId:', member, contactId)
      setCurrentUser(member)
      setSelectedContact(contactId)
      setOpenSlider(true)
    } catch (error) {
      console.error('Error fetching contact info:', error)
    }
  }

  const handleCloseSlider = () => {
    setOpenSlider(false)
  }

  const openRenameDialog = () => {
    setIsRenameDialogOpen(true)
  }

  const renameChat = async (newName: string) => {
    try {
      await updateDoc(doc(db, 'chats', currentChat.id), {
        name: newName,
      })
      closeRenameDialog()
      console.log('Chat renamed successfully!')
    } catch (error) {
      console.error('Error renaming chat:', error)
    }
  }

  const closeRenameDialog = () => {
    setIsRenameDialogOpen(false)
  }

  const renderMembers = () => {
    return currentChat.members.map((memberId, index) => (
      <Typography variant="body2" key={index}>
        {/* Replace this with real user name fetched from the database */}
        Member {index + 1}
      </Typography>
    ))
  }

  const renderLastMessage = () => {
    if (currentChat.recentMessage.text) {
      return currentChat.recentMessage.text
    } else if (currentChat.recentMessage.fileUrl) {
      return 'Sent a file'
    }
    return 'No messages yet'
  }

  const renderLastSeen = () => {
    if (currentChat.type === 'group') {
      return currentChat.createdAt
        ? `Created: ${moment(currentChat.createdAt).format('MMMM Do YYYY, h:mm a')}`
        : 'Loading...' // or any fallback message you'd prefer
    } else {
      return currentChat.recentMessage.sentAt
        ? `Last seen: ${moment(currentChat.recentMessage.sentAt).format('MMMM Do YYYY, h:mm a')}`
        : 'No last seen info'
    }
  }

  const updateProfilePhoto = async () => {
    try {
      const auth = getAuth()
      const user = auth.currentUser

      if (!user) {
        throw new Error('User not logged in.')
      }

      // Prompt user to select a file
      const fileInput = document.createElement('input')
      fileInput.type = 'file'
      fileInput.accept = 'image/*'
      fileInput.click()

      // Wait for the user to select a file
      const file = await new Promise<File | null>((resolve) => {
        fileInput.onchange = (event) => {
          const selectedFile = (event.target as HTMLInputElement)?.files?.[0]
          resolve(selectedFile || null)
        }
      })

      if (!file) {
        console.log('No file selected.')
        return
      }

      // Upload the file to Firebase Storage
      const storage = getStorage()
      const storageRef = ref(storage, `groupImages/${user.uid}/${file.name}`)
      await uploadBytes(storageRef, file)

      // Get the download URL for the uploaded file
      const photoURL = await getDownloadURL(storageRef)

      const userRef = doc(db, 'chats', currentChat.id)
      await updateDoc(userRef, { photoURL })

      console.log('Profile photo updated successfully!')

      // Optionally, update the UI
      alert('Profile photo updated!')
    } catch (error) {
      console.error('Error updating profile photo:', error)
      alert('Failed to update profile photo. Please try again.')
    }
  }

  return (
    <Box display="flex" height="100vh" >
      <Sidebar />
      <Chat contactClick={clickContactInfo} />

      {/* Contact Info Drawer */}
      <Drawer
        anchor="right"
        open={openSlider}
        onClose={handleCloseSlider}
        variant="temporary"
        style={{
          width: '400px',
          flexShrink: 0,
        }}
        SlideProps={{
          direction: 'left',
        }}
      >
        <Box
          p={3}
          display="flex"
          flexDirection="column"
          height="100%"
          width="380px"
        >
          <>
            <Card style={{ maxWidth: 400, marginBottom: 16, borderRadius: 12 }}>
              <CardContent style={{ padding: '16px' }}>
                <Box alignItems="center" mb={2}>
                  {currentChat.type === 'group' ? (
                    <>
                      <Box
                        alignItems="center"
                        mb={2}
                        display="flex"
                        justifyContent={'space-evenly'}
                        gap={2}
                      >
                        <Avatar
                          alt="Contact's Avatar"
                          src={currentUser?.photoURL}
                          style={{
                            width: 100,
                            height: 100,
                            marginRight: 10,
                            margin: 'auto',
                          }}
                        />
                        <CreateIcon
                          onClick={() => updateProfilePhoto()}
                          style={{
                            cursor: 'pointer',
                            position: 'absolute',
                            right: '28%',
                          }}
                        />
                      </Box>
                    </>
                  ) : (
                    <Avatar
                      alt="Contact's Avatar"
                      src={currentUser?.photoURL}
                      style={{
                        width: 100,
                        height: 100,
                        marginRight: 10,
                        margin: 'auto',
                      }}
                    />
                  )}
                </Box>
                {currentChat.type === 'private' ? (
                  <>
                    <Typography
                      variant="h6"
                      align="center"
                      style={{
                        alignSelf: 'center',
                        wordBreak: 'break-word',
                      }}
                    >
                      {currentUser?.username &&
                        cutText(currentUser.username, 20)}
                    </Typography>

                    <Typography
                      variant="body2"
                      align="center"
                      style={{
                        alignSelf: 'center',
                        wordBreak: 'break-word',
                      }}
                    >
                      {currentUser?.email && cutText(currentUser.email, 20)}
                    </Typography>
                  </>
                ) : (
                  <Box
                    alignItems="center"
                    mb={2}
                    display="flex"
                    justifyContent={'space-evenly'}
                    gap={2}
                  >
                    <Typography
                      variant="h6"
                      align="center"
                      style={{
                        alignSelf: 'center',
                        wordBreak: 'break-word',
                      }}
                    >
                      {currentChat.name && cutText(currentChat.name, 20)}
                    </Typography>
                    <CreateIcon
                      onClick={() => openRenameDialog()}
                      style={{ cursor: 'pointer' }}
                    />

                    <Dialog
                      open={isRenameDialogOpen}
                      onClose={closeRenameDialog}
                    >
                      <InputBox
                        onSubmit={renameChat}
                        onCancel={closeRenameDialog}
                        confirmBtnName={'Rename'}
                        placeholder="New name"
                      />
                    </Dialog>
                  </Box>
                )}

                {/* Chat Details */}
                {/* <Typography variant="body1" align="center">{renderLastMessage()}</Typography> */}
                {currentChat.type === 'group' && (
                  <Typography
                    variant="body2"
                    align="center"
                    color="textSecondary"
                  >
                    Groupe{' :'} {currentChat.members?.length} Members
                  </Typography>
                )}
              </CardContent>
            </Card>
            <Divider style={{ margin: '10px 0' }} />
            {currentChat.type === 'group' && (
              <ChatCard
                key={currentChat.id}
                currentChat={currentChat}
                renderLastSeen={renderLastSeen} // Correctly pass the function
              />
            )}
          </>
        </Box>
      </Drawer>
    </Box>
  )
}

export default Home
