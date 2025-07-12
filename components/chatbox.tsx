'use client';
import { ReactNode, useState, ChangeEvent, FocusEvent } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Button } from '@heroui/react';
import {
  getObjectIDFromString,
  LeanConversation,
  LeanNote,
  LeanUser
} from '@/utils/mongodb';
import { InputEvent, SubmitEvent } from '@/utils/ts';
import { updateConversationByID } from '@/actions/schemamodels/conversations';
import { useBackendRequest } from '@/utils/hooks';
import { HTTP_METHOD } from 'next/dist/server/web/http';

interface ChatBoxProps {
  convo: null | LeanConversation;
  currentUser: LeanUser;
}

const defaultInput = 'Ask something';
const DEFAULT_TITLE = 'Untitled';
const toastOptions = { duration: 6000 };

export const ChatBox = ({ convo, currentUser }: ChatBoxProps): ReactNode => {
  const [userInput, setUserInput] = useState(defaultInput);
  const [convoTitle, setConvoTitle] = useState(convo?.title || DEFAULT_TITLE);
  const [defaultTitle, setDefaultTitle] = useState(
    convo?.title || DEFAULT_TITLE
  );
  const [inFlight, setFlightStatus] = useState(false); // May only need this for LLM submission.
  const { makeRequest } = useBackendRequest();
  const router = useRouter();

  const chatBoxChange = (
    evt: ChangeEvent<HTMLTextAreaElement> | FocusEvent<HTMLTextAreaElement>
  ) => {
    console.log('evt in chatBoxOnChange ', evt);
    console.log('\n');

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

  const submitChat = async (evt: SubmitEvent): Promise<void> => {
    evt.preventDefault();

    if (!convo) return;

    const method: HTTP_METHOD = 'POST';

    setFlightStatus(true);

    const options = {
      body: {
        conversation_id: getObjectIDFromString(convo._id),
        user_id: getObjectIDFromString(currentUser._id),
        sender_type: 'user',
        message: userInput
      },
      method
    };

    const backendURL = `/convos/${convo._id}`;

    await makeRequest(backendURL, options);
  };

  const titleChange = (evt: InputEvent) => {
    console.log('evt in titleChange ', evt);
    console.log('\n');

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

    if (!convo) return;

    setFlightStatus(true);

    const updatedConvo = await updateConversationByID(
      convo._id,
      { title: convoTitle },
      { returnDocument: 'after' }
    );

    if (updatedConvo) {
      setFlightStatus(false);
      setDefaultTitle(updatedConvo.title);
      toast.success('Your Conversation title has been updated.', toastOptions);
    }
  };

  if (!convo) return;

  return (
    <div className="max-w-[700px] mx-auto mb-8 fixed bottom-0 left-[11%] right-0 bg-white">
      <form onSubmit={submitChat} className="mb-3 border-2 p-4 rounded-md">
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
      <form onSubmit={updateTitle} className="border-2 p-4 rounded-md">
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
    </div>
  );
};
