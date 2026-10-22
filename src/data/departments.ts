import type { L } from "./hospital";

export type DeptId = "MED" | "CHD" | "WOM" | "ORT" | "ENT" | "EYE" | "SKN";

export type Department = {
  id: DeptId;
  name: L;
  desc: L;
  room: number;
  placeId: string;
  doctor: string;
  avgMin: number;
  seats: number;
};

export const OPD_HOURS = { start: "9:00", end: "14:00" };

export const DEPARTMENTS: Department[] = [
  { id: "MED", room: 1, placeId: "room1", doctor: "Dr. Anita Rao", avgMin: 8, seats: 40,
    name: { en: "General Medicine", hi: "सामान्य चिकित्सा", ta: "பொது மருத்துவம்" },
    desc: { en: "Fever, cough, blood pressure, sugar", hi: "बुखार, खांसी, बीपी, शुगर", ta: "காய்ச்சல், இருமல், ரத்த அழுத்தம், சர்க்கரை" } },
  { id: "CHD", room: 3, placeId: "room3", doctor: "Dr. Vikram Iyer", avgMin: 10, seats: 25,
    name: { en: "Children", hi: "बच्चों का विभाग", ta: "குழந்தைகள்" },
    desc: { en: "Children up to 12 years", hi: "12 साल तक के बच्चे", ta: "12 வயது வரை உள்ள குழந்தைகள்" } },
  { id: "WOM", room: 4, placeId: "room4", doctor: "Dr. Meera Nair", avgMin: 12, seats: 25,
    name: { en: "Women and pregnancy", hi: "महिला और गर्भावस्था", ta: "பெண்கள் மற்றும் கர்ப்பம்" },
    desc: { en: "Pregnancy check-ups, women's health", hi: "गर्भावस्था जांच, महिलाओं का स्वास्थ्य", ta: "கர்ப்ப பரிசோதனை, பெண்கள் நலம்" } },
  { id: "ORT", room: 5, placeId: "room5", doctor: "Dr. Suresh Patil", avgMin: 9, seats: 20,
    name: { en: "Bones and joints", hi: "हड्डी और जोड़", ta: "எலும்பு மற்றும் மூட்டு" },
    desc: { en: "Back pain, knee pain, fractures", hi: "कमर दर्द, घुटने का दर्द, हड्डी टूटना", ta: "முதுகு வலி, முழங்கால் வலி, எலும்பு முறிவு" } },
  { id: "ENT", room: 6, placeId: "room6", doctor: "Dr. Kavya Menon", avgMin: 7, seats: 15,
    name: { en: "Ear, nose and throat", hi: "कान, नाक और गला", ta: "காது, மூக்கு, தொண்டை" },
    desc: { en: "Ear pain, hearing, sore throat", hi: "कान दर्द, सुनना, गले में खराश", ta: "காது வலி, கேட்கும் திறன், தொண்டை வலி" } },
  { id: "EYE", room: 7, placeId: "room7", doctor: "Dr. Arjun Das", avgMin: 6, seats: 15,
    name: { en: "Eyes", hi: "आंखें", ta: "கண்கள்" },
    desc: { en: "Blurred vision, red or painful eyes", hi: "धुंधला दिखना, लाल या दर्द वाली आंखें", ta: "மங்கலான பார்வை, சிவந்த அல்லது வலிக்கும் கண்" } },
  { id: "SKN", room: 8, placeId: "room8", doctor: "Dr. Fatima Sheikh", avgMin: 7, seats: 15,
    name: { en: "Skin", hi: "त्वचा", ta: "தோல்" },
    desc: { en: "Rash, itching, skin infections", hi: "दाने, खुजली, त्वचा संक्रमण", ta: "தடிப்பு, அரிப்பு, தோல் தொற்று" } },
];

export const deptById = (id: string) => DEPARTMENTS.find((d) => d.id === id);
