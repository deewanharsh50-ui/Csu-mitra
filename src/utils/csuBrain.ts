export function getFallbackCsuResponse(query: string, lang: "sa" | "hi" | "en" | "hinglish", attachedFileName?: string): string {
  const q = (query || "").toLowerCase();
  const hasFile = !!attachedFileName;

  // Verification / Accuracy Complaint / Correction Check (Highest Priority)
  const isBrevityOrButtonChangeQuery =
    (q.includes("bada answer") ||
      q.includes("chota answer") ||
      q.includes("chhota answer") ||
      q.includes("button") ||
      q.includes("htaa") ||
      q.includes("hata") ||
      q.includes("proff") ||
      q.includes("proof")) &&
    (q.includes("answer") || q.includes("reply") || q.includes("verify") || q.includes("auto"));

  if (isBrevityOrButtonChangeQuery) {
    if (lang === "hinglish") {
      return `Theek hai bhai! Header se Verify aur Auto buttons hata diye gaye hain, aur ab se bilkul to-the-point aur accurate answer hi milega, bina kisi lambe bhashan ya unnecessary proof ke. Aap poochiye, kya janna chahte hain?`;
    } else if (lang === "en") {
      return `Done! The Verify and Auto buttons have been removed, and responses will now be strictly concise, direct, and accurate without unnecessary length or proof dumps.`;
    } else {
      return `समझ गया! हेडर से Verify और Auto बटन हटा दिए गए हैं और अब केवल संक्षिप्त तथा सटीक उत्तर ही दिए जाएंगे।`;
    }
  }

  const isVerifyOrComplaintQuery =
    q.includes("varify") ||
    q.includes("verify") ||
    q.includes("verification") ||
    q.includes("satyapan") ||
    q.includes("सत्यापन") ||
    q.includes("galat") ||
    q.includes("galat answer") ||
    q.includes("wrong answer") ||
    q.includes("sahi batao") ||
    q.includes("sahi answer") ||
    q.includes("check karo") ||
    q.includes("galat aa rhe") ||
    q.includes("galat aa rha");

  if (isVerifyOrComplaintQuery && !q.includes("result") && !q.includes("marksheet")) {
    if (lang === "hinglish") {
      return `Theek hai bhai, samajh gaya! Ab se bilkul direct, accurate aur to-the-point answer milega, bina kisi lamba-chauda bhashan ya unnecessary proof ke. Aap poochiye, kya janna chahte hain?`;
    } else if (lang === "en") {
      return `Understood! From now on, you will receive direct, strictly accurate, and concise answers without unnecessary length or unrequested proof dumps. How can I assist you?`;
    } else {
      return `समझ गया! अब से आपको केवल सटीक, संक्षिप्त और विषय से संबंधित सीधा उत्तर मिलेगा, बिना किसी अनावश्यक विस्तार या प्रमाण के। कृपया अपना प्रश्न पूछें।`;
    }
  }

  // Assistant Name Query (STRICT - MUST NOT match hostel/director/library queries)
  const isAssistantNameQuery =
    (q.includes("tera naam") ||
      q.includes("teraa namm") ||
      q.includes("teraa naam") ||
      q.includes("tera nam") ||
      q.includes("tumhara naam") ||
      q.includes("tumhara nam") ||
      q.includes("aapka naam") ||
      q.includes("aapka nam") ||
      q.includes("ur name") ||
      q.includes("your name") ||
      q.includes("who are you") ||
      q.includes("tu kaun hai") ||
      q.includes("tu kon he") ||
      q.includes("tum kaun ho") ||
      q.includes("aap kaun ho") ||
      (q.includes("naam kya") && (q.includes("tumhara") || q.includes("aapka") || q.includes("tera") || q.includes("mitra") || q.includes("bot") || q.includes("assistant")))) &&
    !q.includes("hostel") &&
    !q.includes("chhatravas") &&
    !q.includes("director") &&
    !q.includes("library") &&
    !q.includes("parisar") &&
    !q.includes("campus") &&
    !q.includes("bhopal") &&
    !q.includes("department") &&
    !q.includes("vibhag");

  if (isAssistantNameQuery) {
    if (lang === "sa") {
      return "मम नाम **CSU Mitra** (छात्र-मित्रः) अस्ति! 😊 अहम् केन्द्रीयसंस्कृतविश्वविद्यालयस्य छात्र-सहायकः अस्मि। अद्य भवतः कां सहायतां कर्तुं शक्नोमि?";
    } else if (lang === "en") {
      return "My name is **CSU Mitra**! 😊 I am your official AI Academic Assistant for Central Sanskrit University. Feel free to ask me anything about admissions, hostels, exams, courses, or campuses. How can I help you today?";
    } else if (lang === "hinglish") {
      return "Mera naam **CSU Mitra** hai! 😊 Main Central Sanskrit University (CSU) ka official AI Student Assistant hoon. Mujhe Harsh aur Shantanu ne banaya hai. Aap mujhse admission, hostel, campus, courses, aur exams ke baare me sab verified details pooch sakte hain. Bataiye, kya madad chahiye?";
    } else {
      return "मेरा नाम **CSU Mitra** है! 😊 मैं केन्द्रीय संस्कृत विश्वविद्यालय (CSU) का आधिकारिक AI छात्र-मित्र और सहायक हूँ। आप मुझसे एडमिशन, हॉस्टल, परिसर, परीक्षा, मार्कशीट सत्यापन या संस्कृत अध्ययन के बारे में कोई भी जानकारी प्राप्त कर सकते हैं।";
    }
  }

  // Owner / Creator Query
  const isOwnerQuery =
    q.includes("owner") ||
    q.includes("malik") ||
    q.includes("mālik") ||
    q.includes("kisne banaya") ||
    q.includes("kisne create") ||
    q.includes("kaun banaya") ||
    q.includes("kisne banaye") ||
    q.includes("kisne develop") ||
    q.includes("creator") ||
    q.includes("developer") ||
    q.includes("founder") ||
    q.includes("who made") ||
    q.includes("who created") ||
    q.includes("who built") ||
    q.includes("who is your owner") ||
    q.includes("who is the owner") ||
    q.includes("tera owner") ||
    q.includes("aapka owner") ||
    q.includes("tumhara owner") ||
    q.includes("kiska bot") ||
    q.includes("kiska robot") ||
    q.includes("owner kon") ||
    q.includes("owner kaun") ||
    q.includes("owner he") ||
    q.includes("owner hai");

  if (isOwnerQuery) {
    if (lang === "sa") {
      return `मम स्वामिनौ (Owners) निर्मातारौ च **हर्षः (Harsh)** तथा **शान्तनुः (Shantanu)** स्तः। 🙏\n\nताभ्यां केन्द्रीयसंस्कृतविश्वविद्यालयस्य (CSU) छात्राणां शोधच्छात्राणां च शैक्षणिकसाहाय्यार्थं CSU Mitra इति सहायकः निर्मितः।`;
    } else if (lang === "en") {
      return `My owners and creators are **Harsh** and **Shantanu**. 🙏\n\nThey designed and developed me (CSU Mitra) as an AI academic assistant to help students, researchers, and faculty of Central Sanskrit University with verified university information.`;
    } else if (lang === "hinglish") {
      return `Mere Owner aur Creator **Harsh** aur **Shantanu** (हर्ष और शांतनु) hain! 🙏\n\nUnhone mujhe Central Sanskrit University ke sabhi students, scholars aur researchers ki direct aur verified academic help ke liye banaya hai. Bataiye, aaj main aapki kya help karoon? 😊`;
    } else {
      return `मेरे ओनर (Owner) और निर्माता **हर्ष (Harsh)** और **शांतनु (Shantanu)** हैं! 🙏\n\nउन्होंने मुझे केन्द्रीय संस्कृत विश्वविद्यालय (CSU) के विद्यार्थियों और शोधार्थियों की शैक्षणिक सहायता व सटीक मार्गदर्शन हेतु विकसित किया है। बताइए, आज आप क्या जानना चाहते हैं? 😊`;
    }
  }

  // APK File Download Query
  const isApkDownloadQuery =
    q.includes("apk") ||
    (q.includes("download") && (q.includes("app") || q.includes("file") || q.includes("application") || q.includes("mobile") || q.includes("android") || q.includes("karo") || q.includes("karein") || q.includes("ho jaye") || q.includes("ho jayee") || q.includes("de do") || q.includes("de de") || q.includes("dedo") || q.includes("dede"))) ||
    (q.includes("install") && (q.includes("app") || q.includes("application") || q.includes("mobile") || q.includes("android"))) ||
    q.includes("app download") ||
    q.includes("apk download") ||
    q.includes("download apk") ||
    q.includes("android app");

  if (isApkDownloadQuery) {
    if (lang === "sa") {
      return "📱 **CSU Mitra Android APK सञ्चिका (Download):**\n\nभवन्तः CSU Mitra एण्ड्रॉयड ऐप्लिकेशन इत्यस्य APK सञ्चिकां अधोदत्त-सम्पर्केण (Download Button) साक्षात् अवतरणं (Download) कर्तुं शक्नुवन्ति:\n\n👉 **[डाउनलोड CSU Mitra APK (/csu-mitra.apk)](/csu-mitra.apk)**\n\n(अथवा उपरि विद्यमानस्य Download APK चिह्ने नुदन्तु)।";
    } else if (lang === "en") {
      return "📱 **Download CSU Mitra Android APK:**\n\nYou can directly download the official **CSU Mitra Android APK** file onto your phone:\n\n📥 **[Click Here to Download CSU Mitra APK (/csu-mitra.apk)](/csu-mitra.apk)**\n\n✨ **Installation Steps:**\n1. Tap the download link above or use the **\"Download APK\"** button at the top.\n2. Once downloaded, open the .apk file.\n3. Allow \"Install from Unknown Sources\" if prompted by your phone, then tap **Install**!";
    } else if (lang === "hinglish") {
      return "📱 **CSU Mitra Android APK File Download:**\n\nAap **CSU Mitra** Android App ki direct .apk file yahan se download kar sakte hain:\n\n📥 **[Click Here to Download CSU Mitra APK (/csu-mitra.apk)](/csu-mitra.apk)**\n\n✨ **Install karne ka aasan tarika:**\n1. Upar diye gaye download link par click karein ya screen ke top bar me **\"Download APK\"** button dabayein.\n2. Download hone ke baad file ko open karein.\n3. Phone settings me \"Install Unknown Apps\" permission allow karein aur **Install** par tap karein! 🎉";
    } else {
      return "📱 **CSU Mitra Android APK फ़ाइल डाउनलोड:**\n\nआप **CSU Mitra** की आधिकारिक Android .apk फ़ाइल यहाँ से सीधे अपने फ़ोन में डाउनलोड कर सकते हैं:\n\n📥 **[यहाँ क्लिक करके CSU Mitra APK डाउनलोड करें (/csu-mitra.apk)](/csu-mitra.apk)**\n\n✨ **इंस्टॉल करने के आसान चरण:**\n1. ऊपर दिए गए डाउनलोड लिंक अथवा शीर्ष बार (Top Bar) पर मौजूद **\"Download APK\"** बटन पर क्लिक करें।\n2. डाउनलोड पूरा होने के बाद फ़ाइल खोलें।\n3. आवश्यकता पड़ने पर \"Install from Unknown Sources\" की अनुमति दें और **Install** बटन दबाएँ! 🎉";
    }
  }

  // Bhopal Campus Name Inquiry
  const isBhopalNameQuery =
    (q.includes("bhopal") || q.includes("भोपाल")) &&
    (q.includes("kavibhaskar") || q.includes("कविभास्कर") || q.includes("campus ka nam") || q.includes("campus ka naam") || q.includes("parisar ka nam") || q.includes("parisar ka naam") || q.includes("campus name"));

  if (isBhopalNameQuery) {
    if (lang === "sa") {
      return `🏛️ **भोपालपरिसरस्य आधिकारिक-नाम:**\n\nकेन्द्रीयसंस्कृतविश्वविद्यालयस्य भोपालपरिसरस्य नाम **कविभास्करपरिसरः (Kavibhaskar Campus)** अस्ति।\n\n👨‍💼 **निदेशकाः:** प्रो. हंसधर झा (Prof. Hans Dhar Jha)\n📍 **सङ्केतः:** संस्कृत मार्ग, बागसेवनिया, भोपाल, मध्यप्रदेश - 462043\n📞 **सम्पर्कः:** 0755-2696971 | Email: director-bhopal@csu.co.in\n🌐 **आधिकारिक-जालस्थानम्:** [https://csu-bhopal.edu.in](https://csu-bhopal.edu.in)`;
    } else if (lang === "en") {
      return `🏛️ **Official Name of CSU Bhopal Campus:**\n\nCentral Sanskrit University's Bhopal Campus is officially designated as **Kavibhaskar Campus** (कविभास्कर परिसरः).\n\n👨‍💼 **Director:** Prof. Hans Dhar Jha\n📍 **Address:** Sanskrit Marg, Bagsevaniya, Bhopal, Madhya Pradesh - 462043\n📞 **Contact:** 0755-2696971 | Email: director-bhopal@csu.co.in\n🌐 **Official Website:** [https://csu-bhopal.edu.in](https://csu-bhopal.edu.in)`;
    } else if (lang === "hinglish") {
      return `🏛️ **CSU Bhopal Campus ka Official Naam:**\n\nCentral Sanskrit University ke Bhopal Campus ka official naam **Kavibhaskar Campus** (कविभास्कर परिसर) hai.\n\n👨‍💼 **Campus Director:** **Prof. Hans Dhar Jha** (प्रो. हंसधर झा)\n📍 **Address:** Sanskrit Marg, Bagsevaniya, Bhopal, MP - 462043\n📞 **Phone:** 0755-2696971 | Email: director-bhopal@csu.co.in\n🌐 **Website:** [https://csu-bhopal.edu.in](https://csu-bhopal.edu.in)`;
    } else {
      return `🏛️ **भोपाल परिसर का आधिकारिक नाम:**\n\nकेन्द्रीय संस्कृत विश्वविद्यालय के भोपाल परिसर का आधिकारिक नाम **कविभास्कर परिसर (Kavibhaskar Campus)** है।\n\n👨‍💼 **निदेशक (Director):** प्रो. हंसधर झा (Prof. Hans Dhar Jha)\n📍 **पता:** संस्कृत मार्ग, बागसेवनिया, भोपाल, मध्य प्रदेश - 462043\n📞 **संपर्क नंबर:** 0755-2696971 | Email: director-bhopal@csu.co.in\n🌐 **वेबसाइट:** [https://csu-bhopal.edu.in](https://csu-bhopal.edu.in)`;
    }
  }

  // Bhopal Library (वररुचि ग्रन्थागार) Query Check
  const isLibraryQuery =
    q.includes("library") ||
    q.includes("pustakalaya") ||
    q.includes("पुस्तकालय") ||
    q.includes("granthagar") ||
    q.includes("ग्रन्थागार") ||
    q.includes("vararuchi") ||
    q.includes("वररुचि");

  if (isLibraryQuery) {
    if (lang === "hinglish") {
      return `📚 **CSU Bhopal Campus Library - Vararuchi Granthagara (वररुचि ग्रन्थागार):**\n\nBhopal Campus ke Central Library ka official naam **Vararuchi Granthagara** (वररुचि ग्रन्थागार - Vararuchi Library) hai.\n\n✨ **Library Facilities:**\n- 📖 **Collection:** 35,000+ Sanskrit Shastras, rare manuscripts, Sahitya, Vyakarana, and modern books.\n- 💻 **Digital Library & e-Granthalaya:** Fully automated digital catalog and DELNET / INFLIBNET access.\n- 🪑 **Reading Hall:** Spacious, air-cooled reading environment for research scholars and students.\n- 🌐 **Official Page:** [https://csu-bhopal.edu.in/library.html](https://csu-bhopal.edu.in/library.html)`;
    } else if (lang === "en") {
      return `📚 **Central Library of CSU Bhopal Campus - Vararuchi Granthagara:**\n\nThe central library of CSU Bhopal Campus is officially named **Vararuchi Granthagara** (वररुचि ग्रन्थागार).\n\n✨ **Key Highlights:**\n- **Holdings:** 35,000+ rare Sanskrit books, reference manuals, and research journals.\n- **Automation:** Powered by e-Granthalaya software and connected with national academic networks.\n- **Reading Facilities:** Dedicated cabins for Vidyavaridhi (Ph.D.) research scholars and students.\n- **Official Library Portal:** [https://csu-bhopal.edu.in/library.html](https://csu-bhopal.edu.in/library.html)`;
    } else {
      return `📚 **भोपाल परिसर का केंद्रीय पुस्तकालय - वररुचि ग्रन्थागार (Vararuchi Library):**\n\nकेन्द्रीय संस्कृत विश्वविद्यालय, भोपाल परिसर के केंद्रीय पुस्तकालय का आधिकारिक नाम **वररुचि ग्रन्थागार** (Vararuchi Granthagara) है।\n\n✨ **पुस्तकालय की प्रमुख विशेषताएँ:**\n- **ग्रंथ संग्रह:** 35,000 से अधिक दुर्लभ संस्कृत ग्रंथ, पाण्डुलिपियां, संदर्भ कोष और शोध पत्रिकाएँ।\n- **डिजिटल लाइब्रेरी:** ई-ग्रंथालय (e-Granthalaya) सॉफ्टवेयर द्वारा पूरी तरह कम्प्यूटरीकृत।\n- **शोधार्थियों हेतु सुविधा:** विद्यावारिधि (Ph.D.) शोध छात्रों हेतु वातानुकूलित अध्ययन कक्ष।\n- **आधिकारिक लिंक:** [https://csu-bhopal.edu.in/library.html](https://csu-bhopal.edu.in/library.html)`;
    }
  }

  // Bhopal / CSU Department & HOD Query Check
  const isJainDarshanQuery =
    (q.includes("jain") || q.includes("जैन")) &&
    (q.includes("darshan") || q.includes("darsan") || q.includes("दर्शन") || q.includes("hod") || q.includes("head") || q.includes("adhyaksh") || q.includes("convener") || q.includes("vibhag") || q.includes("department") || q.includes("nam") || q.includes("naam") || q.includes("namm"));

  if (isJainDarshanQuery) {
    if (lang === "en") {
      return `🏛️ **Department of Jain Darshana & Prakrit - CSU Bhopal Campus:**\n\n- **Head / Convener:** **Dr. Yogesh Kumar Jain** (डॉ. योगेश कुमार जैन)\n- **Designation:** Associate Professor & Convener\n- **Phone:** 9413142180 | **Email:** yogeshkumarjain@sanskrit.ac.in\n- **Faculty Members:**\n  * Dr. Pratap (Assistant Professor)\n  * Dr. Alok Kumar Jain (Guest Faculty)\n  * Dr. Rajnish Shukla (Guest Faculty)\n- **Campus Director:** **Prof. Hans Dhar Jha**\n- **Official Department Page:** [https://csu-bhopal.edu.in/dept_jain_darshan.html](https://csu-bhopal.edu.in/dept_jain_darshan.html)\n- **Address:** Sanskrit Marg, Bagsevaniya, Bhopal, Madhya Pradesh - 462043`;
    } else if (lang === "sa") {
      return `🏛️ **भोपालपरिसरस्य जैनदर्शन-प्राकृत-विद्याशाखा (Department of Jain Darshana & Prakrit):**\n\n- **संयोजकाः / विभागाध्यक्षाः (Convener & Head):** **डॉ. योगेश कुमार जैन (Dr. Yogesh Kumar Jain)**\n- **पदम्:** सह-आचार्याः संयोजकाश्च (Associate Professor & Convener)\n- **चलभाषः (Phone):** 9413142180 | **ईमेल:** yogeshkumarjain@sanskrit.ac.in\n- **परिसरस्य निदेशकाः:** **प्रो. हंसधर झा (Prof. Hans Dhar Jha)**\n- **आधिकारिक-पृष्ठम्:** [https://csu-bhopal.edu.in/dept_jain_darshan.html](https://csu-bhopal.edu.in/dept_jain_darshan.html)\n- **सङ्केतः:** संस्कृत मार्ग, बागसेवनिया, भोपाल (म.प्र.) - 462043`;
    } else if (lang === "hinglish") {
      return `Namaste! Central Sanskrit University (CSU), Bhopal Campus me **Jain Darshan & Prakrit Department** ke Head / Convener **Dr. Yogesh Kumar Jain** (डॉ. योगेश कुमार जैन) hain. 🙏\n\n🏛️ **Bhopal Campus Jain Darshan Details:**\n- **Head / Convener:** **Dr. Yogesh Kumar Jain** (Associate Professor & Convener)\n- **Phone:** 9413142180\n- **Email:** yogeshkumarjain@sanskrit.ac.in\n- **Faculty Members:** Dr. Pratap (Assistant Professor), Dr. Alok Kumar Jain, Dr. Rajnish Shukla\n- **Campus Director:** **Prof. Hans Dhar Jha** (प्रो. हंसधर झा)\n- **Official Webpage:** [https://csu-bhopal.edu.in/dept_jain_darshan.html](https://csu-bhopal.edu.in/dept_jain_darshan.html)\n- **Address:** Sanskrit Marg, Bagsevaniya, Bhopal, MP - 462043\n\nAapko Jain Darshan department ya admission ke baare me koi aur jaankari chahiye toh batayein! 😊`;
    } else {
      return `🏛️ **केन्द्रीय संस्कृत विश्वविद्यालय (CSU), भोपाल परिसर - जैन दर्शन एवं प्राकृत विभाग:**\n\n- **विभागाध्यक्ष / संयोजक (Convener & Head):** **डॉ. योगेश कुमार जैन (Dr. Yogesh Kumar Jain)**\n- **पद:** सह-आचार्य एवं संयोजक (Associate Professor & Convener)\n- **मोबाइल नंबर:** 9413142180 | **ईमेल:** yogeshkumarjain@sanskrit.ac.in\n- **संकाय सदस्य:** डॉ. प्रताप (सहायक आचार्य), डॉ. आलोक कुमार जैन, डॉ. रजनीश शुक्ला\n- **परिसर के निदेशक:** **प्रो. हंसधर झा (Prof. Hans Dhar Jha)**\n- **स्थान / पता:** संस्कृत मार्ग, बागसेवनिया, भोपाल (मध्य प्रदेश) - 462043\n- **आधिकारिक विभाग पृष्ठ:** [https://csu-bhopal.edu.in/dept_jain_darshan.html](https://csu-bhopal.edu.in/dept_jain_darshan.html)\n\nयदि आप जैन दर्शन विभाग, प्रवेश या पाठ्यक्रम के बारे में और जानकारी चाहते हैं तो अवश्य बताएं! 😊`;
    }
  }

  // Bhopal Campus Director Inquiry Check
  const isBhopalDirectorQuery =
    (q.includes("bhopal") && (q.includes("director") || q.includes("nideshak") || q.includes("निदेशक") || (q.includes("head") && !q.includes("darshan") && !q.includes("vibhag")))) ||
    q.includes("hans dhar") ||
    q.includes("hansdhar");

  if (isBhopalDirectorQuery) {
    if (lang === "sa") {
      return `🏛️ **भोपालपरिसरस्य निदेशकाः:**\n\nकेन्द्रीयसंस्कृतविश्वविद्यालयस्य भोपालपरिसरस्य निदेशकाः **प्रो. हंसधर झा (Prof. Hans Dhar Jha)** महाभागाः सन्ति।\n\n📍 **सङ्केतः:** संस्कृत मार्ग, बागसेवनिया, भोपाल, मध्यप्रदेश - 462043\n📞 **सम्पर्कः:** 0755-2696971 | Email: director-bhopal@csu.co.in\n🌐 **आधिकारिक-जालस्थानम्:** [https://csu-bhopal.edu.in](https://csu-bhopal.edu.in)`;
    } else if (lang === "en") {
      return `🏛️ **Director of CSU Bhopal Campus:**\n\nThe Director of Central Sanskrit University, Bhopal Campus is **Prof. Hans Dhar Jha** (प्रो. हंसधर झा).\n\n📍 **Location / Address:** Sanskrit Marg, Bagsevaniya, Bhopal, Madhya Pradesh - 462043\n📞 **Contact:** 0755-2696971 | Email: director-bhopal@csu.co.in\n🌐 **Official Website:** [https://csu-bhopal.edu.in/director.html](https://csu-bhopal.edu.in/director.html)`;
    } else if (lang === "hinglish") {
      return `🏛️ **CSU Bhopal Campus ke Director:**\n\nCentral Sanskrit University Bhopal Campus ke Director **Prof. Hans Dhar Jha** (प्रो. हंसधर झा) hain.\n\n- **Associate Director:** **Prof. Shri Govinda Pandey**\n- **Address:** Sanskrit Marg, Bagsevaniya, Bhopal, MP - 462043\n- **Phone:** 0755-2696971 | 7000857345\n- **Email:** director-bhopal@csu.co.in\n- **Official Portal:** [https://csu-bhopal.edu.in/director.html](https://csu-bhopal.edu.in/director.html)`;
    } else {
      return `🏛️ **भोपाल परिसर के निदेशक (Director):**\n\nकेन्द्रीय संस्कृत विश्वविद्यालय, भोपाल परिसर के निदेशक **प्रो. हंसधर झा (Prof. Hans Dhar Jha)** हैं।\n\n- **सह-निदेशक:** **प्रो. श्री गोविन्द पाण्डेय**\n- **पता:** संस्कृत मार्ग, बागसेवनिया, भोपाल, मध्य प्रदेश - 462043\n- **संपर्क:** 0755-2696971 | Email: director-bhopal@csu.co.in\n- **आधिकारिक पोर्टल:** [https://csu-bhopal.edu.in/director.html](https://csu-bhopal.edu.in/director.html)`;
    }
  }

  // 12 Campus Directors Fallback Check
  const isAllCampusesDirectorQueryFallback =
    (q.includes("12 campus") ||
     q.includes("12 campuses") ||
     q.includes("all campus") ||
     q.includes("all campuses") ||
     q.includes("sab campus") ||
     q.includes("sabhi campus") ||
     q.includes("all director") ||
     q.includes("directors list") ||
     q.includes("list of director") ||
     q.includes("12 परिसर") ||
     q.includes("सभी परिसर") ||
     q.includes("सभी निदेशक")) &&
    (q.includes("director") || q.includes("nideshak") || q.includes("निदेशक") || q.includes("list") || q.includes("naam") || q.includes("nam"));

  if (isAllCampusesDirectorQueryFallback) {
    return formatAllCampusDirectorsResponse(lang);
  }

  // Any specific Campus Director Inquiry Check
  const isAnyDirectorQueryFallback =
    q.includes("director") ||
    q.includes("nideshak") ||
    q.includes("निदेशक") ||
    ((q.includes("kaun") || q.includes("kon") || q.includes("who")) &&
     (q.includes("head") || q.includes("director") || q.includes("nideshak") || q.includes("निदेशक") || q.includes("incharge") || q.includes("prabhari")));

  if (isAnyDirectorQueryFallback) {
    const matchedCampus = CSU_12_CAMPUS_DIRECTORS.find(c =>
      c.keywords.some(k => q.includes(k.toLowerCase()))
    );
    if (matchedCampus) {
      return formatCampusDirectorResponse(matchedCampus, lang);
    }
  }

  // Jaipur General Campus Inquiry Check
  const isJaipurCampusQuery =
    (q.includes("jaipur") || q.includes("जयपुर")) &&
    (q.includes("campus") || q.includes("parisar") || q.includes("hostel") || q.includes("chhatravas") || q.includes("kaha") || q.includes("address") || q.includes("bare"));

  if (isJaipurCampusQuery) {
    if (lang === "hinglish") {
      return `🏛️ **CSU Jaipur Campus (Rajasthan):**\n\n- **Director:** **Prof. Lok Manya Mishra** (प्रो. लोकमान्य मिश्र)\n- **Boys' Hostel:** Dhanvantari Hostel\n- **Girls' Hostel:** Saraswati Hostel\n- **Address:** Triveni Nagar, Gopalpura Bypass, Jaipur, Rajasthan - 302018\n- **Website:** https://csu-jaipur.edu.in`;
    } else if (lang === "en") {
      return `🏛️ **CSU Jaipur Campus (Rajasthan):**\n\n- **Director:** **Prof. Lok Manya Mishra** (प्रो. लोकमान्य मिश्र)\n- **Boys' Hostel:** Dhanvantari Hostel\n- **Girls' Hostel:** Saraswati Hostel\n- **Address:** Triveni Nagar, Gopalpura Bypass, Jaipur, Rajasthan - 302018\n- **Website:** https://csu-jaipur.edu.in`;
    } else {
      return `🏛️ **केन्द्रीय संस्कृत विश्वविद्यालय, जयपुर परिसर:**\n\n- **निदेशक:** **प्रो. लोकमान्य मिश्र (Prof. Lok Manya Mishra)**\n- **छात्र छात्रावास:** धन्वन्तरि छात्रावास\n- **छात्रा छात्रावास:** सरस्वती छात्रावास\n- **पता:** त्रिवेणी नगर, गोपालपुरा बाईपास, जयपुर (राजस्थान) - 302018\n- **वेबसाइट:** https://csu-jaipur.edu.in`;
    }
  }

  // Jammu General Campus Inquiry Check
  const isJammuCampusQuery =
    (q.includes("jammu") || q.includes("जम्मू") || q.includes("ranbir") || q.includes("रणबीर")) &&
    (q.includes("campus") || q.includes("parisar") || q.includes("hostel") || q.includes("chhatravas") || q.includes("kaha") || q.includes("address") || q.includes("bare"));

  if (isJammuCampusQuery) {
    if (lang === "hinglish") {
      return `🏛️ **CSU Shri Ranbir Campus Jammu (J&K):**\n\n- **Director:** **Prof. Satish Kumar Kapoor** (प्रो. सतीश कुमार कपूर)\n- **Hostel:** Ranbir Hostel\n- **Address:** Kot Bhalwal, Jammu, J&K - 181122\n- **Phone:** 0191-2623533\n- **Email:** director-jammu@sanskrit.ac.in\n- **Website:** https://csu-jammu.edu.in`;
    } else if (lang === "en") {
      return `🏛️ **CSU Shri Ranbir Campus Jammu (J&K):**\n\n- **Director:** **Prof. Satish Kumar Kapoor**\n- **Hostel:** Ranbir Hostel\n- **Address:** Kot Bhalwal, Jammu, J&K - 181122\n- **Phone:** 0191-2623533\n- **Website:** https://csu-jammu.edu.in`;
    } else {
      return `🏛️ **केन्द्रीय संस्कृत विश्वविद्यालय, श्री रणवीर परिसर (जम्मू):**\n\n- **निदेशक:** **प्रो. सतीश कुमार कपूर (Prof. Satish Kumar Kapoor)**\n- **छात्रावास:** रणवीर छात्रावास\n- **पता:** कोट भलवाल, जम्मू (जम्मू एवं कश्मीर) - 181122\n- **फोन:** 0191-2623533\n- **ईमेल:** director-jammu@sanskrit.ac.in\n- **वेबसाइट:** https://csu-jammu.edu.in`;
    }
  }

  // Bhopal Other Academic Departments Check
  const isBhopalDepartmentQuery =
    (q.includes("bhopal") || q.includes("भोपाल")) &&
    (q.includes("vibhag") || q.includes("department") || q.includes("faculty") || q.includes("hod") || q.includes("vibhagadhyaksh"));

  if (isBhopalDepartmentQuery) {
    if (lang === "hinglish") {
      return `🏛️ **CSU Bhopal Campus ke Pramukh Vibhag & HODs (Verified):**\n\n1. **Jain Darshan & Prakrit Vibhag:** Convener: **Dr. Yogesh Kumar Jain** (Associate Professor | Ph: 9413142180)\n2. **Shiksha-Shastra (B.Ed & M.Ed):** HOD & Associate Director: **Prof. Shri Govinda Pandey**\n3. **Sahitya Vibhag:** Convener: **Prof. Sanandan Kumar Tripathi** (Senior Prof: Prof. Hans Dhar Jha)\n4. **Vyakarana Vibhag:** Convener: **Prof. Subodh Sharma**\n5. **Jyotisha Vibhag:** Senior Faculty: **Prof. Hans Dhar Jha**\n6. **Advaita Vedanta:** Head: **Dr. Pavan Vyas**\n7. **Modern Subjects (English/Computer):** Convener: **Prof. Archana Dubey**\n\n- **Campus Director:** **Prof. Hans Dhar Jha**\n- **Contact:** 0755-2696971 | [https://csu-bhopal.edu.in](https://csu-bhopal.edu.in)`;
    } else {
      return `🏛️ **केन्द्रीय संस्कृत विश्वविद्यालय, भोपाल परिसर के प्रमुख विभाग एवं संकाय (सत्यापित):**\n\n1. **जैन दर्शन एवं प्राकृत विभाग:** संयोजक एवं विभागाध्यक्ष: **डॉ. योगेश कुमार जैन (Dr. Yogesh Kumar Jain)**\n2. **शिक्षाशास्त्र विभाग (B.Ed / M.Ed):** विभागाध्यक्ष व सह-निदेशक: **प्रो. श्री गोविन्द पाण्डेय**\n3. **साहित्य विभाग:** संयोजक: **प्रो. सनन्दन कुमार त्रिपाठी** (वरिष्ठ आचार्य: प्रो. हंसधर झा)\n4. **व्याकरण विभाग:** संयोजक: **प्रो. सुबोध शर्मा**\n5. **ज्योतिष विभाग:** वरिष्ठ आचार्य: **प्रो. हंसधर झा**\n6. **अद्वैत वेदान्त विभाग:** अध्यक्ष: **डॉ. पवन व्यास**\n7. **आधुनिक विषय विभाग:** संयोजिका: **प्रो. अर्चना दुबे**\n\n- **परिसर निदेशक:** **प्रो. हंसधर झा**\n- **संपर्क:** 0755-2696971 | पता: संस्कृत मार्ग, बागसेवनिया, भोपाल - 462043\n- **वेबसाइट:** [https://csu-bhopal.edu.in](https://csu-bhopal.edu.in)`;
    }
  }

  // Bhopal Hostel Query Check (100% VERIFIED NAMES: Kavi Bhaskar & Dakshi Hostels)
  const isBhopalHostelQuery =
    (q.includes("bhopal") || q.includes("भोपाल")) &&
    (q.includes("hostel") || q.includes("chhatravas") || q.includes("छात्रावास") || (q.includes("boys") && q.includes("hostel")) || (q.includes("girls") && q.includes("hostel")));

  const isGeneralHostelQuery =
    q.includes("hostel") || q.includes("chhatravas") || q.includes("छात्रावास") || q.includes("boys hostel") || q.includes("girls hostel");

  if (isBhopalHostelQuery || (isGeneralHostelQuery && (q.includes("bhopal") || q.includes("boys hostel ka naam") || q.includes("boys hostel ka nam") || q.includes("boys hostel ka namm")))) {
    if (lang === "sa") {
      return `🏫 **भोपालपरिसरस्य छात्रावासाः (Hostels - 100% Verified):**\n\n- 👦 **छात्र-छात्रावासः (Boys' Hostel):** **कविभास्कर छात्र-छात्रावासः (Kavi Bhaskar Boys' Hostel)**\n  * प्रकोष्ठाः (Rooms): १६८ | क्षमता (Capacity): २७६ छात्राः\n- 👧 **छात्रा-छात्रावासः (Girls' Hostel):** **दाक्षी छात्रा-छात्रावासः (Dakshi Girls' Hostel)**\n  * प्रकोष्ठाः (Rooms): ५४ | क्षमता: १३३ छात्राः\n\n🍲 **भोजनालयः (Mess):** अन्नपूर्णा भोजनालयः (सात्त्विक-पौष्टिक-भोजनम्)\n💰 **शुल्कम्:** वार्षिकं ₹१,५०० (कक्षभाटकम्) + ₹२,००० (कॉशन मनी) = कुलम् ₹३,५००।\n📍 **सङ्केतः:** संस्कृत मार्ग, बागसेवनिया, भोपाल (म.प्र.) - 462043\n🌐 **छात्रावास-जालपुष्टम्:** [https://csu-bhopal.edu.in/hostel.html](https://csu-bhopal.edu.in/hostel.html)`;
    } else if (lang === "en") {
      return `🏫 **CSU Bhopal Campus Official Hostel Details (100% Verified):**\n\n- 👦 **Boys' Hostel Name:** **Kavi Bhaskar Boys' Hostel** (कविभास्कर छात्र-छात्रावास)\n  * **Capacity:** 168 furnished rooms accommodating up to 276 male students.\n- 👧 **Girls' Hostel Name:** **Dakshi Girls' Hostel** (दाक्षी छात्रा-छात्रावास)\n  * **Capacity:** 54 rooms accommodating up to 133 female students.\n\n🍲 **Mess & Dining:** **Annapurna Bhojanalaya** (hygienic vegetarian meals 3 times daily)\n💰 **Hostel Fees:** Annual Room Rent ₹1,500 + Refundable Caution Deposit ₹2,000 = Total ₹3,500 at admission. Mess charges approx ₹1,800 to ₹2,500 monthly.\n📌 **In-Charge Contact:** Mr. Sudhanshu Kanojiya (7987483036)\n📍 **Address:** Sanskrit Marg, Bagsevaniya, Bhopal, Madhya Pradesh - 462043\n🌐 **Official Hostel Page:** [https://csu-bhopal.edu.in/hostel.html](https://csu-bhopal.edu.in/hostel.html)`;
    } else if (lang === "hinglish") {
      return `🏫 **CSU Bhopal Campus Hostel Details (100% Official & Verified):**\n\n- 👦 **Boys' Hostel ka Naam:** **Kavi Bhaskar Boys' Hostel** (कविभास्कर छात्र-छात्रावास)\n  * **Capacity:** 168 Rooms, 276 students reh sakte hain.\n- 👧 **Girls' Hostel ka Naam:** **Dakshi Girls' Hostel** (दाक्षी छात्रा-छात्रावास)\n  * **Capacity:** 54 Rooms, 133 female students ke liye.\n\n🍲 **Mess:** **Annapurna Bhojanalaya** (Clean, hygienic pure vegetarian food)\n💰 **Hostel Fees:**\n  * Room Rent (Annual): ₹1,500\n  * Caution Deposit (Refundable): ₹2,000\n  * **Total Admission Fee:** ₹3,500\n  * Monthly Mess Charges: ₹1,800 se ₹2,500 lagbhag.\n📌 **Hostel Incharge Contact:** Mr. Sudhanshu Kanojiya (Mobile: 7987483036)\n📍 **Address:** Sanskrit Marg, Bagsevaniya, Bhopal, Madhya Pradesh - 462043\n🌐 **Official Hostel Link:** [https://csu-bhopal.edu.in/hostel.html](https://csu-bhopal.edu.in/hostel.html)`;
    } else {
      return `🏫 **भोपाल परिसर के छात्रावास (100% आधिकारिक व सत्यापित विवरण):**\n\n- 👦 **लड़कों के छात्रावास का नाम (Boys' Hostel):** **कविभास्कर छात्र-छात्रावास (Kavi Bhaskar Boys' Hostel)**\n  * **क्षमता:** 168 सुसज्जित कमरे, जिसमें 276 छात्रों के रहने की व्यवस्था है।\n- 👧 **लड़कियों के छात्रावास का नाम (Girls' Hostel):** **दाक्षी छात्रा-छात्रावास (Dakshi Girls' Hostel)**\n  * **क्षमता:** 54 कमरे, जिसमें 133 छात्राओं के रहने की व्यवस्था है।\n\n🍲 **भोजनालय (Mess):** **अन्नपूर्णा भोजनालय** (प्रतिदिन तीन समय स्वच्छ, सात्त्विक व पौष्टिक भोजन)\n💰 **छात्रावास शुल्क संरचना:**\n  * वार्षिक कमरा किराया: ₹1,500\n  * कॉशन मनी (वापसी योग्य): ₹2,000\n  * **प्रवेश के समय कुल शुल्क:** ₹3,500\n  * मासिक मेस शुल्क: लगभग ₹1,800 से ₹2,500\n📌 **छात्रावास प्रभारी:** श्री सुधांशु कनौजिया (मोबाइल: 7987483036)\n📍 **पता:** संस्कृत मार्ग, बागसेवनिया, भोपाल (मध्य प्रदेश) - 462043\n🌐 **आधिकारिक विवरण पृष्ठ:** [https://csu-bhopal.edu.in/hostel.html](https://csu-bhopal.edu.in/hostel.html)`;
    }
  }

  if (isGeneralHostelQuery) {
    if (lang === "sa") {
      return `🏫 **केन्द्रीयसंस्कृतविश्वविद्यालयस्य मुख्याः छात्रावासाः:**\n\n1. **भोपालपरिसरः:** छात्र-छात्रावासः: **कविभास्कर छात्र-छात्रावासः** | छात्रा-छात्रावासः: **दाक्षी छात्रा-छात्रावासः**\n2. **पुरीपरिसरः (ओडिशा):** छात्र-छात्रावासः: **गोपबन्धु छात्रवासः** | छात्रा-छात्रावासः: **कुन्तला छात्रवासः**\n3. **शृङ्गेरीपरिसरः (कर्णाटकम्):** छात्र-छात्रावासः: **शङ्कर छात्रवासः** | छात्रा-छात्रावासः: **शारदा छात्रवासः**\n4. **जयपुरपरिसरः (राजस्थानम्):** छात्र-छात्रावासः: **धन्वन्तरि छात्रवासः** | छात्रा-छात्रावासः: **सरस्वती छात्रवासः**\n5. **प्रयागराजपरिसरः (उ.प्र.):** **गङ्गानाथझा छात्रवासः**\n6. **जम्मू-परिसरः (जेएंडके):** **रणवीर छात्रवासः**\n\n📌 छात्रावासेषु भोजनमेश् (Mess), वाई-फाई, सुरक्षा च उपलभ्यते।`;
    } else if (lang === "en") {
      return `🏫 **CSU Main Campus Hostel Directory (Verified):**\n\n1. **Bhopal Campus (MP):** Boys' Hostel: **Kavi Bhaskar Boys' Hostel** | Girls' Hostel: **Dakshi Girls' Hostel**\n2. **Puri Campus (Odisha):** Boys' Hostel: **Gopabandhu Hostel** | Girls' Hostel: **Kuntala Hostel**\n3. **Sringeri Campus (Karnataka):** Boys' Hostel: **Shankara Hostel** | Girls' Hostel: **Sharada Hostel**\n4. **Jaipur Campus (Rajasthan):** Boys' Hostel: **Dhanvantari Hostel** | Girls' Hostel: **Saraswati Hostel**\n5. **Prayagraj Campus (UP):** **Ganganath Jha Hostel**\n6. **Jammu Campus (J&K):** **Ranbir Hostel**\n\n📌 All CSU hostels provide hygienic mess dining, Wi-Fi, sports reading rooms, and 24x7 security.\n🌐 Official Link: [https://sanskrit.nic.in](https://sanskrit.nic.in)`;
    } else {
      return `🏫 **केन्द्रीय संस्कृत विश्वविद्यालय के मुख्य छात्रावास (सत्यापित विवरण):**\n\n1. **भोपाल परिसर (म.प्र.):** बॉयज हॉस्टल: **कविभास्कर छात्र-छात्रावास** | गर्ल्स हॉस्टल: **दाक्षी छात्रा-छात्रावास**\n2. **पुरी परिसर (ओडिशा):** छात्र छात्रावास: **गोपबंधु छात्रावास** | छात्रा छात्रावास: **कुंतला छात्रावास**\n3. **शृंगेरी परिसर (कर्नाटक):** छात्र छात्रावास: **शंकर छात्रावास** | छात्रा छात्रावास: **शारदा छात्रावास**\n4. **जयपुर परिसर (राजस्थान):** छात्र छात्रावास: **धन्वंतरि छात्रावास** | छात्रा छात्रावास: **सरस्वती छात्रावास**\n5. **प्रयागराज परिसर (उ.प्र.):** **गंगानाथ झा छात्रावास**\n6. **जम्मू परिसर (J&K):** **रणवीर छात्रावास**\n\n📌 सभी परिसरों में मेस, वाई-फाई, लाइब्रेरी और 24 घंटे सुरक्षा उपलब्ध है।`;
    }
  }

  // Strict Factual Accuracy Fallback for Specific Fees or Exact Unannounced Exam Dates
  const isUnverifiedSpecificQuery =
    (q.includes("fee") || q.includes("फीस") || q.includes("shulk") || q.includes("शुल्क")) &&
    (q.includes("kitni") || q.includes("exact") || q.includes("kitna") || q.includes("per semester") || q.includes("kitne"));

  if (isUnverifiedSpecificQuery) {
    if (lang === "sa") {
      return "कृपया अस्य विषयस्य आधिकारिक-नवीन-सूचनायै CSU इत्यस्य जालस्थानम् (sanskrit.nic.in) पश्यन्तु अथवा परिसरकार्यालयं सम्पर्कं कुर्वन्तु।";
    } else if (lang === "en") {
      return "Please visit the official CSU website (sanskrit.nic.in) or contact the campus office for official and up-to-date information regarding this topic.";
    } else {
      return "कृपया फीस व शुल्क संबंधी नवीनतम व सटीक तालिका हेतु विश्वविद्यालय की आधिकारिक वेबसाइट (sanskrit.nic.in) देखें या अपने संबंधित परिसर कार्यालय से संपर्क करें। सामान्यतः नियमित शास्त्री व आचार्य पाठ्यक्रमों का वार्षिक शुल्क लगभग ₹2,000 से ₹5,000 होता है।";
    }
  }

  // Date & Time Inquiry Check
  const isDateQuery =
    q.includes("date") ||
    q.includes("tarikh") ||
    q.includes("taarikh") ||
    q.includes("aaj kitni") ||
    q.includes("aaj ki date") ||
    q.includes("today date") ||
    q.includes("time") ||
    q.includes("samay") ||
    q.includes("din kya");

  if (isDateQuery) {
    const todayStr = new Date().toLocaleDateString("hi-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Kolkata",
    });
    const todayEnStr = new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Kolkata",
    });
    if (lang === "en") {
      return `📅 **Today's Date:** ${todayEnStr} (India Standard Time)\n\nHow can I assist you with Central Sanskrit University admissions, courses, or campus details today? 😊`;
    } else if (lang === "sa") {
      return `📅 **अद्यतना दिनांकः:** ${todayEnStr}\n\nअद्य भवतः केन्द्रीयसंस्कृतविश्वविद्यालय-सम्बन्धे का सहायता करणीया? 😊`;
    } else if (lang === "hinglish") {
      return `📅 **Aaj ki Date:** ${todayEnStr} hai!\n\nBataiye, aaj Central Sanskrit University (CSU) ke baare me aap kya jaanna chahte hain? 😊`;
    } else {
      return `📅 **आज की दिनांक (Date):** ${todayStr} (${todayEnStr})\n\nबताइए, आज केन्द्रीय संस्कृत विश्वविद्यालय (CSU) के बारे में आप क्या जानना चाहते हैं? 😊`;
    }
  }

  // BTech / Nasik Course Query Check
  const isBTechOrNasikQuery =
    q.includes("btech") ||
    q.includes("b.tech") ||
    q.includes("engineering") ||
    q.includes("nasik") ||
    q.includes("nashik") ||
    q.includes("ai & data science") ||
    q.includes("ai and data science");

  if (isBTechOrNasikQuery) {
    if (lang === "en") {
      return `💻 **B.Tech in Artificial Intelligence & Data Science at CSU Nashik Campus:**\n\nCentral Sanskrit University (CSU) offers a pioneer 4-year **B.Tech in Artificial Intelligence & Data Science** program at its **Nashik Campus (Maharashtra)**!\n\n✨ **Key Highlights:**\n- **AICTE Approved:** India's first AICTE-approved engineering degree program offered by a Sanskrit Central University under NEP-2020.\n- **Curriculum:** Blends modern Artificial Intelligence, Machine Learning, Python, NLP, Data Science, and Cloud Computing with Sanskrit Computational Linguistics and Indian Knowledge Systems (IKS).\n- **Total Intake:** 66 Seats (60 regular + 6 supernumerary).\n- **Eligibility:** 10+2 with Physics, Chemistry & Mathematics (PCM) with basic Sanskrit understanding.\n- **Admission:** Via JEE score / Entrance examination.\n\n🌐 **Official Information:** Visit [https://sanskrit.nic.in](https://sanskrit.nic.in)`;
    } else if (lang === "hinglish") {
      return `💻 **CSU Nashik Campus me B.Tech (AI & Data Science):**\n\nHaanji bilkul sahi! Central Sanskrit University (CSU) apne **Nashik / Mumbai Campus (Maharashtra)** par 4-saal ka **B.Tech in Artificial Intelligence & Data Science** offer karta hai! 🔥\n\n✨ **B.Tech Course ki Highlights:**\n- **AICTE Approved:** Yeh India ka pehla AICTE approved engineering program hai jise Sanskrit Central University conduct karti hai (NEP-2020 ke tahat).\n- **Syllabus:** Iss B.Tech me Artificial Intelligence, Machine Learning, Data Science, Python, Deep Learning ke sath Computational Linguistics aur Sanskrit Manuscripts digitization sikhaya jata hai.\n- **Total Seats:** 66 seats (60 regular + 6 supernumerary seats).\n- **Eligibility:** 12th PCM (Physics, Chemistry, Maths).\n- **Admission Process:** Entrance Exam / JEE merit ke dwara.\n\nMore details: [https://sanskrit.nic.in](https://sanskrit.nic.in)`;
    } else {
      return `💻 **केन्द्रीय संस्कृत विश्वविद्यालय - नासिक परिसर में B.Tech (AI & Data Science):**\n\nहाँ जी, बिल्कुल सही! केन्द्रीय संस्कृत विश्वविद्यालय (CSU) अपने **नासिक परिसर (महाराष्ट्र)** में 4-वर्षीय **B.Tech in Artificial Intelligence and Data Science** पाठ्यक्रम संचालित करता है! 🎉\n\n✨ **पाठ्यक्रम की मुख्य विशेषताएँ:**\n- **AICTE मान्यता प्राप्त:** यह भारत का पहला AICTE-approved इंजीनियरिंग पाठ्यक्रम है जो संस्कृत केंद्रीय विश्वविद्यालय द्वारा राष्ट्रीय शिक्षा नीति (NEP-2020) के अंतर्गत शुरू किया गया है।\n- **पाठ्यक्रम (Curriculum):** इसमें AI, Machine Learning, Data Science, Python, NLP के साथ-साथ संस्कृत कम्प्यूटेशनल भाषाविज्ञान और प्राचीन पाण्डुलिपियों के डिजिटलाइजेशन की तकनीक सिखाई जाती है।\n- **कुल सीटें:** 66 सीटें (60 नियमित + 6 सुपरन्यूमरेरी सीटें)।\n- **पात्रता:** 10+2 (भौतिकी, रसायन विज्ञान व गणित - PCM)।\n- **प्रवेश प्रक्रिया:** एंट्रेंस एग्जाम / JEE मेरिट द्वारा।\n\n🌐 **अधिक जानकारी हेतु portal देखें:** [https://sanskrit.nic.in](https://sanskrit.nic.in)`;
    }
  }

  // Two-Step Verification Pipeline / Architecture Request Check
  const isArchitectureChangeRequest =
    (q.includes("search api") || q.includes("first api") || q.includes("ek api") || q.includes("live search") || q.includes("varify hokar")) &&
    (q.includes("lga") || q.includes("kamm kar") || q.includes("kar") || q.includes("karo"));

  if (isArchitectureChangeRequest) {
    if (lang === "hinglish" || lang === "hi") {
      return `✅ **Two-Step Verification Pipeline Active:**\n\n1. **Step 1 (First API):** Query pehle First API ke paas jakar initial response draft karegi.\n2. **Step 2 (Live Search & Verification API):** Live search aur university official data ke sath cross-verify hokar hi 100% accurate aur concise answer render hoga.\n\n📌 **Jaipur Campus Director:** CSU Jaipur Campus ke Director **Prof. Nilabh Tiwari** (प्रो. नीलाभ तिवारी) hain (pehle Prof. Madan Mohan Jha the, jo ab Jaipur me nahi hain).`;
    } else {
      return `✅ **Two-Stage Verification Pipeline Active:**\n\n1. **Step 1 (First API):** Query is first processed by the primary AI to produce a draft response.\n2. **Step 2 (Live Search & Verification API):** Real-time web search and official portal data verify and correct the draft for 100% factual accuracy before displaying.\n\n📌 **Jaipur Campus Director:** The current Director is **Prof. Nilabh Tiwari** (प्रो. नीलाभ तिवारी).`;
    }
  }

  // User Complaint / Clarification Request
  const isComplaint =
    q.includes("galat") ||
    q.includes("wrong") ||
    q.includes("incorrect") ||
    q.includes("sahi batao") ||
    q.includes("sahi nhai") ||
    q.includes("sahi nahi") ||
    q.includes("kuch aur") ||
    q.includes("puch kuch") ||
    q.includes("samajh nahi") ||
    q.includes("kya bol");

  if (isComplaint) {
    if (lang === "en") {
      return `Apologies for any confusion! 🙏 Please feel free to rephrase or specify your question directly—for example:\n\n1. **Admissions & CUET**: How to apply for Shastri (B.A.), Acharya (M.A.), or B.Ed via Samarth Portal?\n2. **Campuses & Directors**: Details for Bhopal Campus (Director: Prof. Hans Dhar Jha) or other 11 campuses?\n3. **Exams & Marksheets**: Verification and result links on sanskrit.nic.in?\n4. **Sanskrit Shastras & NEP-2020**: Course subjects, Vyakarana, Sahitya, or Computational Linguistics?\n\nPlease tell me what specific detail you'd like to know!`;
    } else {
      return `क्षमा करें! 🙏 अगर मेरे पिछले उत्तर में कोई अस्पष्टता रही हो। कृपया अपना प्रश्न पुनः सीधा पूछें—जैसे कि:\n\n1. **एडमिशन (CUET/Samarth)**: शास्त्री (B.A.), आचार्य (M.A.), या B.Ed. में प्रवेश प्रक्रिया?\n2. **परिसर व निदेशक**: भोपाल परिसर (निदेशक: प्रो. हंसधर झा) या अन्य 11 परिसरों के बारे में?\n3. **परीक्षा व मार्कशीट**: रिजल्ट पोर्टल व अंकपत्र सत्यापन?\n4. **विषय व सिलेबस**: व्याकरण, साहित्य, ज्योतिष, या कंप्यूटर विषय?\n\nआप जिसके बारे में पूछना चाहते हैं, कृपया बेझिझक विस्तार से लिखें! 😊`;
    }
  }

  // Casual Greeting Check
  const isCasualGreeting = /^(h+y+|h+e+y+|h+i+|h+e+l+l+o+|namaste|namaskar|pranam|halo|hola)(\s*[!.,?]*)*$/i.test(q);
  if (isCasualGreeting) {
    if (lang === "sa") return "नमस्ते! 🙏 अद्य भवतः कां सहायतां कर्तुं शक्नोमि?";
    if (lang === "en") return "Hello! How can I help you today? 😊🙏";
    return "नमस्ते! 🙏 आज मैं आपकी क्या सहायता कर सकता हूँ? 😊";
  }

  // How are you check
  const isHowAreYou = /\b(kaise\s+ho|kese\s+ho|kya\s+hal|kya\s+haal|how\s+are\s+you)\b/i.test(q);
  if (isHowAreYou) {
    if (lang === "en") {
      return "I'm doing great, thank you! 😊 How are you doing today? How can I help you with your university studies?";
    }
    return "मैं बहुत बढ़िया हूँ, शुक्रिया! 😊 आप बताइए, आप कैसे हैं और आपका दिन कैसा बीत रहा है? आज पढ़ाई या कॉलेज से जुड़ी क्या मदद करूँ आपकी?";
  }

  // 1. ENGLISH RESPONSES
  if (lang === "en") {
    if (hasFile && (q.includes("check") || q.includes("verify") || q.includes("look") || q.includes("admit") || q.includes("marksheet") || q.includes("file") || q.includes("photo"))) {
      return `📄 **Attached Document Received: ${attachedFileName}**\n\nI have registered your uploaded file for Central Sanskrit University verification:\n- **For Marksheet / Degree Verification:** You can cross-check grade records directly on the CSU Examination portal: [https://sanskrit.nic.in/examination_results.php](https://sanskrit.nic.in/examination_results.php)\n- **For Samarth Portal Examination/Admit Card:** Access your Student Life Cycle account: [https://sanskrit.samarth.edu.in](https://sanskrit.samarth.edu.in)\n- **For Admissions / Counseling:** Upload original scanned certificates on [https://sanskritadm.samarth.edu.in](https://sanskritadm.samarth.edu.in)\n\n*(Note: Ensure all credentials and enrollment roll numbers match your registration records exactly.)*`;
    }

    if (q.includes("vc") || q.includes("vice chancellor") || q.includes("head") || q.includes("varakhedi")) {
      return `🏛️ **Vice-Chancellor of Central Sanskrit University:**\n\nThe honorable Vice-Chancellor of Central Sanskrit University (CSU) is **Prof. Shrinivasa Varakhedi** (प्रोफेसर-श्रीनिवास-वरखेडी).\n\nUnder his guidance, CSU has spearheaded the full implementation of NEP-2020, Sanskrit Computational Linguistics, AI & NLP initiatives, digital manuscript preservation, and global promotion of Sanskrit Shastras.\n\n📍 **Headquarters:** 56-57, Institutional Area, Janakpuri, New Delhi - 110058\n🌐 **Official Portal:** [https://sanskrit.nic.in](https://sanskrit.nic.in)`;
    }

    if (q.includes("campus") || q.includes("hostel") || q.includes("location") || q.includes("center")) {
      return `🏛️ **Central Sanskrit University Campuses & Hostels:**\n\nCSU operates 12 premier campuses across India along with a distance learning directorate (MSP):\n1. **Ganganath Jha Campus**, Prayagraj (Uttar Pradesh) - Renowned for rare manuscripts and higher research\n2. **Shri Sadashiva Campus**, Puri (Odisha) - Traditional Shastras, Jagannatha culture, and Shiksha Shastri (B.Ed.)\n3. **Shri Ranbir Campus**, Jammu (Jammu & Kashmir)\n4. **Guruvayoor Campus**, Thrissur (Kerala)\n5. **Jaipur Campus**, Jaipur (Rajasthan) - Blend of traditional Shastras and modern computing\n6. **Lucknow Campus**, Lucknow (Uttar Pradesh)\n7. **Rajiv Gandhi Campus**, Sringeri (Karnataka) - Advaita Vedanta & Shastra Peetham\n8. **Vedavyasa Campus**, Baddi (Himachal Pradesh)\n9. **Bhopal Campus**, Bhopal (Madhya Pradesh)\n10. **K.J. Somaiya Campus**, Mumbai (Maharashtra)\n11. **Eklavya Campus**, Agartala (Tripura) - Sanskrit hub for Northeast India\n12. **Shri Raghunath Kirti Campus**, Devprayag (Uttarakhand) - Himalayan Himalayan campus\n13. **Mukta Swadhyaya Peetham (MSP)** - Distance Education Directorate, Janakpuri, New Delhi\n\n📌 **Hostel Facilities:** Most CSU campuses provide safe, affordable hostel accommodation and mess facilities for regular Shastri, Acharya, and Shiksha Shastri students based on merit and distance.\n🌐 Official link: [https://sanskrit.nic.in](https://sanskrit.nic.in)`;
    }

    if (q.includes("admission") || q.includes("cuet") || q.includes("apply") || q.includes("samarth") || q.includes("counseling")) {
      return `📝 **CSU Admission Process (Current Academic Session):**\n\n1. **Regular Undergraduate Programs (Shastri B.A. Honours - 4 Year FYUGP NEP-2020):**\n   - Admissions are coordinated through **NTA CUET-UG**.\n2. **Postgraduate Programs (Acharya M.A. & Shiksha Shastri B.Ed.):**\n   - Coordinated through **NTA CUET-PG**.\n3. **Central Samarth Counseling Portal:**\n   - Candidates must register online for seat allotment at: [https://sanskritadm.samarth.edu.in](https://sanskritadm.samarth.edu.in)\n4. **Non-CUET Institutional Round:**\n   - For any vacant seats, individual campuses release direct application notifications on [sanskrit.nic.in](https://sanskrit.nic.in).\n5. **Distance Education (MSP):**\n   - Direct registration is open via [sanskrit.nic.in](https://sanskrit.nic.in).`;
    }

    if (q.includes("shastri") || q.includes("bed") || q.includes("b.ed") || q.includes("acharya") || q.includes("degree") || q.includes("course") || q.includes("nep")) {
      return `🎓 **Degree Programs & NEP-2020 Curriculum at CSU:**\n\n* **Prak-Shastri (+2 / Higher Secondary):** 2-year bridge program combining foundational Sanskrit Shastras with English, Computers, and Modern subjects.\n* **Shastri (B.A. Honours - FYUGP 4-Year NEP):** Multidisciplinary degrees in Vyakarana, Sahitya, Jyotisha, Nyaya, Vedanta, and Sanskrit Computational Linguistics.\n* **Acharya (M.A. in Sanskrit):** 2-year postgraduate degree across 15+ specialized traditional Shastras.\n* **Shiksha Shastri (B.Ed.):** 2-year NCTE-approved professional teacher training program for Sanskrit pedagogy.\n* **Vidyanidhi (Ph.D.):** Doctoral research program with monthly UGC/CSU research fellowships.`;
    }

    if (q.includes("result") || q.includes("marksheet") || q.includes("exam") || q.includes("grade") || q.includes("hall ticket")) {
      return `📄 **Examination Results & Marksheet Verification:**\n\n- **Official Results Portal:** [https://sanskrit.nic.in/examination_results.php](https://sanskrit.nic.in/examination_results.php)\n- **Samarth Student Portal (Hall Ticket & Semester Grade Cards):** [https://sanskrit.samarth.edu.in](https://sanskrit.samarth.edu.in)\n\n*Requirements for verification:* Keep your Enrollment Number, Roll Number, and Campus Code ready.`;
    }

    if (q.includes("registrar") || q.includes("register")) {
      return `🏛️ **Registrar of Central Sanskrit University (CSU):**\n\n- **Registrar:** Prof. R.G. Murali Krishna (प्रोफेसर आर. जी. मुरली कृष्ण)\n- **Headquarters:** Central Sanskrit University, 56-57 Institutional Area, Janakpuri, New Delhi - 110058\n- **Official Contact & Portal:** [https://sanskrit.nic.in](https://sanskrit.nic.in)\n\nFor official administrative notifications, circulars, or university administration contacts, please visit the official website or contact the Registrar's Office.`;
    }

    if (q.includes("pradeep pandey") || q.includes("pande") || q.includes("professor")) {
      return `🎓 **Faculty / Officers at Central Sanskrit University:**\n\nCentral Sanskrit University has distinguished professors and academic heads across its 12 campuses in India.\n- **Vice-Chancellor:** Prof. Shrinivasa Varakhedi\n- **Bhopal Campus Director:** Prof. Hans Dhar Jha\n- **Registrar:** Prof. R.G. Murali Krishna\n\nFor specific department faculty listings, designations, and contact details, please refer to the official faculty directory on [https://sanskrit.nic.in](https://sanskrit.nic.in).`;
    }

    return `Regarding your query "${query}":\n\nCentral Sanskrit University (CSU), New Delhi is an official Central University under the Ministry of Education, Govt. of India.\n\n- **Vice-Chancellor:** Prof. Shrinivasa Varakhedi\n- **Registrar:** Prof. R.G. Murali Krishna\n- **Bhopal Campus Director:** Prof. Hans Dhar Jha\n- **Official Website:** [https://sanskrit.nic.in](https://sanskrit.nic.in)\n\nYou can ask me specific questions about admissions, exams, marksheets, hostels, or campus details! 😊`;
  }

  // 2. SANSKRIT RESPONSES
  if (lang === "sa") {
    if (hasFile) {
      return `📄 **संलग्न-सञ्चिका प्राप्ता: ${attachedFileName}**\n\nभवता प्रेषितं दस्तावेजम्/चित्रं केन्द्रीयसंस्कृतविश्वविद्यालयस्य छात्रमित्रेण स्वीकृतम्।\n- **अङ्कपत्र-प्रमाणीकरणाय:** कृपया [https://sanskrit.nic.in/examination_results.php](https://sanskrit.nic.in/examination_results.php) इति जालपुटे स्वस्य अनुक्रमाङ्कं प्रविशतु।\n- **प्रवेश-सम्बन्धे:** समर्थ-प्रवेश-द्वारम् [https://sanskritadm.samarth.edu.in](https://sanskritadm.samarth.edu.in) अस्ति।`;
    }

    if (q.includes("vc") || q.includes("vice chancellor") || q.includes("कुलपति") || q.includes("varakhedi")) {
      return `🏛️ **केन्द्रीयसंस्कृतविश्वविद्यालयस्य माननीयाः कुलपतयः:**\n\nसम्प्रति केन्द्रीयसंस्कृतविश्वविद्यालयस्य कुलपतयः **प्रोफेसर-श्रीनिवास-वरखेडी-महाभागाः** सन्ति।\n\nतेषां कुशलनेतृत्वे राष्ट्रिय-शिक्षा-नीतेः (NEP-2020), कम्प्यूटेशनल-संस्कृतस्य, पाण्डुलिपि-संरक्षणस्य च बहवः अभिनव-प्रकल्पाः प्रचलन्ति।\n\n📍 **मुख्यालयः:** ५६-५७, सांस्थानिक-क्षेत्रम्, जनकपुरी, नवदेहली - ११००५८\n🌐 **आधिकारिक-जालस्थानम्:** [https://sanskrit.nic.in](https://sanskrit.nic.in)`;
    }

    if (q.includes("campus") || q.includes("परिसर") || q.includes("छात्रावास") || q.includes("hostel")) {
      return `🏛️ **केन्द्रीयसंस्कृतविश्वविद्यालयस्य द्वादश-परिसराः छात्रावासाश्च:**\n\nविश्वविद्यालयस्य भारतवर्षे द्वादश (१२) मुख्याः परिसराः तथा एका दूरस्थशिक्षासंस्था (MSP) सन्ति:\n१. **गङ्गानाथझापरिसरः**, प्रयागराजः (उत्तरप्रदेशः) - पाण्डुलिपिशास्त्रम्\n२. **श्रीसदाशिवपरिसरः**, पुरी (ओडिशा) - जगन्नाथसंस्कृतिः, शिक्षाशास्त्री (B.Ed.)\n३. **श्रीरणवीरपरिसरः**, जम्मू (जम्मू-कश्मीरम्)\n४. **गुरुवायूरपरिसरः**, तृश्शूर (केरळम्)\n५. **जयपुरपरिसरः**, जयपुरम् (राजस्थानम्)\n६. **लखनऊपरिसरः**, लखनऊ (उत्तरप्रदेशः)\n७. **राजीवगान्धीपरिसरः**, शृङ्गेरी (कर्णाटकम्) - वेदान्तपीठम्\n८. **वेदव्यासपरिसरः**, बद्दी (हिमाचलप्रदेशः)\n९. **भोपालपरिसरः**, भोपालम् (मध्यप्रदेशः)\n१०. **के.जे. सोमैयापरिसरः**, मुम्बई (महाराष्ट्रम्)\n११. **एकलव्यपरिसरः**, अगरतला (त्रिपुरा) - पूर्वोत्तरभारतस्य मुख्यकेन्द्रम्\n१२. **श्रीरघुनाथकीर्तिपरिसरः**, देवप्रयागः (उत्तराखण्डः)\n१३. **मुक्तस्वाध्यायपीठम् (MSP)**, नवदेहली (दूरस्थशिक्षा)\n\n📌 **छात्रावासव्यवस्था:** नियमित-विद्यार्थिभ्यः योग्यतायाः दूरावस्थितेश्च आधारेण छात्रावासस्य उत्तमव्यवस्था वर्तते।`;
    }

    if (q.includes("admission") || q.includes("प्रवेश") || q.includes("cuet") || q.includes("samarth")) {
      return `📝 **केन्द्रीयसंस्कृतविश्वविद्यालये प्रवेशप्रक्रिया:**\n\n१. **शास्त्री-प्रवेशः (B.A. Honours NEP-2020):** NTA CUET-UG माध्यमेन।\n२. **आचार्यः (M.A.) तथा शिक्षाशास्त्री (B.Ed.):** NTA CUET-PG माध्यमेन।\n३. **केन्द्रीय-परामर्श-पञ्जीकरणम् (Samarth Portal):**\n   👉 [https://sanskritadm.samarth.edu.in](https://sanskritadm.samarth.edu.in)\n४. **अनावृत्त-सीट-प्रवेशः (Non-CUET):** रिक्तस्थानानां कृते परिसराः पृथक्तया विज्ञप्तिं प्रकाशयन्ति ([sanskrit.nic.in](https://sanskrit.nic.in))।`;
    }

    if (q.includes("result") || q.includes("marksheet") || q.includes("परीक्षा") || q.includes("अङ्कपत्र")) {
      return `📄 **परीक्षापरिणामः अङ्कपत्रसत्यापनं च:**\n\n- आधिकारिक-परीक्षापरिणाम-द्वारम्: [https://sanskrit.nic.in/examination_results.php](https://sanskrit.nic.in/examination_results.php)\n- समर्थ-छात्र-द्वारम् (Hall Ticket / Marksheet): [https://sanskrit.samarth.edu.in](https://sanskrit.samarth.edu.in)\n\nसत्यापनार्थं स्वस्य अनुक्रमाङ्कं प्रविशतु।`;
    }

    return `नमस्ते! केन्द्रीयसंस्कृतविश्वविद्यालयस्य आधिकारिक-छात्रमित्रे (CSU Mitra) भवतां हार्दिकं स्वागतम्। 🙏\n\nअहं भवतां साहाय्यार्थं सन्नद्धोऽस्मि:\n• 🏛️ **द्वादश-परिसराः छात्रावासाश्च (12 Campuses & Hostels)**\n• 🎓 **पाठ्यक्रमाः (Shastri, Acharya, Shiksha Shastri B.Ed., Ph.D.)**\n• 📝 **प्रवेश-काउंसलिंग-प्रक्रिया (CUET & Samarth Portal)**\n• 📄 **अङ्कपत्र-परीक्षापरिणामाः ([sanskrit.nic.in](https://sanskrit.nic.in))**\n• 📁 **दस्तावेज-चित्र-परीक्षणम् (Photos & Files)**\n\nकृपया स्वप्रश्नं पृच्छतु।`;
  }

  // 3. HINDI RESPONSES (DEFAULT FOR HINDI / HINGLISH)
  if (hasFile) {
    return `📄 **संलग्न फ़ाइल / दस्तावेज़ प्राप्त हुआ: ${attachedFileName}**\n\nआपके द्वारा अपलोड किए गए दस्तावेज़ (फ़ोटो/फ़ाइल) की सहायता हेतु निर्देश:\n- **अंकपत्र / परीक्षा परिणाम सत्यापन:** केन्द्रीय संस्कृत विश्वविद्यालय के आधिकारिक परीक्षा पोर्टल पर रोल नंबर से जांचें: [https://sanskrit.nic.in/examination_results.php](https://sanskrit.nic.in/examination_results.php)\n- **समर्थ छात्र पोर्टल (हॉल टिकट/अंकपत्र डाउनलोड):** [https://sanskrit.samarth.edu.in](https://sanskrit.samarth.edu.in)\n- **प्रवेश संबंधी आवेदन / काउंसलिंग:** [https://sanskritadm.samarth.edu.in](https://sanskritadm.samarth.edu.in)`;
  }

  if (q.includes("vc") || q.includes("vice chancellor") || q.includes("कुलपति") || q.includes("head") || q.includes("varakhedi")) {
    return `🏛️ **केन्द्रीय संस्कृत विश्वविद्यालय के कुलपति (Vice-Chancellor):**\n\nवर्तमान में केन्द्रीय संस्कृत विश्वविद्यालय के माननीय कुलपति **प्रोफेसर श्रीनिवास वरखेडी (Prof. Shrinivasa Varakhedi)** हैं।\n\nउनके कुशल मार्गदर्शन में विश्वविद्यालय में राष्ट्रीय शिक्षा नीति (NEP-2020), कम्प्यूटेशनल संस्कृत, डिजिटल पाण्डुलिपि संरक्षण तथा आधुनिक शास्त्रीय अनुसंधान के अनेक नवाचार संचालित हो रहे हैं।\n\n📍 मुख्यालय: 56-57, संस्थागत क्षेत्र, जनकपुरी, नई दिल्ली - 110058\n🌐 आधिकारिक जालस्थल: [https://sanskrit.nic.in](https://sanskrit.nic.in)`;
  }

  if (q.includes("campus") || q.includes("परिसर") || q.includes("hostel") || q.includes("छात्रावास")) {
    return `🏛️ **केन्द्रीय संस्कृत विश्वविद्यालय के 12 परिसर एवं छात्रावास:**\n\nविश्वविद्यालय के भारतभर में 12 प्रमुख परिसर और 1 दूरस्थ शिक्षा केंद्र (MSP) कार्यरत हैं:\n1. **गङ्गानाथ झा परिसर**, प्रयागराज (उ.प्र.) - दुर्लभ पाण्डुलिपि विज्ञान एवं उच्च शोध\n2. **श्री सदाशिव परिसर**, पुरी (ओडिशा) - पारम्परिक शास्त्र, जगन्नाथ संस्कृति व शिक्षा शास्त्री (B.Ed.)\n3. **श्री रणवीर परिसर**, जम्मू (जम्मू-कश्मीर)\n4. **गुरुवायूर परिसर**, त्रिशूर (केरल)\n5. **जयपुर परिसर**, जयपुर (राजस्थान) - पारम्परिक व आधुनिक संस्कृत समन्वय\n6. **लखनऊ परिसर**, लखनऊ (उ.प्र.)\n7. **राजीव गान्धी परिसर**, शृङ्गेरी (कर्नाटक) - अद्वैत वेदान्त एवं शास्त्र पीठ\n8. **वेदव्यास परिसर**, बद्दी (हिमाचल प्रदेश)\n9. **भोपाल परिसर**, भोपाल (म.प्र.)\n10. **के.जे. सोमैया परिसर**, मुम्बई (महाराष्ट्र)\n11. **एकलव्य परिसर**, अगरतला (त्रिपुरा) - पूर्वोत्तर भारत का मुख्य केंद्र\n12. **श्री रघुनाथ कीर्ति परिसर**, देवप्रयाग (उत्तराखण्ड) - हिमालयी देवभूमि परिसर\n13. **मुक्त स्वाध्याय पीठम् (MSP)**, जनकपुरी मुख्यालय, नई दिल्ली (दूरस्थ एवं ऑनलाइन शिक्षा)\n\n📌 **छात्रावास सुविधा (Hostel):** नियमित छात्रों (शास्त्री, आचार्य, शिक्षा शास्त्री) हेतु योग्यता एवं दूरी के आधार पर छात्रावास एवं मेस व्यवस्था उपलब्ध है।`;
  }

  if (q.includes("admission") || q.includes("प्रवेश") || q.includes("cuet") || q.includes("samarth") || q.includes("समर्थ")) {
    return `📝 **केन्द्रीय संस्कृत विश्वविद्यालय प्रवेश प्रक्रिया (Current Academic Session):**\n\n1. **शास्त्री (B.A. Hons - 4 Year FYUGP NEP-2020):** NTA CUET-UG प्रवेश परीक्षा द्वारा।\n2. **आचार्य (M.A.) एवं शिक्षा शास्त्री (B.Ed.):** NTA CUET-PG परीक्षा द्वारा।\n3. **केन्द्रीय समर्थ काउंसलिंग पोर्टल (Samarth Portal):**\n   👉 प्रवेश एवं सीट आवंटन लिंक: [https://sanskritadm.samarth.edu.in](https://sanskritadm.samarth.edu.in)\n4. **संस्थागत / रिक्त सीट प्रवेश (Non-CUET):**\n   - रिक्त सीटों हेतु परिसर स्तर पर Non-CUET आवेदन आमंत्रित किए जाते हैं (अधिसूचना [sanskrit.nic.in](https://sanskrit.nic.in) पर जारी होती है)।\n5. **मुक्त स्वाध्याय पीठम् (MSP - Distance Learning):**\n   - दूरस्थ पाठ्यक्रमों में सीधे प्रवेश हेतु समर्थ पोर्टल पर आवेदन करें।`;
  }

  if (q.includes("shastri") || q.includes("शास्त्री") || q.includes("bed") || q.includes("b.ed") || q.includes("shiksha") || q.includes("शिक्षा शास्त्री") || q.includes("acharya") || q.includes("आचार्य")) {
    return `🎓 **प्रमुख उपाधियाँ एवं राष्ट्रीय शिक्षा नीति (NEP-2020):**\n\n* **प्राक्-शास्त्री (+2 / इण्टरमीडिएट):** 2-वर्षीय पाठ्यक्रम (पारम्परिक व आधुनिक विषयों का सेतु)।\n* **शास्त्री (Four-Year Undergraduate Program - FYUGP B.A. Honours):** 4-वर्षीय बहुविषयक डिग्री (साहित्य, व्याकरण, ज्योतिष, दर्शन, न्याय, कम्प्यूटेशनल भाषाविज्ञान)।\n* **आचार्य (M.A. in Sanskrit):** 2-वर्षीय स्नातकोत्तर डिग्री (15 से अधिक शास्त्रीय विषयों में)।\n* **शिक्षा शास्त्री (B.Ed.):** 2-वर्षीय NCTE मान्यता प्राप्त शिक्षक प्रशिक्षण डिग्री।\n* **विद्यानिधि (Ph.D.):** उच्च शोध उपाधि (मासिक फेलोशिप सहित)।`;
  }

  if (q.includes("result") || q.includes("marksheet") || q.includes("परिणाम") || q.includes("अङ्कपत्र") || q.includes("exam") || q.includes("परीक्षा")) {
    return `📄 **परीक्षा परिणाम एवं अंकपत्र सत्यापन (Marksheet & Results):**\n\n- **परीक्षा परिणाम पोर्टल:** [https://sanskrit.nic.in/examination_results.php](https://sanskrit.nic.in/examination_results.php)\n- **समर्थ छात्र पोर्टल (हॉल टिकट व सेमेस्टर अंकपत्र):** [https://sanskrit.samarth.edu.in](https://sanskrit.samarth.edu.in)\n\nसत्यापन हेतु अपना रोल नंबर अथवा एन् Enrollment नंबर दर्ज करें।`;
  }

  return `आपके प्रश्न "${query || "CSU Inquiry"}" के संबंध में जानकारी:\n\nकेन्द्रीय संस्कृत विश्वविद्यालय (CSU), भारत सरकार के शिक्षा मंत्रालय के अधीन संस्कृत शिक्षा एवं शोध का सर्वप्रमुख केंद्रीय विश्वविद्यालय है।\n\nआप विश्वविद्यालय के आधिकारिक पोर्टल [https://sanskrit.nic.in](https://sanskrit.nic.in) पर नवीनतम सर्कुलर, रिजल्ट, और एडमिशन अपडेट देख सकते हैं। अथवा मुझसे एडमिशन, हॉस्टल, परिसर, कोर्स (शास्त्री/आचार्य/B.Ed) या परीक्षा के बारे में विशेष जानकारी पूछ सकते हैं! 😊`;
}
