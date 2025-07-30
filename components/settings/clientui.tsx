'use client';
import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/clerk-react';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import {
  Avatar,
  Card,
  CardBody,
  CardHeader,
  Button,
  useDisclosure
} from '@heroui/react';
import { DeleteModal } from '@/components/deletemodal';
import { LeanUser } from '@/utils/mongodb';
import { deleteUserAccount } from '@/actions/schemamodels/users';

interface ClientUIProps {
  currentUser: LeanUser;
}
const toastOptions = { duration: 6000 };

export const ClientUI = ({ currentUser }: ClientUIProps): ReactNode => {
  const { signOut } = useClerk();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const router = useRouter();

  const { first_name, last_name, email, avatar_url, sign_up_date } =
    currentUser;

  const fullName = `${first_name} ${last_name}`;

  const avatarSrc =
    avatar_url === null || avatar_url === '' ? undefined : avatar_url;

  const dateJoined = dayjs(sign_up_date).format('M/D/YYYY');

  const deleteAccount = async (onClose: () => void) => {
    const deletedUser = await deleteUserAccount(currentUser._id);

    if (deletedUser && deletedUser.cancel_date) {
      await signOut();
      toast.success(
        "Your AlwaysSaved account has been deleted. We're sad to see you go. 😢 ",
        toastOptions
      );
      onClose();
      setTimeout(() => {
        router.push('/');
      }, toastOptions.duration);
      return;
    }

    toast.error(
      'There was a problem deleting your account. Try again later. 🤔',
      toastOptions
    );
  };

  return (
    <div className="p-2">
      <h1 className="text-3xl lg:text-6xl mb-16">⚙️ Settings Page</h1>

      <Card className="max-w-[300px] mb-8">
        <CardHeader>
          <Avatar src={avatarSrc} />
        </CardHeader>
        <CardBody>
          <h2 className="text-xl font-semibold mb-2">Account</h2>
          <p className="mb-2">
            <span className="font-semibold">Email</span>: {email}
          </p>
          <p className="mb-2">
            <span className="font-semibold">Name</span>: {fullName}
          </p>
          <p>
            <span className="font-semibold">Date Joined</span>: {dateJoined}
          </p>
        </CardBody>
      </Card>

      <div className="mb-32">
        <Button size="md" variant="ghost" onPress={onOpen}>
          ❌ Delete Account
        </Button>
      </div>

      <DeleteModal
        deleteCallback={deleteAccount}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        resourceType="AlwaysSaved Account"
      />
    </div>
  );
};
