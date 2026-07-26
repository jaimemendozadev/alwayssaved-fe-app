'use client';
import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HTTP_METHOD } from 'next/dist/server/web/http';
import { Button } from '@heroui/react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { ChatBox } from '@/components/chatbox';
import { ChatThread } from '@/components/chatthread';
import {
  getConversationMessages,
  getConvoMessageByID
} from '@/actions/schemamodels/convomessages';
import { updateConversationByID } from '@/actions/schemamodels/conversations';
import { useLLMRequest } from '@/utils/hooks';
import { InputEvent, SubmitEvent, BackendResponse } from '@/utils/ts';
import {
  LeanConvoMessage,
  getObjectIDFromString,
  LeanConversation,
  LeanFile,
  LeanNote,
  LeanUser
} from '@/utils/mongodb';

interface ClientUIProps {
  currentUser: LeanUser;
  currentConvo: LeanConversation;
  convoFiles: LeanFile[];
  currentNote: LeanNote;
}

interface TempConvoMessage {
  message?: string;
  is_pending?: boolean;
  is_thinking?: boolean;
  temp_id?: string;
}

const DEFAULT_TITLE = 'Untitled';

const toastOptions = { duration: 10000 };

export const ClientUI = ({
  currentUser,
  currentConvo,
  convoFiles,
  currentNote
}: ClientUIProps): ReactNode => {
  const [convoTitle, setConvoTitle] = useState(
    () => currentConvo.title || DEFAULT_TITLE
  );
  const [prevConvoTitle, setPrevConvoTitle] = useState(currentConvo.title);

  if (currentConvo.title !== prevConvoTitle) {
    setPrevConvoTitle(currentConvo.title);
    setConvoTitle(currentConvo.title || DEFAULT_TITLE);
  }

  const [convoThread, updateThread] = useState<
    (LeanConvoMessage | TempConvoMessage)[]
  >([]);

  const [inFlight, setFlightStatus] = useState(false);
  const { makeRequest } = useLLMRequest();

  const router = useRouter();

  console.log('currentConvo: ', currentConvo);
  console.log('\n');

  const titleChange = (evt: InputEvent) => {
    if (evt?.type === 'blur') {
      if (convoTitle.length === 0) {
        setConvoTitle(currentConvo.title || DEFAULT_TITLE);
        return;
      }
    }

    if (evt?.type === 'change') {
      setConvoTitle(evt.target.value);
      return;
    }
  };

  const updateTitle = async (evt: SubmitEvent): Promise<void> => {
    evt.preventDefault();

    if (!currentConvo) return;

    setFlightStatus(true);

    const updatedConvo = await updateConversationByID(
      currentConvo._id,
      { title: convoTitle },
      { returnDocument: 'after' }
    );

    if (updatedConvo) {
      toast.success('Your Conversation title has been updated.', toastOptions);
    }

    setFlightStatus(false);
    router.refresh();
  };

  const chatHandler = async (userInput: string): Promise<void> => {
    const method: HTTP_METHOD = 'POST';

    setFlightStatus(true);

    const file_ids_list = convoFiles.map((leanFile) => leanFile._id);
    const note_id = currentNote._id;

    const userConvoMsg = {
      conversation_id: getObjectIDFromString(currentConvo._id),
      user_id: getObjectIDFromString(currentUser._id),
      sender_type: 'user',
      message: userInput.trim(),
      file_ids_list,
      note_id
    };

    const options = {
      body: userConvoMsg,
      method
    };

    const backendURL = `/convos/${currentConvo._id}`;

    try {
      const tempUpdate = [
        ...convoThread,
        { ...userConvoMsg, is_pending: true, temp_id: uuidv4() }
      ];
      updateThread(tempUpdate);

      toast.loading(
        'The LLM message will appear at the bottom in a litle bit. ⏲️',
        toastOptions
      );

      const chatRes = await makeRequest<
        BackendResponse<{
          user_msg_id: string;
          llm_response: LeanConvoMessage;
        }>
      >(backendURL, options);

      updateThread((prevState) => {
        const filtered = prevState.filter(
          (leanMsg: TempConvoMessage | LeanConvoMessage) =>
            'temp_id' in leanMsg === false
        );

        return filtered;
      });

      setFlightStatus(false);

      if (chatRes && chatRes.payload) {
        const { payload } = chatRes;
        const { user_msg_id, llm_response } = payload;

        const savedUserMsg = await getConvoMessageByID(user_msg_id);

        updateThread((prevState) => [...prevState, savedUserMsg, llm_response]);

        return;
      }

      throw new Error('Never received a response from the LLM Service.');
    } catch (error) {
      // TODO: Handle in telemetry.
      console.log('Error in ChatBox submitChat ', error);
      toast.error(
        'There was a problem sending your message to the LLM. 🥺 Try again later.',
        toastOptions
      );
    }

    setFlightStatus(false);
  };

  useEffect(() => {
    async function loadConvoMessages(convoID: string) {
      const convoMessages = await getConversationMessages(convoID);

      updateThread(convoMessages);
    }

    if (currentConvo) {
      loadConvoMessages(currentConvo._id);
    }
  }, []);

  // See Dev Notes below.
  return (
    <div className="min-h-screen p-6 flex flex-col justify-between">
      <h1 className="text-3xl lg:text-6xl mb-16">
        💬 Convo Page for: {currentConvo.title}
      </h1>
      <ChatThread convoThread={convoThread} />

      <ChatBox chatHandler={chatHandler} inFlight={inFlight} />

      <section>
        <div className="border-2 p-4 rounded-md mb-8">
          <p className="mb-1">
            <span className="font-bold">Attached Convo Files</span>:
          </p>
          {convoFiles.length > 0 && (
            <ul className="space-y-2">
              {convoFiles.map((convoFile) => {
                return <li key={convoFile._id}>{convoFile.file_name}</li>;
              })}
            </ul>
          )}
        </div>

        <form onSubmit={updateTitle} className="mb-8 border-2 p-4 rounded-md">
          <div className="flex items-end">
            <label htmlFor="convoTitle" className="text-lg min-w-[400px]">
              <span>
                <b>Conversation Title</b> (<em>can be updated</em>)
              </span>
              :<br />
              <input
                className="w-[100%] p-2 border ounded-md rounded-md"
                onBlur={titleChange}
                onFocus={titleChange}
                onChange={titleChange}
                id="convoTitle"
                name="convoTitle"
                value={convoTitle}
                disabled={inFlight}
              />
            </label>

            <Button size="md" variant="ghost" type="submit" className="ml-4">
              Submit
            </Button>
          </div>
        </form>
      </section>
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
