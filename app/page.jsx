import React, { useMemo, useState } from "react";

const PROFILES = [
  { id: "resident", icon: "🧍", name: "城市普通居民", detail: "租房 · 基础工作 · 德语 B1 · 一叠未分类的信", money: 1900, debt: 1200, health: 80, stress: 28, energy: 78, german: 46, papers: 35, reputation: 25, wage: 470 }
];

const JOBS = [
  { id: "shift", name: "轮班工作", wage: 470, energy: -22, health: -4, stress: 6, requirement: 0, paperRequirement:0, icon: "🏭" },
  { id: "delivery", name: "外卖接单", wage: 340, energy: -20, health: -6, stress: 4, requirement: 0, paperRequirement:0, icon: "🚲" },
  { id: "office", name: "办公室临时工", wage: 560, energy: -17, health: -2, stress: 7, requirement: 55, paperRequirement:45, icon: "🖨️" },
  { id: "agency", name: "社区翻译", wage: 640, energy: -16, health: -1, stress: 5, requirement: 75, paperRequirement:60, icon: "🗣️" }
];

const GOODS = [
  { id: "bike", name: "二手自行车", icon: "🚲", base: 95, note: "罢工和好天气时走俏" },
  { id: "heater", name: "电暖器", icon: "♨️", base: 70, note: "寒潮时价格暴涨" },
  { id: "ticket", name: "Deutschlandticket", icon: "🎫", base: 49, note: "政策变化会影响价格" },
  { id: "phone", name: "旧手机", icon: "📱", base: 120, note: "办线上手续的刚需" },
  { id: "furniture", name: "宜家小桌", icon: "🪑", base: 45, note: "开学季需求上升" },
  { id: "printer", name: "家用打印机", icon: "🖨️", base: 85, note: "任何手续都可能需要它" }
];

const HUSTLE_GOODS = [
  { id:"books", name:"二手德语教材", icon:"📚", margin:.18, risk:2, demand:"稳定", detail:"来源清楚，利润不高，但几乎不会出事。" },
  { id:"phones", name:"翻新旧手机", icon:"📱", margin:.34, risk:12, demand:"较高", detail:"需要处理退货、砍价和“最低多少钱包邮”。" },
  { id:"shoes", name:"高仿名牌运动鞋", icon:"👟", margin:.82, risk:54, demand:"很高", detail:"利润诱人，但可能被平台封号、海关扣货或品牌方追责。" },
  { id:"sticks", name:"破解电视棒", icon:"📺", margin:1.05, risk:68, demand:"火爆", detail:"卖得快，风险也最高；一次投诉可能吞掉几个月利润。" }
];

const CHANNELS = [
  { id:"ebay", name:"eBay Kleinanzeigen", icon:"💻", bonus:.18, risk:12, cost:8, note:"客流大、价格好，但平台留痕完整。" },
  { id:"flohmarkt", name:"周末跳蚤市场", icon:"⛺", bonus:0, risk:-8, cost:28, note:"要交摊位费、消耗体力，现金交易更灵活。" }
];

const STOCKS = [
  { id:"dax", ticker:"DAXX", name:"德国大盘基金", base:112, icon:"🏦", volatility:.12, note:"相对平稳的虚构指数基金" },
  { id:"rail", ticker:"RLOG", name:"莱茵物流股份", base:74, icon:"🚆", volatility:.27, note:"罢工和供应链新闻影响明显" },
  { id:"amt", ticker:"AMT", name:"政务软件股份", base:46, icon:"🗄️", volatility:.38, note:"每次数字化失败，订单反而可能增加" }
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
  ]},
  { id:"fax", title:"电子签名无效，传真件有效", office:"AMT FÜR DIGITALISIERUNG", text:"你上传了带电子签名的 PDF。负责数字化的部门回复：请打印、签字，再传真回来。", choices:[
    { label:"去文具店发传真", effect:{money:-18,energy:-7,papers:10,stress:5}, result:"传真成功。确认函将通过平信寄出。" },
    { label:"把规定打印出来一起寄", effect:{money:-8,energy:-11,papers:13,stress:8}, result:"三周后收到答复：你的信已被扫描成 PDF。" }
  ]},
  { id:"termin-for-termin", title:"这个 Termin 只用于预约另一个 Termin", office:"BÜRGERBÜRO", text:"你准时到达窗口，却得知今天的预约只用于身份核验。真正办事需要现场领取新的预约号码。", choices:[
    { label:"礼貌地领取新号码", effect:{energy:-9,stress:8,papers:7}, result:"新预约在八周后，地点是同一栋楼同一个窗口。" },
    { label:"问能否今天顺便办完", effect:{energy:-14,stress:12,reputation:-2}, result:"工作人员认真解释了为什么“顺便”不是行政法概念。" }
  ]},
  { id:"pfandbon", title:"价值 8.25 欧元的 Pfandbon 消失了", office:"SUPERMARKT", text:"你退了整袋瓶子，机器打印的小票却从口袋里失踪。它突然显得比现金更像现金。", choices:[
    { label:"沿原路寻找小票", effect:{energy:-7,stress:4,money:8}, result:"你在面包柜旁找到了它，并像保护护照一样攥紧。" },
    { label:"接受命运，再买一袋饮料", effect:{money:-16,stress:-3}, result:"你获得了新的瓶子，也获得了未来的 Pfand。" }
  ]},
  { id:"cash-card", title:"一家店只收现金，隔壁只收卡", office:"EINZELHANDEL", text:"面包店的刷卡机“今天坏了”；旁边的咖啡馆为保持无现金理念拒收你刚取出的 50 欧元。", choices:[
    { label:"再去找一台 ATM", effect:{money:-6,energy:-5,stress:5}, result:"ATM 收了手续费，面包店又表示不收 50 欧元大钞。" },
    { label:"今天不消费了", effect:{money:12,health:-2,stress:3}, result:"你省了钱，也错过了午饭。" }
  ]},
  { id:"ruhezeit", title:"星期日，你的吸尘器引发了外交危机", office:"HAUSORDNUNG", text:"你下午两点吸尘。楼下邻居立刻按门铃，并带来一份标有 Ruhezeit 的 Hausordnung。", choices:[
    { label:"立即停止并道歉", effect:{stress:5,reputation:3,energy:-3}, result:"邻居接受道歉，并补充讲解玻璃瓶应该在哪些时段投放。" },
    { label:"指出规则没禁止吸尘", effect:{stress:9,reputation:-8,papers:4}, result:"第二天公告栏出现了一份专门禁止吸尘的新补充规定。" }
  ]},
  { id:"arzt-urlaub", title:"医生正在休假，代班医生也在休假", office:"HAUSARZT", text:"诊所门口贴着代班地址。你赶到代班诊所，门上贴着另一张纸，指向第一家诊所。", choices:[
    { label:"回家喝茶观察", effect:{health:-5,stress:3,energy:-5}, result:"你完成了一次医疗系统闭环旅行。" },
    { label:"去急诊排队", effect:{energy:-14,health:8,stress:7}, result:"五小时后医生确认：这确实不是急症。" }
  ]},
  { id:"briefankundigung", title:"你收到一封信，通知另一封信将要寄来", office:"VERSICHERUNG", text:"第一页说明正式决定将在单独信件中发送；第二页说明不要就本通知提出异议。", choices:[
    { label:"建立一个新文件夹保存", effect:{money:-6,papers:8,stress:4}, result:"文件夹标签是：尚未收到但必须保存。" },
    { label:"先放到那叠信上面", effect:{stress:7,papers:-4}, result:"三周后正式决定到了，但你找不到预告信要求保留的编号。" }
  ]},
  { id:"biomuell", title:"你的 Bio 垃圾袋不够 Bio", office:"ABFALLBERATUNG", text:"市政网站推荐可降解垃圾袋，垃圾公司却贴出通知说处理设备无法识别这种袋子。", choices:[
    { label:"改用报纸包厨余", effect:{energy:-4,papers:3,reputation:4}, result:"报纸写着本市正在推进无纸化。" },
    { label:"买官方认可的纸袋", effect:{money:-12,stress:3}, result:"纸袋在你走到垃圾房前已经漏了。" }
  ]},
  { id:"paketshop", title:"包裹店营业，但负责包裹的人不在", office:"PAKETSHOP", text:"便利店开着，老板也在，但“会操作包裹系统的同事”今天不上班。", choices:[
    { label:"明天再来", effect:{energy:-5,stress:4}, result:"明天系统维护，后天是周日。" },
    { label:"现场研究机器", effect:{energy:-9,reputation:5,papers:3}, result:"你帮老板重启了设备，并免费做了十分钟 IT 支持。" }
  ]},
  { id:"tuv", title:"TÜV 认为警示灯亮着；车认为没有", office:"TÜV", text:"检测时仪表盘短暂亮灯。复检时灯灭了，但复检需要证明第一次的问题已经维修。", choices:[
    { label:"请修理厂出具证明", effect:{money:-95,papers:9,stress:4}, result:"修理厂证明他们没有修任何东西，因为东西没有坏。" },
    { label:"预约再次检测", effect:{money:-42,energy:-8,stress:7}, result:"新预约一个月后。检测员建议你开车时不要让灯再亮。" }
  ]},
  { id:"internet", title:"网速问题只能通过在线客服解决", office:"INTERNETANBIETER", text:"网络断了。电话语音要求你登录在线客服；在线客服要求你连接家庭 Wi-Fi 完成线路检测。", choices:[
    { label:"用手机流量开热点", effect:{money:-24,energy:-8,stress:6}, result:"检测结果显示：你的互联网连接不可用。" },
    { label:"拔掉路由器等十秒", effect:{energy:-3,stress:-2}, result:"它居然好了。客服随后发来满意度调查。" }
  ]},
  { id:"brot", title:"你只是想买面包，却被问了七个问题", office:"BÄCKEREI", text:"全麦、裸麦、混合麦；切片或整条；薄片或厚片；是否需要袋子；现金还是 Girocard。队伍安静地等着你。", choices:[
    { label:"说：和前面那位一样", effect:{money:-6,stress:-4,reputation:2}, result:"你得到了一种不知道名字但非常可靠的面包。" },
    { label:"认真逐项选择", effect:{money:-8,energy:-3,german:3}, result:"你完成了本周最顺利的一次行政程序。" }
  ]}
];

const ACTIONS = [
  { id:"work", icon:"💼", name:"做本职工作", sub:"按当前职业结算工资", run:s=>{const job=JOBS.find(j=>j.id===s.jobId)||JOBS[0];const languageBonus=Math.min(80,Math.max(0,s.german-40)*2);return {money:job.wage+languageBonus+(s.flags.promotion?70:0),energy:job.energy,health:job.health,stress:job.stress,reputation:3};}},
  { id:"gig", icon:"🚲", name:"接一次临时零工", sub:"不改变本职 · 德语越好收入越高", run:s=>({money:190+Math.round(s.german*.9),energy:-19,health:-6,stress:7}) },
  { id:"paper", icon:"🏛️", name:"处理积压手续", sub:"选择一项具体行政任务", planner:true },
  { id:"learn", icon:"📚", name:"学德语", sub:"解锁好工作 · 费脑", run:()=>({german:9,energy:-12,stress:2,money:-25}) },
  { id:"rest", icon:"🛋️", name:"在家休息", sub:"恢复健康和精力", run:()=>({energy:25,health:8,stress:-10,money:-18}) },
  { id:"drink", icon:"🍺", name:"去酒吧喝酒", sub:"压力大降 · 伤身烧钱", run:()=>({money:-48,stress:-18,health:-7,energy:-3,reputation:4}) },
  { id:"social", icon:"🤝", name:"参加社区活动", sub:"积累人脉 · 小额花费", run:()=>({money:-22,energy:-8,stress:-7,reputation:11,german:3}) },
  { id:"doctor", icon:"🩺", name:"照顾身体", sub:"花钱治疗 · 恢复健康", run:()=>({money:-95,health:18,energy:8,stress:-5}) }
];

const PAPER_TASKS = [
  { id:"folder", icon:"🗂️", name:"整理标准材料包", sub:"获得 1 份可在事件中消耗的完整材料包", effect:{packs:1,papers:8,german:1,energy:-10,stress:3} },
  { id:"termin", icon:"📅", name:"抢一次 Behörden-Termin", sub:"预约、复印、排队，把档案推进一大截", effect:{packs:1,papers:14,energy:-14,stress:6} },
  { id:"refund", icon:"🧾", name:"核对旧账并申请退费", sub:"翻出一笔重复扣款，同时补全往来记录", effect:{money:90,papers:7,energy:-12,stress:4} }
];

const clamp = n => Math.max(0, Math.min(100, Math.round(n)));
const effectNames = {money:"资金",debt:"债务",energy:"精力",health:"健康",stress:"压力",german:"德语",papers:"档案",packs:"材料包",reputation:"人脉"};
const periodLabel = s => s.month>12?"年度结束":`第 ${s.month} 月 · 第 ${s.week} 周`;

function seededPrice(good, week, news) {
  const wave = .78 + ((Math.sin((week + 1) * (good.base + 7) * .113) + 1) / 2) * .48;
  return Math.max(8, Math.round(good.base * wave * (news.mods[good.id] || 1)));
}

function stockPrice(stock, week) {
  const trend=1+week*.006;
  const wave=1+Math.sin((week+2)*(stock.base*.017))*stock.volatility;
  const bureaucracy=stock.id==="amt"&&week%7===0?1.32:1;
  return Math.max(8,Math.round(stock.base*trend*wave*bureaucracy));
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
  const [ventureGood,setVentureGood]=useState("phones");
  const [ventureChannel,setVentureChannel]=useState("ebay");
  const [ventureAmount,setVentureAmount]=useState(150);

  const news=state?NEWS[state.newsIndex%NEWS.length]:NEWS[0];
  const prices=useMemo(()=>state?Object.fromEntries(GOODS.map(g=>[g.id,seededPrice(g,state.totalWeek,news)])): {},[state?.totalWeek,state?.newsIndex]);
  const stockPrices=useMemo(()=>state?Object.fromEntries(STOCKS.map(s=>[s.id,stockPrice(s,state.totalWeek)])): {},[state?.totalWeek]);

  function start(profile){
    setState({...profile,profileId:profile.id,month:1,week:1,totalWeek:0,jobId:"shift",inventory:{},inventoryCost:{},stocks:{},stockCost:{},activeVenture:null,ventureLedger:[],packs:0,flags:{},seen:[],journal:[],newsIndex:0,capacity:6,businessRuns:0});
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

  function doAction(action,force=false){
    if(modal&&!force)return;
    let next=applyEffect(state,action.run(state));
    let log=`第 ${state.month} 月第 ${state.week} 周：${action.name}`;
    let nextWeek=state.week+1, nextMonth=state.month, newsIndex=state.newsIndex;
    let monthSummary="";
    if(nextWeek>4){
      nextWeek=1; nextMonth+=1; newsIndex+=1;
      const living=780;
      const interest=Math.ceil(next.debt*.035);
      next=applyEffect(next,{money:-living,debt:interest,stress:next.money<living?12:1,energy:8});
      log+=`；月末扣除生活费 ${living}€，债务利息 ${interest}€`;
      monthSummary=`月末已扣生活费 ${living}€，债务增加利息 ${interest}€。`;
    }
    next={...next,week:nextWeek,month:nextMonth,totalWeek:state.totalWeek+1,newsIndex,journal:[log,...state.journal].slice(0,20)};
    const ended=next.health<=0||next.stress>=100||next.money<=0||next.month>12;
    setState(next);
    if(ended){setScreen("end");return;}
    const event=(next.totalWeek%2===0||next.stress>68)?drawEvent(next):null;
    const timeLabel=`${periodLabel(state)} → ${periodLabel(next)}`;
    if(event)setModal({type:"event",event,timeLabel,actionName:action.name,monthSummary});
    else setModal({type:"weekResult",actionName:action.name,timeLabel,monthSummary});
  }

  function chooseEvent(choice,event){
    const languageRelief=state.german>=75?4:state.german>=60?2:0;
    const adjusted={...choice.effect};
    if(adjusted.stress>0)adjusted.stress=Math.max(0,adjusted.stress-languageRelief);
    let next=applyEffect(state,adjusted);
    if(choice.flag)next={...next,flags:{...next.flags,[choice.flag]:true}};
    next={...next,seen:[...next.seen,event.id],journal:[`${event.office}：${event.title}｜${choice.label}`,...next.journal].slice(0,20)};
    const timeLabel=modal?.timeLabel;
    setState(next); setModal({type:"result",choice,event,timeLabel,languageRelief});
  }

  function choosePrepared(event){
    if(state.packs<1){setToast("没有完整材料包。先用一周处理积压手续。");return;}
    const choice=event.choices[0];
    const reduced={...choice.effect,packs:-1};
    Object.entries(reduced).forEach(([key,value])=>{
      const harmful=(["money","energy","health"].includes(key)&&value<0)||(key==="stress"&&value>0);
      if(harmful)reduced[key]=Math.round(value*.45);
    });
    let next=applyEffect(state,reduced);
    if(choice.flag)next={...next,flags:{...next.flags,[choice.flag]:true}};
    next={...next,seen:[...next.seen,event.id],journal:[`${event.office}：${event.title}｜提交完整档案快速处理`,...next.journal].slice(0,20)};
    setState(next);
    setModal({type:"result",choice:{label:"提交完整材料包快速处理",result:"你拿出了原件、复印件、回执、Aktenzeichen 和按日期排列的往来信件。工作人员短暂沉默后，事情居然办下来了。"},event,timeLabel:modal?.timeLabel,prepared:true});
  }

  function trade(good,mode){
    const qty=state.inventory[good.id]||0;
    const totalCost=state.inventoryCost[good.id]||0;
    const avgCost=qty>0?totalCost/qty:0;
    const totalQty=Object.values(state.inventory).reduce((a,b)=>a+b,0);
    if(mode==="buy"&&(state.money<prices[good.id]||totalQty>=state.capacity)){setToast(totalQty>=state.capacity?"储物空间满了。":"钱不够。");return;}
    if(mode==="sell"&&qty<=0){setToast("你没有这件东西。");return;}
    const inventory={...state.inventory,[good.id]:qty+(mode==="buy"?1:-1)};
    const inventoryCost={...state.inventoryCost,[good.id]:mode==="buy"?totalCost+prices[good.id]:Math.max(0,totalCost-avgCost)};
    setState({...state,money:state.money+(mode==="buy"?-prices[good.id]:prices[good.id]),inventory,inventoryCost});
    const realized=Math.round(prices[good.id]-avgCost);
    setToast(mode==="buy"
      ?`买入 ${good.name}：成本 ${prices[good.id]}€`
      :`卖出 ${good.name}：收入 ${prices[good.id]}€，实际${realized>=0?"赚":"亏"} ${Math.abs(realized)}€`);
  }

  function payDebt(){
    const amount=Math.min(250,state.money-200,state.debt);
    if(amount<=0){setToast("至少要留下 200€ 生活费。");return;}
    setState({...state,money:state.money-amount,debt:state.debt-amount});
    setToast(`偿还债务 ${amount}€`);
  }

  function switchJob(job){
    if(state.german<job.requirement||state.papers<job.paperRequirement){setToast(`需要德语 ${job.requirement}、档案完整度 ${job.paperRequirement}`);return;}
    setState({...state,jobId:job.id});setToast(`下周开始做：${job.name}`);
  }

  function startVenture(){
    if(state.activeVenture){setToast("已有一个经营批次在进行中。先推进时间并结算。");return;}
    const good=HUSTLE_GOODS.find(g=>g.id===ventureGood);
    const channel=CHANNELS.find(c=>c.id===ventureChannel);
    const amount=Math.min(Math.max(50,ventureAmount),Math.max(50,state.money-250));
    if(state.money<amount+channel.cost+200){setToast("至少要留下 200€ 生活费，并支付渠道成本。");return;}
    const totalInvestment=amount+channel.cost;
    const activeVenture={goodId:good.id,goodName:good.name,channelId:channel.id,channelName:channel.name,capital:amount,fee:channel.cost,invested:totalInvestment,startWeek:state.totalWeek,readyWeek:state.totalWeek+1};
    setState({...state,money:state.money-totalInvestment,activeVenture,journal:[`第 ${state.month} 月第 ${state.week} 周：投入 ${totalInvestment}€ 开始经营 ${good.name}`,...state.journal].slice(0,20)});
    setToast(`经营批次已开始。至少推进 1 周后才能结算。`);
  }

  function settleVenture(){
    const batch=state.activeVenture;
    if(!batch){setToast("当前没有等待结算的经营批次。");return;}
    if(state.totalWeek<batch.readyWeek){setToast(`还需推进 ${batch.readyWeek-state.totalWeek} 周才能结算。`);return;}
    const good=HUSTLE_GOODS.find(g=>g.id===batch.goodId);
    const channel=CHANNELS.find(c=>c.id===batch.channelId);
    const amount=batch.capital;
    const signal=(batch.startWeek*37+amount+good.risk*3+(channel.id==="ebay"?19:7))%100;
    const caught=signal<Math.max(2,good.risk+channel.risk);
    const demand=.78+((state.totalWeek*13+good.id.length*11)%48)/100;
    const salesGain=Math.round(amount*(good.margin+channel.bonus)*demand);
    let profit=salesGain-channel.cost;
    let returned=amount+salesGain;
    let consequence={stress:good.risk>40?8:3,reputation:good.risk<20?4:-2};
    let result=`你投入 ${amount}€，本周销售后净赚 ${profit}€。`;
    if(caught){
      const fine=Math.round(90+amount*(good.risk/65));
      consequence={stress:18,papers:-8,reputation:-10};
      returned=Math.max(0,returned-fine);
      result=channel.id==="ebay"
        ?`平台冻结了交易，并收到权利人投诉。扣除退款与罚款 ${fine}€ 后，本周净结果为 ${profit-fine}€。`
        :`市场巡查要求出示进货凭证。货物被扣并产生 ${fine}€ 损失，本周净结果为 ${profit-fine}€。`;
    }
    const ledgerEntry={week:state.totalWeek,good:good.name,channel:channel.name,capital:amount,fee:channel.cost,invested:batch.invested,returned,profit:returned-batch.invested,caught,heldWeeks:state.totalWeek-batch.startWeek};
    let next=applyEffect(state,{...consequence,money:returned});
    next={...next,activeVenture:null,businessRuns:(next.businessRuns||0)+1,ventureLedger:[ledgerEntry,...(next.ventureLedger||[])].slice(0,8),journal:[`经营结算：${good.name}，净结果 ${ledgerEntry.profit>=0?"+":""}${ledgerEntry.profit}€`,...next.journal].slice(0,20)};
    setState(next);
    setModal({type:"ventureResult",title:caught?"副业翻车了":"这批货卖完了",result,ledger:ledgerEntry});
  }

  function doPaperTask(task){
    setModal(null);
    doAction({id:`paper-${task.id}`,name:task.name,run:()=>task.effect},true);
  }

  function tradeStock(stock,mode){
    const held=state.stocks[stock.id]||0;
    const totalCost=state.stockCost[stock.id]||0;
    const avgCost=held>0?totalCost/held:0;
    const price=stockPrices[stock.id];
    if(mode==="buy"&&state.money<price+250){setToast("买入后至少要保留 250€ 现金。");return;}
    if(mode==="sell"&&held<1){setToast("你没有持有这只股票。");return;}
    const stockCost={...state.stockCost,[stock.id]:mode==="buy"?totalCost+price:Math.max(0,totalCost-avgCost)};
    setState({...state,money:state.money+(mode==="buy"?-price:price),stocks:{...state.stocks,[stock.id]:held+(mode==="buy"?1:-1)},stockCost});
    const realized=Math.round(price-avgCost);
    setToast(mode==="buy"
      ?`买入 ${stock.ticker}：成本 ${price}€`
      :`卖出 ${stock.ticker}：成交 ${price}€，实际${realized>=0?"赚":"亏"} ${Math.abs(realized)}€`);
  }

  if(screen==="intro")return <main className="landing v2-intro"><div className="flagline"/><nav><span className="brand">DEUTSCHLAND<br/><b>浮生记</b></span><span className="version">NEUE FASSUNG · V3</span></nav><section className="hero"><div className="kicker">12 MONATE · 48 WOCHEN · KEIN EINFACHER WEG</div><h1>活下去，<br/><em>并且保持体面。</em></h1><p>你是一名普通的城市居民：有一份基础工作、一间租来的房子、一笔债务，以及一叠不敢扔的信。以后走哪条路，由每一周的选择决定。</p><div className="starting-file"><span>🧍</span><div><b>城市普通居民</b><small>现金 1900€ · 债务 1200€ · 德语 B1 · 健康尚可</small></div></div><div className="loop-preview"><span>行动一周</span><i>→</i><span>承担后果</span><i>→</i><span>熬过月末</span></div><button className="primary" onClick={()=>start(PROFILES[0])}>领取普通居民档案 <span>→</span></button></section><footer><span>无需职业选择</span><span>人生路线由行动形成</span></footer></main>;

  if(screen==="end"){
    const won=state.month>12&&state.health>0&&state.stress<100&&state.money>0;
    const net=Math.round(state.money-state.debt+Object.entries(state.inventory).reduce((sum,[id,q])=>sum+(prices[id]||0)*q,0));
    return <main className="paper-page end-page"><div className="end-stamp">{won?"年度结算":"生活中断"}</div><h2>{won?"你熬过了一年。":state.health<=0?"身体先撑不住了":state.stress>=100?"压力突破了极限":"账户见底了"}</h2><p>{won?"你没有战胜这个系统，但学会了保存每封信、每张截图和每个 Aktenzeichen。下一局可以尝试另一条生存路线。":"失败并不总来自一次错误选择，更多时候来自许多看似还能承受的小损耗。"}</p><div className="score"><span>净资产<b>{net}€</b></span><span>剩余健康<b>{state.health}</b></span><span>处理事件<b>{state.seen.length}</b></span></div><button className="primary" onClick={()=>start(PROFILES[0])}>重新开始这一年 <span>↻</span></button></main>;
  }

  const totalInventory=Object.values(state.inventory).reduce((a,b)=>a+b,0);
  const currentJob=JOBS.find(j=>j.id===state.jobId)||JOBS[0];
  const languageBonus=Math.min(80,Math.max(0,state.german-40)*2);
  const currentWage=currentJob.wage+languageBonus+(state.flags.promotion?70:0);
  return <main className="v2-game">
    <header className="v2-head"><div><small>LEBENSAKTE · {state.name}</small><b>第 {state.month} 月 · 第 {state.week} 周</b></div><div className="deadline"><small>年度进度</small><b>{Math.min(state.totalWeek,48)}/48</b></div></header>
    <section className="v2-stats"><Stat label="现金" value={state.money} type="money"/><Stat label="债务" value={state.debt} type="money"/><Stat label="健康" value={state.health}/><Stat label="压力" value={state.stress} bad/></section>
    <div className="ticker"><b>本周消息</b><span>{news.text}</span></div>
    <div className="time-rule"><b>时间规则</b><span>⏳ 本周行动＝推进 1 周</span><span>○ 商品、股票、经营批次、换职业＝不耗时间</span></div>
    <nav className="tabs">{[["actions","本周行动"],["market","交易投资"],["career","职业设定"],["journal","记录"]].map(([id,label])=><button className={tab===id?"active":""} key={id} onClick={()=>setTab(id)}>{label}</button>)}</nav>

    <section className="v2-panel">
      {tab==="actions"&&<><div className="panel-title"><div><small>WOCHE {state.totalWeek+1}</small><h2>这一周怎么过？</h2></div><span>每次只能选 1 项</span></div><div className="current-job"><span>{currentJob.icon}</span><div><small>当前本职工作</small><b>{currentJob.name}</b></div><strong>本周工资 {currentWage}€</strong><button onClick={()=>setTab("career")}>更换职业</button></div><div className="resource-row"><span>⚡ 精力 {state.energy}</span><span>🗣️ 德语 {state.german}</span><span>🤝 人脉 {state.reputation}</span><span>🗂️ 档案 {state.papers}</span><span>📦 材料包 {state.packs}</span></div><div className="action-grid">{ACTIONS.map(a=><button key={a.id} onClick={()=>a.planner?setModal({type:"paperPlanner"}):doAction(a)} disabled={(a.id==="work"||a.id==="gig")&&state.energy<18}><i>{a.icon}</i><span><b>{a.name}</b><small>{a.id==="work"?`${currentJob.name} · 收入 ${currentWage}€`:a.sub}</small></span><em>⏳ 1周</em></button>)}</div><div className="month-cost"><b>处理手续不再是“空过一周”</b><span>你可以整理材料、抢预约或追旧账。材料包能在官僚事件中直接消耗，显著降低损失；档案值则用于解锁更好的职业。</span></div></>}

      {tab==="market"&&<><div className="panel-title"><div><small>HANDEL & ANLAGE</small><h2>交易与投资</h2></div><span>所有操作不直接耗时</span></div><p className="market-tip">先买入或开一个经营批次，再用“本周行动”推进时间。价格和经营结果会随着周数变化。</p>
        <div className="market-section-title"><b>即时买卖</b><span>储物 {totalInventory}/{state.capacity}</span></div><div className="goods">{GOODS.map(g=>{const qty=state.inventory[g.id]||0;const avg=qty?Math.round((state.inventoryCost[g.id]||0)/qty):0;const pnl=qty?prices[g.id]-avg:0;return <div className="good" key={g.id}><span className="good-icon">{g.icon}</span><div><b>{g.name}</b><small>{g.note}</small><em>持有 {qty} · {qty?`均价 ${avg}€ · 每件${pnl>=0?"浮盈":"浮亏"} ${Math.abs(pnl)}€`:"尚未买入"}</em></div><strong><small>当前卖价</small>{prices[g.id]}€</strong><div className="trade-buttons"><button onClick={()=>trade(g,"buy")}>买</button><button onClick={()=>trade(g,"sell")}>卖</button></div></div>})}</div>
        <div className="market-section-title"><b>经营批次</b><span>开始与结算均不耗时</span></div>
        <div className="venture-block"><div className="subhead"><b>① 选择要卖的东西</b><span>利润越高，风险通常越大</span></div><div className="venture-goods">{HUSTLE_GOODS.map(g=><button key={g.id} className={ventureGood===g.id?"selected":""} onClick={()=>setVentureGood(g.id)}><i>{g.icon}</i><b>{g.name}</b><small>预期毛利 {Math.round(g.margin*100)}% · 风险 {g.risk}</small></button>)}</div>
        <div className="subhead"><b>② 选择销售渠道</b></div><div className="channel-row">{CHANNELS.map(c=><button key={c.id} className={ventureChannel===c.id?"selected":""} onClick={()=>setVentureChannel(c.id)}><i>{c.icon}</i><span><b>{c.name}</b><small>{c.note}</small></span></button>)}</div>
        {state.activeVenture?<div className="active-venture"><div><small>进行中的经营批次</small><b>{state.activeVenture.goodName} · {state.activeVenture.channelName}</b></div><span>已投入 <b>{state.activeVenture.invested}€</b></span><span>{state.totalWeek>=state.activeVenture.readyWeek?"现在可以结算":"还需推进 1 周"}</span><button onClick={settleVenture} disabled={state.totalWeek<state.activeVenture.readyWeek}>{state.totalWeek>=state.activeVenture.readyWeek?"查看行情并结算":"等待时间推进"}</button></div>:<div className="capital-box"><div><b>③ 开始经营批次</b><strong>{ventureAmount} €</strong></div><input aria-label="投入本金" type="range" min="50" max={Math.max(50,Math.min(800,state.money-250))} step="50" value={Math.min(ventureAmount,Math.max(50,state.money-250))} onChange={e=>setVentureAmount(Number(e.target.value))}/><div className="cost-preview"><span>商品本金<b>{ventureAmount}€</b></span><span>渠道费用<b>{CHANNELS.find(c=>c.id===ventureChannel)?.cost||0}€</b></span><span>总投入<b>{ventureAmount+(CHANNELS.find(c=>c.id===ventureChannel)?.cost||0)}€</b></span></div><small>开始批次不耗时间，但资金会立刻锁定；至少推进一周后才能结算。</small><button onClick={startVenture}>投入 {ventureAmount+(CHANNELS.find(c=>c.id===ventureChannel)?.cost||0)}€ 开始批次 <span>→</span></button></div>}
        {(state.ventureLedger||[]).length>0&&<div className="venture-ledger"><div className="subhead"><b>最近经营账本</b><span>投入 → 回收 → 净结果</span></div>{state.ventureLedger.slice(0,3).map((l,i)=><p key={i}><span>{l.good}<small>{l.channel}</small></span><b>{l.invested}€ → {l.returned}€</b><em className={l.profit>=0?"profit":"loss"}>{l.profit>=0?"+":""}{l.profit}€</em></p>)}</div>}</div>
        <div className="stock-block"><div className="subhead"><b>虚构证券市场</b><span>均价与浮盈亏实时显示</span></div>{STOCKS.map(s=>{const held=state.stocks[s.id]||0;const avg=held?Math.round((state.stockCost[s.id]||0)/held):0;const pnl=held?(stockPrices[s.id]-avg)*held:0;return <div className="stock" key={s.id}><i>{s.icon}</i><span><b>{s.ticker} · {s.name}</b><small>{held?`持有 ${held} 股 · 均价 ${avg}€ · ${pnl>=0?"浮盈":"浮亏"} ${Math.abs(pnl)}€`:"未持有 · 买入后记录成本"}</small></span><strong><small>现价</small>{stockPrices[s.id]}€</strong><div><button onClick={()=>tradeStock(s,"buy")}>买</button><button onClick={()=>tradeStock(s,"sell")}>卖</button></div></div>})}</div>
      </>}

      {tab==="career"&&<><div className="panel-title"><div><small>HAUPTBERUF & SCHULDEN</small><h2>设定本职工作</h2></div><span>德语 {state.german} · 档案 {state.papers}</span></div><p className="career-help">换职业不消耗时间。德语不仅解锁职业：超过 40 后，每点德语为本职周薪增加 2€，最多加 80€；德语 60/75 还会分别减少事件压力 2/4 点。</p><div className="language-bonus"><span>当前语言工资加成<b>+{languageBonus}€ / 周</b></span><span>当前事件减压<b>-{state.german>=75?4:state.german>=60?2:0} 压力</b></span></div><div className="jobs">{JOBS.map(j=>{const unlocked=state.german>=j.requirement&&state.papers>=j.paperRequirement;return <button key={j.id} className={state.jobId===j.id?"selected":""} onClick={()=>switchJob(j)}><i>{j.icon}</i><span><b>{j.name}</b><small>基础周薪 {j.wage}€ · 精力 {j.energy} · 健康 {j.health}{j.requirement?` · 德语 ${j.requirement} · 档案 ${j.paperRequirement}`:""}</small></span><em>{state.jobId===j.id?"当前本职":unlocked?"设为本职":"未解锁"}</em></button>})}</div><div className="debt-box"><span><small>私人债务</small><b>{Math.round(state.debt)} €</b></span><p>每月增长 3.5%。还清后，你才真正拥有选择。</p><button onClick={payDebt}>偿还最多 250€</button></div></>}

      {tab==="journal"&&<><div className="panel-title"><div><small>VERLAUF</small><h2>生活记录</h2></div><span>{state.seen.length} 个事件</span></div><div className="journal">{state.journal.length?state.journal.map((j,i)=><p key={i}><i>{String(state.journal.length-i).padStart(2,"0")}</i>{j}</p>):<div className="empty">你的档案目前还很薄。系统会设法改变这一点。</div>}</div></>}
    </section>

    {toast&&<button className="toast" onClick={()=>setToast("")}>{toast}<span>×</span></button>}
    {modal&&<div className="modal-backdrop"><article className="event-modal">
      {modal.type==="paperPlanner"?<><div className="modal-top"><span>BEHÖRDENPLAN</span><b>行政事务</b></div><h2>这周具体跑什么手续？</h2><p>选择一项后才会推进一周。它们会留下档案、材料包或追回的钱，不再只是“忙了一周”。</p><div className="paper-tasks">{PAPER_TASKS.map(task=><button key={task.id} onClick={()=>doPaperTask(task)}><b>{task.icon} {task.name}</b><span>{task.sub}</span><em>{Object.entries(task.effect).map(([k,v])=>`${effectNames[k]} ${v>0?"+":""}${v}`).join(" · ")}</em></button>)}</div><button className="secondary" onClick={()=>setModal(null)}>先不跑手续</button></>:modal.type==="event"?<><div className="modal-top"><span>{modal.event.office}</span><b>随机事项</b></div><div className="time-passed">{modal.timeLabel}<small>{modal.actionName}已经用掉一周</small></div><h2>{modal.event.title}</h2><p>{modal.event.text}</p><div className="modal-choices">{modal.event.choices.map(c=><button key={c.label} onClick={()=>chooseEvent(c,modal.event)}><b>{c.label}</b><span>{Object.entries(c.effect||{}).map(([k,v])=>`${effectNames[k]} ${v>0?"+":""}${v}`).join(" · ")}</span></button>)}<button className="prepared-choice" disabled={state.packs<1} onClick={()=>choosePrepared(modal.event)}><b>📦 提交完整材料包快速处理</b><span>消耗 1 份材料包 · 本次主要损失降低约 55%{state.packs<1?" · 当前不足":""}</span></button></div></>:modal.type==="weekResult"?<><div className="modal-top"><span>WOCHENABSCHLUSS</span><b>周结算</b></div><div className="time-passed large">{modal.timeLabel}<small>时间已经推进</small></div><h2>这一周结束了</h2><p>{modal.actionName}已经完成。{modal.monthSummary||"新的市场价格和生活状态已经更新。"}</p><button className="primary" onClick={()=>setModal(null)}>进入新的一周 <span>→</span></button></>:modal.type==="ventureResult"?<><div className="modal-top"><span>NEBENGEWERBE</span><b>经营结算</b></div><div className="holding-period">持有 {modal.ledger.heldWeeks} 周后结算<small>开始和结算本身均不耗时间</small></div><h2>{modal.title}</h2><p>{modal.result}</p><div className="venture-result-numbers"><span>总投入<b>{modal.ledger.invested}€</b><small>本金 {modal.ledger.capital}€ + 渠道 {modal.ledger.fee}€</small></span><span>回收金额<b>{modal.ledger.returned}€</b><small>实际回到账户的价值</small></span><span>净利润<b className={modal.ledger.profit>=0?"profit":"loss"}>{modal.ledger.profit>=0?"+":""}{modal.ledger.profit}€</b><small>回收 − 总投入</small></span></div><button className="primary" onClick={()=>setModal(null)}>完成结算 <span>→</span></button></>:<><div className="modal-top"><span>AUSWIRKUNG</span><b>处理结果</b></div>{modal.timeLabel&&<div className="time-passed">{modal.timeLabel}<small>事件发生在已经消耗的这一周</small></div>}<h2>{modal.choice.label}</h2><p>{modal.choice.result}</p>{modal.languageRelief>0&&<div className="language-relief">🗣️ 德语能力令本次压力额外减少 {modal.languageRelief} 点</div>}<button className="primary" onClick={()=>setModal(null)}>进入新的一周 <span>→</span></button></>}
    </article></div>}
  </main>;
}
