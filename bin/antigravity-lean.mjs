#!/usr/bin/env node
import {createInterface} from 'node:readline';
import {install,doctor,uninstall,destination} from '../src/installer.mjs';
import {profiles,statuses,normalize} from '../src/profiles.mjs';

const HELP=`Antigravity Lean 0.1.0 — 省额度，也提高效率
Node.js >=20. No npm dependencies. No account collection.

Usage:
  node bin/antigravity-lean.mjs [wizard]
  node bin/antigravity-lean.mjs install --scope project --project PATH --yes
  node bin/antigravity-lean.mjs install --scope global --dry-run
  node bin/antigravity-lean.mjs doctor [--scope global|project] [--project PATH]
  node bin/antigravity-lean.mjs uninstall [--scope global|project] [--project PATH] --yes

Options:
  --profile balanced|gemini-first|claude-first
  --lang zh|en                 Wizard / response language (default zh)
  --gemini-status unknown|available|exhausted
  --claude-status unknown|available|exhausted
  --planning-model LABEL       Suggested UI labels, not automatic switching
  --execution-model LABEL
  --review-model LABEL
  --dry-run                    Preview without filesystem writes
  --yes                        Consent for noninteractive install/uninstall
  --json                       Machine-readable result (non-wizard)
  --help, -h
  --version
`;
function parse(argv) {
 const o={};let command='wizard';
 if(argv.length && !argv[0].startsWith('-'))command=argv.shift();
 const values={'--scope':'scope','--project':'project','--profile':'profile','--lang':'lang','--gemini-status':'geminiStatus','--claude-status':'claudeStatus'};
 const flags={'--yes':'yes','--dry-run':'dryRun','--json':'json','--help':'help','-h':'help','--version':'version'};
 for(let i=0;i<argv.length;i++){
  const arg=argv[i];
  if(flags[arg])o[flags[arg]]=true;
  else if(values[arg] || /^--(planning|execution|review)-model$/.test(arg)){
   const value=argv[++i];if(!value || value.startsWith('--'))throw new Error('Missing value for '+arg);
   if(values[arg])o[values[arg]]=value;
   else {o.models??={};o.models[arg.slice(2,-6)]=value;}
  } else throw new Error('Unknown option: '+arg);
 }
 if(!['wizard','install','doctor','uninstall'].includes(command))throw new Error('Unknown command: '+command);
 return {command,o};
}
async function wizard(initial) {
 const rl=createInterface({input:process.stdin,crlfDelay:Infinity,terminal:false});
 const lines=rl[Symbol.asyncIterator]();
 const ask=async(prompt,fallback)=>{
  process.stdout.write(prompt+(fallback!==undefined?' ['+fallback+']':'')+': ');
  const line=await lines.next();if(line.done)throw new Error('Input ended; cancelled without installation.');
  return line.value.trim() || fallback || '';
 };
 try {
  console.log('Antigravity Lean — 每位家庭成员在自己的电脑上安装 / Install on each member’s own computer.');
  console.log('不收集账号信息，不读取全家实时额度。No accounts, telemetry or live family quota access.');
  const lang=await ask('语言 / Language: zh, en',initial.lang??'zh');
  if(!['zh','en'].includes(lang))throw new Error('Invalid language');
  const zh=lang==='zh';
  const scope=await ask(zh?'安装范围 global（全局）/ project（项目）':'Scope: global / project',initial.scope??'global');
  if(!['global','project'].includes(scope))throw new Error('Invalid scope');
  const project=scope==='project'?await ask(zh?'项目绝对路径':'Absolute project path',initial.project??process.cwd()):undefined;
  const profile=await ask(zh?'策略 balanced / gemini-first / claude-first':'Profile: '+profiles.join(' / '),initial.profile??'balanced');
  console.log(zh?'额度状态仅为手动记录，请查看 View Usage 的周额度和五小时额度。':'Status is a manual snapshot. Check weekly AND five-hour limits in View Usage.');
  const geminiStatus=await ask('Gemini: '+statuses.join(' / '),initial.geminiStatus??'unknown');
  const claudeStatus=await ask('Claude/GPT: '+statuses.join(' / '),initial.claudeStatus??'unknown');
  const o={scope,project,profile,lang,geminiStatus,claudeStatus};
  const defaults=normalize({...o,models:initial.models}).models;
  o.models={};
  for(const role of ['planning','execution','review']) o.models[role]=await ask(zh?({planning:'规划模型',execution:'执行模型',review:'复核模型'}[role]):role+' model',defaults[role]);
  const preview=await install({...o,dryRun:true});
  console.log(JSON.stringify(preview,null,2));
  if(initial.dryRun){console.log(zh?'仅预览，未写入文件。':'Preview only; no files written.');return;}
  const confirm=await ask(zh?'确认安装？输入 yes；其他输入取消':'Install? Type yes to confirm; anything else cancels','no');
  if(confirm!=='yes'){console.log(zh?'已取消，未写入文件。':'Cancelled; no files written.');return;}
  const result=await install(o);
  console.log(zh?'安装完成：'+result.destination:'Installed: '+result.destination);
  console.log(zh?'重新启动会话，在 Customizations 查看规则；CLI 可验证目录：':'Restart the session and inspect Customizations. CLI validation:');
  console.log('agy plugin validate "'+result.destination+'"');
  console.log(zh?'如果 CLI 未发现该插件，请用 agy plugin install 安装上述目录；不要同时安装仓库默认版。':'If CLI does not discover the plugin, install this directory with agy plugin install; do not also install the repository default.');
  if(claudeStatus==='exhausted' && geminiStatus==='exhausted')
   console.log(zh?'两组额度均标记耗尽：请等待重置，安装不会恢复额度。':'Both groups marked exhausted: wait for reset. Installing does not restore quota.');
 } finally {rl.close();}
}
try{
 if(Number(process.versions.node.split('.')[0])<20)throw new Error('Node.js 20+ required: https://nodejs.org/');
 const {command,o}=parse(process.argv.slice(2));
 if(o.help)console.log(HELP);
 else if(o.version)console.log('0.1.0');
 else if(command==='wizard')await wizard(o);
 else {
  destination(o);
  normalize(o);
  if(o.lang && !['zh','en'].includes(o.lang))throw new Error('Invalid language');
  if(['install','uninstall'].includes(command) && !o.dryRun && !o.yes)
   throw new Error('Use the interactive wizard, or provide --yes after reviewing --dry-run.');
  const result=await ({install,doctor,uninstall}[command])(o);
  console.log(JSON.stringify(result,null,2));
  if(command==='doctor' && !result.ok)process.exitCode=1;
 }
}catch(e){console.error('Antigravity Lean: '+e.message);process.exitCode=1;}
