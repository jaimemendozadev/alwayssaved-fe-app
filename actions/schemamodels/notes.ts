'use server';
import { deepLean, getObjectIDFromString, LeanNote, NoteModel } from "@/utils/mongodb";


export const getNoteByID = async(noteID: string): Promise<LeanNote | void> => {
    const mongoID = getObjectIDFromString(noteID);
    const foundNote = await NoteModel.findById(mongoID).exec();


    if(!foundNote) {
        throw new Error(`Can't find a note with an ID of ${noteID}`)
    }


    return deepLean(foundNote);


}