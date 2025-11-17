import { useEffect, useState, useRef, useContext } from 'react'
import { useSelector } from 'react-redux'
import Picker from 'emoji-picker-react'
import { serverTimestamp, arrayUnion } from 'firebase/firestore'
import { db, storage, auth } from '../../../firebase'
import { useAuthState } from 'react-firebase-hooks/auth'
import { AppState } from '../../../../../../../store/chatStore'
import EmojiEmotionsIcon from '@material-ui/icons/EmojiEmotions'
import SendIcon from '@material-ui/icons/Send'
import AttachFileIcon from '@material-ui/icons/AttachFile'
import {
  Box,
  IconButton,
  Input,
  TextField,
  Popover,
  LinearProgress,
  Typography,
} from '@material-ui/core'
import useStyles from './styles'
import { collection, addDoc, doc, setDoc, onSnapshot,getDoc } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { v4 as uuidv4 } from 'uuid'
import { updateTypingStatus } from './../../../../../../../services/firebase'
import { AuthContext } from './../../../../../../../contexts/AuthContext'
import { encryptMessage } from '../../../utils'
import messageJson from './../Messages/message.json'

const SendBox = (props: any) => {
  const { setIsScroll } = props
  const { auth: currentAuth } = useContext(AuthContext)
  const [user, loading] = useAuthState(auth)
  const classes = useStyles()
  const chatID = useSelector((state: AppState) => state.chats.currentChat.id)
  const [input, setInput] = useState('')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setInput('')
    setSelectedFile(null)
  }, [chatID])

  const sendMessage = async (e: React.FormEvent, replies: []) => {
    e.preventDefault()
    setInput('')
    setIsScroll(true)
    if (input.trim() === '' && !selectedFile) return

    try {
      let image = ''
      let video = ''
      let fileUrl = ''

      if (selectedFile) {
        setUploading(true)
        const fileRef = ref(
          storage,
          `chat_files/${chatID}/${selectedFile.name}`,
        )
        const uploadTask = uploadBytesResumable(fileRef, selectedFile)

        // Use a promise to handle the upload completion
        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              console.log(progress, 'upload:::::')
              setUploadProgress(progress)
            },
            (error) => {
              console.error('Error uploading file:', error)
              setUploading(false)
              reject(error) // Reject if there's an error
            },
            async () => {
              try {
                const fileType = selectedFile.type
                if (fileType.startsWith('image/')) {
                  image = await getDownloadURL(uploadTask.snapshot.ref)
                } else if (fileType.startsWith('video/')) {
                  video = await getDownloadURL(uploadTask.snapshot.ref)
                } else {
                  fileUrl = await getDownloadURL(uploadTask.snapshot.ref)
                }
                console.log('File uploaded successfully:')
                resolve()
              } catch (error) {
                setUploadProgress(0)
                setUploading(false)
                reject(error)
              }
            },
          )
        })
      }

      let serverTime = await serverTimestamp()
      const messageId = `${Date.now()}`
      const localTimestamp = new Date();

      console.log("User @#############", currentAuth)

      const messageData = {
        _id: messageId,
        text: encryptMessage(input),
        sentAt: localTimestamp,
        sentBy: {
          uid: currentAuth.user._id,
          displayName: currentAuth.user.username,
        },
        user: {
          _id: currentAuth.user._id,
        },
        image,
        video,
        fileUrl,
        isRead: arrayUnion(),
        replies: replies || null,
        isDeleted: false,
      }

      console.log('messageData to send:', messageData)

      await setDoc(doc(db, 'chats', chatID, 'messages', messageId), messageData)

      // onSnapshot(docRef, (docSnap) => {
      //   if (docSnap.exists()) {
      //     console.log('Updated Server Time:', docSnap.data().sentAt.toDate())
      //   }
      // })

      // Update the recent message in the chat document

      const newDateId = new Date(localTimestamp).toISOString().split('T')[0]

      await setDoc(
        doc(db, 'chats', chatID),
        {
          recentMessage: {
            _id: newDateId,
            text: input,
            sentAt: serverTime,
            sentBy: {
              uid: currentAuth.user._id,
              displayName: currentAuth.user.username,
            },
            fileUrl,
            image,
            video,
          },
        },
        { merge: true },
      )

      setUploadProgress(0)
      setUploading(false)
      setSelectedFile(null)
    } catch (error) {
      setUploadProgress(0)
      setUploading(false)
      console.error('Error sending message: ', error)
    }
  }

  const openEmojiPicker = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget)
  }

  const closeEmojiPicker = () => {
    setAnchorEl(null)
  }

  const onEmojiClick = (emojiObject: any) => {
    console.log('################### onEmojiClick', emojiObject.emoji, input)
    setInput((prev) => prev + emojiObject.emoji)
    closeEmojiPicker()
  }

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0]
      if (file) setSelectedFile(file)
    }
  }

  const handleTyping = (e) => {
    setInput(e.target.value)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    updateTypingStatus(currentAuth.user._id, true)

    typingTimeoutRef.current = setTimeout(() => {
      updateTypingStatus(currentAuth.user._id, false)
    }, 1000)
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      p={1}
      border={1}
      borderRight={0}
      borderBottom={0}
      borderLeft={0}
      borderColor={'divider'}
    >
      <IconButton onClick={openEmojiPicker}>
        <EmojiEmotionsIcon />
      </IconButton>
      <Popover
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={closeEmojiPicker}
      >
        <Picker onEmojiClick={onEmojiClick} />
      </Popover>

      {/* File Input */}
      <IconButton component="label">
        <AttachFileIcon />
        <input
          type="file"
          hidden
          onChange={handleFileChange}
          // accept="image/*, image/*, .pdf, .docx, .txt, .jpg, .png, .jpeg, application/*"
          accept="image/*, video/*"
        />
      </IconButton>

      {/* Display file name if selected */}
      {!uploading && selectedFile && (
        <Typography variant="body2" style={{ marginLeft: 8 }}>
          {selectedFile.name}
        </Typography>
      )}

      {/* File Upload Progress */}
      {uploading && (
        <Box width="100%" mt={1}>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}

      <form
        className={`${classes.form} flex items-center gap-2 bg-white p-2 rounded-xl border`}
        onSubmit={sendMessage}
      >
        <TextField
          className={`${classes.input} flex-1`}
          fullWidth
          multiline
          minRows={1}
          maxRows={6}
          placeholder="Type a message..."
          variant="outlined"
          value={input}
          autoFocus
          onChange={(e) => handleTyping(e)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault() // prevent line break
              sendMessage(e) // send message
            }
          }}
          InputProps={{
            sx: {
              borderRadius: '24px',
              padding: '8px 14px',
              '& fieldset': { border: 'none' }, // remove outline
            },
          }}
        />

        <IconButton
          type="submit"
          color="primary"
          disabled={input.trim() === '' && !selectedFile}
          sx={{
            backgroundColor: input.trim() !== '' ? '#1976d2' : '#eee',
            color: input.trim() !== '' ? '#fff' : '#888',
            borderRadius: '50%',
            '&:hover': {
              backgroundColor: input.trim() !== '' ? '#1565c0' : '#ddd',
            },
          }}
        >
          <SendIcon />
        </IconButton>
      </form>
    </Box>
  )
}

export default SendBox
