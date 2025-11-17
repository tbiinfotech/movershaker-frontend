import Chat from './Chat'
import User from './User'

export const SET_USER = 'SET_USER'
export const SET_CHATS = 'SET_CHATS'
export const SET_CURRENT_CHAT = 'SET_CURRENT_CHAT'
export const TOGGLE_DARKTHEME = 'TOGGLE_DARKTHEME'

export interface SetUserAction {
  type: typeof SET_USER
  user: User
}

export interface SetChatsAction {
  type: typeof SET_CHATS
  chats: Chat[]
}

export interface SetCurrentChatsAction {
  type: typeof SET_CURRENT_CHAT
  chat: any
}

export interface ToggleDarkThemeAction {
  type: typeof TOGGLE_DARKTHEME
}

export type UserAction = SetUserAction
export type ChatsAction = SetChatsAction
export type CurrentChatsAction = SetCurrentChatsAction
export type DarkThemeEnabledAction = ToggleDarkThemeAction

export type AppAction = UserAction | ChatsAction | DarkThemeEnabledAction | CurrentChatsAction
