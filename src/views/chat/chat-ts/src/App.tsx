import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, onSnapshot, doc, getDoc, query, where, updateDoc } from 'firebase/firestore';
import Loading from './pages/Loading';
import { chatAuth, db } from './../../../../services/firebase';
import { convertDocToChat, convertDocToUser } from './utils';
import { USER_INIT_STATE } from './../../../../reducers/user';
import { CHATS_INIT_STATE } from './../../../../reducers/chats';
import { setChats, setUser } from './actions';
import Home from './pages/Home';

const App = () => {
  const dispatch = useDispatch();
  const [user, loading] = useAuthState(chatAuth);
  const [fetchingUserData, setFetchingUserData] = useState(true);
  const [fetchingChatsData, setFetchingChatsData] = useState(true);

  useEffect(() => {
    if (!user) {
      dispatch(setUser(USER_INIT_STATE));
      dispatch(setChats(CHATS_INIT_STATE));
      setFetchingUserData(false);
      setFetchingChatsData(false);
      return;
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const snapshot = await getDoc(userDocRef);

      setFetchingUserData(false);
      
      if (!snapshot.exists()) return;

  
      dispatch(setUser(convertDocToUser(snapshot.data())));
    } catch (error) {
      console.error('Error fetching user data:', error);
      setFetchingUserData(false);
    }
  };


  if (loading) {
    return <Loading />;
  }

  return <Home />;
};

export default App;
