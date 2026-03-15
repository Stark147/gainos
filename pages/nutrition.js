import { useState, useEffect, useRef } from 'react';
import BottomNav from '../components/BottomNav';

const store = {
  getLogs(){ if(typeof window==='undefined')return{}; try{return JSON.parse(localStorage.getItem('gn_logs')||'{}')}catch{return{}} },
  saveLog(date,meals){ const a=this.getLogs(); a[date]=meals; localStorage.setItem('gn_logs',JSON.stringify(a)) },
  getTargets(){ if(typeof window==='undefined')return DEF; try{return JSON.parse(localStorage.getItem('gn_targets')||'null')||DEF}catch{return DEF} },
  saveTargets(t){ localStorage.setItem('gn_targets',JSON.stringify(t)) },
  getWater(d){ if(typeof window==='undefined')return 0; try{return JSON.parse(localStorage.getItem('gn_water')||'{}')[d]||0}catch{return 0} },
  saveWater(d,v){ const a=JSON.parse(localStorage.getItem('gn_water')||'{}'); a[d]=v; localStorage.setItem('gn_water',JSON.stringify(a)) },
};

const TODAY = new Date().toISOString().split('T')[0];
const DEF = { calories:2000, protein:150, carbs:200, fat:65, fiber:30, water:8 };
const MEAL_TYPES = ['Breakfast','Lunch','Dinner','Snacks'];

// ─── Complete Food Database ─────────────────────────────────
const FOOD_DB = [
  // ── Indian: Dal & Legumes ──
  {name:'Dal Tadka',cal:150,protein:9,carbs:20,fat:4,fiber:5,sodium:380,potassium:440,calcium:40,iron:2.5,vitC:2,serving:'1 cup (200g)',category:'Indian'},
  {name:'Dal Makhani',cal:220,protein:10,carbs:24,fat:9,fiber:6,sodium:420,potassium:480,calcium:60,iron:3,vitC:1,serving:'1 cup (200g)',category:'Indian'},
  {name:'Chana Masala',cal:180,protein:10,carbs:26,fat:5,fiber:7,sodium:350,potassium:420,calcium:55,iron:3.5,vitC:4,serving:'1 cup (200g)',category:'Indian'},
  {name:'Rajma Masala',cal:200,protein:11,carbs:28,fat:5,fiber:8,sodium:340,potassium:500,calcium:50,iron:3,vitC:2,serving:'1 cup (200g)',category:'Indian'},
  {name:'Moong Dal',cal:120,protein:8,carbs:16,fat:1,fiber:4,sodium:180,potassium:340,calcium:30,iron:2,serving:'1 cup (200g)',category:'Indian'},
  {name:'Masoor Dal',cal:130,protein:9,carbs:18,fat:1,fiber:5,sodium:200,potassium:360,calcium:35,iron:2.5,serving:'1 cup (200g)',category:'Indian'},
  {name:'Sambar',cal:90,protein:4,carbs:12,fat:3,fiber:4,sodium:310,potassium:280,calcium:40,iron:1.5,vitC:8,serving:'1 cup (200g)',category:'Indian'},
  {name:'Chole',cal:270,protein:14,carbs:40,fat:7,fiber:10,sodium:480,potassium:520,calcium:90,iron:5,vitC:3,serving:'1 cup (200g)',category:'Indian'},
  {name:'Urad Dal',cal:160,protein:11,carbs:22,fat:1,fiber:6,sodium:10,potassium:380,calcium:50,iron:3,serving:'1 cup cooked',category:'Indian'},
  // ── Indian: Rice & Grains ──
  {name:'Basmati Rice',cal:200,protein:4,carbs:44,fat:0.5,fiber:0.6,sodium:5,potassium:55,calcium:10,iron:0.4,serving:'1 cup cooked',category:'Indian'},
  {name:'Brown Rice',cal:215,protein:5,carbs:45,fat:1.5,fiber:3.5,sodium:5,potassium:85,calcium:20,iron:1,serving:'1 cup cooked',category:'Indian'},
  {name:'Jeera Rice',cal:220,protein:4,carbs:46,fat:3,fiber:0.8,sodium:120,potassium:60,calcium:12,iron:0.6,serving:'1 cup',category:'Indian'},
  {name:'Chicken Biryani',cal:450,protein:28,carbs:55,fat:14,fiber:2,sodium:740,potassium:460,calcium:50,iron:3,vitC:3,serving:'1 plate (350g)',category:'Indian'},
  {name:'Veg Biryani',cal:350,protein:9,carbs:58,fat:10,fiber:4,sodium:580,potassium:380,calcium:60,iron:2,serving:'1 plate (300g)',category:'Indian'},
  {name:'Khichdi',cal:200,protein:8,carbs:35,fat:4,fiber:3,sodium:280,potassium:240,calcium:30,iron:1.5,serving:'1 cup',category:'Indian'},
  {name:'Poha',cal:180,protein:3,carbs:38,fat:3,fiber:2,sodium:240,potassium:120,calcium:15,iron:1.2,vitC:5,serving:'1 plate (150g)',category:'Indian'},
  {name:'Upma',cal:160,protein:4,carbs:28,fat:5,fiber:2,sodium:320,potassium:140,calcium:20,iron:1,serving:'1 plate (150g)',category:'Indian'},
  {name:'Pongal',cal:250,protein:7,carbs:40,fat:8,fiber:2,sodium:300,potassium:160,calcium:30,iron:1.5,serving:'1 cup',category:'Indian'},
  // ── Indian: Bread ──
  {name:'Wheat Roti',cal:100,protein:3,carbs:20,fat:1,fiber:2.5,sodium:1,potassium:80,calcium:15,iron:1,serving:'1 piece (40g)',category:'Indian'},
  {name:'Paratha',cal:200,protein:4,carbs:30,fat:7,fiber:2,sodium:180,potassium:100,calcium:20,iron:1.2,serving:'1 piece (80g)',category:'Indian'},
  {name:'Aloo Paratha',cal:280,protein:5,carbs:40,fat:10,fiber:3,sodium:220,potassium:280,calcium:25,iron:1.5,vitC:8,serving:'1 piece (100g)',category:'Indian'},
  {name:'Naan',cal:260,protein:8,carbs:44,fat:6,fiber:1.5,sodium:380,potassium:110,calcium:55,iron:2,serving:'1 piece (90g)',category:'Indian'},
  {name:'Puri',cal:150,protein:2.5,carbs:18,fat:7,fiber:1,sodium:80,potassium:40,calcium:10,iron:0.8,serving:'1 piece (50g)',category:'Indian'},
  {name:'Missi Roti',cal:130,protein:5,carbs:22,fat:2,fiber:3,sodium:80,potassium:120,calcium:25,iron:1.5,serving:'1 piece',category:'Indian'},
  {name:'Bhatura',cal:220,protein:5,carbs:30,fat:9,fiber:1,sodium:200,potassium:60,calcium:20,iron:1,serving:'1 piece (80g)',category:'Indian'},
  // ── Indian: Sabzi ──
  {name:'Palak Paneer',cal:240,protein:14,carbs:10,fat:16,fiber:3,sodium:380,potassium:380,calcium:280,iron:4,vitC:18,serving:'1 cup (200g)',category:'Indian'},
  {name:'Paneer Butter Masala',cal:320,protein:15,carbs:12,fat:24,fiber:2,sodium:480,potassium:280,calcium:300,iron:1.5,vitC:8,serving:'1 cup (200g)',category:'Indian'},
  {name:'Paneer Bhurji',cal:260,protein:16,carbs:6,fat:18,fiber:1,sodium:380,potassium:240,calcium:320,iron:1.5,serving:'1 cup (150g)',category:'Indian'},
  {name:'Aloo Gobi',cal:150,protein:3,carbs:22,fat:5,fiber:4,sodium:280,potassium:380,calcium:40,iron:1.5,vitC:45,serving:'1 cup (200g)',category:'Indian'},
  {name:'Bhindi Masala',cal:120,protein:2,carbs:14,fat:6,fiber:4,sodium:260,potassium:300,calcium:55,iron:0.8,vitC:18,serving:'1 cup (150g)',category:'Indian'},
  {name:'Baingan Bharta',cal:130,protein:3,carbs:15,fat:6,fiber:5,sodium:280,potassium:380,calcium:40,iron:1,vitC:6,serving:'1 cup (200g)',category:'Indian'},
  {name:'Matar Paneer',cal:260,protein:13,carbs:14,fat:17,fiber:4,sodium:360,potassium:280,calcium:250,iron:2,vitC:12,serving:'1 cup (200g)',category:'Indian'},
  {name:'Saag',cal:100,protein:4,carbs:10,fat:5,fiber:4,sodium:240,potassium:420,calcium:180,iron:3.5,vitC:20,serving:'1 cup (200g)',category:'Indian'},
  {name:'Aloo Matar',cal:170,protein:4,carbs:26,fat:5,fiber:4,sodium:300,potassium:380,calcium:30,iron:1.5,vitC:20,serving:'1 cup (200g)',category:'Indian'},
  {name:'Capsicum Sabzi',cal:90,protein:2,carbs:12,fat:4,fiber:3,sodium:200,potassium:220,calcium:20,iron:0.8,vitC:80,serving:'1 cup',category:'Indian'},
  {name:'Mix Veg Curry',cal:140,protein:4,carbs:18,fat:6,fiber:4,sodium:300,potassium:340,calcium:60,iron:1.5,vitC:20,serving:'1 cup (200g)',category:'Indian'},
  // ── Indian: Chicken ──
  {name:'Chicken Curry',cal:280,protein:28,carbs:8,fat:15,fiber:1,sodium:480,potassium:420,calcium:30,iron:1.5,vitC:4,serving:'1 cup (200g)',category:'Indian'},
  {name:'Butter Chicken',cal:320,protein:25,carbs:12,fat:20,fiber:1,sodium:560,potassium:380,calcium:35,iron:1.2,vitC:6,serving:'1 cup (200g)',category:'Indian'},
  {name:'Tandoori Chicken',cal:280,protein:35,carbs:5,fat:12,fiber:1,sodium:680,potassium:480,calcium:40,iron:2,vitC:3,serving:'2 pieces (200g)',category:'Indian'},
  {name:'Chicken Tikka Masala',cal:300,protein:26,carbs:10,fat:18,fiber:1.5,sodium:520,potassium:400,calcium:35,iron:1.5,vitC:8,serving:'1 cup (200g)',category:'Indian'},
  {name:'Chicken Seekh Kebab',cal:200,protein:22,carbs:4,fat:10,fiber:0.5,sodium:420,potassium:320,calcium:20,iron:1.5,vitC:2,serving:'2 pieces (120g)',category:'Indian'},
  {name:'Chicken Korma',cal:340,protein:24,carbs:10,fat:22,fiber:1,sodium:500,potassium:360,calcium:40,iron:1.5,serving:'1 cup',category:'Indian'},
  // ── Indian: Snacks ──
  {name:'Samosa',cal:250,protein:4,carbs:30,fat:13,fiber:2,sodium:380,potassium:180,calcium:20,iron:1.5,vitC:5,serving:'1 piece (80g)',category:'Indian'},
  {name:'Vada Pav',cal:290,protein:6,carbs:40,fat:12,fiber:2.5,sodium:480,potassium:220,calcium:30,iron:1.5,vitC:8,serving:'1 piece',category:'Indian'},
  {name:'Idli',cal:140,protein:4,carbs:28,fat:0.5,fiber:1,sodium:200,potassium:80,calcium:15,iron:0.8,serving:'2 pieces (100g)',category:'Indian'},
  {name:'Dosa',cal:180,protein:4,carbs:32,fat:4,fiber:1.5,sodium:300,potassium:100,calcium:20,iron:1,serving:'1 piece (90g)',category:'Indian'},
  {name:'Masala Dosa',cal:280,protein:6,carbs:45,fat:9,fiber:3,sodium:480,potassium:280,calcium:30,iron:1.5,vitC:8,serving:'1 piece',category:'Indian'},
  {name:'Medu Vada',cal:160,protein:5,carbs:18,fat:8,fiber:2,sodium:280,potassium:120,calcium:25,iron:1.2,serving:'1 piece (60g)',category:'Indian'},
  {name:'Dhokla',cal:150,protein:6,carbs:22,fat:4,fiber:1.5,sodium:380,potassium:140,calcium:40,iron:1,serving:'2 pieces (80g)',category:'Indian'},
  {name:'Pani Puri',cal:200,protein:4,carbs:36,fat:5,fiber:3,sodium:480,potassium:200,calcium:30,iron:1.5,vitC:4,serving:'6 pieces',category:'Indian'},
  {name:'Bhel Puri',cal:180,protein:4,carbs:30,fat:5,fiber:2,sodium:420,potassium:180,calcium:25,iron:1,serving:'1 plate',category:'Indian'},
  {name:'Kachori',cal:280,protein:5,carbs:32,fat:15,fiber:3,sodium:320,potassium:160,calcium:25,iron:1.5,serving:'1 piece (80g)',category:'Indian'},
  {name:'Pakora (Veg)',cal:200,protein:4,carbs:24,fat:10,fiber:2,sodium:360,potassium:180,calcium:30,iron:1,serving:'4 pieces',category:'Indian'},
  {name:'Chole Bhature',cal:650,protein:18,carbs:85,fat:25,fiber:10,sodium:680,potassium:520,calcium:90,iron:5,vitC:3,serving:'1 plate',category:'Indian'},
  // ── Indian: Dairy ──
  {name:'Paneer',cal:265,protein:18,carbs:3.5,fat:20,fiber:0,sodium:28,potassium:160,calcium:480,iron:0.5,vitD:0.5,vitB12:0.4,serving:'100g',category:'Indian'},
  {name:'Curd / Dahi',cal:60,protein:3.5,carbs:4,fat:3,fiber:0,sodium:46,potassium:155,calcium:120,iron:0.1,vitB12:0.4,serving:'100g',category:'Indian'},
  {name:'Lassi',cal:180,protein:7,carbs:25,fat:5,fiber:0,sodium:80,potassium:260,calcium:220,iron:0.2,vitB12:0.5,serving:'1 glass (250ml)',category:'Indian'},
  {name:'Chaas / Buttermilk',cal:60,protein:3,carbs:5,fat:2,fiber:0,sodium:120,potassium:180,calcium:115,iron:0.1,serving:'1 glass (250ml)',category:'Indian'},
  {name:'Ghee',cal:135,protein:0,carbs:0,fat:15,fiber:0,sodium:0,potassium:1,calcium:0,iron:0,vitA:110,satFat:9,serving:'1 tbsp (15g)',category:'Indian'},
  {name:'Masala Chai',cal:80,protein:2,carbs:12,fat:3,fiber:0,sodium:40,potassium:80,calcium:80,iron:0.2,serving:'1 cup (200ml)',category:'Indian'},
  {name:'Mango Lassi',cal:220,protein:6,carbs:40,fat:4,fiber:1,sodium:70,potassium:340,calcium:200,iron:0.3,vitC:20,vitA:80,serving:'1 glass (300ml)',category:'Indian'},
  // ── Eggs ──
  {name:'Boiled Egg',cal:78,protein:6,carbs:0.6,fat:5,fiber:0,sodium:62,potassium:63,calcium:28,iron:0.6,vitD:1.1,vitB12:0.6,vitA:75,cholesterol:186,serving:'1 large egg (50g)',category:'Eggs'},
  {name:'Egg Bhurji',cal:200,protein:14,carbs:4,fat:14,fiber:0.5,sodium:380,potassium:180,calcium:60,iron:1.5,vitD:2,vitB12:1.2,vitA:150,cholesterol:370,serving:'2 eggs',category:'Eggs'},
  {name:'Omelette',cal:190,protein:13,carbs:2,fat:14,fiber:0,sodium:340,potassium:160,calcium:55,iron:1.2,vitD:1.8,vitB12:1,cholesterol:360,serving:'2 eggs',category:'Eggs'},
  {name:'Egg Curry',cal:220,protein:14,carbs:8,fat:14,fiber:1,sodium:420,potassium:240,calcium:60,iron:1.5,vitD:2,vitB12:1,cholesterol:370,serving:'2 eggs + curry',category:'Eggs'},
  {name:'Egg White',cal:17,protein:3.6,carbs:0.2,fat:0,fiber:0,sodium:55,potassium:54,calcium:2,iron:0,vitB12:0.1,serving:'1 white (33g)',category:'Eggs'},
  {name:'Scrambled Eggs',cal:210,protein:14,carbs:2,fat:16,fiber:0,sodium:340,potassium:140,calcium:60,iron:1.2,vitD:2,vitB12:1.2,cholesterol:400,serving:'2 eggs + butter',category:'Eggs'},
  // ── Protein Foods ──
  {name:'Chicken Breast',cal:165,protein:31,carbs:0,fat:3.6,fiber:0,sodium:74,potassium:256,calcium:15,iron:1,vitB12:0.3,serving:'100g cooked',category:'Protein'},
  {name:'Chicken Thigh',cal:209,protein:26,carbs:0,fat:11,fiber:0,sodium:88,potassium:220,calcium:12,iron:1.1,vitB12:0.3,serving:'100g cooked',category:'Protein'},
  {name:'Salmon',cal:208,protein:22,carbs:0,fat:13,fiber:0,sodium:58,potassium:380,calcium:15,iron:0.8,vitD:11,vitB12:3.2,omega3:2.3,serving:'100g cooked',category:'Protein'},
  {name:'Tuna (canned)',cal:130,protein:28,carbs:0,fat:1,fiber:0,sodium:360,potassium:280,calcium:15,iron:1.3,vitD:4,vitB12:2.5,omega3:0.5,serving:'100g',category:'Protein'},
  {name:'Soya Chunks',cal:345,protein:52,carbs:28,fat:0.5,fiber:13,sodium:8,potassium:2100,calcium:240,iron:10,serving:'100g dry',category:'Protein'},
  {name:'Tofu',cal:76,protein:8,carbs:2,fat:4,fiber:0.3,sodium:7,potassium:121,calcium:350,iron:2.7,serving:'100g',category:'Protein'},
  {name:'Paneer (raw)',cal:265,protein:18,carbs:3.5,fat:20,fiber:0,sodium:28,potassium:160,calcium:480,iron:0.5,serving:'100g',category:'Protein'},
  {name:'Sprouts',cal:85,protein:6,carbs:12,fat:0.5,fiber:4,sodium:20,potassium:280,calcium:40,iron:2.5,vitC:14,serving:'1 cup (100g)',category:'Protein'},
  {name:'Whey Protein',cal:120,protein:25,carbs:3,fat:1.5,fiber:0,sodium:120,potassium:180,calcium:120,iron:0.5,vitB12:0.5,serving:'1 scoop (30g)',category:'Protein'},
  {name:'Greek Yogurt',cal:100,protein:17,carbs:6,fat:0.7,fiber:0,sodium:65,potassium:240,calcium:190,iron:0.1,vitB12:1.3,serving:'170g',category:'Protein'},
  // ── Cereals & Grains ──
  {name:'Oats',cal:158,protein:6,carbs:27,fat:3.2,fiber:4,sodium:9,potassium:164,calcium:21,iron:2,magnesium:63,zinc:1.1,serving:'1 cup cooked',category:'Grains'},
  {name:'Whole Wheat Bread',cal:81,protein:4,carbs:15,fat:1,fiber:2,sodium:144,potassium:78,calcium:23,iron:1,serving:'1 slice (32g)',category:'Grains'},
  {name:'White Bread',cal:80,protein:2.7,carbs:15,fat:1,fiber:0.6,sodium:142,potassium:31,calcium:38,iron:0.8,serving:'1 slice (30g)',category:'Grains'},
  {name:'Cornflakes',cal:113,protein:2,carbs:25,fat:0.2,fiber:1,sodium:203,potassium:26,calcium:1,iron:2.7,vitD:1,vitB12:0.4,serving:'30g',category:'Grains'},
  {name:'Quinoa',cal:222,protein:8,carbs:39,fat:3.5,fiber:5,sodium:13,potassium:318,calcium:31,iron:2.8,magnesium:118,serving:'1 cup cooked',category:'Grains'},
  {name:'Muesli',cal:200,protein:6,carbs:38,fat:4,fiber:4,sodium:80,potassium:220,calcium:40,iron:2.5,serving:'50g',category:'Grains'},
  // ── Fruits ──
  {name:'Banana',cal:105,protein:1.3,carbs:27,fat:0.4,fiber:3.1,sodium:1,potassium:422,calcium:6,iron:0.3,vitC:10.3,serving:'1 medium (118g)',category:'Fruits'},
  {name:'Apple',cal:95,protein:0.5,carbs:25,fat:0.3,fiber:4.4,sodium:2,potassium:195,calcium:11,iron:0.2,vitC:8.4,serving:'1 medium (182g)',category:'Fruits'},
  {name:'Mango',cal:200,protein:2.8,carbs:50,fat:1.3,fiber:5.4,sodium:3,potassium:564,calcium:27,iron:0.8,vitC:122,vitA:181,serving:'1 medium (200g)',category:'Fruits'},
  {name:'Orange',cal:62,protein:1.2,carbs:15,fat:0.2,fiber:3.1,sodium:1,potassium:237,calcium:52,iron:0.1,vitC:70,folate:40,serving:'1 medium (131g)',category:'Fruits'},
  {name:'Papaya',cal:62,protein:0.7,carbs:16,fat:0.4,fiber:2.5,sodium:12,potassium:360,calcium:34,iron:0.3,vitC:87,vitA:149,serving:'1 cup (145g)',category:'Fruits'},
  {name:'Guava',cal:68,protein:2.6,carbs:14,fat:1,fiber:5.4,sodium:2,potassium:417,calcium:30,iron:0.3,vitC:228,serving:'1 medium (100g)',category:'Fruits'},
  {name:'Watermelon',cal:46,protein:0.9,carbs:11.5,fat:0.2,fiber:0.6,sodium:2,potassium:170,calcium:11,iron:0.4,vitC:12,vitA:43,serving:'1 cup (154g)',category:'Fruits'},
  {name:'Grapes',cal:104,protein:1.1,carbs:27,fat:0.2,fiber:1.4,sodium:3,potassium:288,calcium:15,iron:0.5,vitC:16,vitK:22,serving:'1 cup (151g)',category:'Fruits'},
  {name:'Pomegranate',cal:83,protein:1.7,carbs:19,fat:1.2,fiber:4,sodium:3,potassium:236,calcium:10,iron:0.3,vitC:10.2,folate:38,serving:'1/2 cup seeds',category:'Fruits'},
  {name:'Strawberry',cal:49,protein:1,carbs:12,fat:0.5,fiber:3,sodium:1,potassium:233,calcium:27,iron:0.6,vitC:97,folate:36,serving:'1 cup (152g)',category:'Fruits'},
  // ── Vegetables (raw/cooked) ──
  {name:'Broccoli',cal:55,protein:3.7,carbs:11,fat:0.6,fiber:5.1,sodium:64,potassium:457,calcium:62,iron:1,vitC:101,vitK:220,vitA:120,folate:168,serving:'1 cup (156g)',category:'Vegetables'},
  {name:'Spinach (cooked)',cal:41,protein:5.4,carbs:7,fat:0.5,fiber:4.3,sodium:126,potassium:839,calcium:245,iron:6.4,vitC:18,vitA:943,folate:263,serving:'1 cup (180g)',category:'Vegetables'},
  {name:'Tomato',cal:35,protein:1.7,carbs:7.7,fat:0.4,fiber:2.4,sodium:9,potassium:427,calcium:18,iron:0.5,vitC:34,vitA:75,serving:'1 medium (148g)',category:'Vegetables'},
  {name:'Cucumber',cal:16,protein:0.7,carbs:3.6,fat:0.1,fiber:0.5,sodium:2,potassium:152,calcium:16,iron:0.3,vitC:3.8,vitK:17,serving:'1 cup (119g)',category:'Vegetables'},
  {name:'Carrot',cal:52,protein:1.2,carbs:12,fat:0.3,fiber:3.6,sodium:88,potassium:410,calcium:42,iron:0.3,vitC:7.6,vitA:1069,serving:'1 medium (61g)',category:'Vegetables'},
  {name:'Onion',cal:46,protein:1,carbs:11,fat:0.1,fiber:1.9,sodium:5,potassium:190,calcium:23,iron:0.2,vitC:12,folate:19,serving:'1 medium (110g)',category:'Vegetables'},
  {name:'Cabbage',cal:22,protein:1.1,carbs:5,fat:0.1,fiber:2.5,sodium:16,potassium:170,calcium:40,iron:0.4,vitC:37,vitK:76,folate:38,serving:'1 cup (89g)',category:'Vegetables'},
  {name:'Sweet Potato',cal:103,protein:2.3,carbs:24,fat:0.1,fiber:3.8,sodium:41,potassium:542,calcium:39,iron:0.8,vitC:22,vitA:1096,serving:'1 medium (130g)',category:'Vegetables'},
  // ── Nuts & Seeds ──
  {name:'Almonds',cal:164,protein:6,carbs:6,fat:14,fiber:3.5,sodium:0,potassium:208,calcium:76,iron:1,magnesium:76,zinc:0.9,vitE:7.3,serving:'28g (~23 nuts)',category:'Nuts'},
  {name:'Peanuts',cal:161,protein:7,carbs:5,fat:14,fiber:2.4,sodium:5,potassium:200,calcium:15,iron:0.6,magnesium:49,serving:'28g',category:'Nuts'},
  {name:'Walnuts',cal:185,protein:4,carbs:4,fat:18,fiber:2,sodium:1,potassium:125,calcium:28,iron:0.8,omega3:2.5,magnesium:45,serving:'28g',category:'Nuts'},
  {name:'Cashews',cal:157,protein:5,carbs:9,fat:12,fiber:1,sodium:3,potassium:187,calcium:10,iron:1.9,magnesium:83,zinc:1.6,serving:'28g (~18 nuts)',category:'Nuts'},
  {name:'Peanut Butter',cal:188,protein:8,carbs:6,fat:16,fiber:2,sodium:148,potassium:200,calcium:14,iron:0.6,magnesium:57,serving:'2 tbsp (32g)',category:'Nuts'},
  {name:'Flaxseeds',cal:37,protein:1.3,carbs:2,fat:3,fiber:2,sodium:2,potassium:84,calcium:26,iron:0.6,omega3:1.6,serving:'1 tbsp (10g)',category:'Nuts'},
  {name:'Chia Seeds',cal:58,protein:2,carbs:5,fat:3.5,fiber:5,sodium:2,potassium:80,calcium:88,iron:1,omega3:1.8,magnesium:47,serving:'1 tbsp (12g)',category:'Nuts'},
  {name:'Sunflower Seeds',cal:165,protein:5.5,carbs:7,fat:14,fiber:3,sodium:1,potassium:241,calcium:21,iron:1.5,magnesium:91,vitE:7.4,serving:'28g',category:'Nuts'},
  // ── Dairy ──
  {name:'Full Fat Milk',cal:150,protein:8,carbs:12,fat:8,fiber:0,sodium:105,potassium:349,calcium:276,iron:0.1,vitD:2.5,vitB12:1.1,vitA:75,serving:'1 glass (240ml)',category:'Dairy'},
  {name:'Skimmed Milk',cal:83,protein:8,carbs:12,fat:0.2,fiber:0,sodium:103,potassium:382,calcium:299,iron:0.1,vitD:2.5,vitB12:1.2,serving:'1 glass (240ml)',category:'Dairy'},
  {name:'Cheese (Cheddar)',cal:113,protein:7,carbs:0.4,fat:9,fiber:0,sodium:180,potassium:36,calcium:202,iron:0.2,vitD:0.3,vitB12:0.3,vitA:75,cholesterol:29,serving:'28g / 1 slice',category:'Dairy'},
  {name:'Butter',cal:102,protein:0.1,carbs:0,fat:11.5,fiber:0,sodium:91,potassium:3,calcium:3,iron:0,vitA:97,satFat:7.3,cholesterol:31,serving:'1 tbsp (14g)',category:'Dairy'},
  {name:'Coconut Milk',cal:230,protein:2.3,carbs:6,fat:24,fiber:2.2,sodium:15,potassium:263,calcium:16,iron:3.3,serving:'1 cup (240ml)',category:'Dairy'},
  // ── Beverages ──
  {name:'Black Coffee',cal:5,protein:0.3,carbs:0,fat:0,fiber:0,sodium:5,potassium:116,calcium:5,iron:0.1,serving:'1 cup (240ml)',category:'Beverages'},
  {name:'Green Tea',cal:2,protein:0,carbs:0,fat:0,fiber:0,sodium:2,potassium:20,calcium:2,iron:0.2,serving:'1 cup (240ml)',category:'Beverages'},
  {name:'Coconut Water',cal:45,protein:1.7,carbs:8.9,fat:0.5,fiber:2.6,sodium:252,potassium:600,calcium:58,iron:0.7,vitC:5.8,magnesium:60,serving:'1 glass (240ml)',category:'Beverages'},
  {name:'Orange Juice',cal:110,protein:1.7,carbs:26,fat:0.5,fiber:0.5,sodium:2,potassium:496,calcium:27,iron:0.4,vitC:124,folate:74,serving:'1 glass (240ml)',category:'Beverages'},
  {name:'Protein Shake',cal:120,protein:25,carbs:5,fat:1.5,fiber:0,sodium:120,potassium:180,calcium:120,iron:0.5,vitB12:0.5,serving:'1 scoop in water',category:'Beverages'},
  // ── Fast Food (common) ──
  {name:'McAloo Tikki Burger',cal:300,protein:8,carbs:42,fat:12,fiber:3,sodium:560,potassium:320,calcium:80,iron:2,serving:'1 burger',category:'Fast Food'},
  {name:'Veg Pizza (medium slice)',cal:250,protein:10,carbs:32,fat:9,fiber:2,sodium:520,potassium:200,calcium:150,iron:1.5,serving:'1 slice',category:'Fast Food'},
  {name:'Chicken Burger',cal:400,protein:20,carbs:40,fat:18,fiber:2,sodium:680,potassium:280,calcium:80,iron:2.5,serving:'1 burger',category:'Fast Food'},
  {name:'French Fries (medium)',cal:320,protein:4,carbs:44,fat:15,fiber:3,sodium:400,potassium:560,calcium:14,iron:1,vitC:8,serving:'1 medium',category:'Fast Food'},
  {name:'Maggi Noodles',cal:350,protein:8,carbs:52,fat:12,fiber:1,sodium:900,potassium:120,calcium:20,iron:1.5,serving:'1 pack (70g)',category:'Fast Food'},
];

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

const CATS = ['All',...[...new Set(FOOD_DB.map(f=>f.category))]];

function sumMeals(meals){
  const t={cal:0,protein:0,carbs:0,fat:0,fiber:0,sugar:0,sodium:0,potassium:0,calcium:0,iron:0,vitC:0,vitD:0,vitB12:0,magnesium:0,zinc:0,omega3:0,vitA:0,folate:0,cholesterol:0,satFat:0};
  Object.values(meals).flat().forEach(item=>{ Object.keys(t).forEach(k=>{ t[k]+=item[k]||0 }) });
  Object.keys(t).forEach(k=>{ t[k]=Math.round(t[k]*10)/10 });
  return t;
}

function Bar({pct,color,h=6}){
  return(
    <div style={{height:h,background:'var(--surface2)',borderRadius:3,overflow:'hidden',flex:1}}>
      <div style={{height:'100%',width:`${Math.min(pct,100)}%`,background:color,borderRadius:3,transition:'width 0.5s ease'}}/>
    </div>
  );
}

const BLANK={name:'',cal:'',protein:'',carbs:'',fat:'',fiber:'',sodium:'',potassium:'',calcium:'',iron:'',vitC:'',vitD:'',vitB12:'',magnesium:'',zinc:'',omega3:''};

export default function Nutrition(){
  const [meals,setMeals]         = useState({Breakfast:[],Lunch:[],Dinner:[],Snacks:[]});
  const [targets,setTargets]     = useState(DEF);
  const [water,setWater]         = useState(0);
  const [view,setView]           = useState('today');
  const [showAdd,setShowAdd]     = useState(false);
  const [addTab,setAddTab]       = useState('db');   // db | manual
  const [activeMeal,setActiveMeal]= useState('Breakfast');
  const [searchQ,setSearchQ]     = useState('');
  const [activeCat,setActiveCat] = useState('All');
  const [dropdown,setDropdown]   = useState([]);
  const [manual,setManual]       = useState(BLANK);
  const [servings,setServings]   = useState({});
  const [history,setHistory]     = useState({});
  const [editT,setEditT]         = useState(DEF);
  const [mounted,setMounted]     = useState(false);
  const searchRef = useRef();

  useEffect(()=>{
    const all=store.getLogs(); setHistory(all);
    setMeals(all[TODAY]||{Breakfast:[],Lunch:[],Dinner:[],Snacks:[]});
    const t=store.getTargets(); setTargets(t); setEditT(t);
    setWater(store.getWater(TODAY));
    setMounted(true);
  },[]);

  const saveMeals=(m)=>{ setMeals(m); store.saveLog(TODAY,m); const a=store.getLogs(); a[TODAY]=m; setHistory({...a}); };

  // Instant dropdown search
  const handleSearch=(q)=>{
    setSearchQ(q);
    if(!q.trim()){ setDropdown([]); return; }
    const ql=q.toLowerCase();
    const filtered=FOOD_DB.filter(f=>{
      const matchCat=activeCat==='All'||f.category===activeCat;
      const matchQ=f.name.toLowerCase().includes(ql)||f.category.toLowerCase().includes(ql);
      return matchCat&&matchQ;
    }).slice(0,12);
    setDropdown(filtered);
  };

  const handleCatChange=(cat)=>{
    setActiveCat(cat);
    if(searchQ.trim()){
      const ql=searchQ.toLowerCase();
      setDropdown(FOOD_DB.filter(f=>(cat==='All'||f.category===cat)&&(f.name.toLowerCase().includes(ql)||f.category.toLowerCase().includes(ql))).slice(0,12));
    }
  };

  const addFood=(food)=>{
    const mult=servings[food.name]||1;
    const item={id:Date.now(),name:food.name,serving:`${mult>1?mult+'× ':''}${food.serving||'1 serving'}`,source:'db'};
    ['cal','protein','carbs','fat','fiber','sugar','sodium','potassium','calcium','iron','vitC','vitD','vitB12','magnesium','zinc','omega3','vitA','folate','cholesterol','satFat'].forEach(k=>{ item[k]=Math.round(((food[k]||0)*mult)*10)/10 });
    const updated={...meals,[activeMeal]:[...(meals[activeMeal]||[]),item]};
    saveMeals(updated); setSearchQ(''); setDropdown([]); setServings({});
  };

  const addManual=()=>{
    if(!manual.name||!manual.cal)return;
    const item={id:Date.now(),name:manual.name,serving:'custom',source:'manual'};
    Object.keys(BLANK).forEach(k=>{ item[k]=parseFloat(manual[k])||0 });
    item.name=manual.name;
    const updated={...meals,[activeMeal]:[...(meals[activeMeal]||[]),item]};
    saveMeals(updated); setManual(BLANK); setShowAdd(false);
  };

  const removeFood=(mealType,id)=>{ const u={...meals,[mealType]:meals[mealType].filter(f=>f.id!==id)}; saveMeals(u); };

  const totals=sumMeals(meals);
  const macros=[
    {key:'cal',  label:'Calories',color:'#6c63ff',unit:'kcal',dv:targets.calories},
    {key:'protein',label:'Protein',color:'#43e97b',unit:'g',dv:targets.protein},
    {key:'carbs',  label:'Carbs',  color:'#ffd166',unit:'g',dv:targets.carbs},
    {key:'fat',    label:'Fat',    color:'#ff8fab',unit:'g',dv:targets.fat},
  ];

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
          <button onClick={()=>setView(view==='history'?'today':'history')} style={{background:view==='history'?'rgba(108,99,255,0.2)':'var(--surface)',border:'1px solid var(--border2)',borderRadius:10,padding:'8px 12px',color:view==='history'?'var(--accent)':'var(--text2)',fontSize:11,cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>History</button>
          <button onClick={()=>setView(view==='targets'?'today':'targets')} style={{background:view==='targets'?'rgba(108,99,255,0.2)':'var(--surface)',border:'1px solid var(--border2)',borderRadius:10,padding:'8px 12px',color:view==='targets'?'var(--accent)':'var(--text2)',fontSize:11,cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>Targets</button>
        </div>
      </div>

      {/* TODAY */}
      {view==='today'&&(
        <>
          {/* Macro summary */}
          <div className="card card-glow fade-up-1" style={{padding:'20px',marginBottom:14}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
              <div>
                <div className="label" style={{marginBottom:6}}>Today's Intake</div>
                <div className="display" style={{fontSize:40,color:'var(--accent)',lineHeight:1}}>{totals.cal}</div>
                <div style={{fontSize:12,color:'var(--text3)'}}>of {targets.calories} kcal</div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                {macros.slice(1).map(m=>(
                  <div key={m.key} style={{textAlign:'center'}}>
                    <div style={{fontSize:14,fontWeight:700,color:m.color}}>{totals[m.key]}<span style={{fontSize:10}}>{m.unit}</span></div>
                    <div style={{fontSize:9,color:'var(--text3)',letterSpacing:1}}>{m.label.toUpperCase()}</div>
                    <div style={{marginTop:4}}><Bar pct={(totals[m.key]/m.dv)*100} color={m.color} h={4}/></div>
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

          {/* Water */}
          <div className="card fade-up-2" style={{padding:'14px',marginBottom:14}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <div className="label">Water 💧</div>
              <div style={{fontSize:13,fontWeight:700,color:'#4cc9f0'}}>{water}/{targets.water} glasses</div>
            </div>
            <div style={{display:'flex',gap:5,marginBottom:6}}>
              {Array.from({length:targets.water}).map((_,i)=>(
                <div key={i} onClick={()=>{const n=i<water?i:i+1;setWater(n);store.saveWater(TODAY,n);}} style={{flex:1,height:24,borderRadius:5,background:i<water?'#4cc9f0':'var(--surface2)',border:'1px solid var(--border)',cursor:'pointer',transition:'background 0.15s'}}/>
              ))}
            </div>
            <Bar pct={(water/targets.water)*100} color='#4cc9f0' h={3}/>
          </div>

          {/* Meals */}
          {MEAL_TYPES.map(mealType=>(
            <div key={mealType} className="card fade-up-3" style={{padding:'16px',marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:'var(--text)'}}>{mealType}</div>
                  <div style={{fontSize:11,color:'var(--text3)'}}>
                    {Math.round((meals[mealType]||[]).reduce((s,f)=>s+(f.cal||0),0))} kcal · {Math.round((meals[mealType]||[]).reduce((s,f)=>s+(f.protein||0),0))}g protein
                  </div>
                </div>
                <button onClick={()=>{setActiveMeal(mealType);setShowAdd(true);setAddTab('db');setSearchQ('');setDropdown([]);}} style={{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),#8b5cf6)',border:'none',color:'#fff',fontSize:20,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 12px rgba(108,99,255,0.35)',lineHeight:1}}>+</button>
              </div>
              {(meals[mealType]||[]).length===0?(
                <div style={{fontSize:12,color:'var(--text3)',textAlign:'center',padding:'6px 0'}}>No foods logged</div>
              ):(meals[mealType]||[]).map((f,i)=>(
                <div key={f.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:i<meals[mealType].length-1?'1px solid var(--border)':'none'}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:500,color:'var(--text)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{f.name}</div>
                    <div style={{fontSize:10,color:'var(--text3)'}}>{f.serving} · P:{f.protein}g C:{f.carbs}g F:{f.fat}g</div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
                    <div style={{fontSize:13,fontWeight:700,color:'var(--accent)'}}>{f.cal} kcal</div>
                    <button onClick={()=>removeFood(mealType,f.id)} style={{background:'none',border:'none',color:'var(--text3)',cursor:'pointer',fontSize:18,lineHeight:1,padding:'0 4px'}}>×</button>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Micros */}
          {Object.values(meals).flat().length>0&&(
            <div className="card fade-up-4" style={{padding:'18px',marginBottom:14}}>
              <div className="label" style={{marginBottom:14}}>Micronutrients</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                {MICROS.map(m=>{
                  const val=totals[m.key]||0;
                  const pct=Math.min(Math.round((val/m.dv)*100),100);
                  return(
                    <div key={m.key}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                        <span style={{fontSize:11,color:'var(--text2)',fontWeight:500}}>{m.label}</span>
                        <span style={{fontSize:10,color:m.color,fontWeight:700}}>{val}{m.unit}</span>
                      </div>
                      <Bar pct={pct} color={m.color} h={4}/>
                      <div style={{fontSize:9,color:'var(--text3)',marginTop:2}}>{pct}% DV</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* HISTORY */}
      {view==='history'&&(
        <div>
          <button onClick={()=>setView('today')} style={{background:'none',border:'none',color:'var(--text3)',fontSize:12,cursor:'pointer',fontFamily:'inherit',marginBottom:16}}>← Today</button>
          {Object.entries(history).sort(([a],[b])=>b.localeCompare(a)).slice(0,14).map(([date,dm])=>{
            const dt=sumMeals(dm);
            return(
              <div key={date} className="card" style={{padding:'14px 18px',marginBottom:10}}>
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

      {/* TARGETS */}
      {view==='targets'&&(
        <div>
          <button onClick={()=>setView('today')} style={{background:'none',border:'none',color:'var(--text3)',fontSize:12,cursor:'pointer',fontFamily:'inherit',marginBottom:16}}>← Back</button>
          <div className="card" style={{padding:'20px',marginBottom:14}}>
            <div className="label" style={{marginBottom:16}}>Daily Targets</div>
            {[{k:'calories',l:'Calories',unit:'kcal'},{k:'protein',l:'Protein',unit:'g'},{k:'carbs',l:'Carbs',unit:'g'},{k:'fat',l:'Fat',unit:'g'},{k:'fiber',l:'Fiber',unit:'g'},{k:'water',l:'Water',unit:'glasses'}].map(f=>(
              <div key={f.k} style={{marginBottom:14}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                  <label style={{fontSize:13,color:'var(--text2)',fontWeight:500}}>{f.l}</label>
                  <span style={{fontSize:11,color:'var(--text3)'}}>{f.unit}</span>
                </div>
                <input type="number" value={editT[f.k]||''} onChange={e=>setEditT({...editT,[f.k]:parseFloat(e.target.value)||0})} style={{padding:'10px 14px'}}/>
              </div>
            ))}
            <button className="btn-primary" onClick={()=>{store.saveTargets(editT);setTargets(editT);setView('today');}}>Save Targets</button>
          </div>
        </div>
      )}

      {/* ── ADD FOOD MODAL ── */}
      {showAdd&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.88)',zIndex:200,display:'flex',flexDirection:'column',backdropFilter:'blur(12px)'}}>
          <div style={{flex:1,overflowY:'auto',padding:'20px 18px 100px',maxWidth:480,width:'100%',margin:'0 auto'}}>

            {/* Modal header */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
              <div>
                <div style={{fontSize:10,color:'var(--text3)',marginBottom:3,letterSpacing:1.5,textTransform:'uppercase'}}>Adding to {activeMeal}</div>
                <div className="display" style={{fontSize:22}}>Add Food</div>
              </div>
              <button onClick={()=>{setShowAdd(false);setSearchQ('');setDropdown([]);}} style={{width:36,height:36,borderRadius:'50%',background:'var(--surface2)',border:'1px solid var(--border2)',color:'var(--text)',fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
            </div>

            {/* Tabs */}
            <div style={{display:'flex',gap:8,marginBottom:16,background:'var(--surface)',borderRadius:12,padding:4,border:'1px solid var(--border)'}}>
              {[{id:'db',label:'🍽 Search Foods'},{id:'manual',label:'✏️ Manual'}].map(t=>(
                <button key={t.id} onClick={()=>setAddTab(t.id)} style={{flex:1,padding:'10px',borderRadius:8,border:'none',cursor:'pointer',background:addTab===t.id?'linear-gradient(135deg,var(--accent),#8b5cf6)':'transparent',color:addTab===t.id?'#fff':'var(--text2)',fontSize:12,fontWeight:700,fontFamily:'inherit',transition:'all 0.2s'}}>{t.label}</button>
              ))}
            </div>

            {/* DB Search */}
            {addTab==='db'&&(
              <div>
                {/* Category pills */}
                <div style={{display:'flex',gap:6,marginBottom:12,overflowX:'auto',paddingBottom:4,scrollbarWidth:'none'}}>
                  {CATS.map(cat=>(
                    <button key={cat} onClick={()=>handleCatChange(cat)} style={{flexShrink:0,padding:'5px 12px',background:activeCat===cat?'var(--accent)':'var(--surface)',border:'1px solid var(--border)',borderRadius:20,color:activeCat===cat?'#fff':'var(--text3)',fontSize:10,fontWeight:700,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}}>{cat}</button>
                  ))}
                </div>

                {/* Search with instant dropdown */}
                <div style={{position:'relative',marginBottom:4}}>
                  <input
                    ref={searchRef}
                    type="text"
                    autoFocus
                    placeholder={`Search ${activeCat==='All'?'any food':activeCat+' foods'}...`}
                    value={searchQ}
                    onChange={e=>handleSearch(e.target.value)}
                    style={{paddingLeft:40}}
                  />
                  <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',fontSize:15,pointerEvents:'none'}}>🔍</span>
                  {searchQ&&<button onClick={()=>{setSearchQ('');setDropdown('');}} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'var(--text3)',cursor:'pointer',fontSize:18}}>×</button>}
                </div>

                {/* Dropdown results */}
                {dropdown.length>0&&(
                  <div style={{marginTop:4}}>
                    {dropdown.map((food,i)=>(
                      <div key={i} className="card" style={{padding:'14px',marginBottom:8}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
                          <div style={{fontSize:13,fontWeight:600,color:'var(--text)',flex:1}}>{food.name}</div>
                          <span style={{fontSize:9,fontWeight:700,padding:'2px 8px',borderRadius:20,background:'rgba(108,99,255,0.15)',color:'var(--accent)',letterSpacing:1,flexShrink:0,marginLeft:8}}>{food.category}</span>
                        </div>
                        <div style={{fontSize:11,color:'var(--text2)',marginBottom:4}}>Per {food.serving}: <strong style={{color:'var(--accent)'}}>{food.cal} kcal</strong> · P:{food.protein}g · C:{food.carbs}g · F:{food.fat}g</div>
                        <div style={{fontSize:10,color:'var(--text3)',marginBottom:10}}>
                          {food.fiber?`Fiber:${food.fiber}g · `:''}
                          {food.sodium?`Na:${food.sodium}mg · `:''}
                          {food.calcium?`Ca:${food.calcium}mg`:''}
                        </div>
                        <div style={{display:'flex',gap:8,alignItems:'center'}}>
                          <div style={{display:'flex',alignItems:'center',gap:6,background:'var(--surface2)',borderRadius:8,padding:'4px 8px',border:'1px solid var(--border)'}}>
                            <button onClick={()=>setServings(s=>({...s,[food.name]:Math.max(0.5,(s[food.name]||1)-0.5)}))} style={{background:'none',border:'none',color:'var(--text2)',cursor:'pointer',fontSize:16,fontFamily:'inherit',lineHeight:1}}>−</button>
                            <span style={{fontSize:13,fontWeight:700,color:'var(--text)',minWidth:24,textAlign:'center'}}>{servings[food.name]||1}</span>
                            <button onClick={()=>setServings(s=>({...s,[food.name]:(s[food.name]||1)+0.5}))} style={{background:'none',border:'none',color:'var(--text2)',cursor:'pointer',fontSize:16,fontFamily:'inherit',lineHeight:1}}>+</button>
                          </div>
                          <span style={{fontSize:11,color:'var(--text3)'}}>× serving</span>
                          <button onClick={()=>addFood(food)} style={{marginLeft:'auto',padding:'8px 18px',background:'linear-gradient(135deg,var(--accent),#8b5cf6)',border:'none',borderRadius:8,color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 4px 10px rgba(108,99,255,0.3)'}}>Add ✓</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchQ&&dropdown.length===0&&(
                  <div style={{textAlign:'center',padding:'20px',color:'var(--text3)',fontSize:13}}>
                    No results for "{searchQ}"<br/>
                    <span style={{fontSize:11,color:'var(--text3)'}}>Try Manual entry to add custom food</span>
                  </div>
                )}

                {!searchQ&&(
                  <div style={{textAlign:'center',padding:'24px',color:'var(--text3)',fontSize:12}}>
                    Start typing to search {FOOD_DB.length}+ foods instantly
                  </div>
                )}
              </div>
            )}

            {/* Manual */}
            {addTab==='manual'&&(
              <div>
                <div className="label" style={{marginBottom:12}}>Enter Nutrition Info</div>
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:9,fontWeight:700,letterSpacing:1.5,color:'var(--text3)',textTransform:'uppercase',marginBottom:4}}>FOOD NAME *</div>
                  <input type="text" placeholder="e.g. Homemade Dal" value={manual.name} onChange={e=>setManual({...manual,name:e.target.value})}/>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                  {[
                    {k:'cal',l:'Calories (kcal)*'},{k:'protein',l:'Protein (g)'},{k:'carbs',l:'Carbs (g)'},{k:'fat',l:'Fat (g)'},
                    {k:'fiber',l:'Fiber (g)'},{k:'sodium',l:'Sodium (mg)'},{k:'potassium',l:'Potassium (mg)'},{k:'calcium',l:'Calcium (mg)'},
                    {k:'iron',l:'Iron (mg)'},{k:'vitC',l:'Vitamin C (mg)'},{k:'vitD',l:'Vitamin D (mcg)'},{k:'vitB12',l:'Vitamin B12 (mcg)'},
                    {k:'magnesium',l:'Magnesium (mg)'},{k:'zinc',l:'Zinc (mg)'},{k:'omega3',l:'Omega-3 (g)'},
                  ].map(f=>(
                    <div key={f.k}>
                      <div style={{fontSize:9,fontWeight:700,letterSpacing:1,color:'var(--text3)',textTransform:'uppercase',marginBottom:3}}>{f.l}</div>
                      <input type="number" min="0" step="0.1" value={manual[f.k]} onChange={e=>setManual({...manual,[f.k]:e.target.value})} style={{padding:'9px 12px',fontSize:13}}/>
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
