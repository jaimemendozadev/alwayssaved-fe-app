'use client';
import { ReactNode, useContext, useEffect } from 'react';
import { ChatBox } from '@/components/chatbox';
import { LeanConversation, LeanUser } from '@/utils/mongodb';
import { ChatThread } from '@/components/chatthread';
import { ConvoContext } from '@/components/context';
import { getConversationMessages } from '@/actions/schemamodels/convomessages';
interface ClientUIProps {
  currentUser: LeanUser;
  convo: LeanConversation;
}

export const ClientUI = ({ currentUser, convo }: ClientUIProps): ReactNode => {
  const { currentConvo, convoThread, setCurrentConvo, updateThread } =
    useContext(ConvoContext);

  useEffect(() => {
    if (convo && setCurrentConvo && currentConvo === null) {
      setCurrentConvo(convo);
    }
  }, [convo, currentConvo, setCurrentConvo]);

  useEffect(() => {
    async function setConvoMessage(convoID: string) {
      const convoMessages = await getConversationMessages(convoID);

      if (updateThread) {
        updateThread(convoMessages);
      }
    }

    if (convo && updateThread) {
      setConvoMessage(convo._id);
    }
  }, []);

  // See Dev Notes below.
  return (
    <div className="min-h-screen p-6 flex flex-col justify-between">
      <ChatThread convoThread={convoThread} />
      <ChatBox currentUser={currentUser} />
    </div>
  );
};

/***************************
 * Notes
 ***************************

 1) If there's time to implement for MVP, will need to 
    implement responsive layout for every page, including 
    work on ChatThread & ChatBox responsive layout.

*/
