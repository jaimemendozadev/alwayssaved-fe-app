'use client';
import {
  ReactNode,
  useState,
  ChangeEvent,
  FocusEvent,
  useContext,
  useCallback
} from 'react';
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
import { BackendResponse, SubmitEvent } from '@/utils/ts';
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
const toastOptions = { duration: 6000 };

export const ChatBox = ({
  currentUser,
  convoFiles,
  currentNote
}: ChatBoxProps): ReactNode => {
  const [userInput, setUserInput] = useState(defaultInput);
  const [inFlight, setFlightStatus] = useState(false);
  const { makeRequest } = useLLMRequest();
  const { updateThread, convoThread, currentConvo } = useContext(ConvoContext);

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
    </div>
  );
};
