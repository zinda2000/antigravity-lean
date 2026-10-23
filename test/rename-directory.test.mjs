
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,access,rm,realpath} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {renameDirectory} from '../src/rename-directory.mjs';

async function fixture(t){
 const root=await realpath(await mkdtemp(path.join(tmpdir(),'lean-rename-')));
 t.after(()=>rm(root,{recursive:true,force:true,maxRetries:3,retryDelay:100}));
 const src=path.join(root,'stage');await mkdir(src);
 await writeFile(path.join(src,'test.txt'),'keep');
 return {root,src,dst:path.join(root,'installed')};
}
test('rename preserves the directory contents',async t=>{
 const {src,dst}=await fixture(t);await renameDirectory(src,dst);
 await access(path.join(dst,'test.txt'));await assert.rejects(access(src));
});
test('failed rename reports both paths and the operating-system error',async t=>{
 const {src,dst}=await fixture(t);await mkdir(dst);await writeFile(path.join(dst,'existing.txt'),'user');
 await assert.rejects(renameDirectory(src,dst),e=>Boolean(e.code && e.message.includes(src) && e.message.includes(dst)));
 await access(path.join(src,'test.txt'));await access(path.join(dst,'existing.txt'));
});
test('a Windows sharing lock can release before installation rename completes',{skip:process.platform!=='win32'},async t=>{
 const {src,dst}=await fixture(t);
 const ps=`
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
using Microsoft.Win32.SafeHandles;
public static class LeanDirectoryLock {
 [DllImport("kernel32.dll", CharSet=CharSet.Unicode, SetLastError=true)]
 public static extern SafeFileHandle CreateFile(string path, uint access, uint share, IntPtr security, uint mode, uint flags, IntPtr template);
}
'@
$h=[LeanDirectoryLock]::CreateFile($env:LEAN_LOCK_PATH,1,3,[IntPtr]::Zero,3,0x02000000,[IntPtr]::Zero)
if($h.IsInvalid){ throw "Directory lock failed" }
Write-Output "LOCKED"
Start-Sleep -Milliseconds 900
$h.Dispose()
`;
 const child=spawn('powershell.exe',['-NoProfile','-NonInteractive','-Command',ps],{env:{...process.env,LEAN_LOCK_PATH:src},windowsHide:true,stdio:['ignore','pipe','pipe']});
 const exit=once(child,'exit');
 t.after(()=>{if(child.exitCode===null)child.kill();});
 let output='';
 await new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(new Error('Lock process timed out: '+output)),10000);
  child.stdout.on('data',b=>{output+=b;if(output.includes('LOCKED')){clearTimeout(timer);resolve();}});
  child.stderr.on('data',b=>{output+=b;});
  child.once('error',e=>{clearTimeout(timer);reject(e);});
  child.once('exit',code=>{if(!output.includes('LOCKED')){clearTimeout(timer);reject(new Error('Lock process exited '+code+': '+output));}});
 });
 const start=Date.now();await renameDirectory(src,dst);
 assert.ok(Date.now()-start>=300,'must survive the initial sharing violation');
 await access(path.join(dst,'test.txt'));
 assert.equal((await exit)[0],0);
});
