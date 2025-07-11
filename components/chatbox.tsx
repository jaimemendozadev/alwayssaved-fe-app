'use client';
import { ReactNode, useState, ChangeEvent, FocusEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/react';
import { LeanConversation } from '@/utils/mongodb';

interface ChatBoxProps {
  chatSubmit: () => void;
  inFlight: boolean;
  convo: null | LeanConversation;
}

const defaultInput = 'Ask something';
export const ChatBox = ({ chatSubmit, inFlight }: ChatBoxProps): ReactNode => {
  const [userInput, setUserInput] = useState(defaultInput);
  const router = useRouter();

  const handleChatBox = (
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

  return (
    <div className="max-w-[700px] mx-auto">
      <form onSubmit={chatSubmit} className="mb-8 border-2 p-4 rounded-md">
        <div className="flex items-start">
          <textarea
            aria-label="Ask the LLM a Question"
            className="w-[100%] p-3 border rounded-md"
            onBlur={handleChatBox}
            onFocus={handleChatBox}
            onChange={handleChatBox}
            id="noteTitle"
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
