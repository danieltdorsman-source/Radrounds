(()=>{'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const state={page:'scan',slice:21,dragY:null,atlasOn:true,manifest:[],protocol:'cchr'};

function showPage(id){
 state.page=id;
 $$('.page').forEach(p=>p.classList.toggle('active',p.id===id));
 $$('.navbtn').forEach(b=>b.classList.toggle('active',b.dataset.page===id));
 history.replaceState(null,'','#'+id);
 if(id==='scan') setTimeout(()=>$('#viewer')?.focus(),0);
}
$$('.navbtn').forEach(b=>b.onclick=()=>showPage(b.dataset.page));
if(location.hash==='#request')showPage('request');

function levelFor(n){return RADROUNDS.sliceLevels.find(x=>n<=x.max)||RADROUNDS.sliceLevels.at(-1)}
function setLevel(){
 const L=levelFor(state.slice);
 $('#sliceNumber').textContent=state.slice;
 $('#sliceRange').value=state.slice;
 $('#sliceLeft').textContent=String(state.slice).padStart(2,'0');
 $('#sliceLevel').textContent=L.title.toLowerCase();
 $('#levelTitle').textContent=L.title;
 $('#levelText').textContent=L.text;
 $('#levelTags').innerHTML=L.tags.map(t=>'<span>'+t+'</span>').join('');
}
function imgURL(n){return RADROUNDS.commonsSlice(n)}
function preload(n){[n-2,n-1,n+1,n+2].filter(x=>x>=1&&x<=41).forEach(x=>{const im=new Image();im.src=imgURL(x)})}
function setSlice(n){
 state.slice=Math.max(1,Math.min(41,n|0));
 const img=$('#ctImg');
 $('#loadState').textContent='loading…';
 img.onload=()=>{$('#loadState').textContent='646×468 · original PNG'};
 img.onerror=()=>{$('#loadState').textContent='image retry';setTimeout(()=>{img.src=imgURL(state.slice)+'?t='+Date.now()},800)};
 img.src=imgURL(state.slice);
 img.alt='Normal non-contrast CT head, axial slice '+state.slice+' of 41';
 setLevel();preload(state.slice);clearHover();
}
$('#sliceRange').oninput=e=>setSlice(+e.target.value);
$('#viewer').addEventListener('wheel',e=>{e.preventDefault();setSlice(state.slice+(e.deltaY>0?1:-1))},{passive:false});
$('#viewer').addEventListener('keydown',e=>{
 if(['ArrowDown','ArrowRight','PageDown'].includes(e.key)){e.preventDefault();setSlice(state.slice+1)}
 if(['ArrowUp','ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();setSlice(state.slice-1)}
 if(e.key==='Home'){e.preventDefault();setSlice(1)}
 if(e.key==='End'){e.preventDefault();setSlice(41)}
});
$('#stage').addEventListener('pointerdown',e=>{state.dragY=e.clientY;$('#stage').setPointerCapture?.(e.pointerId)});
$('#stage').addEventListener('pointermove',e=>{
 if(state.dragY!==null){
   const d=e.clientY-state.dragY;
   if(Math.abs(d)>11){setSlice(state.slice+(d>0?1:-1));state.dragY=e.clientY}
 } else hoverAnatomy(e);
});
window.addEventListener('pointerup',()=>state.dragY=null);
$('#stage').addEventListener('pointerleave',clearHover);
$('#atlasToggle').onchange=e=>{state.atlasOn=e.target.checked;if(!state.atlasOn)clearHover()};
setSlice(state.slice);

fetch(RADROUNDS.anatomyManifest).then(r=>r.json()).then(d=>{
 state.manifest=(d.parts||[]).filter(p=>p.bbox&&p.centroid);
 $('#loadState').textContent='646×468 · atlas ready';
}).catch(()=>{state.manifest=[]});

function humanize(slug){
 let s=slug.replace(/^(ctx|nuc|vasc|vent|tel|tract)-/,'').replace(/-l$/,' · left').replace(/-r$/,' · right');
 const map={mca:'middle cerebral artery',aca:'anterior cerebral artery',ica:'internal carotid artery',pca:'posterior cerebral artery',aica:'anterior inferior cerebellar artery',pica:'posterior inferior cerebellar artery',sca:'superior cerebellar artery',pag:'periaqueductal grey',dmv:'dorsal motor nucleus of vagus',vpl:'ventral posterolateral thalamic nucleus',vpm:'ventral posteromedial thalamic nucleus',lgn:'lateral geniculate nucleus',mgn:'medial geniculate nucleus',snc:'substantia nigra pars compacta',snr:'substantia nigra pars reticulata',pprf:'paramedian pontine reticular formation'};
 s=s.split('-').map(x=>map[x]||x).join(' ');
 return s.replace(/\b\w/g,m=>m.toUpperCase());
}
function boxVol(b){return Math.max(.01,(b.max[0]-b.min[0])*(b.max[1]-b.min[1])*(b.max[2]-b.min[2]))}
function anatomyAt(u,v){
 // Atlas-correlated approximation: image right = patient left (+x), superior slice increases +y, image top = anterior (+z)
 const x=(u-.5)*112;
 const y=-48+((state.slice-1)/40)*142;
 const z=(.5-v)*146;
 if(!state.manifest.length)return fallbackAnatomy();
 let cand=state.manifest.filter(p=>x>=p.bbox.min[0]&&x<=p.bbox.max[0]&&y>=p.bbox.min[1]&&y<=p.bbox.max[1]&&z>=p.bbox.min[2]&&z<=p.bbox.max[2]);
 cand=cand.sort((a,b)=>boxVol(a.bbox)-boxVol(b.bbox)).slice(0,8);
 if(!cand.length)return fallbackAnatomy();
 return cand.map(p=>({name:humanize(p.slug),kind:p.kind||'structure',slug:p.slug}));
}
function fallbackAnatomy(){
 const L=levelFor(state.slice);
 return L.tags.slice(0,5).map((x,i)=>({name:x.replace(/\b\w/g,m=>m.toUpperCase()),kind:i?'regional landmark':'level anatomy'}));
}
function hoverAnatomy(e){
 if(!state.atlasOn)return;
 const img=$('#ctImg'),rect=img.getBoundingClientRect();
 if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom){clearHover();return}
 const u=(e.clientX-rect.left)/rect.width,v=(e.clientY-rect.top)/rect.height;
 const list=anatomyAt(u,v);
 const dot=$('#hoverDot'),stageRect=$('#stage').getBoundingClientRect();
 dot.style.left=(e.clientX-stageRect.left-4)+'px';dot.style.top=(e.clientY-stageRect.top-4)+'px';dot.style.display='block';
 const primary=list[0]?.name||'No atlas match';
 $('#tipTitle').textContent=primary;
 $('#tipSub').textContent='Slice '+state.slice+' · '+(u<.5?'patient right':'patient left')+' · atlas-correlated candidate';
 $('#tipList').innerHTML=list.slice(1).map(x=>'<span class="tipchip">'+x.name+'</span>').join('');
 $('#sidePrimary').textContent=primary;
 $('#sideCandidates').innerHTML=list.slice(1).map(x=>'<div class="candidate">'+x.name+'<small>'+x.kind+'</small></div>').join('')||'<div class="candidate">No additional structure candidate at this point.</div>';
}
function clearHover(){
 $('#hoverDot').style.display='none';
 $('#tipTitle').textContent='Move over the scan';
 $('#tipSub').textContent='Detailed candidate structures appear here.';
 $('#tipList').innerHTML='';
 $('#sidePrimary').textContent='—';
 $('#sideCandidates').innerHTML='';
}

const P=RADROUNDS.protocols;
function protocolById(id){return P.find(p=>p.id===id)}
function renderProtocolList(){
 $('#protocolList').innerHTML=P.map(p=>'<button class="protocolbtn '+(p.id===state.protocol?'active':'')+'" data-protocol="'+p.id+'"><b>'+p.title+'</b><small>'+p.category+'</small></button>').join('');
 $$('[data-protocol]').forEach(b=>b.onclick=()=>{state.protocol=b.dataset.protocol;renderProtocolList();renderProtocol()});
}
function field(name,label,pts=0,group='crit'){
 return '<div class="criterion"><label><input type="checkbox" data-group="'+group+'" data-name="'+name+'" data-pts="'+pts+'"><span>'+label+'</span></label>'+(pts?'<span class="pts">'+(pts>0?'+':'')+pts+'</span>':'')+'</div>';
}
function input(name,label,type='text',placeholder=''){
 return '<div class="calcinput"><span>'+label+'</span><input data-input="'+name+'" type="'+type+'" placeholder="'+placeholder+'"></div>';
}
function select(name,label,opts){
 return '<div class="calcinput"><span>'+label+'</span><select data-input="'+name+'">'+opts.map(([v,t])=>'<option value="'+v+'">'+t+'</option>').join('')+'</select></div>';
}
function renderCalculator(p){
 let h='';
 if(p.type==='points'){
   h='<div class="calcsection"><div class="calctitle">CANADIAN CT HEAD RULE</div>'+p.fields.map((x,i)=>field('c'+i,x[0],x[1])).join('')+'</div>';
 }
 if(p.type==='cspine'){
   h='<div class="calcsection"><div class="calctitle">STEP 1 · HIGH-RISK FACTORS</div>'+field('age65','Age ≥65')+field('danger','Dangerous mechanism')+field('para','Paraesthesia in extremities')+'</div>'+
     '<div class="calcsection"><div class="calctitle">STEP 2 · LOW-RISK FACTORS ALLOWING ROM ASSESSMENT</div>'+field('rear','Simple rear-end MVC')+field('sitting','Sitting position in ED')+field('ambulatory','Ambulatory at any time')+field('delayed','Delayed onset neck pain')+field('nomid','No midline C-spine tenderness')+'</div>'+
     '<div class="calcsection"><div class="calctitle">STEP 3 · ACTIVE ROTATION</div>'+field('rotate','Able to rotate neck 45° left AND right')+'</div>';
 }
 if(p.type==='pe'){
   h='<div class="calcsection"><div class="calctitle">WELLS PE</div>'+
   field('dvt','Clinical signs of DVT',3,'wells')+field('likely','PE more likely than alternative diagnosis',3,'wells')+
   field('hr','Heart rate >100',1.5,'wells')+field('immob','Immobilisation ≥3 days or surgery in previous 4 weeks',1.5,'wells')+
   field('prior','Previous DVT/PE',1.5,'wells')+field('haem','Haemoptysis',1,'wells')+field('cancer','Active cancer',1,'wells')+'</div>'+
   '<div class="calcsection"><div class="calctitle">PERC · ONLY IF CLINICALLY LOW RISK</div>'+
   field('p_age','Age <50',0,'perc')+field('p_hr','Pulse <100',0,'perc')+field('p_sat','SaO₂ ≥95% on room air',0,'perc')+field('p_haem','No haemoptysis',0,'perc')+
   field('p_est','No exogenous oestrogen',0,'perc')+field('p_vte','No prior VTE',0,'perc')+field('p_surg','No surgery/trauma requiring hospitalisation in past 4 weeks',0,'perc')+field('p_leg','No unilateral leg swelling',0,'perc')+'</div>'+
   select('peLow','Clinician considers pre-test probability low enough for PERC?',[['no','No / unsure'],['yes','Yes']]);
 }
 if(p.type==='dvt'){
   const fs=[['cancer','Active cancer'],['immob','Paralysis/paresis/recent plaster immobilisation'],['bed','Bedridden ≥3 days or major surgery within 12 weeks'],['tender','Localised tenderness along deep venous system'],['whole','Entire leg swollen'],['calf','Calf swelling ≥3 cm vs asymptomatic side'],['oedema','Pitting oedema confined to symptomatic leg'],['collat','Collateral superficial non-varicose veins'],['prior','Previously documented DVT']];
   h='<div class="calcsection"><div class="calctitle">TWO-LEVEL WELLS DVT</div>'+fs.map(x=>field(x[0],x[1],1,'dvt')).join('')+field('alt','Alternative diagnosis at least as likely as DVT',-2,'dvt')+'</div>';
 }
 if(p.type==='ankle'){
   h='<div class="calcsection"><div class="calctitle">ANKLE SERIES</div>'+field('latmal','Bone tenderness posterior edge/tip lateral malleolus')+field('medmal','Bone tenderness posterior edge/tip medial malleolus')+field('walk','Unable to bear weight both immediately AND for 4 steps at assessment')+'</div>'+
   '<div class="calcsection"><div class="calctitle">FOOT SERIES</div>'+field('fifth','Bone tenderness at base of 5th metatarsal')+field('nav','Bone tenderness at navicular')+field('walk2','Unable to bear weight both immediately AND for 4 steps at assessment')+'</div>';
 }
 if(p.type==='redflags'){
   h='<div class="calcsection"><div class="calctitle">URGENT NEURO / CES FEATURES</div>'+field('urine','New urinary retention/overflow or major bladder dysfunction')+field('saddle','Saddle/perineal sensory disturbance')+field('bilat','Bilateral or progressive motor deficit')+field('objective','Objective neurological deficit')+'</div>'+
   '<div class="calcsection"><div class="calctitle">OTHER SERIOUS-PATHOLOGY RED FLAGS</div>'+field('cancer','Known/suspected malignancy')+field('infection','Fever, immunosuppression, IVDU or infection risk')+field('fracture','Significant trauma / osteoporosis / fracture risk')+'</div>';
 }
 if(p.type==='stroke'){
   h='<div class="calcsection"><div class="calctitle">TIME-CRITICAL INFORMATION</div>'+input('lkw','Last known well / symptom onset','text','e.g. 14:10')+input('deficit','Deficit / NIHSS if used locally','text','e.g. right weakness + aphasia, NIHSS 12')+input('baseline','Baseline function','text','e.g. independent, mRS 0')+input('anticoag','Anticoagulation / bleeding context','text','drug + last dose if relevant')+'</div>';
 }
 if(p.type==='simple'){
   h='<div class="calcsection"><div class="calctitle">REQUEST-QUALITY CHECK</div>'+p.prompts.map((x,i)=>field('s'+i,x)).join('')+'</div>';
 }
 if(p.type==='pregpe'){
   h='<div class="calcsection"><div class="calctitle">PREGNANCY PE PATHWAY</div>'+field('dvt','Symptoms/signs of DVT')+field('cxr','Chest X-ray abnormal')+field('unstable','Clinical instability')+'</div>'+input('gest','Gestation','text','weeks');
 }
 $('#calculator').innerHTML=h;
 $('#calculator').querySelectorAll('input,select').forEach(x=>x.addEventListener('change',updateRuleResult));
}
function checked(name){const x=$('[data-name="'+name+'"]');return !!x?.checked}
function val(name){const x=$('[data-input="'+name+'"]');return x?.value?.trim()||''}
function allChecked(group){const xs=$$('[data-group="'+group+'"]');return xs.length&&xs.every(x=>x.checked)}
function updateRuleResult(){
 const p=protocolById(state.protocol);let text='',cls='';
 if(p.type==='points'){const any=$$('[data-group="crit"]').some(x=>x.checked);text=any?p.positive:p.negative;cls=any?'positive':'warn'}
 else if(p.type==='cspine'){
   const high=checked('age65')||checked('danger')||checked('para');
   const low=checked('rear')||checked('sitting')||checked('ambulatory')||checked('delayed')||checked('nomid');
   if(high){text='High-risk factor present — Canadian C-Spine Rule supports imaging.';cls='positive'}
   else if(!low){text='No low-risk factor selected to allow safe ROM assessment — imaging is supported by the rule.';cls='positive'}
   else if(checked('rotate')){text='Low-risk factor present and patient can actively rotate 45° left/right — rule does not support imaging, if fully applicable.';cls='warn'}
   else{text='Low-risk factor present but active 45° rotation not confirmed — imaging is supported by the rule.';cls='positive'}
 }
 else if(p.type==='pe'){
   const score=$$('[data-group="wells"]:checked').reduce((s,x)=>s+(+x.dataset.pts||0),0);
   const likely=score>4;
   const low=val('peLow')==='yes',perc=allChecked('perc');
   text='Wells PE = '+score.toFixed(score%1?1:0)+' ('+(likely?'PE likely >4':'PE unlikely ≤4')+'). ';
   if(low&&perc)text+='All 8 PERC criteria satisfied in a clinician-selected low-risk patient — PERC-negative; no further PE testing is supported by the rule.';
   else if(low)text+='PERC is not negative because one or more criteria are not satisfied; proceed with the locally approved PE pathway (often D-dimer before imaging when appropriate).';
   else text+='PERC is not being applied. Use the local pre-test probability + D-dimer/imaging pathway.';
   cls=likely?'positive':'warn';
 }
 else if(p.type==='dvt'){
   const score=$$('[data-group="dvt"]:checked').reduce((s,x)=>s+(+x.dataset.pts||0),0);
   text='Wells DVT = '+score+'. '+(score>=2?'DVT likely (≥2): compression ultrasound pathway supported.':'DVT unlikely (<2): a negative D-dimer can exclude DVT in the validated population; follow local pathway.');
   cls=score>=2?'positive':'warn';
 }
 else if(p.type==='ankle'){
   const ankle=checked('latmal')||checked('medmal')||checked('walk');
   const foot=checked('fifth')||checked('nav')||checked('walk2');
   text=(ankle?'Ankle radiographs supported. ':'No ankle-series criterion selected. ')+(foot?'Foot radiographs supported.':'No foot-series criterion selected.');
   cls=(ankle||foot)?'positive':'warn';
 }
 else if(p.type==='redflags'){
   const urgent=checked('urine')||checked('saddle')||checked('bilat')||checked('objective');
   const serious=checked('cancer')||checked('infection')||checked('fracture');
   text=urgent?'Features concerning for cauda equina/neurological compression are selected — urgent spinal assessment and MRI pathway.':serious?'Serious-pathology red flag selected — imaging modality/urgency depends on suspected cause and local pathway.':'No red flag selected — uncomplicated acute low back pain generally does not require immediate imaging.';
   cls=(urgent||serious)?'positive':'warn';
 }
 else if(p.type==='stroke'){text='Time-critical pathway: activate the local stroke process and ensure NCCT/CTA request contains exact timing, deficit, baseline and anticoagulation context.';cls='positive'}
 else if(p.type==='pregpe'){
   if(checked('dvt'))text='DVT symptoms/signs selected — KEMH guidance supports compression duplex ultrasound before further PE imaging.'; 
   else if(checked('cxr')||checked('unstable'))text='No DVT symptoms selected; abnormal CXR or instability favours CTPA in the KEMH pathway.';
   else text='No DVT symptoms, normal CXR/stable context: KEMH guidance generally favours V/Q as first-line, subject to local service/pathway.';
   cls='positive';
 }
 else{text='Use the checklist to make the request specific and clinically answerable. Imaging choice remains dependent on the local protocol and patient context.';cls='warn'}
 $('#ruleResult').className='ruleResult '+cls;$('#ruleResult').textContent=text;
}
function renderProtocol(){
 const p=protocolById(state.protocol);
 $('#protocolCategory').textContent=p.category;$('#protocolTitle').textContent=p.title;$('#protocolIntro').textContent=p.intro;
 $('#protocolSource').href=p.source;$('#guardrail').textContent=p.guard;
 renderCalculator(p);updateRuleResult();
 $('#extraHistory').value='';$('#extraExam').value='';$('#extraSafety').value='';$('#extraQuestion').value=p.question||'';
 $('#generatedRequest').textContent='Your request will appear here.';
}
function collectCriteria(p){
 const out=[];
 $$('[data-name]:checked').forEach(x=>out.push(x.parentElement.innerText.replace(/\s+/g,' ').trim()));
 $$('[data-input]').forEach(x=>{if(x.value&&x.dataset.input!=='peLow')out.push(x.parentElement.firstElementChild?.textContent+': '+x.value)});
 return out;
}
function generate(){
 const p=protocolById(state.protocol);updateRuleResult();
 const criteria=collectCriteria(p),h=$('#extraHistory').value.trim(),e=$('#extraExam').value.trim(),s=$('#extraSafety').value.trim(),q=$('#extraQuestion').value.trim()||p.question;
 const lines=[];
 lines.push(p.title.toUpperCase());
 if(criteria.length)lines.push('Decision-rule / pathway details: '+criteria.join('; ')+'.');
 if(h)lines.push('History/timing: '+h);
 if(e)lines.push('Relevant exam/physiology: '+e);
 if(s)lines.push('Safety/preparation: '+s);
 lines.push('Clinical question: '+q);
 lines.push('Rule/pathway summary: '+$('#ruleResult').textContent);
 lines.push('Please review prior imaging where relevant and advise if an alternative protocol/modality is more appropriate.');
 $('#generatedRequest').textContent=lines.join('\n\n');
}
$('#generateRequest').onclick=generate;
$('#copyRequest').onclick=async()=>{try{await navigator.clipboard.writeText($('#generatedRequest').textContent);$('#copyMsg').textContent='Copied'}catch{$('#copyMsg').textContent='Select and copy manually'}setTimeout(()=>$('#copyMsg').textContent='',1400)};
renderProtocolList();renderProtocol();
})();