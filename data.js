const RADROUNDS={
commonsSlice:n=>"https://commons.wikimedia.org/wiki/Special:Redirect/file/"+encodeURIComponent("CT of a normal brain, axial "+n+".png"),
anatomyManifest:"https://raw.githubusercontent.com/linkbag/neuroaxis-atlas/master/src/assets/anatomy/anatomy-manifest.json",
sliceLevels:[
{max:5,title:"Skull base / posterior fossa",text:"Inferior skull base, temporal bones and posterior fossa structures dominate.",tags:["orbits / skull base","cerebellum","brainstem","4th ventricle","petrous temporal bones"]},
{max:10,title:"Posterior fossa / basal cistern level",text:"Move from foramen magnum through pons and basal cisterns.",tags:["cerebellar hemispheres","pons","prepontine cistern","4th ventricle","temporal lobes"]},
{max:16,title:"Suprasellar / mesencephalic level",text:"Cisterns, midbrain and medial temporal structures become prominent.",tags:["midbrain","suprasellar cistern","temporal lobes","hippocampal region","circle of Willis region"]},
{max:25,title:"Basal ganglia / ventricular level",text:"Deep grey nuclei and the ventricular system are the key landmarks.",tags:["caudate","putamen","globus pallidus","internal capsule","thalamus","3rd ventricle","lateral ventricles"]},
{max:33,title:"Centrum semiovale",text:"Deep white matter and cortical sulci dominate above the basal ganglia.",tags:["centrum semiovale","corpus callosum","frontal lobes","parietal lobes","falx"]},
{max:41,title:"High convexity",text:"Superior cortex and subcortical white matter predominate.",tags:["frontal cortex","parietal cortex","precentral gyrus region","postcentral gyrus region","superior sagittal sinus region"]}
],
protocols:[
{
id:"cchr",category:"TRAUMA",title:"Minor head injury — Canadian CT Head Rule",intro:"Validated for selected adults with minor head injury. Use the rule only when its inclusion/exclusion criteria are satisfied.",source:"https://www.ranzcr.com/document/cdr-summary-canadian-ct-head-rule/",
guard:"Use only in adults with minor head injury (GCS 13–15) after witnessed LOC, amnesia or disorientation. Do not use as a shortcut outside the validated population; anticoagulation/bleeding disorders, post-traumatic seizure and other exclusions require separate clinical assessment.",
type:"points",mode:"any",question:"CT brain — acute traumatic intracranial injury or skull fracture?",
fields:[
["GCS <15 at 2 hours after injury",1],["Suspected open/depressed skull fracture",1],["Any sign of basal skull fracture",1],["≥2 episodes of vomiting",1],["Age ≥65 years",1],["Retrograde amnesia ≥30 minutes",1],["Dangerous mechanism",1]
],positive:"One or more CCHR high/medium-risk criteria are present — CT is supported by the rule, provided the rule is applicable.",negative:"No CCHR criterion selected — the rule does not support CT, provided the patient meets the validated inclusion/exclusion criteria.",
prompts:["mechanism + time of injury","GCS now and at 2 h","LOC/amnesia/disorientation","vomiting episodes","skull-fracture signs","anticoagulation/bleeding disorder","neurological deficit"]
},
{
id:"cspine",category:"TRAUMA",title:"C-spine trauma — Canadian C-Spine Rule",intro:"For alert, stable trauma patients aged ≥16 years who satisfy the rule’s applicability criteria.",source:"https://www.ranzcr.com/document/cdr-summary-canadian-c-spine-rule/",
guard:"Rule requires alert GCS 15, stable patient, acute injury within 48 hours and applicable trauma context. It is not validated for penetrating trauma, acute paralysis, known vertebral disease, pregnancy or several other excluded groups.",
type:"cspine",question:"Cervical spine injury requiring imaging?",
fields:[],prompts:["mechanism","midline tenderness","paraesthesia","ambulation","delayed vs immediate neck pain","active rotation 45° each way","neurological deficit"]
},
{
id:"pe",category:"VTE",title:"Suspected PE — Wells + PERC",intro:"Pre-test probability first. PERC is only for appropriately selected low-risk patients; otherwise use a validated PE pathway with D-dimer/imaging as applicable.",source:"https://www.ranzcr.com/document/cdr-summary-wells-score-pe/",
guard:"Do not use PERC in moderate/high pre-test probability. Pregnancy and anticoagulation can change the appropriate pathway. Use your local D-dimer assay/threshold and local ED protocol.",
type:"pe",question:"Pulmonary embolism? Central clot burden / right-heart strain features?",
fields:[],prompts:["symptom onset","haemodynamics","SpO₂ / oxygen requirement","clinical DVT signs","prior VTE","recent surgery/immobility","haemoptysis","active cancer","pregnancy possibility"]
},
{
id:"dvt",category:"VTE",title:"Suspected lower-limb DVT — Wells",intro:"Two-level Wells score supports selection of D-dimer versus compression ultrasound in the validated population.",source:"https://www.ranzcr.com/document/cdr-summary-wells-score-dvt/",
guard:"Validated for suspected lower-limb DVT in appropriate adults. Pregnancy, upper-limb DVT, recurrent same-leg DVT and other contexts may require a different pathway.",
type:"dvt",question:"Lower-limb DVT on compression ultrasound?",
fields:[],prompts:["side","onset","entire-leg swelling","calf circumference difference","deep venous tenderness","pitting oedema","previous DVT","active cancer","recent immobilisation/surgery"]
},
{
id:"ankle",category:"MSK",title:"Acute ankle / midfoot injury — Ottawa Ankle Rules",intro:"Validated to reduce unnecessary ankle and foot radiographs after acute injury.",source:"https://www.ranzcr.com/document/ottawa-ankle-rule-cdr/",
guard:"Apply in acute ankle/midfoot trauma where the rule is appropriate. Clinical judgement still applies in exclusions or unreliable examination.",
type:"ankle",question:"Acute fracture of ankle or midfoot?",
fields:[],prompts:["site of maximal tenderness","posterior malleolar tenderness","base of 5th metatarsal","navicular tenderness","weight-bearing at scene and assessment"]
},
{
id:"back",category:"SPINE",title:"Acute low back pain / cauda equina red flags",intro:"Imaging is generally not indicated for uncomplicated acute low back pain; red flags change the pathway.",source:"https://www.ranzcr.com/document/print-version-acute-low-back-pain/",
guard:"This is not a numeric score. Suspected cauda equina, infection, malignancy or significant fracture risk requires urgent clinical assessment and the relevant local imaging pathway.",
type:"redflags",question:"Compressive cauda equina / cord pathology or other serious spinal cause?",
fields:[],prompts:["urinary retention/incontinence","saddle sensory change","bilateral/progressive weakness","objective neurological deficit","cancer history","infection risk / fever","significant trauma / fracture risk"]
},
{
id:"stroke",category:"NEURO",title:"Acute stroke / LVO pathway — WA",intro:"A time-critical WA pathway. Capture onset/last-known-well, deficit, baseline and anticoagulation so NCCT/CTA can answer the reperfusion question.",source:"https://www.wacountry.health.wa.gov.au/News/2026/09/18/Telestroke-milestone-strengthens-access-to-lifesaving-care",
guard:"WA Statewide Telestroke operates 24/7 for regional hospitals. Activate your local stroke pathway early; do not delay specialist contact while perfecting a request.",
type:"stroke",question:"Intracranial haemorrhage? Early ischaemic change? Large-vessel occlusion and site?",
fields:[],prompts:["exact onset / last known well","focal deficit / NIHSS if used","baseline function","anticoagulation","recent surgery/bleeding","glucose","NCCT + CTA requested per local stroke pathway"]
},
{
id:"renal",category:"ABDOMEN",title:"Renal colic / obstructed urinary tract",intro:"Structure the request around stone probability, obstruction, infection and important alternative diagnoses.",source:"https://www.wacountry.health.wa.gov.au/~/media/WACHS/Documents/About-us/Policies/Imaging-Clinical-Practice-Standard.PDF?thn=0",
guard:"Imaging modality varies with age, pregnancy, recurrent typical presentations and local protocol. Fever/sepsis, single kidney or renal impairment changes urgency.",
type:"simple",question:"Ureteric calculus? Site/size? Hydronephrosis or alternative acute diagnosis?",
fields:[],prompts:["side + radiation","onset/severity","haematuria","fever/sepsis","single kidney","renal function","pregnancy possibility","previous stones / prior CT"]
},
{
id:"pregpe",category:"PREGNANCY",title:"Pregnancy — suspected PE",intro:"KEMH/WNHS guidance uses CXR and DVT symptoms to help select compression ultrasound, V/Q or CTPA.",source:"https://www.kemh.health.wa.gov.au/~/media/HSPs/NMHS/Hospitals/WNHS/Documents/Clinical-guidelines/Obs-Gyn-Guidelines/Venous-Thrombosis-and-Embolism-Prevention-and-Management.pdf?thn=0",
guard:"Pregnancy-specific pathway. If DVT symptoms/signs are present, compression ultrasound is used first; with no DVT symptoms, V/Q or CTPA selection depends on CXR and clinical context/local service.",
type:"pregpe",question:"Pulmonary embolism in pregnancy?",
fields:[],prompts:["gestation","DVT symptoms/signs","CXR result","haemodynamic stability","oxygen requirement","contrast history","alternative diagnosis"]
},
{
id:"earlypreg",category:"PREGNANCY",title:"Early pregnancy pain / bleeding",intro:"KEMH guidance identifies transvaginal ultrasound as the key imaging test in first-trimester complications.",source:"https://www.kemh.health.wa.gov.au/~/media/HSPs/NMHS/Hospitals/WNHS/Documents/Clinical-guidelines/Obs-Gyn-Guidelines/Pregnancy-First-Trimester.pdf",
guard:"This is an assessment pathway, not a stand-alone diagnosis. Unstable patients and suspected rupture require urgent obstetric/gynaecology review.",
type:"simple",question:"Location and viability of pregnancy? Ectopic pregnancy or other first-trimester complication?",
fields:[],prompts:["gestational age / LMP","pain side/severity","bleeding","syncope/presyncope","β-hCG trend if available","prior ectopic / tubal surgery","haemodynamic status"]
}
]
};