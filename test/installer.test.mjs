import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, mkdir, readdir, symlink, access, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { install, doctor, uninstall, destination } from '../src/installer.mjs';
async function fixture(t) {
 const root=await mkdtemp(path.join(tmpdir(),'lean-test-'));
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
