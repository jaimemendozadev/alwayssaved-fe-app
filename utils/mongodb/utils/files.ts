import { IFile, LeanFile } from "../schemamodels/files";
import { getLeanUser } from "./users";


export const getLeanFile = (file: IFile): LeanFile => {
    const {_id, user_id, note_id, s3_key, file_name, file_type, date_uploaded, embedding_status} = file;

    
    const base: LeanFile = {
      _id: _id.toHexString(),
      user_id: '',
      note_id: '',
      s3_key,
      file_name,
      file_type,
      date_uploaded,
      embedding_status,
    }

    if(typeof user_id === 'object' && 'email' in user_id) {
        base['user_id'] = getLeanUser(user_id);
    } else {
        base['user_id'] = user_id.toHexString();
    }

    if(typeof note_id === 'object' && 'date_created' in note_id) {
      base['note_id'] = getLeanNote(note_id);
    } else {
      base['note_id'] = note_id.toHexString();
    }

    return base;
}