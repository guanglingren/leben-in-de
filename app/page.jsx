import React, { useMemo, useState } from "react";

const PROFILES = [
  { id: "worker", icon: "🧰", name: "工薪家庭", detail: "仓库分拣员 · 长租房 · 德语 B2", money: 2100, debt: 1200, health: 78, stress: 25, energy: 76, german: 62, papers: 55, reputation: 35, wage: 420 },
  { id: "newcomer", icon: "🧳", name: "新移民", detail: "餐馆帮工 · 临时居留 · 德语 A2", money: 1550, debt: 1800, health: 82, stress: 34, energy: 82, german: 28, papers: 20, reputation: 18, wage: 330 },
  { id: "single", icon: "🛒", name: "单亲家长", detail: "超市兼职 · 一个孩子 · 等待补贴", money: 1350, debt: 950, health: 72, stress: 43, energy: 62, german: 70, papers: 38, reputation: 30, wage: 290 }
];

const JOBS = [
  { id: "shift", name: "轮班工作", wage: 420, energy: -24, health: -5, stress: 9, requirement: 0, icon: "🏭" },
  { id: "delivery", name: "外卖接单", wage: 300, energy: -20, health: -7, stress: 5, requirement: 0, icon: "🚲" },
  { id: "office", name: "办公室临时工", wage: 510, energy: -18, health: -2, stress: 10, requirement: 55, icon: "🖨️" },
  { id: "agency", name: "社区翻译", wage: 580, energy: -17, health: -1, stress: 7, requirement: 75, icon: "🗣️" }
];

const GOODS = [
  { id: "bike", name: "二手自行车", icon: "🚲", base: 95, note: "罢工和好天气时走俏" },
  { id: "heater", name: "电暖器", icon: "♨️", base: 70, note: "寒潮时价格暴涨" },
  { id: "ticket", name: "Deutschlandticket", icon: "🎫", base: 49, note: "政策变化会影响价格" },
  { id: "phone", name: "旧手机", icon: "📱", base: 120, note: "办线上手续的刚需" },
  { id: "furniture", name: "宜家小桌", icon: "🪑", base: 45, note: "开学季需求上升" },
  { id: "printer", name: "家用打印机", icon: "🖨️", base: 85, note: "任何手续都可能需要它" }
];

const NEWS = [
  { text: "铁路工会宣布预警罢工，自行车需求上升。", mods: { bike: 1.55, ticket: .8 } },
  { text: "本周寒潮来袭，物业热线进入忙音状态。", mods: { heater: 1.7 } },
  { text: "大学新学期开始，大量 WG 正在添置家具。", mods: { furniture: 1.6, printer: 1.2 } },
  { text: "市政府宣布更多服务转为线上办理。", mods: { phone: 1.45, printer: 1.25 } },
  { text: "全城跳蚤市场周末开张，二手货供应增加。", mods: { bike: .72, furniture: .68, phone: .82 } },
  { text: "交通票价调整传闻四起，官方表示暂无信息。", mods: { ticket: 1.5 } },
  { text: "能源价格短暂回落，大家开始清理储藏室。", mods: { heater: .68 } },
  { text: "打印服务系统维护一周，纸质材料重新受到重视。", mods: { printer: 1.65 } }
];

const BASE_EVENTS = [
  { id:"name-typo", title:"姓氏少了一个字母", office:"BÜRGERAMT", text:"新证件上的姓拼错了。柜台承认是录入错误，但修改错误需要重新提交出生证明。", when:s=>!s.flags.typo, choices:[
    { label:"重新预约并提交原件", effect:{energy:-10,stress:7,papers:10}, flag:"typo", result:"你抢到了六周后的预约。错误暂时成为了合法记录。" },
    { label:"现场等主管盖章", effect:{energy:-18,stress:12,papers:16}, flag:"typoFixed", result:"等了两小时，主管盖了一个刚才据说不存在的章。" }
  ]},
  { id:"insurance-chain", title:"医保系统不认识你", office:"KRANKENKASSE", text:"医保卡失效。保险公司发现身份证拼写与档案不一致，请你先证明你就是你。", when:s=>s.flags.typo&&!s.flags.insurance, choices:[
    { label:"自费看病，以后报销", effect:{money:-180,health:8,stress:4}, flag:"insurance", result:"病看完了。报销需要一份医生已经不能补开的证明。" },
    { label:"先寄材料，推迟治疗", effect:{health:-11,energy:-7,papers:12}, flag:"insurance", result:"信被送到隔壁部门，预计若干周后内部转交。" }
  ]},
  { id:"wrong-payment", title:"补贴多发了 47 欧元", office:"JOBCENTER", text:"系统主动多付了钱。你无法只退回差额，必须等待正式追缴通知；通知到来时可能带手续费。", choices:[
    { label:"把钱留在账户等通知", effect:{money:47,stress:6}, flag:"overpay", result:"钱还在，但你从此看见信箱就心跳加速。" },
    { label:"主动汇款退回", effect:{money:-47,energy:-7,papers:8}, result:"款项因缺少正确 Aktenzeichen 被原路退回。" }
  ]},
  { id:"heating", title:"暖气坏了，各方都很遗憾", office:"HAUSVERWALTUNG", text:"物业说归房东，房东说归物业，维修公司说只有物业能下单。室温 15°C。", choices:[
    { label:"买电暖器先撑住", effect:{money:-145,health:6,stress:2}, market:{heater:1.5}, result:"房间暖了。能源公司随后上调了全年预付款。" },
    { label:"依法书面限期维修", effect:{health:-8,energy:-10,papers:14}, flag:"rentFight", result:"限期函有效。维修时间窗口是十天后的 08:00–18:00。" }
  ]},
  { id:"train", title:"列车取消了，但系统说它准点", office:"DEUTSCHE BAHN", text:"列车改变终点，App 仍显示准点，因此自动赔偿系统认定旅程完成。", choices:[
    { label:"打车保住这班工", effect:{money:-68,stress:3,reputation:4}, result:"公司表示理解，并提醒你下次应预留交通风险。" },
    { label:"继续等并截图留证", effect:{energy:-13,stress:9,papers:6}, result:"客服回复：截图不能证明你本人在车上。" }
  ]},
  { id:"kita", title:"依法有托位，实际上没有托位", office:"JUGENDAMT", text:"市政府确认孩子依法享有名额，同时通知全区没有空位。你可以起诉，但诉讼期间仍要自己照看。", when:s=>s.profileId==="single"&&!s.flags.kita, choices:[
    { label:"减少工作自己照看", effect:{money:-220,stress:-5,energy:-5}, flag:"kita", result:"雇主同意减少工时，但不保证以后恢复。" },
    { label:"申请紧急名额", effect:{energy:-16,stress:9,papers:18}, flag:"kita", result:"表格要求雇主证明你必须工作；雇主要求幼儿园证明没有名额。" }
  ]},
  { id:"permit", title:"许可卡在另一张许可上", office:"AUSLÄNDERBEHÖRDE", text:"新合同要外管局批准；外管局要雇主确认职位；雇主则要你先出示有效许可。", when:s=>s.profileId==="newcomer"&&!s.flags.permit, choices:[
    { label:"反复抄送双方邮件", effect:{energy:-15,stress:11,papers:18}, flag:"permit", result:"第七封邮件后，有人终于把两个附件放进同一份档案。" },
    { label:"申请过渡证明", effect:{money:-80,stress:7,papers:12}, flag:"permit", result:"银行柜员没见过这张证明，需要请示主管。" }
  ]},
  { id:"radio", title:"同一住址收了两次广播费", office:"BEITRAGSSERVICE", text:"你与室友共用缴费号，但系统又建立了新账户。在线表格不接受旧缴费号格式。", choices:[
    { label:"先交钱避免催收", effect:{money:-63,stress:-2}, result:"系统立即确认收款。退款要另填纸质表格。" },
    { label:"寄信拒绝重复付款", effect:{energy:-8,stress:10,papers:11}, result:"六周没有回复，但催款信准时到达。" }
  ]},
  { id:"tax", title:"一封无法回复的税务信", office:"FINANZAMT", text:"你有 14 天解释两年前的一笔收入。邮箱不接收邮件，电话只在周二、周四 9–11 点开放。", choices:[
    { label:"请税务顾问代办", effect:{money:-280,papers:17,stress:-8}, result:"顾问四分钟填完表，收取最低一小时费用。" },
    { label:"自己研究寄挂号信", effect:{energy:-18,stress:11,papers:12}, result:"你按时寄出；三周后收到系统尚未扫描的提醒。" }
  ]},
  { id:"package", title:"包裹放在一个不存在的邻居家", office:"ZUSTELLUNG", text:"快递状态显示“交给邻居 Müller”，但整栋楼没有这个姓氏。客服机器人坚持包裹已妥投。", choices:[
    { label:"挨家挨户敲门", effect:{energy:-9,stress:4,reputation:5}, result:"四楼住户在垃圾桶旁找到了包裹，你顺便认识了半栋楼。" },
    { label:"提交丢失申诉", effect:{papers:8,stress:7,money:-35}, result:"申诉要求上传包裹内物品的照片。" }
  ]},
  { id:"doctor", title:"专科医生有一个明年的号", office:"FACHARZT", text:"家庭医生认为你需要尽快检查。五家诊所都表示不接新患者，第六家可预约 11 个月后。", choices:[
    { label:"接受自费诊所", effect:{money:-240,health:13,stress:-4}, result:"第二天就看上了医生，原来时间也有价目表。" },
    { label:"继续打电话碰运气", effect:{energy:-14,health:-6,stress:9}, result:"第十二通电话后，你熟练掌握了所有候线音乐。" }
  ]},
  { id:"bank", title:"银行冻结了你的线上账户", office:"BANK", text:"身份识别系统无法读取过渡居留证明。柜台说账户没问题，App 说必须去柜台。", choices:[
    { label:"请柜台主管人工验证", effect:{energy:-12,stress:7,papers:7}, result:"主管验证成功，但系统要到午夜才同步。" },
    { label:"改用现金生活一周", effect:{money:-35,stress:6}, result:"三家店不收大额纸币，一台机器不收现金。" }
  ]},
  { id:"landlord", title:"房东宣布一项现代化改造", office:"MIETRECHT", text:"楼道将换一盏感应灯，房租因此计划上涨。信中附了三页计算，但没有灯泡型号。", choices:[
    { label:"加入租客协会", effect:{money:-85,papers:12,reputation:8}, flag:"mieterverein", result:"律师发现计算方式有误。房东表示只是“草案”。" },
    { label:"接受涨租避免冲突", effect:{money:-120,stress:-3}, result:"灯换好了，亮十秒后自动熄灭。" }
  ]},
  { id:"school", title:"学校临时停课，但通知寄到了旧地址", office:"SCHULE", text:"孩子在校门口才知道教师培训停课。学校系统里地址是旧的，尽管市政府半年前已经更新。", when:s=>s.profileId==="single", choices:[
    { label:"请假一天照顾孩子", effect:{money:-95,energy:-11,stress:5}, result:"雇主理解，但系统记为一次短期缺勤。" },
    { label:"拜托邻居帮忙", effect:{money:-30,reputation:10,stress:-4}, result:"邻居答应了。社区关系比跨部门数据同步可靠。" }
  ]},
  { id:"contract", title:"你的手机合同自动续了两年", office:"KUNDENSERVICE", text:"运营商称解约信晚到一天，因此合同自动延长。你有寄出凭证，但客服只能看到收到日期。", choices:[
    { label:"接受优惠继续用", effect:{money:-80,stress:-3}, result:"优惠只有六个月，合同还有二十四个月。" },
    { label:"找消费者中心申诉", effect:{money:-25,energy:-9,papers:10}, result:"申诉成功率不错，预计处理八周。" }
  ]},
  { id:"fine", title:"你在买票后收到逃票罚款", office:"FAHRKARTENKONTROLLE", text:"购票 App 扣款成功，但车票晚了 38 秒显示。查票员说检查时没有有效票。", choices:[
    { label:"当场交 60 欧元", effect:{money:-60,stress:5}, result:"案件结束，原则没有得到处理。" },
    { label:"带证据去服务中心", effect:{energy:-10,papers:9,stress:7}, result:"罚款降到 7 欧元手续费，因为系统确实没错。" }
  ]},
  { id:"energy", title:"能源公司估算你用掉了两倍的电", office:"ENERGIEVERSORGER", text:"抄表照片很清楚，但自动识别多读了一位数字。客服请你等待下一次年度结算自动纠正。", choices:[
    { label:"接受上调预付款", effect:{money:-160,stress:4}, result:"多付的钱理论上会在十一个月后回来。" },
    { label:"书面反对并暂停扣款", effect:{energy:-9,papers:13,stress:8}, result:"客服另开了一个编号，旧催款流程仍继续。" }
  ]},
  { id:"trash", title:"垃圾桶分类错误，整栋楼被收费", office:"ABFALLBETRIEB", text:"有人把披萨盒放错桶，物业把特殊清运费平均计入所有住户账单。", choices:[
    { label:"交掉 24 欧元算了", effect:{money:-24,stress:2}, result:"下周垃圾房贴上了四页带照片的说明。" },
    { label:"组织邻居共同申诉", effect:{energy:-7,reputation:12,papers:7}, result:"费用撤销了。物业要求指定一名垃圾责任人。" }
  ]},
  { id:"course", title:"德语课取消，但考试照常", office:"VOLKSHOCHSCHULE", text:"老师长期病假，课程停了三周。考试中心是另一个机构，所以考试日期不变。", choices:[
    { label:"自己熬夜复习", effect:{energy:-15,german:9,health:-3}, result:"你学会了虚拟式，也开始用它描述人生。" },
    { label:"申请退费和改期", effect:{papers:9,stress:6,money:70}, result:"学费退回了，考试改期需要重新缴费。" }
  ]},
  { id:"jobref", title:"雇主需要一张已经不存在的证明", office:"PERSONALABTEILUNG", text:"人事部门要求纸质税卡。税务局表示纸质税卡十多年前已取消，但人事系统的必填项还在。", choices:[
    { label:"打印官网说明交上去", effect:{energy:-6,papers:8,reputation:5}, result:"人事把官网说明扫描成“税卡替代件”。" },
    { label:"等两个部门自行沟通", effect:{money:-110,stress:9}, result:"两个部门都没有对方的直线电话。" }
  ]},
  { id:"overpay-return", title:"多发的 47 欧元终于被追缴", office:"JOBCENTER", text:"七个月后，追缴通知来了：47 欧元本金、5 欧元邮费和 10 欧元管理费。", when:s=>s.flags.overpay&&!s.flags.overpayDone, choices:[
    { label:"立即付款结案", effect:{money:-62,stress:-6}, flag:"overpayDone", result:"你支付了系统犯错的管理成本，案件正式结案。" },
    { label:"对附加费提出异议", effect:{energy:-8,papers:10,stress:7}, flag:"overpayDone", result:"异议已登记，但不暂停催款执行。" }
  ]},
  { id:"neighbor", title:"邻居邀请你参加楼里的烧烤", office:"NACHBARSCHAFT", text:"这不是官方活动，没有表格，也不需要预约。你甚至有点不习惯。", choices:[
    { label:"带点吃的去参加", effect:{money:-28,stress:-13,reputation:14,energy:-3}, result:"你认识了会修自行车的邻居和懂租房法的退休教师。" },
    { label:"太累了，在家休息", effect:{health:5,energy:11,stress:-5}, result:"你睡了一个完整的下午，什么手续也没办。" }
  ]},
  { id:"promotion", title:"主管暗示有一个更稳定的岗位", office:"ARBEIT", text:"岗位薪水更高，但需要一份额外证书。公司愿意推荐你，课程要占三个周末。", when:s=>s.reputation>=45&&!s.flags.promotion, choices:[
    { label:"报名培训争取岗位", effect:{money:-120,energy:-14,stress:6,reputation:10,german:5}, flag:"promotion", result:"你拿到了培训名额。未来工作收入提高。" },
    { label:"维持现在的节奏", effect:{stress:-4,health:3}, flag:"promotionSkip", result:"你保住了周末，也暂时放弃了向上流动。" }
  ]},
  { id:"refund", title:"一次意外顺利的退款", office:"FINANZAMT", text:"税务局主动更正了旧计算，并把钱打进账户。信件只有一页，你反复读了三遍。", choices:[
    { label:"把钱用于还债", effect:{money:240,debt:-240,stress:-7}, result:"债务明显下降，你第一次觉得终点不是虚构的。" },
    { label:"留作紧急备用金", effect:{money:410,stress:-3}, result:"账户数字让你稍微安心，但债务仍在计息。" }
  ]}
];

const ACTIONS = [
  { id:"work", icon:"💼", name:"去上班", sub:"稳定收入 · 消耗身体", run:s=>{const job=JOBS.find(j=>j.id===s.jobId)||JOBS[0]; return {money:job.wage+(s.flags.promotion?70:0),energy:job.energy,health:job.health,stress:job.stress,reputation:3};}},
  { id:"gig", icon:"🚲", name:"接临时零工", sub:"快速赚钱 · 没有保障", run:()=>({money:230,energy:-19,health:-6,stress:7}) },
  { id:"paper", icon:"🏛️", name:"跑手续", sub:"推进档案 · 消耗整天", run:()=>({papers:14,energy:-12,stress:6}) },
  { id:"learn", icon:"📚", name:"学德语", sub:"解锁好工作 · 费脑", run:()=>({german:9,energy:-13,stress:4,money:-25}) },
  { id:"rest", icon:"🛋️", name:"在家休息", sub:"恢复健康和精力", run:()=>({energy:23,health:8,stress:-8,money:-18}) },
  { id:"drink", icon:"🍺", name:"去酒吧喝酒", sub:"压力大降 · 伤身烧钱", run:()=>({money:-48,stress:-18,health:-7,energy:-3,reputation:4}) },
  { id:"social", icon:"🤝", name:"参加社区活动", sub:"积累人脉 · 小额花费", run:()=>({money:-22,energy:-8,stress:-7,reputation:11,german:3}) },
  { id:"doctor", icon:"🩺", name:"照顾身体", sub:"花钱治疗 · 恢复健康", run:()=>({money:-95,health:18,energy:8,stress:-5}) }
];

const clamp = n => Math.max(0, Math.min(100, Math.round(n)));
const effectNames = {money:"资金",debt:"债务",energy:"精力",health:"健康",stress:"压力",german:"德语",papers:"手续",reputation:"人脉"};

function seededPrice(good, week, news) {
  const wave = .78 + ((Math.sin((week + 1) * (good.base + 7) * .113) + 1) / 2) * .48;
  return Math.max(8, Math.round(good.base * wave * (news.mods[good.id] || 1)));
}

function Stat({label,value,type="bar",bad=false}) {
  return <div className="v2-stat"><span>{label}</span><b>{type==="money"?`${Math.round(value)} €`:Math.round(value)}</b>{type==="bar"&&<i><em style={{width:`${clamp(value)}%`}} className={bad?"danger":""}/></i>}</div>;
}

export default function Home() {
  const [screen,setScreen]=useState("intro");
  const [state,setState]=useState(null);
  const [tab,setTab]=useState("actions");
  const [modal,setModal]=useState(null);
  const [toast,setToast]=useState("");

  const news=state?NEWS[state.newsIndex%NEWS.length]:NEWS[0];
  const prices=useMemo(()=>state?Object.fromEntries(GOODS.map(g=>[g.id,seededPrice(g,state.totalWeek,news)])): {},[state?.totalWeek,state?.newsIndex]);

  function start(profile){
    setState({...profile,profileId:profile.id,month:1,week:1,totalWeek:0,jobId:"shift",inventory:{},flags:{},seen:[],journal:[],newsIndex:0,capacity:6});
    setScreen("game"); setTab("actions"); setModal(null);
  }

  function applyEffect(base,effect={}){
    const next={...base};
    Object.entries(effect).forEach(([k,v])=>{next[k]=["money","debt"].includes(k)?Math.max(0,(next[k]||0)+v):clamp((next[k]||0)+v);});
    return next;
  }

  function drawEvent(current){
    const eligible=BASE_EVENTS.filter(e=>(!e.when||e.when(current))&&!current.seen.slice(-14).includes(e.id));
    if(!eligible.length)return null;
    const index=(current.totalWeek*7+Math.round(current.stress)+Math.round(current.money))%eligible.length;
    return eligible[index];
  }

  function doAction(action){
    if(modal)return;
    let next=applyEffect(state,action.run(state));
    let log=`第 ${state.month} 月第 ${state.week} 周：${action.name}`;
    let nextWeek=state.week+1, nextMonth=state.month, newsIndex=state.newsIndex;
    if(nextWeek>4){
      nextWeek=1; nextMonth+=1; newsIndex+=1;
      const living=state.profileId==="single"?980:state.profileId==="newcomer"?860:920;
      const interest=Math.ceil(next.debt*.035);
      next=applyEffect(next,{money:-living,debt:interest,stress:next.money<living?12:2,energy:5});
      log+=`；月末扣除生活费 ${living}€，债务利息 ${interest}€`;
    }
    next={...next,week:nextWeek,month:nextMonth,totalWeek:state.totalWeek+1,newsIndex,journal:[log,...state.journal].slice(0,20)};
    const ended=next.health<=0||next.stress>=100||next.money<=0||next.month>12;
    setState(next);
    if(ended){setScreen("end");return;}
    const event=(next.totalWeek%2===0||next.stress>68)?drawEvent(next):null;
    if(event)setModal({type:"event",event});
    else setToast(`${action.name}完成。本周过去了。`);
  }

  function chooseEvent(choice,event){
    let next=applyEffect(state,choice.effect);
    if(choice.flag)next={...next,flags:{...next.flags,[choice.flag]:true}};
    next={...next,seen:[...next.seen,event.id],journal:[`${event.office}：${event.title}｜${choice.label}`,...next.journal].slice(0,20)};
    setState(next); setModal({type:"result",choice,event});
  }

  function trade(good,mode){
    const qty=state.inventory[good.id]||0;
    const totalQty=Object.values(state.inventory).reduce((a,b)=>a+b,0);
    if(mode==="buy"&&(state.money<prices[good.id]||totalQty>=state.capacity)){setToast(totalQty>=state.capacity?"储物空间满了。":"钱不够。");return;}
    if(mode==="sell"&&qty<=0){setToast("你没有这件东西。");return;}
    const inventory={...state.inventory,[good.id]:qty+(mode==="buy"?1:-1)};
    setState({...state,money:state.money+(mode==="buy"?-prices[good.id]:prices[good.id]),inventory});
    setToast(`${mode==="buy"?"买入":"卖出"} ${good.name}，${mode==="buy"?"花费":"获得"} ${prices[good.id]}€`);
  }

  function payDebt(){
    const amount=Math.min(250,state.money-200,state.debt);
    if(amount<=0){setToast("至少要留下 200€ 生活费。");return;}
    setState({...state,money:state.money-amount,debt:state.debt-amount});
    setToast(`偿还债务 ${amount}€`);
  }

  function switchJob(job){
    if(state.german<job.requirement){setToast(`需要德语能力 ${job.requirement}`);return;}
    setState({...state,jobId:job.id});setToast(`下周开始做：${job.name}`);
  }

  if(screen==="intro")return <main className="landing v2-intro"><div className="flagline"/><nav><span className="brand">DEUTSCHLAND<br/><b>浮生记</b></span><span className="version">NEUE FASSUNG · V2</span></nav><section className="hero"><div className="kicker">12 MONATE · 48 WOCHEN · KEIN EINFACHER WEG</div><h1>活下去，<br/><em>并且保持体面。</em></h1><p>工作会赚钱，也会磨损身体。喝酒能暂时减压，却要付出健康和现金。学习、交朋友、跑手续、在跳蚤市场低买高卖——每一周都由你决定。</p><div className="loop-preview"><span>行动一周</span><i>→</i><span>承担后果</span><i>→</i><span>熬过月末</span></div><button className="primary" onClick={()=>setScreen("profiles")}>开始十二个月的生活 <span>→</span></button></section><footer><span>每月 4 次行动</span><span>事件牌堆不连续重复</span></footer></main>;

  if(screen==="profiles")return <main className="paper-page"><button className="back" onClick={()=>setScreen("intro")}>← 返回</button><header className="section-head"><small>LEBENSAKTE AUSWÄHLEN</small><h2>你靠什么开始？</h2><p>身份会改变收入、固定支出和专属事件。</p></header><div className="profiles">{PROFILES.map(p=><button className="profile-card" key={p.id} onClick={()=>start(p)}><span className="avatar">{p.icon}</span><span><b>{p.name}</b><small>{p.detail}<br/>现金 {p.money}€ · 债务 {p.debt}€</small></span><i>→</i></button>)}</div></main>;

  if(screen==="end"){
    const won=state.month>12&&state.health>0&&state.stress<100&&state.money>0;
    const net=Math.round(state.money-state.debt+Object.entries(state.inventory).reduce((sum,[id,q])=>sum+(prices[id]||0)*q,0));
    return <main className="paper-page end-page"><div className="end-stamp">{won?"年度结算":"生活中断"}</div><h2>{won?"你熬过了一年。":state.health<=0?"身体先撑不住了":state.stress>=100?"压力突破了极限":"账户见底了"}</h2><p>{won?"你没有战胜这个系统，但学会了保存每封信、每张截图和每个 Aktenzeichen。下一局可以尝试另一条生存路线。":"失败并不总来自一次错误选择，更多时候来自许多看似还能承受的小损耗。"}</p><div className="score"><span>净资产<b>{net}€</b></span><span>剩余健康<b>{state.health}</b></span><span>处理事件<b>{state.seen.length}</b></span></div><button className="primary" onClick={()=>setScreen("profiles")}>换个身份再来 <span>↻</span></button></main>;
  }

  const totalInventory=Object.values(state.inventory).reduce((a,b)=>a+b,0);
  return <main className="v2-game">
    <header className="v2-head"><div><small>LEBENSAKTE · {state.name}</small><b>第 {state.month} 月 · 第 {state.week} 周</b></div><div className="deadline"><small>年度进度</small><b>{Math.min(state.totalWeek,48)}/48</b></div></header>
    <section className="v2-stats"><Stat label="现金" value={state.money} type="money"/><Stat label="债务" value={state.debt} type="money"/><Stat label="健康" value={state.health}/><Stat label="压力" value={state.stress} bad/></section>
    <div className="ticker"><b>本周消息</b><span>{news.text}</span></div>
    <nav className="tabs">{[["actions","本周行动"],["market","跳蚤市场"],["career","工作档案"],["journal","生活记录"]].map(([id,label])=><button className={tab===id?"active":""} key={id} onClick={()=>setTab(id)}>{label}</button>)}</nav>

    <section className="v2-panel">
      {tab==="actions"&&<><div className="panel-title"><div><small>WOCHE {state.totalWeek+1}</small><h2>这一周怎么过？</h2></div><span>选择后推进 1 周</span></div><div className="resource-row"><span>⚡ 精力 {state.energy}</span><span>🗣️ 德语 {state.german}</span><span>🤝 人脉 {state.reputation}</span><span>📄 手续 {state.papers}</span></div><div className="action-grid">{ACTIONS.map(a=><button key={a.id} onClick={()=>doAction(a)} disabled={(a.id==="work"||a.id==="gig")&&state.energy<18}><i>{a.icon}</i><span><b>{a.name}</b><small>{a.sub}</small></span></button>)}</div><div className="month-cost"><b>月末账单</b><span>每 4 次行动扣除生活费，并给债务计息 3.5%</span></div></>}

      {tab==="market"&&<><div className="panel-title"><div><small>FLOHMARKT</small><h2>低买高卖</h2></div><span>储物 {totalInventory}/{state.capacity}</span></div><p className="market-tip">交易本身不推进时间；价格会在每周行动后变化。新闻可能是机会，也可能只是传闻。</p><div className="goods">{GOODS.map(g=><div className="good" key={g.id}><span className="good-icon">{g.icon}</span><div><b>{g.name}</b><small>{g.note}</small><em>持有 {state.inventory[g.id]||0}</em></div><strong>{prices[g.id]}€</strong><div className="trade-buttons"><button onClick={()=>trade(g,"buy")}>买</button><button onClick={()=>trade(g,"sell")}>卖</button></div></div>)}</div></>}

      {tab==="career"&&<><div className="panel-title"><div><small>ARBEIT & SCHULDEN</small><h2>工作档案</h2></div><span>德语 {state.german}</span></div><div className="jobs">{JOBS.map(j=><button key={j.id} className={state.jobId===j.id?"selected":""} onClick={()=>switchJob(j)}><i>{j.icon}</i><span><b>{j.name}</b><small>每周 {j.wage}€ · 精力 {j.energy} · 健康 {j.health}{j.requirement?` · 德语 ${j.requirement}`:""}</small></span><em>{state.jobId===j.id?"当前":state.german>=j.requirement?"选择":"未解锁"}</em></button>)}</div><div className="debt-box"><span><small>私人债务</small><b>{Math.round(state.debt)} €</b></span><p>每月增长 3.5%。还清后，你才真正拥有选择。</p><button onClick={payDebt}>偿还最多 250€</button></div></>}

      {tab==="journal"&&<><div className="panel-title"><div><small>VERLAUF</small><h2>生活记录</h2></div><span>{state.seen.length} 个事件</span></div><div className="journal">{state.journal.length?state.journal.map((j,i)=><p key={i}><i>{String(state.journal.length-i).padStart(2,"0")}</i>{j}</p>):<div className="empty">你的档案目前还很薄。系统会设法改变这一点。</div>}</div></>}
    </section>

    {toast&&<button className="toast" onClick={()=>setToast("")}>{toast}<span>×</span></button>}
    {modal&&<div className="modal-backdrop"><article className="event-modal">
      {modal.type==="event"?<><div className="modal-top"><span>{modal.event.office}</span><b>随机事项</b></div><h2>{modal.event.title}</h2><p>{modal.event.text}</p><div className="modal-choices">{modal.event.choices.map(c=><button key={c.label} onClick={()=>chooseEvent(c,modal.event)}><b>{c.label}</b><span>{Object.entries(c.effect||{}).map(([k,v])=>`${effectNames[k]} ${v>0?"+":""}${v}`).join(" · ")}</span></button>)}</div></>:<><div className="modal-top"><span>AUSWIRKUNG</span><b>处理结果</b></div><h2>{modal.choice.label}</h2><p>{modal.choice.result}</p><button className="primary" onClick={()=>setModal(null)}>继续生活 <span>→</span></button></>}
    </article></div>}
  </main>;
}
