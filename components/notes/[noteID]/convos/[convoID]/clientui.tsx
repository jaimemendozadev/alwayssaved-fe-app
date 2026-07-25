'use client';
import { ReactNode, useContext, useEffect, useState } from 'react';
import { ChatBox } from '@/components/chatbox';
import {
  LeanConversation,
  LeanFile,
  LeanNote,
  LeanUser
} from '@/utils/mongodb';
import { ChatThread } from '@/components/chatthread';
import { ConvoContext } from '@/components/context';
import { getConversationMessages } from '@/actions/schemamodels/convomessages';
interface ClientUIProps {
  currentUser: LeanUser;
  convo: LeanConversation;
  convoFiles: LeanFile[];
  currentNote: LeanNote;
}

const DEFAULT_TITLE = 'Untitled';

/* 
  7-25-26 TODO: 
    - Decouple Note Title From and list of media files out of <ChatBox /> 
    - Refamiliarize ConvoContext & reimplement to make it less confusng going forward
*/
export const ClientUI = ({
  currentUser,
  convo,
  convoFiles,
  currentNote
}: ClientUIProps): ReactNode => {
  const [convoTitle, setConvoTitle] = useState(DEFAULT_TITLE);
    const [defaultTitle, setDefaultTitle] = useState(DEFAULT_TITLE);


  const { currentConvo, convoThread, setCurrentConvo, updateThread } =
    useContext(ConvoContext);


  const titleChange = (evt: InputEvent) => {
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
    router.refresh();
  };

  useEffect(() => {
    if (convo && setCurrentConvo && currentConvo === null) {
      setCurrentConvo(convo);
    }
  }, [convo, currentConvo, setCurrentConvo]);

  useEffect(() => {
    async function setConvoMessage(convoID: string) {
      const convoMessages = await getConversationMessages(convoID);

      if (updateThread) {
        updateThread(convoMessages);
      }
    }

    if (convo && updateThread) {
      setConvoMessage(convo._id);
    }
  }, []);


  // See Dev Notes below.
  return (
    <div className="min-h-screen p-6 flex flex-col justify-between">
      <h1 className="text-3xl lg:text-6xl mb-16">
        💬 Convo Page for: {convo.title}
      </h1>
      <ChatThread convoThread={convoThread} />
      <ChatBox
        currentUser={currentUser}
        currentNote={currentNote}
        convoFiles={convoFiles}
      />

      <section>
        <section>
          <div className="border-2 p-4 rounded-md">
        <p className="mb-1">
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
        </section>

      <section>
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
      </section>



      </section>
    </div>
  );
};

/***************************
 * Notes
 ***************************

 1) If there's time to implement for MVP, will need to 
    implement responsive layout for every page, including 
    work on ChatThread & ChatBox responsive layout.

*/
