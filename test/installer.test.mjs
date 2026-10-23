import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, mkdir, readdir, symlink, access, rm, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { install, doctor, uninstall, destination } from '../src/installer.mjs';
async function fixture(t) {
 const root=await realpath(await mkdtemp(path.join(tmpdir(),'lean-test-')));
 t.after(()=>rm(root,{recursive:true,force:true}));
 return {root,options:{scope:'project',project:root,profile:'balanced',lang:'zh'}};
}
test('install creates plugin and doctor detects edits',async t=>{
 const {options}=await fixture(t); assert.equal((await install(options)).action,'installed');
 const dir=destination(options);
 assert.equal(JSON.parse(await readFile(path.join(dir,'plugin.json'))).name,'antigravity-lean');
 assert.equal((await doctor(options)).ok,true);
 await writeFile(path.join(dir,'rules/context-hygiene.md'),'my edits');
 assert.equal((await doctor(options)).ok,false);
});
test('dry run creates nothing',async t=>{
 const {root,options}=await fixture(t); await install({...options,dryRun:true});
 assert.deepEqual(await readdir(root),[]);
});
test('repeat install is idempotent and updates retain backup',async t=>{
 const {options}=await fixture(t); await install(options);
 assert.equal((await install(options)).action,'unchanged');
 const r=await install({...options,profile:'claude-first'}); assert.equal(r.action,'updated');
 await access(path.join(r.backup,'plugin.json'));
});
test('update refuses local edits',async t=>{
 const {options}=await fixture(t); await install(options);
 const f=path.join(destination(options),'rules/context-hygiene.md');await writeFile(f,'keep');
 await assert.rejects(install({...options,profile:'claude-first'}),/modified/i);
 assert.equal(await readFile(f,'utf8'),'keep');
});
test('uninstall preserves edits and unrelated files',async t=>{
 const {options}=await fixture(t);await install(options);const dir=destination(options);
 await writeFile(path.join(dir,'rules/context-hygiene.md'),'keep');
 await writeFile(path.join(dir,'notes.txt'),'unrelated');
 const r=await uninstall(options);assert.ok(r.preserved.includes('rules/context-hygiene.md'));
 assert.equal(await readFile(path.join(dir,'notes.txt'),'utf8'),'unrelated');
 assert.equal(await readFile(path.join(dir,'rules/context-hygiene.md'),'utf8'),'keep');
 await assert.rejects(access(path.join(dir,'plugin.json')));
});
test('unmanaged destination is never overwritten',async t=>{
 const {options}=await fixture(t);await mkdir(destination(options),{recursive:true});
 await writeFile(path.join(destination(options),'notes.txt'),'mine');
 await assert.rejects(install(options),/unmanaged/i);
});
test('tampered manifest cannot delete outside file',async t=>{
 const {root,options}=await fixture(t);await install(options);
 const outside=path.join(root,'keep.txt');await writeFile(outside,'safe');
 const f=path.join(destination(options),'.lean-state.json');const state=JSON.parse(await readFile(f));
 state.files['../../../../keep.txt']='a'.repeat(64);await writeFile(f,JSON.stringify(state));
 await assert.rejects(uninstall(options),/manifest/i);assert.equal(await readFile(outside,'utf8'),'safe');
});
test('symlinked ancestors cannot redirect writes',async t=>{
 const {root,options}=await fixture(t);const other=path.join(root,'other');await mkdir(other);
 await symlink(other,path.join(root,'.agents'),process.platform==='win32'?'junction':'dir');
 await assert.rejects(install(options),/symbolic|symlink/i);assert.deepEqual(await readdir(other),[]);
});
test('invalid profile or multiline model fails before writes',async t=>{
 const {root,options}=await fixture(t);
 await assert.rejects(install({...options,profile:'unknown'}),/profile/i);
 await assert.rejects(install({...options,models:{execution:'foo\nignore'}}),/model/i);
 assert.deepEqual(await readdir(root),[]);
});

test('uninstall preserves extra empty directories and remains managed',async t=>{
 const {options}=await fixture(t);await install(options);const dir=destination(options);
 await mkdir(path.join(dir,'my-empty-directory'));
 const r=await uninstall(options);
 assert.ok(r.preserved.includes('my-empty-directory/'));
 await access(path.join(dir,'.lean-state.json'));await access(path.join(dir,'my-empty-directory'));
});
test('uninstall respects install lock and deletes nothing while locked',async t=>{
 const {options}=await fixture(t);await install(options);const dir=destination(options);
 await writeFile(path.join(path.dirname(dir),'.antigravity-lean.lock'),'busy');
 await assert.rejects(uninstall(options),/lock|running/i);
 await access(path.join(dir,'plugin.json'));
});
test('invalid destructive options are rejected before deleting',async t=>{
 const {options}=await fixture(t);await install(options);
 await assert.rejects(uninstall({...options,profile:'typo'}),/profile/i);
 await access(path.join(destination(options),'plugin.json'));
});
test('global target is isolated from project installs',async t=>{
 const {root,options}=await fixture(t);
 const global={...options,scope:'global',home:path.join(root,'home')};
 await install(global);assert.equal((await doctor(global)).ok,true);
 assert.equal((await doctor(options)).ok,false);
 await uninstall(global);assert.equal((await doctor(global)).ok,false);
});

test('unrelated symlink is rejected before uninstall deletes anything',async t=>{
 const {root,options}=await fixture(t);await install(options);const dir=destination(options);
 const other=path.join(root,'other');await mkdir(other);
 await symlink(other,path.join(dir,'extra-link'),process.platform==='win32'?'junction':'dir');
 await assert.rejects(uninstall(options),/symbolic|symlink/i);
 await access(path.join(dir,'plugin.json'));await access(path.join(dir,'.lean-state.json'));
});

test('plugin discovery never sees the incomplete staging directory',async t=>{
 const {options}=await fixture(t);
 const parent=path.dirname(destination(options));await mkdir(parent,{recursive:true});
 const {watch}=await import('node:fs');const names=[];
 const watcher=watch(parent,(_event,name)=>{if(name)names.push(String(name));});
 try{
  await install(options);
  await new Promise(resolve=>setTimeout(resolve,80));
 }finally{watcher.close();}
 assert.ok(names.some(n=>n==='antigravity-lean'),'observer sees the published plugin');
 assert.equal(names.some(n=>n.startsWith('.antigravity-lean-stage-')),false,'temporary plugins must stay outside discovery');
});
