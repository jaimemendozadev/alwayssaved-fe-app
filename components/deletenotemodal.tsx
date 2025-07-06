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

interface DeleteNoteModalProps {
  noteID: string;
  isOpen: boolean;
  onOpenChange: () => void;
}

export const DeleteNoteModal = ({
  noteID,
  isOpen,
  onOpenChange
}: DeleteNoteModalProps): ReactNode => {
  const handleNoteDeletion = async (noteID: string): Promise<void> => {
    /*
    - TODO:
      - First collect all the Note Files.
      - Second, delete all the Files in s3.
      - Third, delete all the File documents in DB.
      - Finally, delete the Note document in DB.    
 
    */
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Modal Title
            </ModalHeader>
            <ModalBody>
              <p>You&#39;re about to delete your Note. 😱</p>
              <p>Are you sure you want to delete it? 🤔</p>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button
                color="primary"
                onPress={() => {
                  console.log('INSIIIIDE Modal Action Button');
                  onClose();
                }}
              >
                Action
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
