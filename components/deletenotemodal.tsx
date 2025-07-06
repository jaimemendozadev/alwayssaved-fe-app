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
  const handleNoteDeletion = async (targetID: string): Promise<void> => {};

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              WARNING: You&#39;re about to delete your Note. 😱
            </ModalHeader>
            <ModalBody>
              <p>Are you sure you want to delete your Note? 🤔</p>
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
