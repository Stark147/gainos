import { useState, useEffect, useRef } from 'react';
import BottomNav from '../components/BottomNav';

// ─── Storage ───────────────────────────────────────────────
const store = {
  getLogs(){ if(typeof window==='undefined')return{}; try{return JSON.parse(localStorage.getItem('gn_logs')||'{}')}catch{return{}} },
  saveLog(date,meals){ const a=this.getLogs(); a[date]=meals; localStorage.setItem('gn_logs',JSON.stringify(a)) },
  getTargets(){ if(typeof window==='undefined')return DEF_TARGETS; try{return JSON.parse(localStorage.getItem('gn_targets')||'null')||DEF_TARGETS}catch{return DEF_TARGETS} },
  saveTargets(t){ localStorage.setItem('gn_targets',JSON.stringify(t)) },
  getWater(date){ if(typeof window==='undefined')return 0; try{return JSON.parse(localStorage.getItem('gn_water')||'{}')[date]||0}catch{return 0} },
  saveWater(date,v){ const a=JSON.parse(localStorage.getItem('gn_water')||'{}'); a[date]=v; localStorage.setItem('gn_water',JSON.stringify(a)) },
};

const TODAY = new Date().toISOString().split('T')[0];
const DEF_TARGETS = { calories:2000, protein:150, carbs:200, fat:65, fiber:30, water:8 };
const MEAL_TYPES  = ['Breakfast','Lunch','Dinner','Snacks'];

// ─── Indian Food Database ───────────────────────────────────
const INDIAN_FOODS = [
  // Dal & Legumes
  {name:'Dal Tadka',cal:150,protein:9,carbs:20,fat:4,fiber:5,sodium:380,potassium:440,calcium:40,iron:2.5,vitC:2,category:'Dal'},
  {name:'Dal Makhani',cal:220,protein:10,carbs:24,fat:9,fiber:6,sodium:420,potassium:480,calcium:60,iron:3,vitC:1,category:'Dal'},
  {name:'Chana Masala',cal:180,protein:10,carbs:26,fat:5,fiber:7,sodium:350,potassium:420,calcium:55,iron:3.5,vitC:4,category:'Dal'},
  {name:'Rajma Masala',cal:200,protein:11,carbs:28,fat:5,fiber:8,sodium:340,potassium:500,calcium:50,iron:3,vitC:2,category:'Dal'},
  {name:'Moong Dal',cal:120,protein:8,carbs:16,fat:1,fiber:4,sodium:180,potassium:340,calcium:30,iron:2,vitC:1,category:'Dal'},
  {name:'Masoor Dal',cal:130,protein:9,carbs:18,fat:1,fiber:5,sodium:200,potassium:360,calcium:35,iron:2.5,vitC:1,category:'Dal'},
  {name:'Sambar',cal:90,protein:4,carbs:12,fat:3,fiber:4,sodium:310,potassium:280,calcium:40,iron:1.5,vitC:8,category:'Dal'},
  {name:'Chole Bhature (1 plate)',cal:650,protein:18,carbs:85,fat:25,fiber:10,sodium:680,potassium:520,calcium:90,iron:5,vitC:3,category:'Dal'},
  // Rice & Grains
  {name:'Basmati Rice (cooked)',cal:200,protein:4,carbs:44,fat:0.5,fiber:0.6,sodium:5,potassium:55,calcium:10,iron:0.4,vitC:0,category:'Rice'},
  {name:'Brown Rice (cooked)',cal:215,protein:5,carbs:45,fat:1.5,fiber:3.5,sodium:5,potassium:85,calcium:20,iron:1,vitC:0,category:'Rice'},
  {name:'Jeera Rice',cal:220,protein:4,carbs:46,fat:3,fiber:0.8,sodium:120,potassium:60,calcium:12,iron:0.6,vitC:0,category:'Rice'},
  {name:'Biryani (Chicken)',cal:380,protein:22,carbs:45,fat:12,fiber:2,sodium:680,potassium:380,calcium:40,iron:2.5,vitC:2,category:'Rice'},
  {name:'Khichdi',cal:200,protein:8,carbs:35,fat:4,fiber:3,sodium:280,potassium:240,calcium:30,iron:1.5,vitC:1,category:'Rice'},
  {name:'Poha',cal:180,protein:3,carbs:38,fat:3,fiber:2,sodium:240,potassium:120,calcium:15,iron:1.2,vitC:5,category:'Rice'},
  {name:'Upma',cal:160,protein:4,carbs:28,fat:5,fiber:2,sodium:320,potassium:140,calcium:20,iron:1,vitC:2,category:'Rice'},
  // Bread & Roti
  {name:'Wheat Roti',cal:100,protein:3,carbs:20,fat:1,fiber:2.5,sodium:1,potassium:80,calcium:15,iron:1,vitC:0,category:'Bread'},
  {name:'Paratha (Plain)',cal:200,protein:4,carbs:30,fat:7,fiber:2,sodium:180,potassium:100,calcium:20,iron:1.2,vitC:0,category:'Bread'},
  {name:'Aloo Paratha',cal:280,protein:5,carbs:40,fat:10,fiber:3,sodium:220,potassium:280,calcium:25,iron:1.5,vitC:8,category:'Bread'},
  {name:'Naan',cal:260,protein:8,carbs:44,fat:6,fiber:1.5,sodium:380,potassium:110,calcium:55,iron:2,vitC:0,category:'Bread'},
  {name:'Puri',cal:150,protein:2.5,carbs:18,fat:7,fiber:1,sodium:80,potassium:40,calcium:10,iron:0.8,vitC:0,category:'Bread'},
  {name:'Bhatura',cal:220,protein:5,carbs:30,fat:9,fiber:1,sodium:200,potassium:60,calcium:20,iron:1,vitC:0,category:'Bread'},
  {name:'Missi Roti',cal:130,protein:5,carbs:22,fat:2,fiber:3,sodium:80,potassium:120,calcium:25,iron:1.5,vitC:1,category:'Bread'},
  // Vegetables
  {name:'Palak Paneer',cal:240,protein:14,carbs:10,fat:16,fiber:3,sodium:380,potassium:380,calcium:280,iron:4,vitC:18,category:'Sabzi'},
  {name:'Paneer Butter Masala',cal:320,protein:15,carbs:12,fat:24,fiber:2,sodium:480,potassium:280,calcium:300,iron:1.5,vitC:8,category:'Sabzi'},
  {name:'Aloo Gobi',cal:150,protein:3,carbs:22,fat:5,fiber:4,sodium:280,potassium:380,calcium:40,iron:1.5,vitC:45,category:'Sabzi'},
  {name:'Bhindi Masala',cal:120,protein:2,carbs:14,fat:6,fiber:4,sodium:260,potassium:300,calcium:55,iron:0.8,vitC:18,category:'Sabzi'},
  {name:'Baingan Bharta',cal:130,protein:3,carbs:15,fat:6,fiber:5,sodium:280,potassium:380,calcium:40,iron:1,vitC:6,category:'Sabzi'},
  {name:'Matar Paneer',cal:260,protein:13,carbs:14,fat:17,fiber:4,sodium:360,potassium:280,calcium:250,iron:2,vitC:12,category:'Sabzi'},
  {name:'Saag',cal:100,protein:4,carbs:10,fat:5,fiber:4,sodium:240,potassium:420,calcium:180,iron:3.5,vitC:20,category:'Sabzi'},
  {name:'Aloo Matar',cal:170,protein:4,carbs:26,fat:5,fiber:4,sodium:300,potassium:380,calcium:30,iron:1.5,vitC:20,category:'Sabzi'},
  // Chicken
  {name:'Chicken Curry',cal:280,protein:28,carbs:8,fat:15,fiber:1,sodium:480,potassium:420,calcium:30,iron:1.5,vitC:4,category:'Chicken'},
  {name:'Butter Chicken',cal:320,protein:25,carbs:12,fat:20,fiber:1,sodium:560,potassium:380,calcium:35,iron:1.2,vitC:6,category:'Chicken'},
  {name:'Tandoori Chicken (2 pcs)',cal:280,protein:35,carbs:5,fat:12,fiber:1,sodium:680,potassium:480,calcium:40,iron:2,vitC:3,category:'Chicken'},
  {name:'Chicken Tikka Masala',cal:300,protein:26,carbs:10,fat:18,fiber:1.5,sodium:520,potassium:400,calcium:35,iron:1.5,vitC:8,category:'Chicken'},
  {name:'Chicken Biryani (1 plate)',cal:450,protein:28,carbs:55,fat:14,fiber:2,sodium:740,potassium:460,calcium:50,iron:3,vitC:3,category:'Chicken'},
  {name:'Chicken Seekh Kebab (2)',cal:200,protein:22,carbs:4,fat:10,fiber:0.5,sodium:420,potassium:320,calcium:20,iron:1.5,vitC:2,category:'Chicken'},
  // Egg
  {name:'Boiled Egg',cal:78,protein:6,carbs:0.6,fat:5,fiber:0,sodium:62,potassium:63,calcium:28,iron:0.6,vitD:1.1,vitB12:0.6,vitA:75,cholesterol:186,category:'Egg'},
  {name:'Egg Bhurji (2 eggs)',cal:200,protein:14,carbs:4,fat:14,fiber:0.5,sodium:380,potassium:180,calcium:60,iron:1.5,vitD:2,vitB12:1.2,vitA:150,cholesterol:370,category:'Egg'},
  {name:'Omelette (2 eggs)',cal:190,protein:13,carbs:2,fat:14,fiber:0,sodium:340,potassium:160,calcium:55,iron:1.2,vitD:1.8,vitB12:1,vitA:140,cholesterol:360,category:'Egg'},
  {name:'Egg Curry',cal:220,protein:14,carbs:8,fat:14,fiber:1,sodium:420,potassium:240,calcium:60,iron:1.5,vitD:2,vitB12:1,category:'Egg'},
  // Dairy
  {name:'Paneer (100g)',cal:265,protein:18,carbs:3.5,fat:20,fiber:0,sodium:28,potassium:160,calcium:480,iron:0.5,vitD:0.5,vitB12:0.4,vitA:60,category:'Dairy'},
  {name:'Curd/Dahi (100g)',cal:60,protein:3.5,carbs:4,fat:3,fiber:0,sodium:46,potassium:155,calcium:120,iron:0.1,vitB12:0.4,category:'Dairy'},
  {name:'Lassi (1 glass)',cal:180,protein:7,carbs:25,fat:5,fiber:0,sodium:80,potassium:260,calcium:220,iron:0.2,vitB12:0.5,category:'Dairy'},
  {name:'Chaas (Buttermilk)',cal:60,protein:3,carbs:5,fat:2,fiber:0,sodium:120,potassium:180,calcium:115,iron:0.1,category:'Dairy'},
  {name:'Ghee (1 tbsp)',cal:135,protein:0,carbs:0,fat:15,fiber:0,sodium:0,potassium:1,calcium:0,iron:0,vitA:110,satFat:9,category:'Dairy'},
  {name:'Full Fat Milk (1 glass)',cal:150,protein:8,carbs:12,fat:8,fiber:0,sodium:105,potassium:349,calcium:276,iron:0.1,vitD:2.5,vitB12:1.1,vitA:75,category:'Dairy'},
  // Snacks
  {name:'Samosa (1)',cal:250,protein:4,carbs:30,fat:13,fiber:2,sodium:380,potassium:180,calcium:20,iron:1.5,vitC:5,category:'Snacks'},
  {name:'Vada Pav',cal:290,protein:6,carbs:40,fat:12,fiber:2.5,sodium:480,potassium:220,calcium:30,iron:1.5,vitC:8,category:'Snacks'},
  {name:'Idli (2)',cal:140,protein:4,carbs:28,fat:0.5,fiber:1,sodium:200,potassium:80,calcium:15,iron:0.8,vitC:0,category:'Snacks'},
  {name:'Dosa (1)',cal:180,protein:4,carbs:32,fat:4,fiber:1.5,sodium:300,potassium:100,calcium:20,iron:1,vitC:0,category:'Snacks'},
  {name:'Medu Vada (1)',cal:160,protein:5,carbs:18,fat:8,fiber:2,sodium:280,potassium:120,calcium:25,iron:1.2,vitC:0,category:'Snacks'},
  {name:'Dhokla (2 pcs)',cal:150,protein:6,carbs:22,fat:4,fiber:1.5,sodium:380,potassium:140,calcium:40,iron:1,vitC:0,category:'Snacks'},
  {name:'Kachori (1)',cal:280,protein:5,carbs:32,fat:15,fiber:3,sodium:320,potassium:160,calcium:25,iron:1.5,vitC:1,category:'Snacks'},
  {name:'Pani Puri (6 pcs)',cal:200,protein:4,carbs:36,fat:5,fiber:3,sodium:480,potassium:200,calcium:30,iron:1.5,vitC:4,category:'Snacks'},
  // Protein Foods
  {name:'Chicken Breast (100g)',cal:165,protein:31,carbs:0,fat:3.6,fiber:0,sodium:74,potassium:256,calcium:15,iron:1,vitB12:0.3,category:'Protein'},
  {name:'Tuna (canned, 100g)',cal:130,protein:28,carbs:0,fat:1,fiber:0,sodium:360,potassium:280,calcium:15,iron:1.3,vitD:4,vitB12:2.5,omega3:0.5,category:'Protein'},
  {name:'Salmon (100g)',cal:208,protein:22,carbs:0,fat:13,fiber:0,sodium:58,potassium:380,calcium:15,iron:0.8,vitD:11,vitB12:3.2,omega3:2.3,category:'Protein'},
  {name:'Soya Chunks (100g dry)',cal:345,protein:52,carbs:28,fat:0.5,fiber:13,sodium:8,potassium:2100,calcium:240,iron:10,vitC:0,category:'Protein'},
  {name:'Tofu (100g)',cal:76,protein:8,carbs:2,fat:4,fiber:0.3,sodium:7,potassium:121,calcium:350,iron:2.7,vitC:0,category:'Protein'},
  {name:'Sprouts (1 cup)',cal:85,protein:6,carbs:12,fat:0.5,fiber:4,sodium:20,potassium:280,calcium:40,iron:2.5,vitC:14,category:'Protein'},
  // Fruits
  {name:'Banana',cal:105,protein:1.3,carbs:27,fat:0.4,fiber:3.1,sodium:1,potassium:422,calcium:6,iron:0.3,vitC:10.3,vitB6:0.4,category:'Fruit'},
  {name:'Apple',cal:95,protein:0.5,carbs:25,fat:0.3,fiber:4.4,sodium:2,potassium:195,calcium:11,iron:0.2,vitC:8.4,category:'Fruit'},
  {name:'Mango (1 medium)',cal:200,protein:2.8,carbs:50,fat:1.3,fiber:5.4,sodium:3,potassium:564,calcium:27,iron:0.8,vitC:122,vitA:181,category:'Fruit'},
  {name:'Orange',cal:62,protein:1.2,carbs:15,fat:0.2,fiber:3.1,sodium:1,potassium:237,calcium:52,iron:0.1,vitC:70,folate:40,category:'Fruit'},
  {name:'Papaya (1 cup)',cal:62,protein:0.7,carbs:16,fat:0.4,fiber:2.5,sodium:12,potassium:360,calcium:34,iron:0.3,vitC:87,vitA:149,category:'Fruit'},
  {name:'Guava',cal:68,protein:2.6,carbs:14,fat:1,fiber:5.4,sodium:2,potassium:417,calcium:30,iron:0.3,vitC:228,category:'Fruit'},
  {name:'Watermelon (1 cup)',cal:46,protein:0.9,carbs:11.5,fat:0.2,fiber:0.6,sodium:2,potassium:170,calcium:11,iron:0.4,vitC:12,vitA:43,category:'Fruit'},
  // Nuts & Seeds
  {name:'Almonds (28g / ~23)',cal:164,protein:6,carbs:6,fat:14,fiber:3.5,sodium:0,potassium:208,calcium:76,iron:1,vitE:7.3,magnesium:76,category:'Nuts'},
  {name:'Peanuts (28g)',cal:161,protein:7,carbs:5,fat:14,fiber:2.4,sodium:5,potassium:200,calcium:15,iron:0.6,magnesium:49,category:'Nuts'},
  {name:'Walnuts (28g)',cal:185,protein:4,carbs:4,fat:18,fiber:2,sodium:1,potassium:125,calcium:28,iron:0.8,omega3:2.5,magnesium:45,category:'Nuts'},
  {name:'Cashews (28g)',cal:157,protein:5,carbs:9,fat:12,fiber:1,sodium:3,potassium:187,calcium:10,iron:1.9,magnesium:83,zinc:1.6,category:'Nuts'},
  {name:'Flaxseeds (1 tbsp)',cal:37,protein:1.3,carbs:2,fat:3,fiber:2,sodium:2,potassium:84,calcium:26,iron:0.6,omega3:1.6,category:'Nuts'},
  {name:'Chia Seeds (1 tbsp)',cal:58,protein:2,carbs:5,fat:3.5,fiber:5,sodium:2,potassium:80,calcium:88,iron:1,omega3:1.8,magnesium:47,category:'Nuts'},
  // Breakfast
  {name:'Oats (cooked, 1 cup)',cal:158,protein:6,carbs:27,fat:3.2,fiber:4,sodium:9,potassium:164,calcium:21,iron:2,magnesium:63,zinc:1.1,category:'Breakfast'},
  {name:'Whole Wheat Bread (1 slice)',cal:81,protein:4,carbs:15,fat:1,fiber:2,sodium:144,potassium:78,calcium:23,iron:1,magnesium:23,category:'Breakfast'},
  {name:'Cornflakes (30g)',cal:113,protein:2,carbs:25,fat:0.2,fiber:1,sodium:203,potassium:26,calcium:1,iron:2.7,vitD:1,vitB12:0.4,category:'Breakfast'},
  // Beverages
  {name:'Masala Chai (1 cup)',cal:80,protein:2,carbs:12,fat:3,fiber:0,sodium:40,potassium:80,calcium:80,iron:0.2,category:'Beverages'},
  {name:'Black Coffee',cal:5,protein:0.3,carbs:0,fat:0,fiber:0,sodium:5,potassium:116,calcium:5,iron:0.1,category:'Beverages'},
  {name:'Protein Shake (1 scoop)',cal:120,protein:25,carbs:5,fat:1.5,fiber:0,sodium:120,potassium:180,calcium:120,iron:0.5,category:'Beverages'},
  {name:'Coconut Water (1 glass)',cal:45,protein:1.7,carbs:8.9,fat:0.5,fiber:2.6,sodium:252,potassium:600,calcium:58,iron:0.7,vitC:5.8,magnesium:60,category:'Beverages'},
];

const USDA_MAP = {
  1008:'cal',1003:'protein',1005:'carbs',1004:'fat',1079:'fiber',
  2000:'sugar',1093:'sodium',1092:'potassium',1087:'calcium',1089:'iron',
  1162:'vitC',1114:'vitD',1178:'vitB12',1090:'magnesium',1095:'zinc',
  1404:'omega3',1106:'vitA',1177:'folate',1253:'cholesterol',1258:'satFat',
};

const MICROS = [
  {key:'fiber',label:'Fiber',unit:'g',dv:30,color:'#43e97b'},
  {key:'sugar',label:'Sugar',unit:'g',dv:50,color:'#ffd166'},
  {key:'sodium',label:'Sodium',unit:'mg',dv:2300,color:'#ff8fab'},
  {key:'potassium',label:'Potassium',unit:'mg',dv:4700,color:'#4cc9f0'},
  {key:'calcium',label:'Calcium',unit:'mg',dv:1300,color:'#c3a6ff'},
  {key:'iron',label:'Iron',unit:'mg',dv:18,color:'#ff6b6b'},
  {key:'vitC',label:'Vitamin C',unit:'mg',dv:90,color:'#ffa94d'},
  {key:'vitD',label:'Vitamin D',unit:'mcg',dv:20,color:'#ffe066'},
  {key:'vitB12',label:'Vitamin B12',unit:'mcg',dv:2.4,color:'#a9e34b'},
  {key:'magnesium',label:'Magnesium',unit:'mg',dv:420,color:'#74b9ff'},
  {key:'zinc',label:'Zinc',unit:'mg',dv:11,color:'#fd79a8'},
  {key:'omega3',label:'Omega-3',unit:'g',dv:1.6,color:'#00cec9'},
  {key:'vitA',label:'Vitamin A',unit:'mcg',dv:900,color:'#e17055'},
  {key:'folate',label:'Folate',unit:'mcg',dv:400,color:'#55efc4'},
  {key:'cholesterol',label:'Cholesterol',unit:'mg',dv:300,color:'#fdcb6e'},
  {key:'satFat',label:'Sat. Fat',unit:'g',dv:20,color:'#d63031'},
];

function sumMeals(meals){
  const t={cal:0,protein:0,carbs:0,fat:0,fiber:0,sugar:0,sodium:0,potassium:0,calcium:0,iron:0,vitC:0,vitD:0,vitB12:0,magnesium:0,zinc:0,omega3:0,vitA:0,folate:0,cholesterol:0,satFat:0};
  Object.values(meals).flat().forEach(item=>{ Object.keys(t).forEach(k=>{ t[k]+=item[k]||0 }) });
  Object.keys(t).forEach(k=>{ t[k]=Math.round(t[k]*10)/10 });
  return t;
}

function Bar({pct,color}){
  const p=Math.min(pct,100);
  return(
    <div style={{height:6,background:'var(--surface2)',borderRadius:3,overflow:'hidden',flex:1}}>
      <div style={{height:'100%',width:`${p}%`,background:color,borderRadius:3,transition:'width 0.5s ease'}}/>
    </div>
  );
}

const BLANK_MANUAL = {name:'',cal:'',protein:'',carbs:'',fat:'',fiber:'',sodium:'',potassium:'',calcium:'',iron:'',vitC:'',vitD:'',vitB12:'',magnesium:'',zinc:'',omega3:''};

export default function Nutrition(){
  const [meals,setMeals]           = useState({Breakfast:[],Lunch:[],Dinner:[],Snacks:[]});
  const [targets,setTargets]       = useState({calories:2000,protein:150,carbs:200,fat:65,fiber:30,water:8});
  const [water,setWater]           = useState(0);
  const [view,setView]             = useState('today');   // today | history | targets
  const [addMode,setAddMode]       = useState(null);      // null | 'search' | 'indian' | 'manual'
  const [activeMeal,setActiveMeal] = useState('Breakfast');
  const [searchQ,setSearchQ]       = useState('');
  const [searching,setSearching]   = useState(false);
  const [results,setResults]       = useState([]);
  const [indianQ,setIndianQ]       = useState('');
  const [manual,setManual]         = useState(BLANK_MANUAL);
  const [servings,setServings]     = useState({});
  const [history,setHistory]       = useState({});
  const [editT,setEditT]           = useState({});
  const [mounted,setMounted]       = useState(false);
  const [activeCategory,setActiveCategory] = useState('All');

  useEffect(()=>{
    const all=store.getLogs();
    setHistory(all);
    setMeals(all[TODAY]||{Breakfast:[],Lunch:[],Dinner:[],Snacks:[]});
    const t=store.getTargets(); setTargets(t); setEditT(t);
    setWater(store.getWater(TODAY));
    setMounted(true);
  },[]);

  const saveMeals=(m)=>{ setMeals(m); store.saveLog(TODAY,m); const a=store.getLogs(); a[TODAY]=m; setHistory({...a}); };

  // USDA search
  const searchUSDA=async()=>{
    if(!searchQ.trim())return;
    setSearching(true);setResults([]);
    try{
      const r=await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(searchQ)}&dataType=Foundation,SR%20Legacy,Survey%20(FNDDS)&pageSize=20&api_key=DEMO_KEY`);
      const d=await r.json();
      const foods=(d.foods||[]).map(f=>{
        const n={};
        (f.foodNutrients||[]).forEach(x=>{ const k=USDA_MAP[x.nutrientId]; if(k)n[k]=Math.round((x.value||0)*10)/10 });
        return{ id:f.fdcId,name:f.description,brand:f.brandOwner||f.foodCategory||'',serving:f.servingSize?`${f.servingSize}${f.servingSizeUnit||'g'}`:'100g',servingG:f.servingSize||100,...n };
      });
      setResults(foods);
    }catch{ setResults([]); }
    setSearching(false);
  };

  const addFood=(food,source)=>{
    const mult=servings[food.id||food.name]||1;
    const item={};
    ['cal','protein','carbs','fat','fiber','sugar','sodium','potassium','calcium','iron','vitC','vitD','vitB12','magnesium','zinc','omega3','vitA','folate','cholesterol','satFat'].forEach(k=>{ item[k]=Math.round(((food[k]||0)*mult)*10)/10 });
    item.id=Date.now(); item.name=food.name; item.serving=mult===1?food.serving||'1 serving':`${mult}× ${food.serving||'serving'}`; item.source=source;
    const updated={...meals,[activeMeal]:[...(meals[activeMeal]||[]),item]};
    saveMeals(updated); setAddMode(null); setSearchQ(''); setResults([]); setIndianQ(''); setServings({});
  };

  const addManual=()=>{
    if(!manual.name||!manual.cal)return;
    const item={id:Date.now(),name:manual.name,serving:'custom',source:'manual'};
    ['cal','protein','carbs','fat','fiber','sodium','potassium','calcium','iron','vitC','vitD','vitB12','magnesium','zinc','omega3'].forEach(k=>{ item[k]=parseFloat(manual[k])||0 });
    const updated={...meals,[activeMeal]:[...(meals[activeMeal]||[]),item]};
    saveMeals(updated); setAddMode(null); setManual(BLANK_MANUAL);
  };

  const removeFood=(mealType,id)=>{ const u={...meals,[mealType]:meals[mealType].filter(f=>f.id!==id)}; saveMeals(u); };

  const totals=sumMeals(meals);
  const macros=[
    {key:'cal',  label:'Calories',color:'#6c63ff',unit:'kcal',dv:targets.calories},
    {key:'protein',label:'Protein',color:'#43e97b',unit:'g',  dv:targets.protein},
    {key:'carbs',  label:'Carbs',  color:'#ffd166',unit:'g',  dv:targets.carbs},
    {key:'fat',    label:'Fat',    color:'#ff8fab',unit:'g',   dv:targets.fat},
  ];

  const indianCategories=['All',...[...new Set(INDIAN_FOODS.map(f=>f.category))]];
  const filteredIndian=INDIAN_FOODS.filter(f=>{
    const matchQ=!indianQ||f.name.toLowerCase().includes(indianQ.toLowerCase())||f.category.toLowerCase().includes(indianQ.toLowerCase());
    const matchC=activeCategory==='All'||f.category===activeCategory;
    return matchQ&&matchC;
  });

  if(!mounted)return null;

  return(
    <div className="page">

      {/* Header */}
      <div className="fade-up" style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:3,color:'var(--accent)',textTransform:'uppercase',marginBottom:4}}>GainOS</div>
          <div className="display" style={{fontSize:26}}>Nutrition 🥗</div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>setView('history')} style={{background:view==='history'?'rgba(108,99,255,0.2)':'var(--surface)',border:'1px solid var(--border2)',borderRadius:10,padding:'8px 12px',color:view==='history'?'var(--accent)':'var(--text2)',fontSize:11,cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>History</button>
          <button onClick={()=>setView('targets')} style={{background:view==='targets'?'rgba(108,99,255,0.2)':'var(--surface)',border:'1px solid var(--border2)',borderRadius:10,padding:'8px 12px',color:view==='targets'?'var(--accent)':'var(--text2)',fontSize:11,cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>Targets</button>
        </div>
      </div>

      {/* ── TODAY VIEW ── */}
      {view==='today'&&(
        <>
          {/* Macro rings */}
          <div className="card card-glow fade-up-1" style={{padding:'20px',marginBottom:14}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
              <div>
                <div className="label" style={{marginBottom:6}}>Today's Intake</div>
                <div className="display" style={{fontSize:36,color:'var(--accent)'}}>{totals.cal}</div>
                <div style={{fontSize:12,color:'var(--text3)'}}>of {targets.calories} kcal</div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                {macros.slice(1).map(m=>(
                  <div key={m.key} style={{textAlign:'center'}}>
                    <div style={{fontSize:13,fontWeight:700,color:m.color}}>{totals[m.key]}{m.unit}</div>
                    <div style={{fontSize:9,color:'var(--text3)',letterSpacing:1}}>{m.label.toUpperCase()}</div>
                    <Bar pct={(totals[m.key]/m.dv)*100} color={m.color}/>
                  </div>
                ))}
              </div>
            </div>
            <Bar pct={(totals.cal/targets.calories)*100} color='#6c63ff'/>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:4}}>
              <span style={{fontSize:10,color:'var(--text3)'}}>0</span>
              <span style={{fontSize:10,color:'var(--accent)',fontWeight:700}}>{Math.round((totals.cal/targets.calories)*100)}%</span>
              <span style={{fontSize:10,color:'var(--text3)'}}>{targets.calories}</span>
            </div>
          </div>

          {/* Water tracker */}
          <div className="card fade-up-2" style={{padding:'16px',marginBottom:14}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div className="label">Water 💧</div>
              <div style={{fontSize:13,fontWeight:700,color:'#4cc9f0'}}>{water}/{targets.water} glasses</div>
            </div>
            <div style={{display:'flex',gap:6,marginBottom:8}}>
              {Array.from({length:targets.water}).map((_,i)=>(
                <div key={i} onClick={()=>{ const n=i<water?i:i+1; setWater(n); store.saveWater(TODAY,n); }} style={{flex:1,height:28,borderRadius:6,background:i<water?'#4cc9f0':'var(--surface2)',border:'1px solid var(--border)',cursor:'pointer',transition:'background 0.15s'}}/>
              ))}
            </div>
            <Bar pct={(water/targets.water)*100} color='#4cc9f0'/>
          </div>

          {/* Meals */}
          {MEAL_TYPES.map(mealType=>(
            <div key={mealType} className="card fade-up-3" style={{padding:'16px',marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:'var(--text)'}}>{mealType}</div>
                  <div style={{fontSize:11,color:'var(--text3)'}}>
                    {Math.round((meals[mealType]||[]).reduce((s,f)=>s+(f.cal||0),0))} kcal · {Math.round((meals[mealType]||[]).reduce((s,f)=>s+(f.protein||0),0))}g protein
                  </div>
                </div>
                <button onClick={()=>{setActiveMeal(mealType);setAddMode('search');}} style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),#8b5cf6)',border:'none',color:'#fff',fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 12px rgba(108,99,255,0.35)'}}>+</button>
              </div>
              {(meals[mealType]||[]).length===0?(
                <div style={{fontSize:12,color:'var(--text3)',textAlign:'center',padding:'8px 0'}}>No foods logged</div>
              ):(meals[mealType]||[]).map((f,i)=>(
                <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:i<meals[mealType].length-1?'1px solid var(--border)':'none'}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:500,color:'var(--text)'}}>{f.name}</div>
                    <div style={{fontSize:10,color:'var(--text3)'}}>{f.serving} · P:{f.protein}g C:{f.carbs}g F:{f.fat}g</div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{fontSize:13,fontWeight:700,color:'var(--accent)'}}>{f.cal} kcal</div>
                    <button onClick={()=>removeFood(mealType,f.id)} style={{background:'none',border:'none',color:'var(--text3)',cursor:'pointer',fontSize:16,lineHeight:1}}>×</button>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Micronutrients */}
          {Object.values(meals).flat().length>0&&(
            <div className="card fade-up-4" style={{padding:'18px',marginBottom:14}}>
              <div className="label" style={{marginBottom:14}}>Micronutrients</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                {MICROS.map(m=>{
                  const val=totals[m.key]||0;
                  const pct=Math.min(Math.round((val/m.dv)*100),100);
                  return(
                    <div key={m.key}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                        <span style={{fontSize:11,color:'var(--text2)',fontWeight:500}}>{m.label}</span>
                        <span style={{fontSize:10,color:m.color,fontWeight:700}}>{val}{m.unit}</span>
                      </div>
                      <div style={{height:4,background:'var(--surface2)',borderRadius:2,overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${pct}%`,background:m.color,borderRadius:2,transition:'width 0.5s'}}/>
                      </div>
                      <div style={{fontSize:9,color:'var(--text3)',marginTop:2}}>{pct}% of {m.dv}{m.unit}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── HISTORY VIEW ── */}
      {view==='history'&&(
        <div>
          <button onClick={()=>setView('today')} style={{background:'none',border:'none',color:'var(--text3)',fontSize:12,cursor:'pointer',fontFamily:'inherit',marginBottom:16}}>← Today</button>
          {Object.entries(history).sort(([a],[b])=>b.localeCompare(a)).slice(0,14).map(([date,dayMeals])=>{
            const dt=sumMeals(dayMeals);
            return(
              <div key={date} className="card" style={{padding:'16px 18px',marginBottom:10}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <div style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{new Date(date+'T12:00:00').toLocaleDateString('en-IN',{weekday:'short',month:'short',day:'numeric'})}</div>
                  <div style={{fontSize:14,fontWeight:700,color:'var(--accent)'}}>{dt.cal} kcal</div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
                  {[{k:'protein',c:'#43e97b',l:'Protein'},{k:'carbs',c:'#ffd166',l:'Carbs'},{k:'fat',c:'#ff8fab',l:'Fat'}].map(m=>(
                    <div key={m.k} style={{textAlign:'center'}}>
                      <div style={{fontSize:12,fontWeight:700,color:m.c}}>{dt[m.k]}g</div>
                      <div style={{fontSize:9,color:'var(--text3)',letterSpacing:1}}>{m.l.toUpperCase()}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {Object.keys(history).length===0&&<div style={{textAlign:'center',padding:'40px',color:'var(--text3)',fontSize:13}}>No history yet</div>}
        </div>
      )}

      {/* ── TARGETS VIEW ── */}
      {view==='targets'&&(
        <div>
          <button onClick={()=>setView('today')} style={{background:'none',border:'none',color:'var(--text3)',fontSize:12,cursor:'pointer',fontFamily:'inherit',marginBottom:16}}>← Back</button>
          <div className="card" style={{padding:'20px',marginBottom:14}}>
            <div className="label" style={{marginBottom:16}}>Daily Targets</div>
            {[
              {k:'calories',l:'Calories',unit:'kcal'},
              {k:'protein', l:'Protein', unit:'g'},
              {k:'carbs',   l:'Carbs',   unit:'g'},
              {k:'fat',     l:'Fat',     unit:'g'},
              {k:'fiber',   l:'Fiber',   unit:'g'},
              {k:'water',   l:'Water',   unit:'glasses'},
            ].map(f=>(
              <div key={f.k} style={{marginBottom:14}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                  <label style={{fontSize:13,color:'var(--text2)',fontWeight:500}}>{f.l}</label>
                  <span style={{fontSize:12,color:'var(--text3)'}}>{f.unit}</span>
                </div>
                <input type="number" value={editT[f.k]||''} onChange={e=>setEditT({...editT,[f.k]:parseFloat(e.target.value)||0})} style={{padding:'10px 14px'}}/>
              </div>
            ))}
            <button className="btn-primary" onClick={()=>{store.saveTargets(editT);setTargets(editT);setView('today');}}>Save Targets</button>
          </div>
        </div>
      )}

      {/* ── ADD FOOD MODAL ── */}
      {addMode&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:200,display:'flex',flexDirection:'column',backdropFilter:'blur(8px)'}}>
          <div style={{flex:1,overflowY:'auto',padding:'20px 18px 24px',maxWidth:480,width:'100%',margin:'0 auto'}}>

            {/* Modal header */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <div>
                <div style={{fontSize:11,color:'var(--text3)',marginBottom:4,letterSpacing:1}}>ADD TO {activeMeal.toUpperCase()}</div>
                <div className="display" style={{fontSize:20}}>Add Food</div>
              </div>
              <button onClick={()=>{setAddMode(null);setSearchQ('');setResults([]);setIndianQ('');}} style={{width:36,height:36,borderRadius:'50%',background:'var(--surface2)',border:'1px solid var(--border2)',color:'var(--text)',fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
            </div>

            {/* Source tabs */}
            <div style={{display:'flex',gap:8,marginBottom:20,background:'var(--surface)',borderRadius:12,padding:4,border:'1px solid var(--border)'}}>
              {[{id:'search',label:'🌍 USDA'},{id:'indian',label:'🇮🇳 Indian'},{id:'manual',label:'✏️ Manual'}].map(t=>(
                <button key={t.id} onClick={()=>setAddMode(t.id)} style={{flex:1,padding:'9px 4px',borderRadius:8,border:'none',cursor:'pointer',background:addMode===t.id?'linear-gradient(135deg,var(--accent),#8b5cf6)':'transparent',color:addMode===t.id?'#fff':'var(--text2)',fontSize:11,fontWeight:700,fontFamily:'inherit',transition:'all 0.2s'}}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* USDA Search */}
            {addMode==='search'&&(
              <div>
                <div style={{position:'relative',marginBottom:16}}>
                  <input type="text" placeholder="Search any food..." value={searchQ} onChange={e=>setSearchQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&searchUSDA()} style={{paddingRight:80}}/>
                  <button onClick={searchUSDA} disabled={searching||!searchQ.trim()} style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',padding:'8px 14px',background:'linear-gradient(135deg,var(--accent),#8b5cf6)',border:'none',borderRadius:8,color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',opacity:searching||!searchQ.trim()?0.5:1}}>{searching?'...':'Search'}</button>
                </div>
                {searching&&<div style={{textAlign:'center',padding:'20px',color:'var(--text3)',fontSize:13}}>Searching USDA database...</div>}
                {results.map((food,i)=>(
                  <div key={i} className="card" style={{padding:'14px',marginBottom:8}}>
                    <div style={{fontSize:13,fontWeight:600,color:'var(--text)',marginBottom:2}}>{food.name}</div>
                    {food.brand&&<div style={{fontSize:10,color:'var(--text3)',marginBottom:6}}>{food.brand}</div>}
                    <div style={{fontSize:11,color:'var(--text2)',marginBottom:8}}>Per {food.serving}: {food.cal||0}kcal · P:{food.protein||0}g · C:{food.carbs||0}g · F:{food.fat||0}g</div>
                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                      <input type="number" min="0.5" step="0.5" value={servings[food.id]||1} onChange={e=>setServings({...servings,[food.id]:parseFloat(e.target.value)||1})} style={{width:60,padding:'6px 8px',fontSize:13}} placeholder="1"/>
                      <span style={{fontSize:11,color:'var(--text3)'}}>× serving</span>
                      <button onClick={()=>addFood(food,'usda')} style={{marginLeft:'auto',padding:'8px 16px',background:'linear-gradient(135deg,var(--accent),#8b5cf6)',border:'none',borderRadius:8,color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Add</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Indian foods */}
            {addMode==='indian'&&(
              <div>
                <input type="text" placeholder="Search Indian foods..." value={indianQ} onChange={e=>setIndianQ(e.target.value)} style={{marginBottom:12}}/>
                {/* Category tabs */}
                <div style={{display:'flex',gap:6,marginBottom:14,overflowX:'auto',paddingBottom:4,scrollbarWidth:'none'}}>
                  {indianCategories.map(cat=>(
                    <button key={cat} onClick={()=>setActiveCategory(cat)} style={{flexShrink:0,padding:'5px 12px',background:activeCategory===cat?'var(--accent)':'var(--surface)',border:'1px solid var(--border)',borderRadius:20,color:activeCategory===cat?'#fff':'var(--text3)',fontSize:10,fontWeight:700,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}}>{cat}</button>
                  ))}
                </div>
                <div style={{maxHeight:420,overflowY:'auto'}}>
                  {filteredIndian.map((food,i)=>(
                    <div key={i} className="card" style={{padding:'14px',marginBottom:8}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
                        <div style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{food.name}</div>
                        <span style={{fontSize:9,fontWeight:700,padding:'2px 8px',borderRadius:20,background:'rgba(108,99,255,0.15)',color:'var(--accent)',letterSpacing:1}}>{food.category}</span>
                      </div>
                      <div style={{fontSize:11,color:'var(--text2)',marginBottom:6}}>Per {food.serving||'serving'}: {food.cal}kcal · P:{food.protein}g · C:{food.carbs}g · F:{food.fat}g</div>
                      <div style={{fontSize:10,color:'var(--text3)',marginBottom:8}}>Fiber:{food.fiber||0}g · Na:{food.sodium||0}mg · Ca:{food.calcium||0}mg · Fe:{food.iron||0}mg</div>
                      <div style={{display:'flex',gap:8,alignItems:'center'}}>
                        <input type="number" min="0.5" step="0.5" value={servings[food.name]||1} onChange={e=>setServings({...servings,[food.name]:parseFloat(e.target.value)||1})} style={{width:60,padding:'6px 8px',fontSize:13}} placeholder="1"/>
                        <span style={{fontSize:11,color:'var(--text3)'}}>× serving</span>
                        <button onClick={()=>addFood({...food,id:food.name},'indian')} style={{marginLeft:'auto',padding:'8px 16px',background:'linear-gradient(135deg,var(--accent),#8b5cf6)',border:'none',borderRadius:8,color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Add</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Manual entry */}
            {addMode==='manual'&&(
              <div>
                <div className="label" style={{marginBottom:12}}>Enter Nutrition Info</div>
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:11,color:'var(--text3)',marginBottom:4}}>FOOD NAME *</div>
                  <input type="text" placeholder="e.g. Homemade Dal" value={manual.name} onChange={e=>setManual({...manual,name:e.target.value})}/>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                  {[
                    {k:'cal',l:'Calories (kcal) *',placeholder:'e.g. 250'},
                    {k:'protein',l:'Protein (g)',placeholder:'e.g. 12'},
                    {k:'carbs',l:'Carbs (g)',placeholder:'e.g. 30'},
                    {k:'fat',l:'Fat (g)',placeholder:'e.g. 8'},
                    {k:'fiber',l:'Fiber (g)',placeholder:'e.g. 4'},
                    {k:'sodium',l:'Sodium (mg)',placeholder:'e.g. 300'},
                    {k:'potassium',l:'Potassium (mg)',placeholder:'e.g. 200'},
                    {k:'calcium',l:'Calcium (mg)',placeholder:'e.g. 50'},
                    {k:'iron',l:'Iron (mg)',placeholder:'e.g. 2'},
                    {k:'vitC',l:'Vitamin C (mg)',placeholder:'e.g. 10'},
                    {k:'vitD',l:'Vitamin D (mcg)',placeholder:'e.g. 0'},
                    {k:'vitB12',l:'Vitamin B12 (mcg)',placeholder:'e.g. 0'},
                    {k:'magnesium',l:'Magnesium (mg)',placeholder:'e.g. 30'},
                    {k:'zinc',l:'Zinc (mg)',placeholder:'e.g. 1'},
                    {k:'omega3',l:'Omega-3 (g)',placeholder:'e.g. 0'},
                  ].map(f=>(
                    <div key={f.k}>
                      <div style={{fontSize:9,fontWeight:700,letterSpacing:1.5,color:'var(--text3)',textTransform:'uppercase',marginBottom:4}}>{f.l}</div>
                      <input type="number" min="0" step="0.1" placeholder={f.placeholder} value={manual[f.k]} onChange={e=>setManual({...manual,[f.k]:e.target.value})} style={{padding:'9px 12px',fontSize:13}}/>
                    </div>
                  ))}
                </div>
                <button className="btn-primary" onClick={addManual} disabled={!manual.name||!manual.cal}>Add Food</button>
              </div>
            )}
          </div>
        </div>
      )}

      <BottomNav/>
    </div>
  );
}
