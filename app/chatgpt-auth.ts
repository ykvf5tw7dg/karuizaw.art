import {redirect} from 'next/navigation';
import {sessionUser,safeReturn} from '@/lib/server/auth';
// Compatibility exports for the existing administrative pages. Identity now
// comes only from a signed, expiring server session, never request headers.
export type ChatGPTUser={userId:string;displayName:string;email:string;fullName:string|null};
export const getChatGPTUser=sessionUser;
export async function requireChatGPTUser(returnTo:string):Promise<ChatGPTUser>{const user=await sessionUser();if(user)return user;redirect(chatGPTSignInPath(returnTo));}
export function chatGPTSignInPath(returnTo:string){return `/manage/login?return_to=${encodeURIComponent(safeReturn(returnTo))}`;}
export function chatGPTSignOutPath(){return '/signout-with-chatgpt';}
