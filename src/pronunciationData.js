// src/pronunciationData.js
// Pronunciation data for vocabulary words using IPA (International Phonetic Alphabet)

export const pronunciationData = {
  // Standard vocabulary test words
  "buy": {
    ipa: "/baɪ/",
    phonetic: "BUY"
  },
  "hot": {
    ipa: "/hɒt/",
    phonetic: "HOT"
  },
  "sad": {
    ipa: "/sæd/",
    phonetic: "SAD"
  },
  "hire": {
    ipa: "/ˈhaɪər/",
    phonetic: "HY-er"
  },
  "significant": {
    ipa: "/sɪɡˈnɪfɪkənt/",
    phonetic: "sig-NIF-i-kant"
  },
  "analyze": {
    ipa: "/ˈænəlaɪz/",
    phonetic: "AN-uh-lyz"
  },
  "consequences": {
    ipa: "/ˈkɒnsɪkwənsɪz/",
    phonetic: "KON-si-kwen-siz"
  },
  "impressive": {
    ipa: "/ɪmˈpresɪv/",
    phonetic: "im-PRES-iv"
  },
  "profound": {
    ipa: "/prəˈfaʊnd/",
    phonetic: "pruh-FOWND"
  },
  "remarkable": {
    ipa: "/rɪˈmɑːkəbl/",
    phonetic: "ri-MAR-kuh-bul"
  },

  // Article-based vocabulary (smuggling article)
  "sail": {
    ipa: "/seɪl/",
    phonetic: "SAYL"
  },
  "hide": {
    ipa: "/haɪd/",
    phonetic: "HYD"
  },
  "caught": {
    ipa: "/kɔːt/",
    phonetic: "KAWT"
  },
  "security": {
    ipa: "/sɪˈkjʊərɪti/",
    phonetic: "si-KYOOR-i-tee"
  },
  "concerning": {
    ipa: "/kənˈsɜːnɪŋ/",
    phonetic: "kuhn-SUR-ning"
  },
  "recruited": {
    ipa: "/rɪˈkruːtɪd/",
    phonetic: "ri-KROO-tid"
  },
  "tides": {
    ipa: "/taɪdz/",
    phonetic: "TYDZ"
  },
  "disappear": {
    ipa: "/ˌdɪsəˈpɪər/",
    phonetic: "dis-uh-PEER"
  },
  "vulnerabilities": {
    ipa: "/ˌvʌlnərəˈbɪlɪtiz/",
    phonetic: "vul-nuh-ruh-BIL-i-teez"
  },
  "complexion": {
    ipa: "/kəmˈplekʃən/",
    phonetic: "kuhm-PLEK-shuhn"
  },

  // Reading exercise vocabulary (octopus article)
  "close": {
    ipa: "/kləʊz/",
    phonetic: "KLOHZ"
  },
  "pots": {
    ipa: "/pɒts/",
    phonetic: "POTS"
  },
  "ruining": {
    ipa: "/ˈruːɪnɪŋ/",
    phonetic: "ROO-in-ing"
  },
  "catching": {
    ipa: "/ˈkætʃɪŋ/",
    phonetic: "KACH-ing"
  },
  "invasion": {
    ipa: "/ɪnˈveɪʒən/",
    phonetic: "in-VAY-zhuhn"
  },
  "mediterranean": {
    ipa: "/ˌmedɪtəˈreɪniən/",
    phonetic: "med-i-tuh-RAY-nee-uhn"
  },
  "shortage": {
    ipa: "/ˈʃɔːtɪdʒ/",
    phonetic: "SHAWR-tij"
  },
  "emergency": {
    ipa: "/ɪˈmɜːdʒənsi/",
    phonetic: "i-MUR-juhn-see"
  },
  "juvenile": {
    ipa: "/ˈdʒuːvənaɪl/",
    phonetic: "JOO-vuh-nyl"
  },
  "welcoming": {
    ipa: "/ˈwelkəmɪŋ/",
    phonetic: "WEL-kuh-ming"
  }
};

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