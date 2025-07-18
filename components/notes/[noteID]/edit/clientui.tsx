'use client';
import { ReactNode, } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Button, useDisclosure } from '@heroui/react';
import {
  LeanUser,
  LeanNote,
  LeanFile,
  LeanConversation
} from '@/utils/mongodb';
import { deleteNoteByID } from '@/actions/schemamodels/notes';
import { DeleteModal } from '@/components/deletemodal';
import {
  createConversation,
  deleteConvoByID
} from '@/actions/schemamodels/conversations';
import { deleteMessagesByConvoID } from '@/actions/schemamodels/convomessages';
import {
  EditConvosSection,
  FileUploadSection,
  RemoveFilesSection
} from './components';

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

  console.log('noteFiles in /notes/[noteID]/edit ', noteFiles);
  console.log('\n');

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

      <FileUploadSection
        currentNoteID={currentNoteID}
        currentUser={currentUser}
        handleRedirect={handleRedirect}
      />

      <EditConvosSection
        currentNote={currentNote}
        noteFiles={noteFiles}
        convos={convos}
        handleConvoDeletion={handleConvoDeletion}
        handleNewConvo={handleNewConvo}
      />

      <RemoveFilesSection currentUser={currentUser} noteFiles={noteFiles} />
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
