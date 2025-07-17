'use client';
import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { Button, Tooltip, useDisclosure } from '@heroui/react';
import {
  LeanUser,
  LeanNote,
  LeanFile,
  LeanConversation
} from '@/utils/mongodb';
import { FileUpload } from '@/components/fileupload';
import { purgeFileByID } from '@/actions/schemamodels/files';
import { deleteNoteByID } from '@/actions/schemamodels/notes';
import { DeleteModal } from '@/components/deletemodal';
import {
  createConversation,
  deleteConvoByID
} from '@/actions/schemamodels/conversations';
import { deleteMessagesByConvoID } from '@/actions/schemamodels/convomessages';

interface ClientUIProps {
  currentUser: LeanUser;
  currentNote: LeanNote;
  noteFiles: LeanFile[];
  currentNoteID: string;
  convos: LeanConversation[];
}

const toastOptions = { duration: 6000 };

export const ClientUI = ({
  currentUser,
  currentNote,
  noteFiles,
  currentNoteID,
  convos
}: ClientUIProps): ReactNode => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const router = useRouter();

  const handleRedirect = () => {
    router.refresh();
  };

  const noteID = currentNote._id.toString();

  // See Dev Note #1 below.
  const deleteNoteCallback = async (onClose: () => void) => {
    const deleteRes = await deleteNoteByID(noteID);

    if (deleteRes.date_deleted) {
      toast.success('Your Note has been delete. 👍🏽', toastOptions);
      onClose();
      router.push('/notes');
    }

    toast.error(
      'There was a problem deleting your Note. Try again later. 🤦🏽',
      toastOptions
    );

    onClose();
  };

  const handleNewConvo = async () => {
    const newConvo = await createConversation(currentUser._id, currentNote._id);

    if (newConvo) {
      router.push(`/notes/${currentNote._id}/convos/${newConvo._id}`);
    }

    throw new Error(
      `There was an error creating a new Conversation for Note ${currentNote._id}`
    );
  };

  // See Dev Note #2 below.
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
    <div className="p-6 w-[85%]">
      <h1 className="text-3xl lg:text-6xl mb-16">
        Edit Page for Note: {currentNote?.title}
      </h1>

      <div className="mb-32">
        <Button onPress={onOpen} color="danger" size="md" variant="ghost">
          Delete Note
        </Button>
      </div>

      <DeleteModal
        deleteCallback={deleteNoteCallback}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        resourceType="Note"
      />

      <div className="mb-44">
        <h2 className="text-3xl lg:text-4xl mb-10">
          Upload More Files to Your Note
        </h2>

        <article className="mb-24">
          <p className="text-xl mb-2">
            <span className="font-bold">Media Upload Instructions</span>:
          </p>

          <p className="text-lg mb-3 font-bold text-red-700">
            🙅🏽‍♀️ DO NOT GO TO ANOTHER PAGE IN THE APP WHILE UPLOADING FILES.
          </p>

          <p className="text-lg mb-8">
            <span className="font-bold">
              Wait until all the media files are uploaded
            </span>{' '}
            to the cloud for transcribing. Then you can create a brand new Note
            with new media files or navigate to another part of the app.
          </p>

          <p className="text-lg mb-3">
            While you wait for the media files to be transcribed, go do
            something else. ☕️ We&apos;ll let you know when it&apos;s done.
          </p>
        </article>

        <FileUpload
          currentUser={currentUser}
          currentNoteID={currentNoteID}
          routerCallback={handleRedirect}
        />
      </div>

      <h2 className="text-3xl lg:text-4xl mb-10">
        💬 Remove of Add Conversations for {currentNote.title} Note
      </h2>

      {/* TODO: Will have to disable handleNewConvo button if there are no Files attached to the Note. */}

      {convos.length === 0 ? (
        <div className="mb-32">
          <p className="text-2xl mb-4">
            You have no Conversations for this Note.
          </p>
          <p className="text-2xl mb-8">
            Create a Conversation for this Note to start chatting with the LLM.
            🤖
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
      ) : (
        <div className="mb-48">
          <div className="mb-24">
            <p className="text-2xl mb-4">
              Click on the &lsquo;Delete Convo&rsquo; trash can button to remove
              any Conversation attached to your Note. 🗑️
            </p>

            <p className="text-2xl mb-16">
              Or you can click on the &lsquo;Create Convo&rsquo; button and
              start a new Conversation about your Note Files.
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
                    {dayjs(convo.date_started).format('dddd, MMMM D, YYYY')}
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

      <h2 className="text-3xl lg:text-4xl mb-6">
        Remove Files Attached to Your Note
      </h2>

      {noteFiles.length === 0 && (
        <p className="text-xl mb-16">
          You have no files attached to this Note. You can add files to the note
          in the dropdown below.
        </p>
      )}

      {/* 
        TODOs: 
        
            1) Will need to add User instructions that once they delete a .txt Transcript file, 
               any ongoing conversations that reference a deleted file won't work properly
               because the LLM no longer has access to that information. 😱

            2) Need to add Warning Modal to warn the User if they try deleting a .txt file
               and how it affects ongoing conversations that reference that soon to be
               deleted .txt file. 😱
      
      */}

      {noteFiles.length > 0 && (
        <ul className="space-y-4 mb-16">
          {noteFiles.map((fileDoc) => (
            <li key={fileDoc._id} className="border p-5">
              <span className="font-semibold">File Name</span>:{' '}
              {fileDoc.file_name} &nbsp; | &nbsp;{' '}
              <span className="font-semibold">File Type</span>:{' '}
              {fileDoc.file_type} &nbsp; | &nbsp;{' '}
              <Tooltip content="Delete File">
                <Button
                  size="sm"
                  variant="ghost"
                  isIconOnly={true}
                  aria-label="Delete"
                  onPress={async () => {
                    const purgedResult = await purgeFileByID(
                      fileDoc._id,
                      fileDoc.file_type
                    );

                    if (purgedResult.date_deleted) {
                      toast.success(
                        'Your File has been deleted. 👍🏽',
                        toastOptions
                      );
                      router.refresh();
                    }
                  }}
                >
                  🗑️
                </Button>
              </Tooltip>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/***************************
 * Notes
 ***************************

 1) For MVP v1, deleteNoteByID "deletes" a Note by updating
    the date_deleted property. In a separate async job,
    a proper Note deletion will involve:

    - Getting all the Note's File DB references in NoteModel.files[].
      - Deleting all Note's Files from s3.
      - Deleting all the Vector points in Vector DB.
      - Deleting File DB document.
    - Deleting the Note DB document.

 2) Conversation & ConvoMessage documents are not
    hard deleted in the app. They're marked with
    date_deleted value in the document. They will
    be removed from the database in a separate
    async job.

*/
