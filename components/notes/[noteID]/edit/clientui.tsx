'use client';
import { ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { Button, Tooltip, useDisclosure } from '@heroui/react';
import {
  LeanUser,
  LeanNote,
  LeanFile,
  LeanConversation
} from '@/utils/mongodb';
import { deleteNoteByID } from '@/actions/schemamodels/notes';
import { deleteConvoByID } from '@/actions/schemamodels/conversations';
import { deleteMessagesByConvoID } from '@/actions/schemamodels/convomessages';
import { purgeFileByID } from '@/actions/schemamodels/files';
import { DeleteModal } from '@/components/deletemodal';
import { UploadInstructions } from '@/components/uploadinstructions';
import { FileUpload } from '@/components/fileupload';

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
  const [targetFile, setTargetFile] = useState<LeanFile | null>(null);

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

  const deleteTextFile = async (onClose: () => void) => {
    if (targetFile === null) return;

    const { _id, file_type } = targetFile;

    const deletedFile = await purgeFileByID(_id, file_type);

    if (deletedFile && deletedFile.date_deleted) {
      toast.success(
        'Your text transcript File was successfully deleted. 👍🏽',
        toastOptions
      );
      onClose();
      setTargetFile(null);
      router.refresh();
      return;
    }

    throw new Error(
      `There was an error deleting the .txt File ${_id} for User ${currentUser._id}.`
    );
  };

  // See Dev Note #2 below.
  const handleConvoDeletion = async (convoID: string): Promise<void> => {
    if (convoID === null) return;

    await deleteConvoByID(convoID);

    await deleteMessagesByConvoID(convoID);

    toast.success('Your Conversation has been delete. 👍🏽', toastOptions);

    router.refresh();
  };

  return (
    <div className="p-6 w-[85%]">
      <h1 className="text-3xl lg:text-6xl mb-16">
        Edit Page for: {currentNote?.title}
      </h1>

      {/* Delete Your Note */}

      <h2 className="text-3xl lg:text-4xl mb-10">❌ Delete Your Note</h2>

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

      <hr className="mb-16" />

      {/* Attach Note Files Reminder */}

      {noteFiles.length === 0 && (
        <div className="mb-32">
          <h2 className="text-3xl lg:text-4xl mb-4">
            📌 REMINDER: Attach Files to Note
          </h2>
          <p className="text-xl mb-8">
            You have no Files attached to this Note. 😔
          </p>
          <p className="text-xl mb-8">
            You&apos;ll need to upload Files to this Note before you can start
            having a Conversation with the LLM. 🤖
          </p>
          <p className="text-xl mb-20">
            You can add Files to the Note in the file uploader.
          </p>
        </div>
      )}

      {/* Delete Attached Conversations */}

      {convos.length > 0 && (
        <div className="mb-24">
          <h2 className="text-3xl lg:text-4xl mb-4">
            ❌ Delete Attached Conversations
          </h2>

          <p className="text-2xl mb-10">
            Click on the trash can button to remove any Conversation attached to
            your Note. 🗑️
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

      <hr className="mb-16" />

      {/*  Remove Files Attached to Your Note */}

      <h2 className="text-3xl lg:text-4xl mb-12">
        Remove Files Attached to Your Note
      </h2>

      <article className="mb-24">
        <p className="text-2xl mb-5 font-bold text-red-700">
          📢 WARNING ABOUT DELETING .txt FILES:
        </p>

        <p className="text-2xl mb-3">
          If you delete a <i>.txt</i> text file from your Note, the LLM{' '}
          <strong>
            will no longer understand what you&apos;re talking about
          </strong>{' '}
          in past and future conversations.
        </p>

        <p className="text-2xl">
          Essentially you&apos;re wiping the LLM&apos;s knowledge of your files
          from it&apos;s memory. 😵‍💫
        </p>
      </article>

      <DeleteModal
        deleteCallback={deleteTextFile}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        resourceType=".txt File"
      />

      {noteFiles.length > 0 && (
        <ul className="space-y-4 mb-24">
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
                    if (fileDoc.file_type === '.txt') {
                      setTargetFile(fileDoc);
                      onOpen();
                      return;
                    }

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

      <hr className="mb-16" />

      {/* Upload More Files */}

      <h2 className="text-3xl lg:text-4xl mb-10">
        💿 Upload More Files to Your Note
      </h2>

      {/* TODO: Will have to craft a new set of instructions for uploadidng files to an existing Note. */}

      <UploadInstructions />

      <div className="mb-44">
        <FileUpload
          currentUser={currentUser}
          currentNoteID={currentNoteID}
          routerCallback={handleRedirect}
        />
      </div>
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
