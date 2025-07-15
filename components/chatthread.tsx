'use client';
import { LeanConvoMessage } from '@/utils/mongodb';
import { ReactNode, useRef, CSSProperties } from 'react';
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

  const Row = ({ index, parent, style }: RowProps): ReactNode => {
    console.log('style ', style);
    const convoMsg = convoThread[index];

    if ('is_pending' in convoMsg) {
      return (
        <CellMeasurer
          key={convoMsg.temp_id}
          cache={cache.current}
          parent={parent}
          columnIndex={0}
          rowIndex={index}
        >
          <div className="border p-4 rounded-md" style={style}>
            {convoMsg.message}
          </div>
        </CellMeasurer>
      );
    } else if ('conversation_id' in convoMsg) {
      return (
        <CellMeasurer
          key={convoMsg._id}
          cache={cache.current}
          parent={parent}
          columnIndex={0}
          rowIndex={index}
        >
          <div className="border p-4 rounded-md" style={style}>
            {convoMsg.message}
          </div>
        </CellMeasurer>
      );
    }

    return null;
  };

  if (!Array.isArray(convoThread)) return null;

  return (
    <div
      style={{ flex: '1 1 auto', width: '900px', margin: '0 auto 60px auto' }}
    >
      <AutoSizer>
        {({ width, height }) => (
          <List
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
