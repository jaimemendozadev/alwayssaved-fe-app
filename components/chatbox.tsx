'use client';
import {
  ReactNode,
  useState,
  ChangeEvent,
  FocusEvent,
  useContext,
  useCallback,
  useEffect
} from 'react';
// import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { Button } from '@heroui/react';
import {
  getObjectIDFromString,
  LeanConvoMessage,
  LeanFile,
  LeanNote,
  LeanUser
} from '@/utils/mongodb';
import { BackendResponse, InputEvent, SubmitEvent } from '@/utils/ts';
import { updateConversationByID } from '@/actions/schemamodels/conversations';
import { useLLMRequest } from '@/utils/hooks';
import { HTTP_METHOD } from 'next/dist/server/web/http';
import { ConvoContext } from './context';
import { TempConvoMessage } from './context/convocontext';
import { getConvoMessageByID } from '@/actions/schemamodels/convomessages';

interface ChatBoxProps {
  currentUser: LeanUser;
  convoFiles: LeanFile[];
  currentNote: LeanNote;
}

const defaultInput = 'Ask something';
const DEFAULT_TITLE = 'Untitled';
const toastOptions = { duration: 6000 };

export const ChatBox = ({
  currentUser,
  convoFiles,
  currentNote
}: ChatBoxProps): ReactNode => {
  const [userInput, setUserInput] = useState(defaultInput);
  const [convoTitle, setConvoTitle] = useState(DEFAULT_TITLE);
  const [defaultTitle, setDefaultTitle] = useState(DEFAULT_TITLE);
  const [inFlight, setFlightStatus] = useState(false);
  const { makeRequest } = useLLMRequest();
  const { updateThread, convoThread, currentConvo } = useContext(ConvoContext);

  // const router = useRouter(); // TODO: Resolve what to do with this because this prevents build from happening.

  const chatBoxChange = (
    evt: ChangeEvent<HTMLTextAreaElement> | FocusEvent<HTMLTextAreaElement>
  ) => {
    if (evt?.type === 'focus') {
      if (userInput === defaultInput) {
        setUserInput('');
        return;
      }
    }

    if (evt?.type === 'blur') {
      if (userInput.length === 0) {
        setUserInput(defaultInput);
        return;
      }
    }

    if (evt?.type === 'change') {
      setUserInput(evt.target.value);
      return;
    }
  };

  const submitChat = useCallback(
    async (evt: SubmitEvent): Promise<void> => {
      evt.preventDefault();

      if (!currentConvo || !updateThread) return;

      const method: HTTP_METHOD = 'POST';

      setFlightStatus(true);

      /*
        TODOs: 
        - Should we return a toast message is convoFiles[] length is 0? 🤔
      */

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

          updateThread((prevState) => [
            ...prevState,
            savedUserMsg,
            llm_response
          ]);

          setUserInput(defaultInput);

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
    },
    [
      convoFiles,
      convoThread,
      currentConvo,
      currentNote._id,
      currentUser._id,
      makeRequest,
      updateThread,
      userInput
    ]
  );

  const titleChange = (evt: InputEvent) => {
    if (evt?.type === 'focus') {
      if (convoTitle === defaultTitle) {
        setConvoTitle('');
        return;
      }
    }

    if (evt?.type === 'blur') {
      if (convoTitle.length === 0) {
        setConvoTitle(defaultTitle);
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
      setDefaultTitle(updatedConvo.title);
      toast.success('Your Conversation title has been updated.', toastOptions);
    }

    setFlightStatus(false);
  };

  useEffect(() => {
    if (currentConvo) {
      setConvoTitle(currentConvo?.title || DEFAULT_TITLE);
      setDefaultTitle(currentConvo.title || DEFAULT_TITLE);
    }
  }, [currentConvo]);

  if (!currentConvo) return;

  return (
    <div className="w-[700px] mx-auto mb-8 bg-white">
      <form onSubmit={submitChat} className="mb-8 border-2 p-4 rounded-md">
        <div className="flex items-center">
          <textarea
            aria-label="Ask the LLM a Question"
            className="w-[100%] p-3 border rounded-md"
            onBlur={chatBoxChange}
            onFocus={chatBoxChange}
            onChange={chatBoxChange}
            id="conversation"
            name="conversation"
            value={userInput}
            disabled={inFlight}
          />

          <Button size="md" variant="ghost" type="submit" className="ml-4">
            Submit
          </Button>
        </div>
      </form>
      <form onSubmit={updateTitle} className="mb-8 border-2 p-4 rounded-md">
        <div className="flex items-end">
          <label htmlFor="convoTitle" className="text-lg min-w-[400px]">
            <span className="font-bold">Conversation Title</span>:<br />
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

      <div className="border-2 p-4 rounded-md">
        <p>
          <span className="font-bold">Convo Files</span>:
        </p>
        {convoFiles.length > 0 && (
          <ul className="space-y-2">
            {convoFiles.map((convoFile) => {
              return <li key={convoFile._id}>{convoFile.file_name}</li>;
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
