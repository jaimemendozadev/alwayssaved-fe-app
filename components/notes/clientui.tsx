'use client';
import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { Button, Tooltip } from '@heroui/react';
import { LeanUser, LeanNote } from '@/utils/mongodb';
import { deleteNoteByID } from '@/actions/schemamodels/notes';

interface ClientUIProps {
  userNotes: LeanNote[];
  currentUser: LeanUser;
}

const toastOptions = { duration: 6000 };

export const ClientUI = ({
  userNotes,
  currentUser
}: ClientUIProps): ReactNode => {
  const router = useRouter();

  const handleNoteDeletion = async (noteID: string): Promise<void> => {
    const delRes = await deleteNoteByID(noteID);
    if (delRes.date_deleted) {
      toast.success(
        'Your note has been successfully deleted. 👌🏽',
        toastOptions
      );
      router.refresh();
      return;
    }

    toast.error(
      'There was a problem deleting your Note. Try again later. 😬',
      toastOptions
    );
  };

  if (!currentUser) return null;

  return (
    <div>
      <h1 className="text-3xl lg:text-6xl mb-16">
        📝 {currentUser?.first_name}&#39;s Notes
      </h1>

      {userNotes.length === 0 ? (
        <p className="text-2xl">
          You have no notes saved in the app. Go upload some files and{' '}
          <Link
            className="hover:underline underline-offset-4 text-blue-700"
            href="/home"
          >
            create a new note
          </Link>
          .
        </p>
      ) : (
        <div className="mb-16">
          <p className="text-2xl mb-4">
            Click on any Note Page link to view all the Files and Conversations
            attached to that Note.
          </p>

          <p className="text-2xl">
            From the selected Note Page, you can also start a new chat with the
            LLM about your Note Files. 🤖
          </p>
        </div>
      )}

      {userNotes.length > 0 && (
        <ul className="space-y-7">
          {userNotes.map((noteDoc) => {
            return (
              <li className="border-2 p-5" key={noteDoc._id}>
                <Link
                  className="hover:underline underline-offset-4"
                  href={`/notes/${noteDoc._id}`}
                >
                  <span className="font-semibold">Note Name</span>:{' '}
                  {noteDoc.title} &nbsp; | &nbsp;{' '}
                  <span className="font-semibold">Date Created</span>:{' '}
                  {dayjs(noteDoc.date_created).format('dddd, MMMM D, YYYY')}
                </Link>
                &nbsp; | &nbsp;{' '}
                <Tooltip content="Delete Note">
                  <Button
                    size="sm"
                    variant="ghost"
                    isIconOnly={true}
                    aria-label="Delete"
                    onPress={async () =>
                      await handleNoteDeletion(noteDoc._id.toString())
                    }
                  >
                    🗑️
                  </Button>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
