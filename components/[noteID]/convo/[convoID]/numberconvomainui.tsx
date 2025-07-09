'use client';
import { ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Button } from '@heroui/react';
import { LeanNote, LeanFile, LeanConversation } from '@/utils/mongodb';
import { ChatBox } from '../chatbox';
interface NumberNoteMainUIProps {
  currentNote: LeanNote;
  noteFiles: LeanFile[];
}

export const NumberConvoMainUI = ({
  currentNote,
  noteFiles
}: NumberNoteMainUIProps): ReactNode => {
  const [inFlight, setFlightStatus] = useState(false);
  const [localConvo, setLocalConvo] = useState<LeanConversation | null>(null);
  const router = useRouter();
  const editURL = `${currentNote._id.toString()}/edit`;


  const chatSubmit = async (evt: SubmitEvent): Promise<void> => {
    evt.preventDefault();

    console.log('INSIIIIIDE ChatBox handleSubmit');

    // if (!currentUser) return;

    if (!localConvo) {
      // CREATE a new Conversation

      if (newNote) {
        setLocalNote(newNote);
        toast.success(
          'A new Note has been created. 🎉 You may now add video files to your new Note.',
          toastOptions
        );

        // TODO: Maybe we shouldn't refresh if the currentNoteID is null
        router.refresh();
        return;
      }

      // TODO: Should we throw an error here if we fail to create a new note?
    }

    if (localNote) {
      setFlightStatus(true);
      await updateNoteByID(localNote?._id, { title: noteTitle });

      setFlightStatus(false);
      toast.success('Your Note title has been updated. 👏🏼', toastOptions);

      router.refresh();
    }
  };

  return (
    <div className="p-6 w-[85%]">
      <h1 className="text-3xl lg:text-6xl mb-16">
        Note Page for: {currentNote?.title}
      </h1>

      <div className="mb-14">
        <Button size="md" variant="ghost" onPress={() => router.push(editURL)}>
          ✍🏼 Edit Note
        </Button>
      </div>

      <h2 className="text-3xl lg:text-4xl mb-6">Files Attached to Your Note</h2>

      {noteFiles.length > 0 ? (
        <ul className="space-y-4 mb-32">
          {noteFiles.map((fileDoc) => (
            <li key={fileDoc._id} className="border p-5">
              <span className="font-semibold">File Name</span>:{' '}
              {fileDoc.file_name} &nbsp; | &nbsp;{' '}
              <span className="font-semibold">File Type</span>:{' '}
              {fileDoc.file_type}
            </li>
          ))}
        </ul>
      ) : (
        <div>
          <p className="text-xl mb-1">
            You have no files attached to this Note. 😔
          </p>
          <p className="text-xl mb-20">
            You can add files to the note by clicking on the 👆🏽 above
            &ldquo;Edit Your Note&rdquo; link.
          </p>
        </div>
      )}
    </div>
  );
};
