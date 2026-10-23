import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readdir,rm,readFile,realpath} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const cli=fileURLToPath(new URL('../bin/antigravity-lean.mjs',import.meta.url));
async function fixture(t){const root=await realpath(await mkdtemp(path.join(tmpdir(),'lean-cli-')));t.after(()=>rm(root,{recursive:true,force:true}));return root;}
function run(args,input=''){return spawnSync(process.execPath,[cli,...args],{input,encoding:'utf8',timeout:15000});}
test('help succeeds and invalid arguments fail',()=>{
 assert.equal(run(['--help']).status,0);
 assert.equal(run(['install','--typo']).status,1);
 assert.equal(run(['install','--scope']).status,1);
 assert.equal(run(['unknown']).status,1);
});
test('noninteractive installation requires explicit consent',async t=>{
 const root=await fixture(t);
 const r=run(['install','--scope','project','--project',root]);assert.equal(r.status,1);
 assert.deepEqual(await readdir(root),[]);
});
test('CLI supports dry-run, install, doctor and uninstall end to end',async t=>{
 const root=await fixture(t);const args=['--scope','project','--project',root,'--lang','en'];
 assert.equal(run(['install',...args,'--dry-run']).status,0);
 assert.deepEqual(await readdir(root),[]);
 assert.equal(run(['install',...args,'--yes']).status,0);
 assert.equal(run(['doctor',...args]).status,0);
 assert.equal(run(['uninstall',...args,'--yes']).status,0);
 const r=run(['doctor',...args]);assert.equal(r.status,1);assert.match(r.stdout,/not installed/);
});
test('wizard cancellation is side-effect free',async t=>{
 const root=await fixture(t);
 // Language, scope, project, profile, Gemini status, Claude status, three model labels, consent.
 const r=run(['wizard'],'en\nproject\n'+root+'\nbalanced\nunknown\nunknown\n\n\n\nno\n');
 assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/Cancelled/);
 assert.deepEqual(await readdir(root),[]);
});
test('wizard accepts piped answers and installs personalized plugin',async t=>{
 const root=await fixture(t);
 const r=run(['wizard'],'zh\nproject\n'+root+'\nclaude-first\nexhausted\navailable\n\n\n\nyes\n');
 assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/安装完成/);
 const state=JSON.parse(await readFile(path.join(root,'.agents/plugins/antigravity-lean/.lean-state.json')));
 assert.equal(state.config.profile,'claude-first');assert.equal(state.config.pools.gemini,'exhausted');
 assert.equal(Object.hasOwn(state.files,'agents/lean-explorer.md'),false);
});
test('incomplete wizard input cancels without installing',async t=>{
 const root=await fixture(t);
 const r=run(['wizard'],'en\nproject\n'+root+'\n');
 assert.equal(r.status,1);assert.deepEqual(await readdir(root),[]);
});
