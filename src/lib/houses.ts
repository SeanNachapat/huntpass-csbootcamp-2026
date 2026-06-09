export interface HouseConfig {
  name: string;
  themeColor: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  image: string;
}

export const houses: Record<string, HouseConfig> = {
  'ควาย (Bogo)': {
    name: 'ควายคิดโค้ดครบคืนคอมค้างคาคณะ',
    themeColor: 'ขาว',
    bgClass: 'bg-white',
    textClass: 'text-slate-800',
    borderClass: 'border-slate-300',
    image: '/assets/Bogo.PNG'
  },
  'สิงโต (Lionheart)': {
    name: 'สิงโตโสกัง',
    themeColor: 'เหลือง',
    bgClass: 'bg-yellow-400',
    textClass: 'text-yellow-900',
    borderClass: 'border-yellow-500',
    image: '/assets/Lionheart.PNG'
  },
  'งู (Gary)': {
    name: 'งูสิงจิงกะเบล',
    themeColor: 'ฟ้า',
    bgClass: 'bg-cyan-400',
    textClass: 'text-cyan-900',
    borderClass: 'border-cyan-500',
    image: '/assets/Gary.PNG'
  },
  'จิ้งจอกทะเลทราย (Finnick)': {
    name: 'จิ้งจายทะเลสอก',
    themeColor: 'แดง',
    bgClass: 'bg-red-500',
    textClass: 'text-red-50',
    borderClass: 'border-red-600',
    image: '/assets/Finnick.PNG'
  },
  'แกะ (Bellwether)': {
    name: 'แกะอ้วนชวนซิ่ง',
    themeColor: 'ชมพู',
    bgClass: 'bg-pink-400',
    textClass: 'text-pink-900',
    borderClass: 'border-pink-500',
    image: '/assets/Bellwether.PNG'
  },
  'กาเซลล์ (Gazelle)': {
    name: 'กาเซลล์กาเซียกอนซาเลซ',
    themeColor: 'ม่วง',
    bgClass: 'bg-purple-500',
    textClass: 'text-purple-50',
    borderClass: 'border-purple-600',
    image: '/assets/Gazelle.PNG'
  },
  'สล็อต (Flash)': {
    name: 'สลอธหน้าสล๋อนนั่งสะเหรี่ยงใส่โสร่งเล่นสไลม์',
    themeColor: 'เทา',
    bgClass: 'bg-slate-400',
    textClass: 'text-slate-900',
    borderClass: 'border-slate-500',
    image: '/assets/Flash.PNG'
  },
  'เสือดาว (Clawhauser)': {
    name: 'เสืออ้วนนอนกิน',
    themeColor: 'ส้ม',
    bgClass: 'bg-orange-400',
    textClass: 'text-orange-900',
    borderClass: 'border-orange-500',
    image: '/assets/Clawhauser.PNG'
  }
};
