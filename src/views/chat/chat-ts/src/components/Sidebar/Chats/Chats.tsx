import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  DocumentData,
  QueryDocumentSnapshot,
  startAt,
  endAt,
  updateDoc,
  doc,
} from 'firebase/firestore'

import { useDispatch, useSelector } from 'react-redux'
import { Box, Tab, Tabs, Button } from '@material-ui/core'
import { AuthContext } from '../../../../../../../contexts/AuthContext'
import ChatButton from './ChatButton'
import Chat from '../../../../../../../types/Chat'
import { setChats as setChatsAction } from '../../../actions'
import { getOtherPrivateChatMember } from '../../../utils'
import useStyles from './styles'
import { db } from '../../../firebase'
import { setTimeout } from 'timers'

interface Props {
  search: string
}

const PAGE_SIZE = 10

const Chats: React.FC<Props> = ({ search }) => {
  const classes = useStyles()
  const { auth: loggedInUser } = useContext(AuthContext)
  const dispatch = useDispatch()
  const chats = useSelector((state: AppState) => state.chats.chats)
  const [chats1, setChats] = useState<Chat[]>([])
  const [filteredChats, setFilteredChats] = useState<Chat[]>([])
  const [selectedTab, setSelectedTab] = useState(0)
  const [lastVisible, setLastVisible] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)

  const scrollPosition = useRef(0)

  const scrollRef = useRef<HTMLDivElement | null>(null)

  const convertDocToChat = (doc: any): Chat =>
    ({
      id: doc.id,
      ...doc.data(),
    }) as Chat

  const loadChats = useCallback(
    async (tab, force = false) => {
      if (search.trim()) return
      setLoading(true)
      try {
        console.log('Loading chats...', tab, selectedTab, tab === selectedTab)
        const chatsRef = collection(db, 'chats')
        const typeCondition =
          tab === 0
            ? where('type', '!=', 'group')
            : where('type', '==', 'group')
        let baseQuery = query(chatsRef, typeCondition, limit(PAGE_SIZE))

        if (!force && lastVisible) {
          baseQuery = query(
            chatsRef,
            typeCondition,
            orderBy('createdAt', 'desc'),
            startAfter(lastVisible),
            limit(PAGE_SIZE),
          )
        }

        const snapshot = await getDocs(baseQuery)
        const newChats = snapshot.docs
          .filter((doc) => !!doc.data().createdAt)
          .map(convertDocToChat)

        setChats((prev) => {
          const merged = force ? newChats : [...prev, ...newChats]
          if (tab === selectedTab) {
            dispatch(setChatsAction(merged))
            setFilteredChats((prev) => [...prev, ...newChats])
            return merged
          } else {
            dispatch(setChatsAction(newChats))
            setFilteredChats(newChats)
            return newChats
          }
        })

        setLastVisible(snapshot.docs[snapshot.docs.length - 1] || null)
        setHasMore(snapshot.docs.length === PAGE_SIZE)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    },
    [selectedTab, lastVisible, dispatch],
  )

  const updateChatKeywords = async () => {
    try {
      const chatsRef = collection(db, 'chats')
      const snapshot = await getDocs(chatsRef)

      console.log(`Found ${snapshot.size} chats`)

      let count = 0

      for (const chatDoc of snapshot.docs) {
        const data = chatDoc.data()
        const name = data?.name

        if (!name) continue

        // Split name into keywords (by spaces and dashes) and lowercase
        const keywords = name.split(/[\s-]+/).map((k) => k.toLowerCase())

        // Update Firestore document
        await updateDoc(doc(db, 'chats', chatDoc.id), { keywords })

        count++
        if (count % 50 === 0) {
          console.log(`${count} documents updated...`)
        }
      }

      console.log(`Finished updating ${count} chats.`)
    } catch (error) {
      console.error('Error updating chats:', error)
    }
  }

  const fetchSearchResults = async (searchTerm: string) => {
    const searchWords = searchTerm.toLowerCase().split(/\s+/)
    // Search matches for private and group with search term

    let q
    if (selectedTab === 0) {
      q = query(
        collection(db, 'chats'),
        where('type', '!=', 'group'),
        where('keywords', 'array-contains-any', searchWords),
        orderBy('createdAt', 'desc'),
      )
    } else {
      q = query(
        collection(db, 'chats'),
        where('type', '==', 'group'),
        where('keywords', 'array-contains-any', searchWords),
        orderBy('createdAt', 'desc'),
      )
    }

    const snapshot = await getDocs(q)
    // const allChats = snapshot.docs.map((doc) => doc.data());
    const allChats = snapshot.docs
      .filter((doc) => !!doc.data().createdAt)
      .map(convertDocToChat)

    const filtered = allChats.filter((chat) =>
      searchWords.every((word) => chat.keywords?.includes(word)),
    )

    return filtered as Chat[]
  }

  useEffect(() => {
    let active = true
    if (!search) {
      loadChats(selectedTab, true)
      return
    }

    const runSearch = async () => {
      setLoading(true)
      if (search.trim()) {
        const filtered = await fetchSearchResults(search)
        console.log('Search term present, filtered results:', filtered)
        dispatch(setChatsAction(filtered))
        setFilteredChats(filtered)
      }
      setLoading(false)
    }

    runSearch()

    return () => {
      active = false
    }
  }, [search, selectedTab])

  useEffect(() => {
    const scrollBox = scrollRef.current
    if (!scrollBox) return
    const handleScroll = () => {
      if (
        scrollBox.scrollTop + scrollBox.clientHeight >=
          scrollBox.scrollHeight - 50 &&
        !loading &&
        hasMore
      ) {
        loadChats(selectedTab)
      }
    }
    scrollBox.addEventListener('scroll', handleScroll)
    return () => scrollBox.removeEventListener('scroll', handleScroll)
  }, [loading, hasMore, loadChats])

  const sortChats = (arr: Chat[]) => {
    const uniqueChats = Array.from(
      new Map(arr.map((chat) => [chat.id, chat])).values(),
    )

    return uniqueChats.sort(
      (a, b) =>
        (b.recentMessage?.sentAt?.seconds || 0) -
        (a.recentMessage?.sentAt?.seconds || 0),
    )
  }

  useEffect(() => {
    loadChats(selectedTab, true)
  }, [])

  console.log('filteredChats ######', filteredChats)

  return (
    <Box
      display="flex"
      flexDirection="column"
      m={2}
      mr={1}
      flex={1}
      height="80vh"
    >
      <Tabs
        value={selectedTab}
        onChange={(_, val) => {
          setSelectedTab(val)
          loadChats(val, true) // Force reload for fresh tab
        }}
      >
        <Tab className={classes.tab} label="Private Chats" />
        <Tab className={classes.tab} label="Group Chats" />
      </Tabs>
      <Box
        ref={scrollRef}
        className={classes.scrollBox}
        style={{
          overflowY: 'auto',
          flex: 1,
          maxHeight: 'calc(100vh - 100px)', // adjust 100px = tabs/header height
        }}
      >
        {sortChats(filteredChats).map((chat, ind) => (
          <ChatButton key={ind} chat={chat} />
        ))}
        {loading && (
          <div style={{ textAlign: 'center', padding: '1rem' }}>Loading...</div>
        )}
      </Box>
    </Box>
  )
}

export default Chats
