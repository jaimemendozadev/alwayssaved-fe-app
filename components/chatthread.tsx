'use client';
import { LeanConvoMessage } from '@/utils/mongodb';
import { ReactNode, useRef, useEffect, CSSProperties } from 'react';
import {
  List,
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache
} from 'react-virtualized';
import { TempConvoMessage } from './context/convocontext';
import { MeasuredCellParent } from 'react-virtualized/dist/es/CellMeasurer';
interface ChatThreadProps {
  convoThread: (LeanConvoMessage | TempConvoMessage)[];
}

interface RowProps {
  index: number;
  parent: MeasuredCellParent;
  style: CSSProperties;
}

export const ChatThread = ({ convoThread }: ChatThreadProps): ReactNode => {
  const cache = useRef(
    new CellMeasurerCache({ fixedWidth: true, defaultHeight: 200 })
  );

  const listRef = useRef<List>(null);

  useEffect(() => {
    listRef.current?.scrollToRow(convoThread.length - 1);
  }, [convoThread.length]);

  const Row = ({ index, parent, style }: RowProps): ReactNode => {
    const convoMsg = convoThread[index];

    if ('is_pending' in convoMsg) {
      return (
        <div key={convoMsg.temp_id} style={{ ...style, paddingBottom: 20 }}>
          {' '}
          {/* spacing between items */}
          <CellMeasurer
            cache={cache.current}
            parent={parent}
            columnIndex={0}
            rowIndex={index}
          >
            <div className="border p-6 rounded-md" style={style}>
              {convoMsg.message}
            </div>
          </CellMeasurer>
        </div>
      );
    } else if ('conversation_id' in convoMsg) {
      return (
        <div key={convoMsg._id} style={{ ...style, paddingBottom: 20 }}>
          {' '}
          {/* spacing between items */}
          <CellMeasurer
            cache={cache.current}
            parent={parent}
            columnIndex={0}
            rowIndex={index}
          >
            <div className="border p-6 rounded-md">{convoMsg.message}</div>
          </CellMeasurer>
        </div>
      );
    }

    return null;
  };

  // May delete this if it looks bad.
  if (convoThread.length === 0) {
    return (
      <div className="w-[900px] h-[500px] mx-auto border-2 bg-white rounded-md"></div>
    );
  }

  return (
    <div
      style={{ flex: '1 1 auto', width: '900px', height: '500px', margin: '0 auto 60px auto' }}
    >
      <AutoSizer>
        {({ width, height }) => (
          <List
            ref={listRef}
            rowCount={convoThread.length}
            height={height}
            width={width}
            rowHeight={cache.current.rowHeight}
            rowRenderer={Row}
            deferredMeasurementCache={cache.current}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </div>
  );
};
