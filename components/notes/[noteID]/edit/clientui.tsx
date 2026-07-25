'use client';
import { ReactNode } from 'react';
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
import { EditConvosSection, RemoveFilesSection } from './components';
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

  return (
    <div className="p-6 w-[85%]">
      <h1 className="text-3xl lg:text-6xl mb-16">
        Edit Page for Note: {currentNote?.title}
      </h1>

      <h2 className="text-3xl lg:text-4xl mb-10">❌ Delete Your Note</h2>

      <div className="mb-32">
        <Button onPress={onOpen} color="danger" size="md" variant="ghost">
          Delete Note
        </Button>
      </div>

      <hr className="mb-16" />

      <DeleteModal
        deleteCallback={deleteNoteCallback}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        resourceType="Note"
      />

      <h2 className="text-3xl lg:text-4xl mb-10">
        💿 Upload More Files to Your Note
      </h2>

      <UploadInstructions />

      <div className="mb-44">
        <FileUpload
          currentUser={currentUser}
          currentNoteID={currentNoteID}
          routerCallback={handleRedirect}
        />
      </div>

      <EditConvosSection
        currentUser={currentUser}
        currentNote={currentNote}
        noteFiles={noteFiles}
        convos={convos}
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

*/
