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
  isOpen: boolean;
  resourceType: string;
  onOpenChange: () => void;
  deleteCallback: (onClose: () => void) => void;
}

export const DeleteModal = ({
  isOpen,
  resourceType,
  onOpenChange,
  deleteCallback
}: DeleteNoteModalProps): ReactNode => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <span className="text-red-700">WARNING:</span> You&#39;re about to
              delete your {resourceType}.
            </ModalHeader>
            <ModalBody>
              <p>Are you sure you want to delete your {resourceType}? 🤔</p>
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button color="danger" onPress={() => deleteCallback(onClose)}>
                Delete
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
