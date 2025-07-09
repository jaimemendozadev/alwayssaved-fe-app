'use client';
import { ReactNode, useState, ChangeEvent, FocusEvent } from 'react';
import { Button } from '@heroui/react';

interface ChatBoxProps {
  handleSubmit: () => void;
  inFlight: boolean;
}

const defaultInput = 'Ask something';
export const ChatBox = ({
  handleSubmit,
  inFlight
}: ChatBoxProps): ReactNode => {
  const [userInput, setUserInput] = useState(defaultInput);

  const handleChange = (
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
    <div className="w-[900px]">
      <form onSubmit={handleSubmit} className="mb-8 border-2 p-4">
        <div className="flex items-end">
          <label htmlFor="noteTitle" className="text-lg min-w-[400px]">
            <span className="font-bold">Note Title</span>:<br />
            <textarea
              className="w-[100%] p-1"
              onBlur={handleChange}
              onFocus={handleChange}
              onChange={handleChange}
              id="noteTitle"
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
