'use client';
import { ReactNode, useState, ChangeEvent, FocusEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/react';
import { LeanConversation } from '@/utils/mongodb';
import { SubmitEvent } from '@/utils/ts';

interface ChatBoxProps {
  inFlight: boolean;
  convo: null | LeanConversation;
  chatSubmit: (evt: SubmitEvent) => Promise<void>;
}

const defaultInput = 'Ask something';
export const ChatBox = ({ chatSubmit, inFlight }: ChatBoxProps): ReactNode => {
  const [userInput, setUserInput] = useState(defaultInput);
  const router = useRouter();

  const chatBoxOnChange = (
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

  return (
    <div className="max-w-[700px] mx-auto mb-8 fixed bottom-0 left-[11%] right-0 bg-white">
      <form onSubmit={chatSubmit} className="mb-3 border-2 p-4 rounded-md">
        <div className="flex items-start">
          <textarea
            aria-label="Ask the LLM a Question"
            className="w-[100%] p-3 border rounded-md"
            onBlur={chatBoxOnChange}
            onFocus={chatBoxOnChange}
            onChange={chatBoxOnChange}
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
      <form onSubmit={chatSubmit} className="border-2 p-4 rounded-md">
        <div className="flex items-end">
          <label htmlFor="convoTitle" className="text-lg min-w-[400px]">
            <span className="font-bold">Conversation Title</span>:<br />
            <input
              className="w-[100%] p-1"
              onBlur={chatBoxOnChange}
              onFocus={chatBoxOnChange}
              onChange={chatBoxOnChange}
              id="convoTitle"
              name="convoTitle"
              value={userInput}
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
