
(function (global) {
  const KEY = "bvlgariQuestState_v5_3_9";
  const PLACE_ORDER = ["memorial","harvard","cemetery","bc","fenway","arboretum","castle","garden"];
  const PLACES_WITH_LETTERS = ["harvard","cemetery","bc","fenway","arboretum","castle","garden"];

  function defaultState(){
    return {
      runId: (crypto && crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
      stage: 0,
      unlockedPlaces: [],
      lettersByPlace: {
        memorial:null, harvard:null, cemetery:null, bc:null, fenway:null, arboretum:null, castle:null, garden:null
      },
      nameOverride: { garden: null },
      finished:false
    };
  }
  function load(){
    try{
      const raw = localStorage.getItem(KEY);
      if(!raw) throw 0;
      const s = JSON.parse(raw);
      if(!s.lettersByPlace) s.lettersByPlace = {};
      for(const k of PLACE_ORDER) if(!(k in s.lettersByPlace)) s.lettersByPlace[k] = null;
      if(!s.nameOverride) s.nameOverride = { garden: null };
      if(!Array.isArray(s.unlockedPlaces)) s.unlockedPlaces = [];
      if(typeof s.stage !== "number") s.stage = 0;
      // memorial not auto-inserted in v5_3_9
      return s;
    }catch(e){
      const s = defaultState();
      localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
  }
  function save(s){ localStorage.setItem(KEY, JSON.stringify(s)); }
  function get(){ return load(); }

  function setLetter(place, letter){
    const s = load();
    s.lettersByPlace[place] = (letter||"").trim().toUpperCase();
    save(s);
    return s;
  }
  function getLetter(place){ return load().lettersByPlace[place] || null; }
  function clearLetter(place){ const s = load(); s.lettersByPlace[place] = null; save(s); return s; }

  function getStage(){ return load().stage; }
  function setStage(n){ const s = load(); s.stage = n; save(s); return s; }

  function unlockPlace(place){
    const s = load();
    if(!s.unlockedPlaces.includes(place)) s.unlockedPlaces.push(place);
    s.stage = Math.max(s.stage, s.unlockedPlaces.length - 1);
    save(s);
    return s;
  }
  function isPlaceUnlocked(place){ return load().unlockedPlaces.includes(place); }
  function unlockedList(){ return [...load().unlockedPlaces]; }

  
  function canShowNextRiddle(){
    const s = load();
    // Always show the very first riddle
    if (s.stage === 0) return true;
    if (s.stage >= 8) return false;
    if (s.unlockedPlaces.length === 0) return true;
    const last = s.unlockedPlaces[s.unlockedPlaces.length - 1];
    if (last === "memorial") return true; // memorial has no letter
    return !!s.lettersByPlace[last];
  }

  function lettersList(){
    const s = load();
    const out = [];
    for(const k of PLACES_WITH_LETTERS){
      const v = s.lettersByPlace[k];
      if(v) out.push(v);
    }
    return out;
  }
  function allLettersFilled(){
    const s = load();
    return PLACES_WITH_LETTERS.every(k => !!s.lettersByPlace[k]);
  }
  function resetAll(soft=false){
    const s = load();
    const kept = soft ? { runId: s.runId } : {};
    const next = { ...defaultState(), ...kept };
    localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  }

  function setPlaceName(place, name){
    const s = load();
    if(!s.nameOverride) s.nameOverride = { garden:null };
    s.nameOverride[place] = (name||'').trim();
    save(s);
    return s;
  }
  function getPlaceName(place){
    const s = load();
    return (s.nameOverride && s.nameOverride[place]) || null;
  }

  global.BQuest = {
    get, setLetter, getLetter, clearLetter,
    getStage, setStage, unlockPlace, isPlaceUnlocked, unlockedList,
    canShowNextRiddle, lettersList, allLettersFilled, resetAll,
    setPlaceName, getPlaceName
  };
})(window);
