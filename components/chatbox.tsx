'use client';
import { ReactNode, useState, ChangeEvent, FocusEvent } from 'react';

import { SubmitEvent } from '@/utils/ts';

import { Button } from '@heroui/react';

interface ChatBoxProps {
  chatHandler: (userInput: string) => Promise<void>;
  inFlight: boolean;
}

const defaultInput = 'Ask something';

export const ChatBox = ({ chatHandler, inFlight }: ChatBoxProps): ReactNode => {
  const [userInput, setUserInput] = useState(defaultInput);

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

  const submitChat = (evt: SubmitEvent) => {
    evt.preventDefault();

    chatHandler(userInput);
  };

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
