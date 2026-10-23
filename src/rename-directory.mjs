import {rename} from 'node:fs/promises';
import {setTimeout as delay} from 'node:timers/promises';

// Windows scanners and directory readers can briefly prevent a directory move.
// Retry only sharing/access errors, with a fixed 2.5-second total wait budget.
const waits=[100,200,400,800,1000];
const transient=new Set(['EPERM','EACCES','EBUSY']);
export async function renameDirectory(source,destination) {
 let attempt=0;
 while(true) {
  try{return await rename(source,destination);}
  catch(cause) {
   if(process.platform==='win32' && transient.has(cause.code) && attempt<waits.length) {
    await delay(waits[attempt++]);continue;
   }
   if(process.platform==='win32' && transient.has(cause.code)) {
    const error=new Error(
     'Windows could not rename the plugin directory after bounded retries. '+
     'A program may be holding it open, or access may be denied. '+
     'Close Antigravity/agy sessions or file viewers using this directory, wait briefly, and retry. '+
     'Existing configurations were not force-deleted. '+cause.message,{cause});
    Object.assign(error,{code:cause.code,path:source,dest:destination,syscall:'rename'});
    throw error;
   }
   throw cause;
  }
 }
}
