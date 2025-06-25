// src/pronunciationData.js - Add missing function to fix build error
// This is a temporary fix until the Results component import is corrected

// Helper function to get pronunciation for a word
export const getPronunciation = (word) => {
  const normalizedWord = word.toLowerCase().trim();
  return pronunciationData[normalizedWord] || null;
};

// Helper function to check if pronunciation exists
export const hasPronunciation = (word) => {
  const normalizedWord = word.toLowerCase().trim();
  return normalizedWord in pronunciationData;
};

// TEMPORARY FIX: Add missing isSpeechSupported function
export const isSpeechSupported = () => {
  return 'speechSynthesis' in window;
};

// Get statistics about pronunciation coverage
export const getPronunciationStats = () => {
  const totalWords = Object.keys(pronunciationData).length;
  const levels = {
    A2: 0,
    B1: 0,
    B2: 0,
    C1: 0,
    Articles: 0
  };
  
  // This could be enhanced to categorise words by level
  // For now, just return total count
  return {
    totalWords,
    coverage: `${totalWords} words with pronunciation data`
  };
};

// Comprehensive pronunciation data for all vocabulary words
export const pronunciationData = {
  // ==============================================
  // A2 LEVEL WORDS (25 words)
  // ==============================================
  "buy": {
    ipa: "/baɪ/",
    phonetic: "BUY"
  },
  "hot": {
    ipa: "/hɒt/",
    phonetic: "HOT"
  },
  "happy": {
    ipa: "/ˈhæpi/",
    phonetic: "HAP-ee"
  },
  "works": {
    ipa: "/wɜːks/",
    phonetic: "WURKS"
  },
  "clean": {
    ipa: "/kliːn/",
    phonetic: "KLEEN"
  },
  "garden": {
    ipa: "/ˈɡɑːdn/",
    phonetic: "GAR-den"
  },
  "wake": {
    ipa: "/weɪk/",
    phonetic: "WAYK"
  },
  "read": {
    ipa: "/riːd/",
    phonetic: "REED"
  },
  "car": {
    ipa: "/kɑː/",
    phonetic: "KAR"
  },
  "dinner": {
    ipa: "/ˈdɪnə/",
    phonetic: "DIN-er"
  },
  "closed": {
    ipa: "/kləʊzd/",
    phonetic: "KLOHZD"
  },
  "wore": {
    ipa: "/wɔː/",
    phonetic: "WAWR"
  },
  "sleeping": {
    ipa: "/ˈsliːpɪŋ/",
    phonetic: "SLEE-ping"
  },
  "take": {
    ipa: "/teɪk/",
    phonetic: "TAYK"
  },
  "food": {
    ipa: "/fuːd/",
    phonetic: "FOOD"
  },
  "favourite": {
    ipa: "/ˈfeɪvərɪt/",
    phonetic: "FAY-ver-it"
  },
  "water": {
    ipa: "/ˈwɔːtə/",
    phonetic: "WAW-ter"
  },
  "hair": {
    ipa: "/heə/",
    phonetic: "HAIR"
  },
  "meal": {
    ipa: "/miːl/",
    phonetic: "MEEL"
  },
  "new": {
    ipa: "/njuː/",
    phonetic: "NYOO"
  },
  "door": {
    ipa: "/dɔː/",
    phonetic: "DAWR"
  },
  "live": {
    ipa: "/lɪv/",
    phonetic: "LIV"
  },
  "train": {
    ipa: "/treɪn/",
    phonetic: "TRAYN"
  },
  "present": {
    ipa: "/ˈpreznt/",
    phonetic: "PREZ-ent"
  },
  "weather": {
    ipa: "/ˈweðə/",
    phonetic: "WEH-ther"
  },

  // ==============================================
  // B1 LEVEL WORDS (35 words)
  // ==============================================
  "sad": {
    ipa: "/sæd/",
    phonetic: "SAD"
  },
  "hire": {
    ipa: "/ˈhaɪə/",
    phonetic: "HY-er"
  },
  "finish": {
    ipa: "/ˈfɪnɪʃ/",
    phonetic: "FIN-ish"
  },
  "cancelled": {
    ipa: "/ˈkænsəld/",
    phonetic: "KAN-seld"
  },
  "avoid": {
    ipa: "/əˈvɔɪd/",
    phonetic: "uh-VOYD"
  },
  "study": {
    ipa: "/ˈstʌdi/",
    phonetic: "STUD-ee"
  },
  "decided": {
    ipa: "/dɪˈsaɪdɪd/",
    phonetic: "di-SY-ded"
  },
  "includes": {
    ipa: "/ɪnˈkluːdz/",
    phonetic: "in-KLOODZ"
  },
  "change": {
    ipa: "/tʃeɪndʒ/",
    phonetic: "CHAYNJ"
  },
  "advised": {
    ipa: "/ədˈvaɪzd/",
    phonetic: "ad-VYZD"
  },
  "bring": {
    ipa: "/brɪŋ/",
    phonetic: "BRING"
  },
  "delayed": {
    ipa: "/dɪˈleɪd/",
    phonetic: "di-LAYD"
  },
  "enjoys": {
    ipa: "/ɪnˈdʒɔɪz/",
    phonetic: "in-JOYZ"
  },
  "return": {
    ipa: "/rɪˈtɜːn/",
    phonetic: "ri-TURN"
  },
  "excited": {
    ipa: "/ɪkˈsaɪtɪd/",
    phonetic: "ik-SY-ted"
  },
  "improve": {
    ipa: "/ɪmˈpruːv/",
    phonetic: "im-PROOV"
  },
  "serves": {
    ipa: "/sɜːvz/",
    phonetic: "SURVZ"
  },
  "consider": {
    ipa: "/kənˈsɪdə/",
    phonetic: "kuhn-SID-er"
  },
  "requires": {
    ipa: "/rɪˈkwaɪəz/",
    phonetic: "ri-KWY-erz"
  },
  "misses": {
    ipa: "/ˈmɪsɪz/",
    phonetic: "MIS-ez"
  },
  "covers": {
    ipa: "/ˈkʌvəz/",
    phonetic: "KUV-erz"
  },
  "organise": {
    ipa: "/ˈɔːɡənaɪz/",
    phonetic: "AWR-guh-nyz"
  },
  "forecast": {
    ipa: "/ˈfɔːkɑːst/",
    phonetic: "FAWR-kast"
  },
  "attend": {
    ipa: "/əˈtend/",
    phonetic: "uh-TEND"
  },
  "provides": {
    ipa: "/prəˈvaɪdz/",
    phonetic: "pruh-VYDZ"
  },
  "refused": {
    ipa: "/rɪˈfjuːzd/",
    phonetic: "ri-FYOOZD"
  },
  "affect": {
    ipa: "/əˈfekt/",
    phonetic: "uh-FEKT"
  },
  "discuss": {
    ipa: "/dɪˈskʌs/",
    phonetic: "dis-KUSS"
  },
  "check": {
    ipa: "/tʃek/",
    phonetic: "CHEK"
  },
  "offers": {
    ipa: "/ˈɒfəz/",
    phonetic: "OF-erz"
  },
  "succeeds": {
    ipa: "/səkˈsiːdz/",
    phonetic: "suhk-SEEDZ"
  },
  "replace": {
    ipa: "/rɪˈpleɪs/",
    phonetic: "ri-PLAYS"
  },
  "goal": {
    ipa: "/ɡəʊl/",
    phonetic: "GOHL"
  },
  "prepare": {
    ipa: "/prɪˈpeə/",
    phonetic: "pri-PAIR"
  },

  // ==============================================
  // B2 LEVEL WORDS (30 words)
  // ==============================================
  "significant": {
    ipa: "/sɪɡˈnɪfɪkənt/",
    phonetic: "sig-NIF-i-kuhnt"
  },
  "analyse": {
    ipa: "/ˈænəlaɪz/",
    phonetic: "AN-uh-lyz"
  },
  "essential": {
    ipa: "/ɪˈsenʃl/",
    phonetic: "i-SEN-shuhl"
  },
  "evidence": {
    ipa: "/ˈevɪdəns/",
    phonetic: "EV-i-duhns"
  },
  "establish": {
    ipa: "/ɪˈstæblɪʃ/",
    phonetic: "i-STAB-lish"
  },
  "approach": {
    ipa: "/əˈprəʊtʃ/",
    phonetic: "uh-PROHCH"
  },
  "concept": {
    ipa: "/ˈkɒnsept/",
    phonetic: "KON-sept"
  },
  "context": {
    ipa: "/ˈkɒntekst/",
    phonetic: "KON-tekst"
  },
  "procedure": {
    ipa: "/prəˈsiːdʒə/",
    phonetic: "pruh-SEE-jer"
  },
  "elements": {
    ipa: "/ˈelɪmənts/",
    phonetic: "EL-i-muhnts"
  },
  "fundamental": {
    ipa: "/ˌfʌndəˈmentl/",
    phonetic: "fuhn-duh-MEN-tuhl"
  },
  "methodology": {
    ipa: "/ˌmeθəˈdɒlədʒi/",
    phonetic: "meth-uh-DOL-uh-jee"
  },
  "comprehensive": {
    ipa: "/ˌkɒmprɪˈhensɪv/",
    phonetic: "kom-pri-HEN-siv"
  },
  "assumption": {
    ipa: "/əˈsʌmpʃn/",
    phonetic: "uh-SUHMP-shuhn"
  },
  "consequence": {
    ipa: "/ˈkɒnsɪkwəns/",
    phonetic: "KON-si-kwuhns"
  },
  "alternative": {
    ipa: "/ɔːlˈtɜːnətɪv/",
    phonetic: "awl-TUR-nuh-tiv"
  },
  "criteria": {
    ipa: "/kraɪˈtɪəriə/",
    phonetic: "kry-TEER-ee-uh"
  },
  "implications": {
    ipa: "/ˌɪmplɪˈkeɪʃnz/",
    phonetic: "im-pli-KAY-shuhnz"
  },
  "framework": {
    ipa: "/ˈfreɪmwɜːk/",
    phonetic: "FRAYM-wurk"
  },
  "hypothesis": {
    ipa: "/haɪˈpɒθəsɪs/",
    phonetic: "hy-POTH-uh-sis"
  },
  "phenomenon": {
    ipa: "/fəˈnɒmɪnən/",
    phonetic: "fuh-NOM-i-nuhn"
  },
  "dimensions": {
    ipa: "/daɪˈmenʃnz/",
    phonetic: "dy-MEN-shuhnz"
  },
  "variables": {
    ipa: "/ˈveəriəblz/",
    phonetic: "VAIR-ee-uh-buhlz"
  },
  "investigate": {
    ipa: "/ɪnˈvestɪɡeɪt/",
    phonetic: "in-VES-ti-gayt"
  },
  "strategies": {
    ipa: "/ˈstrætədʒiz/",
    phonetic: "STRAT-uh-jeez"
  },
  "theoretical": {
    ipa: "/ˌθɪəˈretɪkl/",
    phonetic: "thee-uh-RET-i-kuhl"
  },
  "facilitate": {
    ipa: "/fəˈsɪlɪteɪt/",
    phonetic: "fuh-SIL-i-tayt"
  },
  "interpretation": {
    ipa: "/ɪnˌtɜːprɪˈteɪʃn/",
    phonetic: "in-tur-pri-TAY-shuhn"
  },
  "implementation": {
    ipa: "/ˌɪmplɪmenˈteɪʃn/",
    phonetic: "im-pli-men-TAY-shuhn"
  },
  "predominantly": {
    ipa: "/prɪˈdɒmɪnəntli/",
    phonetic: "pri-DOM-i-nuhnt-lee"
  },

  // ==============================================
  // C1 LEVEL WORDS (10 words)
  // ==============================================
  "unprecedented": {
    ipa: "/ʌnˈpresɪdentɪd/",
    phonetic: "uhn-PRES-i-den-tid"
  },
  "paradigm": {
    ipa: "/ˈpærədaɪm/",
    phonetic: "PAIR-uh-dym"
  },
  "discrepancy": {
    ipa: "/dɪˈskrepənsi/",
    phonetic: "dis-KREP-uhn-see"
  },
  "congruent": {
    ipa: "/ˈkɒŋɡruənt/",
    phonetic: "KONG-groo-uhnt"
  },
  "empirical": {
    ipa: "/ɪmˈpɪrɪkl/",
    phonetic: "im-PEER-i-kuhl"
  },
  "substantiate": {
    ipa: "/səbˈstænʃieɪt/",
    phonetic: "suhb-STAN-shee-ayt"
  },
  "intrinsic": {
    ipa: "/ɪnˈtrɪnsɪk/",
    phonetic: "in-TRIN-sik"
  },
  "ameliorate": {
    ipa: "/əˈmiːliəreɪt/",
    phonetic: "uh-MEEL-yuh-rayt"
  },
  "ubiquitous": {
    ipa: "/juːˈbɪkwɪtəs/",
    phonetic: "yoo-BIK-wi-tuhs"
  },
  "meticulous": {
    ipa: "/məˈtɪkjələs/",
    phonetic: "muh-TIK-yuh-luhs"
  },

  // ==============================================
  // ARTICLE VOCABULARY
  // ==============================================
  
  // Smuggling article vocabulary
  "discovered": {
    ipa: "/dɪˈskʌvəd/",
    phonetic: "dis-KUV-erd"
  },
  "officials": {
    ipa: "/əˈfɪʃlz/",
    phonetic: "uh-FISH-uhlz"
  },
  "arrested": {
    ipa: "/əˈrestɪd/",
    phonetic: "uh-RES-ted"
  },
  "passengers": {
    ipa: "/ˈpæsɪndʒəz/",
    phonetic: "PAS-in-jerz"
  },
  "authorities": {
    ipa: "/ɔːˈθɒrɪtiz/",
    phonetic: "aw-THOR-i-teez"
  },
  "investigation": {
    ipa: "/ɪnˌvestɪˈɡeɪʃn/",
    phonetic: "in-ves-ti-GAY-shuhn"
  },
  "suspicious": {
    ipa: "/səˈspɪʃəs/",
    phonetic: "suh-SPISH-uhs"
  },
  "criminal": {
    ipa: "/ˈkrɪmɪnl/",
    phonetic: "KRIM-i-nuhl"
  },
  "illegal": {
    ipa: "/ɪˈliːɡl/",
    phonetic: "i-LEE-guhl"
  },
  "border": {
    ipa: "/ˈbɔːdə/",
    phonetic: "BAWR-der"
  },
  "security": {
    ipa: "/sɪˈkjʊərɪti/",
    phonetic: "si-KYOOR-i-tee"
  },
  "detained": {
    ipa: "/dɪˈteɪnd/",
    phonetic: "di-TAYND"
  },
  "confiscated": {
    ipa: "/ˈkɒnfɪskeɪtɪd/",
    phonetic: "KON-fi-skay-ted"
  },
  "contraband": {
    ipa: "/ˈkɒntrəbænd/",
    phonetic: "KON-truh-band"
  },
  "juvenile": {
    ipa: "/ˈdʒuːvənaɪl/",
    phonetic: "JOO-vuh-nyl"
  },
  "welcoming": {
    ipa: "/ˈwelkəmɪŋ/",
    phonetic: "WEL-kuh-ming"
  },

  // Air India article vocabulary
  "angry": {
    ipa: "/ˈæŋɡri/",
    phonetic: "ANG-gree"
  },
  "due": {
    ipa: "/djuː/",
    phonetic: "DYOO"
  },
  "crashed": {
    ipa: "/kræʃt/",
    phonetic: "KRASHT"
  },
  "disappointed": {
    ipa: "/ˌdɪsəˈpɔɪntɪd/",
    phonetic: "dis-uh-POYN-ted"
  },
  "frustrated": {
    ipa: "/frʌˈstreɪtɪd/",
    phonetic: "fruhs-TRAY-ted"
  },
  "dejected": {
    ipa: "/dɪˈdʒektɪd/",
    phonetic: "di-JEK-ted"
  },
  "requested": {
    ipa: "/rɪˈkwestɪd/",
    phonetic: "ri-KWES-ted"
  },
  "struggle": {
    ipa: "/ˈstrʌɡl/",
    phonetic: "STRUG-uhl"
  },
  "debris": {
    ipa: "/ˈdebriː/",
    phonetic: "DEB-ree"
  },

  // Water treatment article vocabulary
  "worms": {
    ipa: "/wɜːmz/",
    phonetic: "WURMZ"
  },
  "impact": {
    ipa: "/ˈɪmpækt/",
    phonetic: "IM-pakt"
  },
  "released": {
    ipa: "/rɪˈliːst/",
    phonetic: "ri-LEEST"
  },
  "technique": {
    ipa: "/tekˈniːk/",
    phonetic: "tek-NEEK"
  },
  "replicates": {
    ipa: "/ˈreplɪkeɪts/",
    phonetic: "REP-li-kayts"
  },
  "conventional": {
    ipa: "/kənˈvenʃənl/",
    phonetic: "kuhn-VEN-shuhn-uhl"
  },
  "sanitation": {
    ipa: "/ˌsænɪˈteɪʃn/",
    phonetic: "san-i-TAY-shuhn"
  },
  "organic": {
    ipa: "/ɔːˈɡænɪk/",
    phonetic: "awr-GAN-ik"
  }
};
