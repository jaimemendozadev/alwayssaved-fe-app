'use client';
import { ReactNode } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from '@heroui/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { deleteNoteByID } from '@/actions/schemamodels/notes';

interface DeleteNoteModalProps {
  noteID: string;
  isOpen: boolean;
  onOpenChange: () => void;
}

const toastOptions = { duration: 6000 };

export const DeleteNoteModal = ({
  noteID,
  isOpen,
  onOpenChange
}: DeleteNoteModalProps): ReactNode => {
  const router = useRouter();
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <span className="text-red-700">WARNING:</span> You&#39;re about to
              delete your Note.
            </ModalHeader>
            <ModalBody>
              <p>Are you sure you want to delete your Note? 🤔</p>
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="danger"
                onPress={async () => {
                  const deleteRes = await deleteNoteByID(noteID);

                  if (deleteRes.date_deleted) {
                    toast.success(
                      'Your Note has been delete. 👍🏽',
                      toastOptions
                    );
                    onClose();
                    router.push('/notes');
                  } else {
                    toast.error(
                      'There was a problem deleting your Note. Try again later. 🤦🏽',
                      toastOptions
                    );
                  }

                  onClose();
                }}
              >
                Delete
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
