const state = {
  unlocked: Number(localStorage.getItem("siKataUnlocked") || 1),
  stars: Number(localStorage.getItem("siKataStars") || 0),
  best: Number(localStorage.getItem("siKataBest") || 0),
  current: 1
};

const $ = id => document.getElementById(id);
const screens = ["homeScreen","mapScreen","gameScreen","resultScreen"];
let activeAudio = null;
let lastAudioKey = null;

const AUDIO_BASE = "assets/audio/";
const AUDIO = {
  intro: AUDIO_BASE + "instruction/welcome.mp3",
  choose: AUDIO_BASE + "instruction/pilih-jawaban.mp3",
  listen: AUDIO_BASE + "instruction/dengarkan.mp3",
  correct: AUDIO_BASE + "effects/benar.mp3",
  wrong: AUDIO_BASE + "effects/salah.mp3",
  star: AUDIO_BASE + "effects/bintang.mp3",
  levelUp: AUDIO_BASE + "effects/level-up.mp3",
  finish: AUDIO_BASE + "effects/selesai.mp3"
};

function save(){
  localStorage.setItem("siKataUnlocked", state.unlocked);
  localStorage.setItem("siKataStars", state.stars);
  localStorage.setItem("siKataBest", state.best);
}
function show(id){
  screens.forEach(x => $(x).classList.remove("active"));
  $(id).classList.add("active");
  updateHeader();
}
function updateHeader(){
  $("starCount").textContent=state.stars;
  $("homeLevel").textContent=Math.min(state.unlocked,100);
  $("homeStars").textContent=state.stars;
  $("homeBest").textContent=state.best;
  $("progressBar").style.width=(Math.max(1,Math.min(100,state.unlocked))/100*100)+"%";
  $("worldLabel").textContent=state.current ? "Dunia "+LEVELS[state.current-1].world : "Petualangan";
}
function fallbackSpeak(text){
  if(!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text.replace(/\|/g," "));
  u.lang="id-ID";u.rate=.78;u.pitch=1.08;u.volume=1;
  speechSynthesis.speak(u);
}
function playAudio(src,key,fallbackText){
  stopAudio();
  lastAudioKey={src,key,fallbackText};
  if(!src){
    fallbackSpeak(fallbackText); return;
  }
  const audio=new Audio(src);
  audio.preload="auto";
  activeAudio=audio;
  $("audioStatus").textContent="🔊 Memutar...";
  audio.addEventListener("play",()=>setTalking(true));
  audio.addEventListener("ended",()=>{setTalking(false);$("audioStatus").textContent="Audio selesai";});
  audio.addEventListener("error",()=>{
    setTalking(false);$("audioStatus").textContent="Audio MP3 belum tersedia";
    fallbackSpeak(fallbackText);
  });
  audio.play().catch(()=>{
    $("audioStatus").textContent="Tekan Dengarkan untuk suara";
  });
}
function stopAudio(){
  if(activeAudio){activeAudio.pause();activeAudio.currentTime=0;activeAudio=null;}
  if("speechSynthesis" in window)speechSynthesis.cancel();
  setTalking(false);
}
function setTalking(on){$("character").classList.toggle("talk",on)}
function speakCurrent(){
  const l=LEVELS[state.current-1];
  const key="level-"+String(l.id).padStart(3,"0");
  playAudio(AUDIO_BASE+"level/"+key+".mp3",key,l.speak||l.question);
}
function speakInstruction(){
  const l=LEVELS[state.current-1];
  playAudio(AUDIO.listen,"listen",l.speak||l.question);
}
function renderMap(){
  const wrap=$("worlds");wrap.innerHTML="";
  WORLDS.forEach(w=>{
    const box=document.createElement("div");box.className="world";
    box.innerHTML=`<h3>${w.name}</h3><div class="level-grid"></div>`;
    const grid=box.querySelector(".level-grid");
    for(let n=(w.id-1)*10+1;n<=w.id*10;n++){
      const b=document.createElement("button");b.className="level-btn";
      const unlocked=n<=state.unlocked,done=n<state.unlocked;
      b.classList.add(unlocked?(done?"done":"open"):"locked");
      b.textContent=done?"⭐ "+n:(unlocked?n:"🔒");b.disabled=!unlocked;
      b.onclick=()=>startLevel(n);grid.appendChild(b);
    }
    wrap.appendChild(box);
  });
}
function startLevel(id){
  if(id>state.unlocked)return;
  stopAudio();state.current=id;
  const l=LEVELS[id-1];
  $("levelWorld").textContent=l.worldName;$("levelTitle").textContent=l.title;
  $("instruction").textContent=l.instruction.split("|")[0];
  $("question").textContent=l.question;
  $("feedback").className="feedback hidden";$("nextBtn").classList.add("hidden");
  $("speechBubble").textContent="Ayo, coba baca dengan pelan-pelan 😊";
  $("character").className="character";
  $("audioStatus").textContent="Audio siap";
  const opts=$("options");opts.innerHTML="";
  [...l.options].sort(()=>Math.random()-.5).forEach(text=>{
    const b=document.createElement("button");b.className="option";b.textContent=text;
    b.onclick=()=>answer(b,text,l.correct,l);opts.appendChild(b);
  });
  show("gameScreen");
}
function answer(btn,text,correct,l){
  document.querySelectorAll(".option").forEach(b=>b.disabled=true);
  const good=text===correct;btn.classList.add(good?"correct":"wrong");
  const f=$("feedback");f.className="feedback "+(good?"good":"bad");
  if(good){
    f.textContent="🎉 Hebat! Jawaban kamu benar!";
    $("speechBubble").textContent="Hebat sekali! Kamu pintar membaca! ⭐";
    $("character").className="character celebrate";
    state.stars+=3;
    if(state.current===state.unlocked && state.unlocked<100)state.unlocked++;
    state.best=Math.max(state.best,3);save();
    $("nextBtn").classList.remove("hidden");
    playAudio(AUDIO.correct,"correct","Hebat! Jawaban kamu benar!");
    setTimeout(()=>playAudio(AUDIO.star,"star","Tiga bintang untuk kamu!"),650);
  }else{
    f.textContent="😊 Belum tepat. Yuk coba lagi.";
    $("speechBubble").textContent="Tidak apa-apa. Coba sekali lagi ya! 💪";
    $("character").className="character sad";
    playAudio(AUDIO.wrong,"wrong","Tidak apa-apa. Coba sekali lagi.");
    setTimeout(()=>document.querySelectorAll(".option").forEach(b=>{
      if(b.textContent===correct)b.disabled=false;
    }),450);
  }
}
function finish(){
  $("earnedStars").textContent="⭐⭐⭐";
  $("resultEmoji").textContent=state.current===100?"👑":"🎉";
  $("resultTitle").textContent=state.current===100?"RAJA MEMBACA!":"Hebat!";
  $("resultText").textContent=state.current===100?"Kamu menyelesaikan 100 level!":"Level selesai. Siap lanjut?";
  $("resultNextBtn").textContent=state.current===100?"🗺️ LIHAT PETA":"LEVEL BERIKUTNYA ▶";
  $("resultNextBtn").onclick=()=>state.current===100?show("mapScreen"):startLevel(Math.min(100,state.current+1));
  playAudio(state.current===100?AUDIO.finish:AUDIO.levelUp,"result",state.current===100?"Selamat! Kamu menjadi Raja Membaca!":"Level selesai! Hebat!");
  show("resultScreen");
}
$("startBtn").onclick=()=>{show("mapScreen");playAudio(AUDIO.intro,"intro","Selamat datang di Petualangan Si Kata!");};
$("homeBtn").onclick=()=>{stopAudio();show("homeScreen")};
$("mapBtn").onclick=()=>{stopAudio();renderMap();show("mapScreen")};
$("nextBtn").onclick=()=>finish();
$("speakBtn").onclick=speakInstruction;
$("repeatBtn").onclick=()=>speakCurrent();
renderMap();updateHeader();
