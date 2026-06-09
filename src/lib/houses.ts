export interface HouseConfig {
  name: string;
  themeColor: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  image: string;
  emoji: string;
}

export const houses: Record<string, HouseConfig> = {
  'ควาย (Bogo)': {
    name: 'ควายคิดโค้ดครบคืนคอมค้างคาคณะ',
    themeColor: 'ขาว',
    bgClass: 'bg-[#FFFFFF]',
    textClass: 'text-passport-navy',
    borderClass: 'border-[#FFFFFF]',
    image: '/assets/Bogo.PNG',
    emoji: '🐃'
  },
  'สิงโต (Lionheart)': {
    name: 'สิงโตโสกัง',
    themeColor: 'เหลือง',
    bgClass: 'bg-[#F1C40F]',
    textClass: 'text-white',
    borderClass: 'border-[#F1C40F]',
    image: '/assets/Lionheart.PNG',
    emoji: '🦁'
  },
  'งู (Gary)': {
    name: 'งูสิงจิงกะเบล',
    themeColor: 'ฟ้า',
    bgClass: 'bg-[#3498DB]',
    textClass: 'text-white',
    borderClass: 'border-[#3498DB]',
    image: '/assets/Gary.PNG',
    emoji: '🐍'
  },
  'จิ้งจอกทะเลทราย (Finnick)': {
    name: 'จิ้งจายทะเลสอก',
    themeColor: 'แดง',
    bgClass: 'bg-[#E74C3C]',
    textClass: 'text-white',
    borderClass: 'border-[#E74C3C]',
    image: '/assets/Finnick.PNG',
    emoji: '🦊'
  },
  'แกะ (Bellwether)': {
    name: 'แกะอ้วนชวนซิ่ง',
    themeColor: 'ชมพู',
    bgClass: 'bg-[#FF69B4]',
    textClass: 'text-white',
    borderClass: 'border-[#FF69B4]',
    image: '/assets/Bellwether.PNG',
    emoji: '🐑'
  },
  'กาเซลล์ (Gazelle)': {
    name: 'กาเซลล์กาเซียกอนซาเลซ',
    themeColor: 'ม่วง',
    bgClass: 'bg-[#9B59B6]',
    textClass: 'text-white',
    borderClass: 'border-[#9B59B6]',
    image: '/assets/Gazelle.PNG',
    emoji: '🦌'
  },
  'สล็อต (Flash)': {
    name: 'สลอธหน้าสล๋อนนั่งสะเหรี่ยงใส่โสร่งเล่นสไลม์',
    themeColor: 'เทา',
    bgClass: 'bg-[#95A5A6]',
    textClass: 'text-white',
    borderClass: 'border-[#95A5A6]',
    image: '/assets/Flash.PNG',
    emoji: '🦥'
  },
  'เสือดาว (Clawhauser)': {
    name: 'เสืออ้วนนอนกิน',
    themeColor: 'ส้ม',
    bgClass: 'bg-[#E67E22]',
    textClass: 'text-white',
    borderClass: 'border-[#E67E22]',
    image: '/assets/Clawhauser.PNG',
    emoji: '🐆'
  }
};
