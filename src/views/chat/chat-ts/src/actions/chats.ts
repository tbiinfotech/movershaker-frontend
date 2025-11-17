import { AppAction, SET_CHATS, SET_CURRENT_CHAT } from '../../../../../types/actions'
import Chat from '../../../../../types/Chat'

const setChats = (chats: Chat[]): AppAction => {
  return {
    type: SET_CHATS,
    chats,
  }
}

const setCurrentChat = (chat: object): AppAction => {
  return {
    type: SET_CURRENT_CHAT,
    chat,
  }
}

export { setChats, setCurrentChat }
