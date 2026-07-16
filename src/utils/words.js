// Common English words (frequency-based, filtered for morse-friendly chars)
const COMMON_WORDS = [
  // 2-letter
  'an','as','at','be','by','do','go','he','if','in','is','it','me','my',
  'no','of','on','or','so','to','up','us','we',
  // 3-letter
  'act','add','age','ago','aid','aim','air','all','and','any','arm','ask',
  'bad','bag','bar','bay','bed','big','bit','box','boy','bus','but','buy',
  'can','car','cat','day','did','dog','dry','due','ear','eat','end','eye',
  'far','few','fit','fly','for','fun','get','got','gun','had','has','hat',
  'her','him','his','hit','hot','how','job','joy','key','kid','law','lay',
  'led','leg','let','lie','lot','low','man','map','may','men','met','mix',
  'net','new','nor','not','now','off','old','one','our','out','own','pay',
  'per','put','ran','raw','red','rid','run','sat','saw','say','sea','set',
  'she','sit','six','sky','son','tax','ten','the','tie','top','try','two',
  'use','war','was','way','who','why','win','yes','yet','you',
  // 4-letter
  'able','back','ball','band','bank','base','bath','bear','beat','been',
  'bell','belt','best','bill','bird','blue','boat','body','bold','bond',
  'book','boom','bore','born','both','burn','call','came','camp','card',
  'care','case','cash','cast','cave','cell','chat','chip','city','clam',
  'clan','clap','clay','coal','coat','code','cold','come','cook','cool',
  'copy','core','corn','cost','crew','crop','dark','data','date','dawn',
  'dead','deal','dear','deep','desk','diet','dirt','disk','dive','dock',
  'does','door','draw','drop','drug','drum','dual','dump','dust','duty',
  'each','earl','earn','ease','east','edge','else','even','ever','evil',
  'exam','fact','fail','fair','fall','fame','farm','fast','fate','fear',
  'feel','felt','file','fill','film','find','fine','fire','firm','fish',
  'fist','flag','flat','flew','flip','flow','foam','fold','folk','fond',
  'font','food','fool','foot','ford','fore','fork','form','fort','foul',
  'four','free','from','fuel','full','fund','fury','fuse','gain','game',
  'gate','gave','gear','gift','girl','give','glad','glow','glue','goal',
  'gold','golf','good','grab','gray','grew','grid','grip','grow','gulf',
  'guru','gust','half','hall','hand','hang','hard','harm','hash','hate',
  'have','head','heal','heap','heat','heel','held','help','here','hero',
  'high','hill','hint','hold','hole','holy','home','hope','horn','host',
  'hour','huge','hull','hunt','hurt','idea','idle','inch','into','iron',
  'isle','item','jail','jane','john','join','jump','just','keep','kern',
  'kill','kind','king','knew','know','lack','lake','land','lane','last',
  'late','lead','leaf','leak','lean','leap','left','lend','less','life',
  'lift','like','lime','line','link','list','live','load','loan','lock',
  'loft','lone','long','look','loop','lord','lore','lose','loss','lost',
  'loud','love','luck','made','mail','main','make','male','mall','many',
  'mark','mass','math','meal','mean','meet','melt','mere','mesh','mild',
  'mile','milk','mill','mind','mine','miss','mist','mode','mood','moon',
  'more','most','move','much','must','myth','nail','name','near','neat',
  'neck','need','nest','next','nice','nine','node','none','noon','norm',
  'nose','note','null','oath','once','only','open','oral','over','pace',
  'pack','page','pain','pale','palm','park','part','pass','past','path',
  'peak','peer','pick','pier','pile','pine','pink','pipe','plan','play',
  'plea','plot','plow','plug','plus','poem','poet','poll','pond','pool',
  'poor','port','pose','post','pour','pray','prey','pull','pure','push',
  'race','rack','raid','rail','rain','rake','rank','rate','read','real',
  'rein','rely','rent','rest','rice','rich','ride','ring','riot','rise',
  'risk','road','rock','rode','role','roll','roof','room','rope','rose',
  'ruin','rule','rush','rust','safe','said','sail','sake','sale','salt',
  'same','sand','sane','save','scan','scar','seal','seat','seed','seek',
  'seem','seen','self','sell','send','sent','shed','ship','shoe','shot',
  'show','shut','sick','side','sign','silk','sing','sink','site','size',
  'skin','slip','slot','slow','snow','soap','sock','soft','soil','sold',
  'sole','some','song','soon','sort','soul','soup','sour','span','spin',
  'spot','star','stay','stem','step','stir','stop','strap','such','suit',
  'sung','sunk','sure','swim','tail','tale','tall','tank','tape','task',
  'team','tear','tell','tend','term','test','than','that','them','then',
  'they','thin','this','tide','tile','till','time','tire','told','toll',
  'tomb','tone','took','tool','torn','tour','town','tree','trim','trio',
  'trip','true','tube','tune','turn','twin','type','ugly','unit','upon',
  'used','user','vast','very','view','vile','vine','viol','void','vote',
  'wade','wage','wake','walk','wall','want','warn','warp','wash','weak',
  'weed','week','well','went','were','west','what','when','wide','wife',
  'wild','will','wind','wine','wing','wire','wise','wish','with','woke',
  'wolf','wood','wool','word','wore','work','worm','worn','wove','wrap',
  'wren','writ','yard','year','your','zone',
  // 5-letter
  'about','above','abuse','actor','admit','adopt','adult','after','again',
  'agent','agree','ahead','alarm','alert','alike','alive','alley','allow',
  'alone','along','alter','angel','anger','angle','angry','anime','ankle',
  'annex','apart','apple','apply','arena','argue','arise','array','aside',
  'asset','atlas','attic','audio','audit','avoid','award','aware','awful',
  'baker','basic','basis','batch','beach','began','begin','being','below',
  'bench','bible','black','blade','blame','bland','blast','bleed','blend',
  'bless','blind','block','blood','bloom','blown','board','bonus','boost',
  'booth','bound','brain','brand','brave','bread','break','breed','bribe',
  'brick','brief','bring','broad','broke','brook','brown','brush','buddy',
  'build','built','bunch','burst','cabin','cable','camel','canal','candy',
  'carry','cause','cease','chain','chalk','chaos','charm','chart','chase',
  'cheap','check','cheek','chess','chest','chief','child','china','choir',
  'chord','civil','claim','class','clean','clear','clerk','click','cliff',
  'climb','cling','clock','clone','close','cloth','cloud','coach','coast',
  'color','comic','comma','coral','count','court','cover','craft','crane',
  'crash','crazy','cream','creek','crime','crisp','cross','crowd','crown',
  'cruel','crush','curve','cycle','daily','dance','dandy','death','debut',
  'decay','delay','dense','depot','depth','derby','devil','diary','digit',
  'dirty','disco','ditch','diver','dizzy','donor','doubt','dough','draft',
  'drain','drama','drank','drawn','dream','dress','drift','drill','drink',
  'drive','drove','drunk','dryer','eagle','early','earth','eight','elect',
  'elite','empty','enemy','enjoy','enter','entry','equal','error','essay',
  'event','every','exact','exist','extra','fable','faced','facet','faith',
  'false','fancy','fatal','fault','feast','fence','ferry','fever','field',
  'fifth','fifty','fight','final','fixed','flame','flash','fleet','flesh',
  'float','flood','floor','flora','flour','fluid','flush','focal','focus',
  'force','forge','forth','forum','found','frame','frank','fraud','fresh',
  'front','frost','froze','fruit','fully','funny','ghost','given','glass',
  'globe','gloom','glory','glove','going','grace','grade','grain','grand',
  'grant','grape','grasp','grass','grave','graze','great','green','greet',
  'grief','grind','groan','gross','group','grove','guard','guess','guest',
  'guide','guild','guilt','guise','gusto','habit','happy','harsh','haven',
  'heart','heavy','hence','herbs','hiker','honey','honor','horse','hotel',
  'house','human','humor','hurry','hyper','ideal','image','imply','index',
  'indie','inner','input','inter','intro','issue','ivory','japan','jewel',
  'joint','judge','juice','jumbo','karma','knife','knock','known','label',
  'large','laser','later','laugh','layer','learn','lease','least','leave',
  'legal','lemon','level','light','limit','linen','liner','liver','local',
  'lodge','logic','loose','lover','lower','loyal','lucky','lunar','lunch',
  'lyric','magic','major','maker','manor','maple','march','match','mayor',
  'media','mercy','merit','metal','minor','minus','model','money','month',
  'moral','motor','mount','mouse','mouth','moved','movie','music','naive',
  'nerve','never','night','noble','north','noted','novel','nurse','occur',
  'ocean','offer','often','olive','onset','order','other','ought','outer',
  'oxide','ozone','paint','panel','panic','paper','peace','penny','phase',
  'photo','piano','piece','pilot','pixel','pizza','place','plain','plane',
  'plant','plate','plaza','plead','plumb','plume','plunk','plush','point',
  'polar','pound','power','press','price','pride','prime','print','prior',
  'prize','probe','proof','prose','proud','prove','proxy','psalm','queen',
  'query','quest','queue','quick','quiet','quota','quote','radar','radio',
  'raise','rally','range','rapid','ratio','reach','ready','realm','rebel',
  'refer','reign','relax','reply','reset','rider','ridge','rifle','right',
  'risky','rival','river','robot','rocky','roman','rouge','rough','round',
  'route','royal','rugby','ruler','rural','saint','salad','sauce','scale',
  'scene','scope','score','scout','seize','sense','serve','setup','seven',
  'shade','shake','shall','shame','shape','share','shark','sharp','sheer',
  'shell','shift','shine','shirt','shock','shoot','shore','short','shout',
  'sight','silly','since','sixth','sixty','sized','skill','skimp','skull',
  'slave','sleep','sleek','slice','slide','slope','small','smart','smell',
  'smile','smoke','snake','solar','solid','solve','sorry','sound','south',
  'space','spark','speak','speed','spend','spill','spine','spite','split',
  'spoke','spook','spray','squad','stack','staff','stage','stain','stake',
  'stale','stand','stark','start','state','stave','steak','steal','steam',
  'steel','steep','steer','stern','stock','stone','stood','store','storm',
  'story','strap','straw','stray','strip','stuck','study','stuff','style',
  'sugar','suite','sunny','super','surge','sweep','sweet','swept','swift',
  'sword','swore','swung','table','taken','talon','tense','tenth','terms',
  'thorn','those','three','threw','throw','thunder','tiger','tight','timer',
  'title','today','token','tonal','topic','total','touch','tough','tower',
  'toxic','trace','track','trade','trail','train','trait','tramp','trend',
  'trial','tribe','trick','tried','troop','trove','truck','trunk','trust',
  'truth','tumor','twice','twist','ultra','uncle','under','union','unite',
  'until','upper','upset','urban','usage','usual','utter','valid','value',
  'valve','video','vigor','viral','virus','visit','vital','vivid','vocal',
  'voice','voter','wales','waste','watch','water','weary','weigh','weird',
  'whale','wheat','wheel','where','which','while','white','whole','whose',
  'width','woman','women','world','worse','worst','worth','would','wound',
  'wrath','write','wrote','yacht','yield','young','youth','zebra',
];

// Ham radio vocabulary
const HAM_WORDS = [
  // 2-letter
  'de','dx','ur','es','nr','bt','sk','kn','ar','ge','gm','ga','gn',
  // 3-letter
  'ant','amp','agc','afc','atn','bfo','bpf','cfs','cps','cqd','crt',
  'cto','cwt','dbs','dit','dah','dsp','dtv','eme','fec','fft','fsk',
  'ham','hpf','if','khz','lpf','lst','mhz','mic','mni','mox','msg',
  'nil','nts','opr','pep','pip','psk','psn','ptt','pwr','qrm','qrn',
  'qrp','qrq','qrs','qrt','qrz','qsb','qsk','qsl','qso','qsy','qth',
  'qtr','rcv','rem','rprt','rst','rtty','rx','sdr','sib','sig','snr',
  'sop','spc','ssb','sts','stn','swl','tnx','tvi','tx','ufb','uhf',
  'vfo','vhf','vlf','vox','wkd','wpx','wrt','xmtr','xvtr','yagi',
  // 4-letter
  'band','beam','cert','coax','digi','dupe','dxcc','freq','gain','loop',
  'mode','mult','omni','open','oper','peak','pile','rcvr','recd','rept',
  'sect','send','sked','swap','test','thru','wait','wire','wkgs','xmit',
  // 5-letter
  'audio','dipol','dummy','final','forty','mixer','noise','notch','patch',
  'power','radio','relay','reply','roger','squid','super','tower','tuner',
  'xmptr',
  // Common CW abbreviations as words
  'agn','ant','cpi','cpn','cuagn','dwnld','ferr','frnd','gl','gud',
  'hihi','hw','ltr','mni','msg','nw','ok','omh','pse','pwr','r',
  'sigs','tnx','tu','ul','vfb','vry','wx','xcvr','xmas','xtra',
];

// Callsign prefixes by region
const CALLSIGN_PREFIXES = {
  US: ['W','K','N','AA','AB','AC','AD','AE','AF','AG','AI','AJ','AK',
       'KA','KB','KC','KD','KE','KF','KG','KH','KI','KJ','KK','KL',
       'KM','KN','KO','KP','KQ','KR','KS','KT','KU','KV','KW','KX',
       'KY','KZ','NA','NB','NC','ND','NE','NF','NG','NH','NI','NJ',
       'NK','NL','NM','NN','NO','NP','NQ','NR','NS','NT','NU','NV',
       'NW','NX','NY','NZ','WA','WB','WC','WD','WE','WF','WG','WH',
       'WI','WJ','WK','WL','WM','WN','WO','WP','WQ','WR','WS','WT',
       'WU','WV','WW','WX','WY','WZ'],
  UK: ['G','M','2E'],
  Canada: ['VA','VB','VC','VD','VE','VF','VG','VY'],
  Australia: ['VK'],
  Germany: ['DA','DB','DC','DD','DE','DF','DG','DH','DI','DJ','DK','DL','DM'],
  Japan: ['JA','JB','JC','JD','JE','JF','JG','JH','JI','JJ','JK','JL','JM','JN','JO','JP','JQ','JR'],
};

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randChar(pool) { return pool[Math.floor(Math.random() * pool.length)]; }

export function generateCallsign() {
  const regions = Object.keys(CALLSIGN_PREFIXES);
  const region = rand(regions);
  const prefixes = CALLSIGN_PREFIXES[region];
  const prefix = rand(prefixes);
  const district = randChar(DIGITS);
  const suffixLen = randInt(1, 3);
  let suffix = '';
  for (let i = 0; i < suffixLen; i++) suffix += randChar(LETTERS);
  return prefix + district + suffix;
}

export function generateRandomLetters(minLen = 3, maxLen = 10) {
  const len = randInt(minLen, maxLen);
  let result = '';
  for (let i = 0; i < len; i++) result += randChar(LETTERS);
  return result;
}

export function getWord(mode, minLen, maxLen, vocabulary = 'common') {
  if (mode === 'random') {
    return generateRandomLetters(minLen, maxLen);
  }
  if (mode === 'callsign') {
    return generateCallsign();
  }

  // English word mode
  const pool = vocabulary === 'ham' ? HAM_WORDS : COMMON_WORDS;
  const filtered = pool.filter(w => {
    const len = w.length;
    return len >= minLen && len <= maxLen;
  });

  if (filtered.length === 0) {
    // Fallback to random if no words match length
    return generateRandomLetters(minLen, maxLen);
  }
  return rand(filtered).toUpperCase();
}
