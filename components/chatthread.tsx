'use client';
import { LeanConvoMessage } from '@/utils/mongodb';
import { ReactNode } from 'react';
import { Spinner } from '@heroui/react';
import { FixedSizeList as List } from 'react-window';
import { TempConvoMessage } from './context/convocontext';

interface ChatThreadProps {
  convoThread: (LeanConvoMessage | TempConvoMessage)[];
}

interface RowProps {
  index: number;
}

// TODO: Need to fix ChatThread dimensions for reponsive design. Tailwind width classes don't work on <List />
export const ChatThread = ({ convoThread }: ChatThreadProps): ReactNode => {
  const Row = ({ index }: RowProps): ReactNode => {
    const convoMsg = convoThread[index];

    if ('temp_id' in convoMsg) {
      if (convoMsg.is_thinking) {
        return (
          <div
            className="border p-4 rounded-md flex justify-center"
            key={convoMsg.temp_id}
          >
            <Spinner />
          </div>
        );
      }
      return (
        <div className="border p-4 rounded-md" key={convoMsg.temp_id}>
          {convoMsg.is_thinking ? <Spinner /> : convoMsg.message}
        </div>
      );
    } else if ('conversation_id' in convoMsg) {
      return (
        <div className="border p-4 rounded-md" key={convoMsg._id}>
          {convoMsg.message}
        </div>
      );
    }

    return null;
  };

  if (!Array.isArray(convoThread)) return null;

  return (
    <List
      className="mx-auto mb-4 border rounded-md"
      height={500}
      itemCount={convoThread.length}
      itemSize={35}
      width={900}
    >
      {Row}
    </List>
  );
};
