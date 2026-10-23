import { lstat, readFile, writeFile, mkdir, readdir, rename, unlink, rmdir, mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createHash, randomUUID } from 'node:crypto';
import { render } from './profiles.mjs';

const STATE='.lean-state.json';
const ALLOWED=new Set(['plugin.json','rules/context-hygiene.md','rules/model-routing.md','skills/plan-handoff/SKILL.md','agents/lean-explorer.md']);
const hash = data => createHash('sha256').update(data).digest('hex');
async function stat(file) {
 try { return await lstat(file); } catch(e) { if(e.code==='ENOENT') return null; throw e; }
}
export function destination(options={}) {
 const scope=options.scope ?? 'global';
 if(scope==='global') return path.resolve(options.home ?? os.homedir(),'.gemini/config/plugins/antigravity-lean');
 if(scope==='project') {
  if(!options.project) throw new Error('Project path is required');
  return path.resolve(options.project,'.agents/plugins/antigravity-lean');
 }
 throw new Error('Invalid scope: '+scope);
}
async function noLinks(target) {
 let current=path.resolve(target);
 while(true) {
  const s=await stat(current);
  if(s?.isSymbolicLink()) throw new Error('Symbolic link / symlink is not supported: '+current);
  if(s && current!==target && !s.isDirectory()) throw new Error('Parent is not a directory: '+current);
  const parent=path.dirname(current);if(parent===current)break;current=parent;
 }
}
async function stateAt(dir) {
 const file=path.join(dir,STATE);
 await noLinks(file);
 const s=await stat(file);
 if(!s) throw new Error('Unmanaged destination: '+dir);
 let state;
 try { state=JSON.parse(await readFile(file,'utf8')); } catch {throw new Error('Invalid install manifest');}
 if(state?.schema!==1 || state.name!=='antigravity-lean' || !state.files ||
    typeof state.files!=='object' || Array.isArray(state.files) || !Object.keys(state.files).length)
  throw new Error('Invalid install manifest');
 for(const [file,digest] of Object.entries(state.files)) {
  if(!ALLOWED.has(file) || typeof digest!=='string' || !/^[a-f0-9]{64}$/.test(digest))
   throw new Error('Invalid install manifest path or hash');
 }
 return state;
}
async function inventory(dir, prefix='') {
 const result=[];
 for(const entry of await readdir(dir,{withFileTypes:true})) {
  const rel=prefix+entry.name;
  if(entry.isSymbolicLink()) throw new Error('Symbolic link inside plugin: '+rel);
  if(entry.isDirectory()) result.push(...await inventory(path.join(dir,entry.name),rel+'/'));
  else result.push(rel);
 }
 return result;
}
export async function doctor(options={}) {
 const dir=destination(options);await noLinks(dir);
 if(!await stat(dir)) return {ok:false,destination:dir,issues:['not installed']};
 const state=await stateAt(dir);const issues=[];
 for(const [file,digest] of Object.entries(state.files)) {
  const target=path.join(dir,file);await noLinks(target);
  const s=await stat(target);
  if(!s) issues.push('missing: '+file);
  else if(!s.isFile() || hash(await readFile(target))!==digest) issues.push('modified: '+file);
 }
 return {ok:issues.length===0,destination:dir,issues,config:state.config};
}
export async function install(options={}) {
 const {config,files}=render(options);
 const dir=destination(options);await noLinks(dir);
 let prior=null;
 if(await stat(dir)) {
  prior=await stateAt(dir);
  const health=await doctor(options);
  if(!health.ok) throw new Error('Modified or missing managed files; preserve edits before updating: '+health.issues.join(', '));
  const extras=(await inventory(dir)).filter(f=>f!==STATE && !Object.hasOwn(prior.files,f));
  if(extras.length) throw new Error('Unmanaged files in destination: '+extras.join(', '));
 }
 const digests=Object.fromEntries(Object.entries(files).map(([f,data])=>[f,hash(data)]));
 const same=prior && JSON.stringify(prior.files)===JSON.stringify(digests);
 if(same) return {action:'unchanged',destination:dir,config};
 if(options.dryRun) return {action:'preview',destination:dir,config,files:Object.keys(files)};
 const parent=path.dirname(dir);await mkdir(parent,{recursive:true});await noLinks(parent);
 const lock=path.join(parent,'.antigravity-lean.lock');
 const handle=await import('node:fs/promises').then(fs=>fs.open(lock,'wx')).catch(e=>{
  if(e.code==='EEXIST') throw new Error('Another install is running, or stale lock exists: '+lock);throw e;
 });
 let stage,backup;
 try {
  // Recheck after acquiring the lock, before touching a previously inspected destination.
  if(prior) {
   const health=await doctor(options);if(!health.ok)throw new Error('Modified files during installation');
   const current=await stateAt(dir);
   if(JSON.stringify(current)!==JSON.stringify(prior))throw new Error('Installation changed; run again');
  } else if(await stat(dir)) throw new Error('Unmanaged destination appeared; run again');
  stage=await mkdtemp(path.join(parent,'.antigravity-lean-stage-'));
  for(const [file,data] of Object.entries(files)) {
   const target=path.join(stage,file);await mkdir(path.dirname(target),{recursive:true});
   await writeFile(target,data,{flag:'wx'});
  }
  await writeFile(path.join(stage,STATE),JSON.stringify({schema:1,name:'antigravity-lean',version:'0.1.0',config,files:digests},null,2)+'\n',{flag:'wx'});
  if(prior) {
   const backups=path.join(parent,'.antigravity-lean-backups');await noLinks(backups);await mkdir(backups,{recursive:true});
   backup=path.join(backups,Date.now()+'-'+randomUUID());await rename(dir,backup);
  }
  try {await rename(stage,dir);stage=null;}
  catch(e) {if(backup) await rename(backup,dir);throw e;}
  return {action:prior?'updated':'installed',destination:dir,backup,config};
 } finally {
  if(stage) await rm(stage,{recursive:true,force:true});
  await handle.close();await unlink(lock);
 }
}
export async function uninstall(options={}) {
 const dir=destination(options);await noLinks(dir);
 if(!await stat(dir))return {action:'not-installed',destination:dir,preserved:[]};
 const state=await stateAt(dir);const preserved=[];
 // Preflight all paths before deleting anything.
 for(const file of Object.keys(state.files))await noLinks(path.join(dir,file));
 if(options.dryRun)return {action:'preview-uninstall',destination:dir,files:Object.keys(state.files),preserved:[]};
 for(const [file,digest] of Object.entries(state.files)) {
  const target=path.join(dir,file);const s=await stat(target);
  if(!s)continue;
  if(s.isFile() && hash(await readFile(target))===digest)await unlink(target);
  else preserved.push(file);
 }
 // Remove only empty known directories. Never recursively delete a user plugin.
 for(const sub of ['skills/plan-handoff','skills','agents','rules']) {
  try{await rmdir(path.join(dir,sub));}catch(e){if(!['ENOENT','ENOTEMPTY','EEXIST'].includes(e.code))throw e;}
 }
 const remaining=(await inventory(dir)).filter(f=>f!==STATE);
 if(!remaining.length) {await unlink(path.join(dir,STATE));await rmdir(dir);}
 return {action:'uninstalled',destination:dir,preserved:[...new Set([...preserved,...remaining])]};
}
