import { IUser, LeanUser } from "../schemamodels/users";

export function getLeanUser(user: IUser): LeanUser {
  const {
    _id,
    first_name,
    last_name,
    email,
    sign_up_date,
    cancel_date,
    avatar_url
  } = user;
  
  const cancel_date_value = cancel_date ?? null;
  const avatar_value = avatar_url === null || avatar_url === '' ? null : avatar_url;

  // Base LeanUser structure
  const base: LeanUser = {
    _id: _id.toHexString(),
    first_name,
    last_name,
    email,
    sign_up_date,
    cancel_date: cancel_date_value,
    avatar_url: avatar_value,

  };

  return base;
}
