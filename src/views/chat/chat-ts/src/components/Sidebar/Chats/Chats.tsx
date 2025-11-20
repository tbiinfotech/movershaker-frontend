import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
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
  onSnapshot
} from 'firebase/firestore';

import { useDispatch, useSelector } from 'react-redux';
import { Box, Tab, Tabs, Button, sliderClasses } from '@mui/material';
import { AuthContext } from '../../../../../../../contexts/AuthContext';
import ChatButton from './ChatButton';
import Chat from '../../../../../../../types/Chat';
import { setChats as setChatsAction, setCurrentChat } from '../../../actions';
import { getOtherPrivateChatMember } from '../../../utils';
// import useStyles from './styles';
import { ScrollBox, StyledTab } from './styles';
import { db } from '../../../firebase';
import { setTimeout } from 'timers';
import { AppState } from '../../../../../../../store/chatStore';
import useSkipFirstRender from '../../../utils/useSkipFirstRender';
import { toast } from 'react-toastify';

interface Props {
  search: string;
}

const PAGE_SIZE = 10;

const Chats: React.FC<Props> = ({ search }) => {
  // const classes = useStyles();
  const { auth: loggedInUser } = useContext(AuthContext);
  const dispatch = useDispatch();
  const chats = useSelector((state: AppState) => state.chats.chats);
  const [chats1, setChats] = useState<Chat[]>([]);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const currentChat = useSelector((state: AppState) => state.chats.currentChat);

  const scrollPosition = useRef(0);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const convertDocToChat = (doc: any): Chat =>
    ({
      id: doc.id,
      ...doc.data()
    }) as Chat;

  const subscribeChats = useCallback(() => {
    setLoading(true);
    const chatsRef = collection(db, 'chats');
    const typeCondition = selectedTab === 0 ? where('type', '!=', 'group') : where('type', '==', 'group');
    const q = query(chatsRef, typeCondition, orderBy('recentMessage.sentAt', 'desc'), limit(PAGE_SIZE));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatData = snapshot.docs.map(convertDocToChat);
      console.log('subscribed chat function called the chat collection updated updated');

      console.log(chatData, ' chat data 123', currentChat);

      // const updatedCChat = chatData.filter((chat: any) => chat.id == currentChat.id);
      // console.log(updatedCChat, 'updated current chat');
      // if (updatedCChat && updatedCChat.length > 0) {
      //   dispatch(setCurrentChat(updatedCChat[0]));
      // } else {
      //   dispatch(setCurrentChat(chatData[0]));
      // }
      dispatch(setChatsAction(chatData));
      // dispatch(setCurrentChat(chatData[0]));
      setLastVisible(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
      setLoading(false);
    });
    return unsubscribe;
  }, [selectedTab, currentChat]);

  // **Real-time listener for updated chats**
  useEffect(() => {
    // dispatch(setCurrentChat({}));
    // setLoading(false);
    const unsubscribe = subscribeChats();
    return () => unsubscribe();
  }, [selectedTab]);

  const loadChats = useCallback(
    async (tab: any, force = false) => {
      if (search.trim()) return;
      console.log('load chat called this is the lastvisible from which loaded ', lastVisible, hasMore);
      setLoading(true);
      try {
        console.log('Loading chats...', tab, selectedTab, tab === selectedTab);
        const chatsRef = collection(db, 'chats');
        const typeCondition = tab === 0 ? where('type', '!=', 'group') : where('type', '==', 'group');
        const order = orderBy('recentMessage.sentAt', 'desc');
        let baseQuery = query(chatsRef, typeCondition, order, limit(PAGE_SIZE));

        if (!force && lastVisible) {
          baseQuery = query(chatsRef, typeCondition, order, startAfter(lastVisible), limit(PAGE_SIZE));
        }

        const snapshot = await getDocs(baseQuery);
        console.log(snapshot.docs.length, 'the new chat arrived length');
        const newChats = snapshot.docs.filter((doc) => !!doc.data().createdAt).map(convertDocToChat);

        console.log('new chats arrived ', newChats, newChats.length);

        // setChats((prev) => {
        //   const merged = force ? newChats : [...prev, ...newChats];
        //   if (tab === selectedTab) {
        //     console.log('will always be in selected tab lsdakjfalsdfj');
        //     dispatch(setChatsAction(merged));
        //     setFilteredChats((prev) => [...prev, ...newChats]);
        //     return merged;
        //   } else {
        //     dispatch(setChatsAction(newChats));
        //     setFilteredChats(newChats);
        //     return newChats;
        //   }
        // });

        const merged = force ? newChats : [...chats, ...newChats];
        dispatch(setChatsAction(merged));

        setLastVisible(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMore(snapshot.docs.length === PAGE_SIZE);
      } catch (err: any) {
        toast.error(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [selectedTab, lastVisible, dispatch, chats, search]
  );

  const updateChatKeywords = async () => {
    try {
      const chatsRef = collection(db, 'chats');
      const snapshot = await getDocs(chatsRef);

      console.log(`Found ${snapshot.size} chats`);

      let count = 0;

      for (const chatDoc of snapshot.docs) {
        const data = chatDoc.data();
        const name = data?.name;

        if (!name) continue;

        // Split name into keywords (by spaces and dashes) and lowercase
        const keywords = name.split(/[\s-]+/).map((k) => k.toLowerCase());

        // Update Firestore document
        await updateDoc(doc(db, 'chats', chatDoc.id), { keywords });

        count++;
        if (count % 50 === 0) {
          console.log(`${count} documents updated...`);
        }
      }

      console.log(`Finished updating ${count} chats.`);
    } catch (error) {
      console.error('Error updating chats:', error);
    }
  };

  const fetchSearchResults = async (searchTerm: string) => {
    const searchWords = searchTerm.toLowerCase().split(/\s+/);
    // Search matches for private and group with search term

    let q;
    if (selectedTab === 0) {
      q = query(
        collection(db, 'chats'),
        where('type', '!=', 'group'),
        where('keywords', 'array-contains-any', searchWords),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'chats'),
        where('type', '==', 'group'),
        where('keywords', 'array-contains-any', searchWords),
        orderBy('createdAt', 'desc')
      );
    }

    const snapshot = await getDocs(q);
    // const allChats = snapshot.docs.map((doc) => doc.data());
    const allChats = snapshot.docs.filter((doc) => !!doc.data().createdAt).map(convertDocToChat);

    const filtered = allChats.filter((chat) => searchWords.every((word) => chat.keywords?.includes(word)));

    return filtered as Chat[];
  };

  useEffect(() => {
    // console.log('search is changed', search);
    // let active = true;
    // if (!search) {
    //   loadChats(selectedTab, true);
    //   return;
    // }
    // const runSearch = async () => {
    //   setLoading(true);
    //   if (search.trim()) {
    //     const filtered = await fetchSearchResults(search);
    //     console.log('Search term present, filtered results:', filtered);
    //     dispatch(setChatsAction(filtered));
    //     setFilteredChats(filtered);
    //   }
    //   setLoading(false);
    // };
    // runSearch();
    // return () => {
    //   active = false;
    // };
  }, [search, selectedTab]);

  useSkipFirstRender(() => {
    console.log('search is changed', search);
    let active = true;
    if (!search) {
      loadChats(selectedTab, true);
      return;
    }

    const runSearch = async () => {
      setLoading(true);
      if (search.trim()) {
        const filtered = await fetchSearchResults(search);
        console.log('Search term present, filtered results:', filtered);
        dispatch(setChatsAction(filtered));
        setFilteredChats(filtered);
      }
      setLoading(false);
    };

    runSearch();

    return () => {
      active = false;
    };
  }, [search, selectedTab]);

  useEffect(() => {
    const scrollBox = scrollRef.current;
    if (!scrollBox) return;
    const handleScroll = () => {
      // console.log('in scroll event', lastVisible, hasMore);
      if (scrollBox.scrollTop + scrollBox.clientHeight >= scrollBox.scrollHeight - 50 && !loading && hasMore) {
        // console.log('loading chat with scroll load more more moremore');
        loadChats(selectedTab);
      }
    };
    scrollBox.addEventListener('scroll', handleScroll);
    return () => scrollBox.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore, loadChats]);

  const sortChats = (arr: Chat[]) => {
    // const uniqueChats = Array.from(new Map(arr.map((chat) => [chat.id, chat])).values());
    // console.log(uniqueChats.length, 'the unique chat length');
    // return uniqueChats.sort((a, b) => (b.recentMessage?.sentAt?.seconds || 0) - (a.recentMessage?.sentAt?.seconds || 0));
    return arr;
  };

  useEffect(() => {
    // loadChats(selectedTab, true);
  }, []);

  // useEffect(() => {}, [currentChat, filteredChats]);

  // useEffect(() => {
  //   setChats(chats);
  //   setFilteredChats(chats);
  // }, [chats]);

  console.log(
    'filteredChats ######',
    currentChat,
    'this iscurent chat',
    chats.length,
    chats.map((chat: any) => {
      console.log(chat.name);
      return chat;
    }),
    chats.filter((chat: any) => chat.id == '68889eeb63bf95f143024477-678a2ee199c56aef65c6816f')
  );
  // 68b2d69ec959aa8a60d82822-678a2ee199c56aef65c6816f

  return (
    <Box display="flex" flexDirection="column" m={2} mr={1} flex={1} height="80vh">
      <Tabs
        value={selectedTab}
        onChange={(_, val) => {
          // console.log(_, val, 'thes is vale in onchnge tabs');

          setSelectedTab(val);
          loadChats(val, true); // Force reload for fresh tab
        }}
        TabIndicatorProps={{
          style: {
            backgroundColor: '#f50057' // <--- change color here
            // height: '4px' // optional
          }
        }}
      >
        {/* <Tab className={classes.tab} label="Private Chats" />
        <Tab className={classes.tab} label="Group Chats" /> */}
        <StyledTab label="Private Chats" />
        <StyledTab label="Group Chats" />
      </Tabs>
      <ScrollBox
        ref={scrollRef}
        // className={classes.scrollBox}
        style={{
          overflowY: 'auto',
          flex: 1,
          maxHeight: 'calc(100vh - 100px)' // adjust 100px = tabs/header height
        }}
      >
        {sortChats(chats).map((chat, ind) => (
          <ChatButton key={ind} chat={chat} />
        ))}
        {loading && <div style={{ textAlign: 'center', padding: '1rem' }}>Loading...</div>}
      </ScrollBox>
    </Box>
  );
};

export default Chats;
