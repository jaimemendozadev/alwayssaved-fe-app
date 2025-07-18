'use client';
import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { Button, Tooltip } from '@heroui/react';
import {
  createConversation,
  deleteConvoByID
} from '@/actions/schemamodels/conversations';
import { deleteMessagesByConvoID } from '@/actions/schemamodels/convomessages';
import {
  LeanConversation,
  LeanFile,
  LeanNote,
  LeanUser
} from '@/utils/mongodb';

interface EditConvosSectionProps {
  currentUser: LeanUser;
  currentNote: LeanNote;
  noteFiles: LeanFile[];
  convos: LeanConversation[];
}

const toastOptions = { duration: 6000 };

export const EditConvosSection = ({
  currentUser,
  currentNote,
  noteFiles,
  convos
}: EditConvosSectionProps): ReactNode => {
  const router = useRouter();

  const handleNewConvo = async () => {
    const newConvo = await createConversation(currentUser._id, currentNote._id);

    if (newConvo) {
      router.push(`/notes/${currentNote._id}/convos/${newConvo._id}`);
    }

    throw new Error(
      `There was an error creating a new Conversation for Note ${currentNote._id}`
    );
  };

  // See Dev Note #1 below.
  const handleConvoDeletion = async (convoID: string): Promise<void> => {
    if (convoID === null) return;

    console.log('convoID  in handleConvoDeletion ', convoID);

    // TODO: Review the return value of each asyn function.
    await deleteConvoByID(convoID);

    await deleteMessagesByConvoID(convoID);

    toast.success('Your Conversation has been delete. 👍🏽', toastOptions);

    router.refresh();
  };

  return (
    <>
      {noteFiles.length === 0 && (
        <div className="mb-32">
          <h2 className="text-3xl lg:text-4xl mb-4">Attached Note Files</h2>
          <p className="text-xl mb-8">
            You have no Files attached to this Note. 😔
          </p>
          <p className="text-xl mb-8">
            You&apos;ll need to upload Files to this Note before you can start
            having a Conversation with the LLM. 🤖
          </p>
          <p className="text-xl mb-20">
            You can add Files to the Note in the file uploader above. ☝️
          </p>
        </div>
      )}

      {noteFiles.length > 0 && (
        <div className="mb-32">
          <h2 className="text-3xl lg:text-4xl mb-4">Note Conversations</h2>
          <p className="text-2xl mb-8">
            Click on the &lsquo;Create Convo&rsquo; button and start chatting
            with the LLM about your Note Files. 🤖
          </p>
          <div>
            <Button
              size="md"
              variant="ghost"
              onPress={async () => await handleNewConvo()}
            >
              💬 Create Convo
            </Button>
          </div>
        </div>
      )}

      {convos.length === 0 && (
        <div className="mb-32">
          <p className="text-3xl lg:text-4xl mb-4">Note Conversations</p>
          <p className="text-2xl">You have no Conversations for this Note.</p>
        </div>
      )}

      {convos.length > 0 && (
        <div className="mb-24">
          <p className="text-2xl mb-4">
            Click on the &lsquo;Delete Convo&rsquo; trash can button to remove
            any Conversation attached to your Note. 🗑️
          </p>

          <ul className="space-y-7">
            {convos.map((convo) => {
              return (
                <li className="border p-5" key={convo._id}>
                  <Link
                    className="hover:underline underline-offset-4"
                    href={`/notes/${convo.note_id}/convos/${convo._id}`}
                  >
                    <span className="font-semibold">Convo Name</span>:{' '}
                    {convo.title} &nbsp; | &nbsp;{' '}
                    <span className="font-semibold">Convo Start Date</span>:{' '}
                    {dayjs(convo.date_started).format('dddd, MMMM D, YYYY')}{' '}
                    &nbsp;{' '}
                  </Link>
                  <Tooltip content="Delete Convo">
                    <Button
                      size="sm"
                      variant="ghost"
                      isIconOnly={true}
                      aria-label="Delete Conversation"
                      onPress={async () => await handleConvoDeletion(convo._id)}
                    >
                      🗑️
                    </Button>
                  </Tooltip>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
};

/***************************
 * Notes
 ***************************

 1) Conversation & ConvoMessage documents are not
    hard deleted in the app. They're marked with
    date_deleted value in the document. They will
    be removed from the database in a separate
    async job.

*/
