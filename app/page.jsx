import React, { useEffect, useMemo, useState } from "react";

const PROFILES = [
  { id: "student", icon: "🎓", name: "外国大学生", detail: "刚下飞机 · 德语 B1 · 学籍待激活 · 一叠陌生的信", money: 1900, debt: 1200, health: 80, stress: 28, energy: 78, german: 46, papers: 35, reputation: 25, study:22, wage: 470 }
];

const DE_EVENTS = [
  {id:"de-seminar",title:"Dein Name fehlt auf der Seminarliste",office:"UNIVERSITÄT",text:"Der Dozent verweist auf das Prüfungsamt, das Prüfungsamt auf Moodle. Moodle sagt: erfolgreich angemeldet.",choices:[
    {label:"Mit drei Screenshots zum Dozenten",effect:{energy:-8,stress:5,study:8,papers:5},result:"Du wirst handschriftlich ergänzt. Handschriftliche Listen gelten allerdings nicht im System."},
    {label:"Teilnehmen und weiter mailen",effect:{energy:-5,stress:8,study:5,german:2},result:"Du lernst etwas und erhältst zugleich die Bitte, keine doppelten Anfragen zu senden."}
  ]},
  {id:"de-exam",title:"Die Prüfungsanmeldung schloss zwei Minuten zu früh",office:"PRÜFUNGSAMT",text:"Auf der Website stand 23:59. Der Server lebte offenbar in einer anderen Zeitzone.",choices:[
    {label:"Härtefallantrag stellen",effect:{papers:14,energy:-15,stress:10,study:4},result:"Der Antrag ist eingegangen. Die Entscheidung kommt nach dem Prüfungstermin."},
    {label:"Auf das nächste Semester verschieben",effect:{stress:4,study:10,health:2},result:"Dein Studienplan verschiebt sich, aber du hörst auf, die Seite neu zu laden."}
  ]},
  {id:"de-mensa",title:"Die Mensakarte hat Guthaben, existiert aber nicht",office:"MENSA",text:"Der Automat kennt dein Geld, die Kasse kennt deine Karte nicht.",choices:[
    {label:"Noch einmal Mittagessen kaufen",effect:{money:-18,health:3,stress:3},result:"Eine Mahlzeit existiert im System, die andere auf deinem Tablett."},
    {label:"Guthaben übertragen lassen",effect:{energy:-9,papers:6,stress:6},result:"Die alte Karte muss zuerst gelöscht werden. Dafür muss die neue Karte bereits gültig sein."}
  ]},
  {id:"de-library",title:"Mahnung für ein Buch, das du nie ausgeliehen hast",office:"BIBLIOTHEK",text:"Der Datensatz ist vollständig. Nur die Unterschrift gehört nicht dir.",choices:[
    {label:"Ausleihbeleg anfordern",effect:{energy:-10,papers:9,stress:6,study:-2},result:"Der Beleg kommt nach der Datenschutzprüfung. Die Mahngebühr läuft weiter."},
    {label:"Zahlen und das Konto entsperren",effect:{money:-65,stress:-4,study:6},result:"Am nächsten Tag gibt jemand anderes das Buch zurück."}
  ]},
  {id:"de-group",title:"Die Gruppe verschwindet kurz vor der Abgabe",office:"SEMINAR",text:"Die letzte Nachricht lautet: Ich lade es heute Abend hoch. Im Ordner liegt nichts.",choices:[
    {label:"Alles allein fertigstellen",effect:{study:13,energy:-18,health:-5,stress:12},result:"Die Arbeit ist pünktlich da. Vier Namen stehen ordentlich auf dem Deckblatt."},
    {label:"Dem Dozenten schreiben",effect:{german:3,reputation:-3,stress:7,study:4},result:"Ihr sollt zunächst eure interkulturelle Gruppenkommunikation verbessern."}
  ]},
  {id:"de-heating",title:"Die Heizung ist kaputt, alle bedauern es",office:"HAUSVERWALTUNG",text:"Die Verwaltung verweist auf den Vermieter, der Vermieter auf die Verwaltung. Im Zimmer sind 15 °C.",choices:[
    {label:"Einen Heizlüfter kaufen",effect:{money:-120,health:-4,stress:3},result:"Das Zimmer wird wärmer. Die Stromrechnung beginnt ein eigenes Studium."},
    {label:"Schriftlich eine Frist setzen",effect:{health:-8,energy:-10,papers:14},result:"Die Reparatur kommt irgendwann zwischen 8 und 18 Uhr."}
  ]},
  {id:"de-train",title:"Der Zug fällt aus, gilt aber als pünktlich",office:"DEUTSCHE BAHN",text:"Der Endbahnhof wurde geändert. Die App meldet trotzdem eine erfolgreiche Reise.",choices:[
    {label:"Taxi nehmen und die Schicht retten",effect:{money:-68,stress:3,reputation:4},result:"Der Arbeitgeber zeigt Verständnis und empfiehlt künftig mehr Verkehrspuffer."},
    {label:"Warten und Beweise sammeln",effect:{energy:-13,stress:9,papers:6},result:"Der Support erklärt, ein Screenshot beweise nicht, dass du im Zug warst."}
  ]},
  {id:"de-permit",title:"Die Aufenthaltserlaubnis braucht eine Aufenthaltserlaubnis",office:"AUSLÄNDERBEHÖRDE",text:"Der Arbeitgeber braucht die Genehmigung. Die Behörde braucht zuerst den Arbeitsvertrag.",choices:[
    {label:"Alle Stellen gleichzeitig anschreiben",effect:{energy:-15,stress:11,papers:18},result:"Nach der siebten Mail landen beide Anhänge endlich in derselben Akte."},
    {label:"Eine Fiktionsbescheinigung beantragen",effect:{money:-80,stress:7,papers:12},result:"Die Bank kennt das Dokument nicht und fragt die Zentrale."}
  ]},
  {id:"de-radio",title:"Doppelter Rundfunkbeitrag für dieselbe Wohnung",office:"BEITRAGSSERVICE",text:"Du und dein Mitbewohner teilen eine Beitragsnummer. Das System hat trotzdem ein zweites Konto eröffnet.",choices:[
    {label:"Schriftlich widersprechen",effect:{energy:-8,stress:10,papers:11},result:"Sechs Wochen keine Antwort. Die Mahnung kommt pünktlich."},
    {label:"Zahlen und später zurückfordern",effect:{money:-55,stress:-3},result:"Die Rückforderung benötigt nun die Nummer des geschlossenen Kontos."}
  ]},
  {id:"de-doctor",title:"Der nächste Facharzttermin ist nächstes Jahr",office:"FACHARZT",text:"Der Hausarzt empfiehlt eine schnelle Untersuchung. Fünf Praxen nehmen niemanden auf.",choices:[
    {label:"Weiter telefonieren",effect:{energy:-14,health:-6,stress:9},result:"Nach zwölf Anrufen kennst du jede Warteschleifenmelodie."},
    {label:"Als Selbstzahler gehen",effect:{money:-240,health:12,stress:-5},result:"Morgen wäre ein Termin frei. Medizinische Zeit ist käuflich."}
  ]},
  {id:"de-neighbor",title:"Die Nachbarn laden zum Grillen ein",office:"NACHBARSCHAFT",text:"Keine Anmeldung, kein Formular, kein Termin. Das wirkt verdächtig unkompliziert.",choices:[
    {label:"Etwas mitbringen und hingehen",effect:{money:-28,stress:-13,reputation:14,energy:-3},result:"Du lernst jemanden kennen, der Fahrräder repariert und Mietrecht versteht."},
    {label:"Zu Hause ausruhen",effect:{health:5,energy:11,stress:-5},result:"Du schläfst einen ganzen Nachmittag und erledigst keinen Antrag."}
  ]},
  {id:"de-bread",title:"Du willst nur Brot und bekommst sieben Fragen",office:"BÄCKEREI",text:"Vollkorn, Roggen, Mischung; geschnitten oder ganz; dünn oder dick; bar oder Girocard.",choices:[
    {label:"Dasselbe wie die Person vor mir",effect:{money:-6,stress:-4,reputation:2},result:"Du bekommst ein zuverlässiges Brot, dessen Namen du nie erfahren wirst."},
    {label:"Jede Frage sorgfältig beantworten",effect:{money:-8,energy:-3,german:3},result:"Das war der reibungsloseste Verwaltungsvorgang deiner Woche."}
  ]}
];

const JOBS = [
  { id: "shift", name: "仓库夜班", wage: 470, energy: -22, health: -4, stress: 6, requirement: 0, paperRequirement:0, icon: "📦" },
  { id: "delivery", name: "外卖接单", wage: 340, energy: -20, health: -6, stress: 4, requirement: 0, paperRequirement:0, icon: "🚲" },
  { id: "office", name: "大学办公室助理", wage: 560, energy: -17, health: -2, stress: 7, requirement: 55, paperRequirement:45, icon: "🏫" },
  { id: "agency", name: "学生事务翻译", wage: 640, energy: -16, health: -1, stress: 5, requirement: 75, paperRequirement:60, icon: "🗣️" }
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
  { id:"wgkit", name:"WG 厨房入门包", icon:"🍳", margin:.28, risk:5, demand:"稳定", detail:"锅、盘子和电热水壶，专门卖给刚入住的新同学。" },
  { id:"printerset", name:"二手打印机加墨盒", icon:"🖨️", margin:.42, risk:10, demand:"较高", detail:"考试季和办手续时需求很高，风险主要来自卡纸和退货。" },
  { id:"moving", name:"搬家纸箱与小家具", icon:"📦", margin:.25, risk:3, demand:"稳定", detail:"从毕业生手里整批收走，再卖给刚搬进 WG 的新生。" },
  { id:"lunchbox", name:"校园自制饭盒", icon:"🥟", margin:.55, risk:25, demand:"很高", detail:"比食堂便宜，但卫生许可和过敏原标签可能突然找上门。" },
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
  { text:"新学期开学，大批新生正在购买教材和 WG 生活用品。",mods:{},ventureMods:{books:1.28,wgkit:1.25,printerset:1.16,moving:1.14} },
  { text:"考试季临近，图书馆座位和打印店同时告急。",mods:{},ventureMods:{books:1.3,printerset:1.32,lunchbox:1.1} },
  { text:"学生宿舍集中换房，搬家纸箱和廉价厨具需求上涨。",mods:{},ventureMods:{moving:1.34,wgkit:1.3} },
  { text:"周末大型跳蚤市场开张，二手商品供应突然增加。",mods:{},ventureMods:{phones:.86,shoes:.88,moving:.9,wgkit:.92} },
  { text:"校园国际文化节即将举行，餐食和运动用品更受欢迎。",mods:{},ventureMods:{lunchbox:1.32,shoes:1.16} },
  { text:"市政府将更多手续转到线上，旧手机和打印设备需求上升。",mods:{},ventureMods:{phones:1.26,printerset:1.2} },
  { text:"消费者中心警告假货和破解设备，平台开始集中清查。",mods:{},ventureMods:{shoes:.62,sticks:.58} },
  { text:"假期开始，校园人流下降，毕业生正在集中清理家具。",mods:{},ventureMods:{books:.76,lunchbox:.78,moving:1.16,wgkit:.88} }
];
const DE_NEWS = [
  "Semesterstart: Neue Studierende suchen Lehrbücher und WG-Ausstattung.",
  "Die Prüfungsphase naht. Bibliothek und Copyshops sind überfüllt.",
  "Viele Wohnheimzimmer wechseln. Umzugskartons und günstige Küchensachen sind gefragt.",
  "Der große Flohmarkt öffnet. Das Angebot an Gebrauchtwaren steigt plötzlich.",
  "Das internationale Campusfest steht an. Essen und Sportsachen sind gefragt.",
  "Mehr Behördengänge werden digital. Alte Handys und Drucker sind gefragt.",
  "Die Verbraucherzentrale warnt vor Fälschungen und manipulierten Geräten.",
  "Die Semesterferien beginnen. Der Campus wird leerer, viele ziehen aus."
];

const BASE_EVENTS = [
  { id:"seminar", title:"研讨课分组名单里没有你的名字", office:"UNIVERSITÄT", text:"教授说名单由考试办公室导入，考试办公室说课程平台才是正式名单，课程平台显示你已成功注册。", choices:[
    { label:"带着三张截图去找教授", effect:{energy:-8,stress:5,study:8,papers:5}, result:"教授手写把你加进名单，并提醒手写名单不具备系统效力。" },
    { label:"先旁听并继续发邮件", effect:{energy:-5,stress:8,study:5,german:2}, result:"你听懂了课程，也收到自动回复：请勿重复发送同一问题。" }
  ]},
  { id:"examreg", title:"考试报名在截止日提前两分钟关闭", office:"PRÜFUNGSAMT", text:"网页写着 23:59，服务器采用的似乎是另一个时区。办公室建议你下学期再考。", choices:[
    { label:"提交 Härtefallantrag", effect:{papers:14,energy:-15,stress:10,study:4}, result:"申请被受理。是否获准将在考试之后通知。" },
    { label:"接受延期，先准备下一门", effect:{stress:4,study:10,health:2}, result:"你的学习计划向后顺延，但至少这周没有继续刷新网页。" }
  ]},
  { id:"mensa", title:"食堂卡有余额，但系统说卡不存在", office:"MENSA", text:"充值机认识你的钱，收银机不认识你的卡。柜台建议先吃饭再去另一校区申请退款。", choices:[
    { label:"重新买一份午餐", effect:{money:-18,health:3,stress:3}, result:"两份午餐里有一份存在于系统，另一份存在于你手里。" },
    { label:"排队办理余额迁移", effect:{energy:-9,papers:6,stress:6}, result:"余额将在旧卡注销后迁移，而注销旧卡需要先证明新卡有效。" }
  ]},
  { id:"bibliothek", title:"图书馆催还一本你从未借过的书", office:"BIBLIOTHEK", text:"借阅记录完整，唯独签名和你的名字不一致。系统因此认为签名可能是你写错了。", choices:[
    { label:"申请查看借阅凭证", effect:{energy:-10,papers:9,stress:6,study:-2}, result:"凭证将在数据保护审查后提供，催款在此期间继续。" },
    { label:"先赔钱解除账号冻结", effect:{money:-65,stress:-4,study:6}, result:"账号恢复了。那本书第二天被别人还了回来。" }
  ]},
  { id:"groupwork", title:"小组作业截止前，队友突然集体失联", office:"SEMINAR", text:"群聊最后一条消息是“我今晚会上传”。学习平台上只有你创建的空文件夹。", choices:[
    { label:"一个人熬夜完成", effect:{study:13,energy:-18,health:-5,stress:12}, result:"作业交上去了，封面上四个人的名字一样整齐。" },
    { label:"给老师说明情况", effect:{german:3,reputation:-3,stress:7,study:4}, result:"老师建议你们先在小组内部培养跨文化沟通能力。" }
  ]},
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
  { id:"study", icon:"🎓", name:"准备课程和考试", sub:"推进学业 · 消耗精力", run:()=>({study:11,energy:-15,stress:5,money:-12}) },
  { id:"rest", icon:"🛋️", name:"在家休息", sub:"恢复健康和精力", run:()=>({energy:25,health:8,stress:-10,money:-18}) },
  { id:"drink", icon:"🍺", name:"去酒吧喝酒", sub:"压力大降 · 伤身烧钱", run:()=>({money:-48,stress:-18,health:-7,energy:-3,reputation:4}) },
  { id:"social", icon:"🤝", name:"参加社区活动", sub:"积累人脉 · 小额花费", run:()=>({money:-22,energy:-8,stress:-7,reputation:11,german:3}) },
  { id:"tutorial", icon:"🧑‍🎓", name:"参加辅导课和学习小组", sub:"推进学业 · 练德语 · 认识同学", run:()=>({study:9,german:4,reputation:6,energy:-12,stress:3,money:-8}) },
  { id:"sport", icon:"🏐", name:"参加大学体育课", sub:"恢复健康 · 减轻压力 · 消耗精力", run:()=>({health:11,stress:-9,reputation:5,energy:-12,money:-18}) },
  { id:"mealprep", icon:"🍲", name:"在 WG 集体做饭", sub:"省生活费 · 恢复健康 · 增进室友情", run:()=>({money:-24,health:6,stress:-6,reputation:7,energy:-7}) },
  { id:"doctor", icon:"🩺", name:"照顾身体", sub:"花钱治疗 · 恢复健康", run:()=>({money:-95,health:18,energy:8,stress:-5}) }
];

const PAPER_TASKS = [
  { id:"folder", icon:"🗂️", name:"整理标准材料包", sub:"获得 1 份可在事件中消耗的完整材料包", effect:{packs:1,papers:8,german:1,energy:-10,stress:3} },
  { id:"termin", icon:"📅", name:"抢一次 Behörden-Termin", sub:"预约、复印、排队，把档案推进一大截", effect:{packs:1,papers:14,energy:-14,stress:6} },
  { id:"refund", icon:"🧾", name:"核对旧账并申请退费", sub:"翻出一笔重复扣款，同时补全往来记录", effect:{money:90,papers:7,energy:-12,stress:4} }
];

const clamp = n => Math.max(0, Math.min(100, Math.round(n)));
const effectNames = {money:"资金",debt:"债务",energy:"精力",health:"健康",stress:"压力",german:"德语",papers:"档案",packs:"材料包",reputation:"人脉",study:"学业"};
const effectNamesDe = {money:"Geld",debt:"Schulden",energy:"Energie",health:"Gesundheit",stress:"Stress",german:"Deutsch",papers:"Akte",packs:"Unterlagen",reputation:"Kontakte",study:"Studium"};
const effectIcons = {money:"💶",debt:"🏦",energy:"⚡",health:"❤️",stress:"🧠",german:"🗣️",papers:"🗂️",packs:"📦",reputation:"🤝",study:"🎓"};
const periodLabel = s => s.month>12?"年度结束":`第 ${s.month} 月 · 第 ${s.week} 周`;

function EffectBadges({effect,lang="zh"}) {
  const names=lang==="de"?effectNamesDe:effectNames;
  return <div className="effect-badges"><strong>{lang==="de"?"Betroffene Werte":"关联数值"}</strong>{Object.keys(effect).map(key=><span key={key}>{effectIcons[key]} {names[key]}</span>)}</div>;
}

const DE_UI = {
  "现金":"Geld","债务":"Schulden","❤️ 健康":"❤️ Gesundheit","🧠 压力":"🧠 Stress","⚡ 精力":"⚡ Energie","🗣️ 德语":"🗣️ Deutsch","🤝 人脉":"🤝 Kontakte","🗂️ 档案":"🗂️ Akte","📦 材料包":"📦 Unterlagen","🎓 学业":"🎓 Studium",
  "可正常行动":"handlungsfähig","需要休息":"Erholung nötig","无法工作":"arbeitsunfähig","解锁职业":"schaltet Jobs frei","事件减损":"Schutz bei Ereignissen","课程进度":"Studienfortschritt","本周消息":"Diese Woche","时间规则":"ZEITREGEL","⏳ 本周行动＝推进 1 周":"⏳ Wochenaktion = 1 Woche","○ 商品、股票、经营批次、换职业＝不耗时间":"○ Handel, Anlage und Jobwechsel kosten keine Zeit",
  "本周行动":"Wochenaktion","交易投资":"Nebengewerbe","职业设定":"Beruf","记录":"Verlauf","这一周怎么过？":"Wie verbringst du diese Woche?","每次只能选 1 项":"Wähle genau 1 Aktion","现在":"Jetzt","选择行动":"Aktion wählen","消耗整整一周":"verbraucht eine Woche","行动结束":"Danach","本月进度":"Monatsfortschritt","第 ":"Monat "," 月 · 第 ":" · Woche "," 周":"",
  "本周工资 ":"Wochenlohn ","储物 ":"Lager ","持有 ":"Bestand ","投入 ":"Einsatz "," 开始批次":" · Projekt starten",
  "当前本职工作":"Aktueller Nebenjob","更换职业":"Job wechseln","这些数值会怎样影响生活？":"Wie wirken diese Werte?","关联数值":"Betroffene Werte","处理积压手续":"Papierkram erledigen","选择一项具体行政任务":"Eine konkrete Behördenaufgabe wählen","做本职工作":"Im Nebenjob arbeiten","按当前职业结算工资":"Lohn des aktuellen Jobs","按当前工资结算":"Lohn wird danach abgerechnet","接一次临时零工":"Gelegenheitsjob annehmen","不改变本职 · 德语越好收入越高":"Kein Jobwechsel · besseres Deutsch bringt mehr Geld","学德语":"Deutsch lernen","解锁好工作 · 费脑":"Bessere Jobs · kostet Konzentration","准备课程和考试":"Für Kurse und Prüfungen lernen","推进学业 · 消耗精力":"Studium voranbringen · kostet Energie","在家休息":"Zu Hause erholen","恢复健康和精力":"Gesundheit und Energie regenerieren","去酒吧喝酒":"In die Kneipe gehen","压力大降 · 伤身烧钱":"Weniger Stress · kostet Geld und Gesundheit","参加社区活动":"Zum Nachbarschaftstreffen","积累人脉 · 小额花费":"Kontakte aufbauen · kleine Ausgabe","照顾身体":"Um die Gesundheit kümmern","花钱治疗 · 恢复健康":"Behandlung bezahlen · Gesundheit gewinnen","⏳ 推进1周":"⏳ +1 Woche",
  "仓库夜班":"Nachtschicht im Lager","外卖接单":"Essenslieferung","大学办公室助理":"Uni-Bürohilfe","学生事务翻译":"Übersetzung im Studierendenwerk","整理标准材料包":"Standard-Unterlagen vorbereiten","获得 1 份可在事件中消耗的完整材料包":"Ein vollständiges Unterlagenpaket erhalten","抢一次 Behörden-Termin":"Behördentermin ergattern","预约、复印、排队，把档案推进一大截":"Termin, Kopien und Warteschlange für eine vollständigere Akte","核对旧账并申请退费":"Alte Abrechnung prüfen","翻出一笔重复扣款，同时补全往来记录":"Doppelabbuchung finden und Schriftverkehr ergänzen",
  "二手自行车":"Gebrauchtes Fahrrad","罢工和好天气时走俏":"Bei Streik und Sonne gefragt","电暖器":"Heizlüfter","寒潮时价格暴涨":"Bei Kälte besonders teuer","Deutschlandticket":"Deutschlandticket","政策变化会影响价格":"Politik verändert den Preis","旧手机":"Altes Smartphone","办线上手续的刚需":"Für digitale Anträge fast unverzichtbar","宜家小桌":"Kleiner IKEA-Tisch","开学季需求上升":"Zum Semesterstart gefragt","家用打印机":"Drucker","任何手续都可能需要它":"Jeder Antrag könnte ihn verlangen",
  "二手德语教材":"Gebrauchte Deutschbücher","翻新旧手机":"Aufbereitete Smartphones","高仿名牌运动鞋":"Gefälschte Markenschuhe","破解电视棒":"Manipulierter TV-Stick","eBay Kleinanzeigen":"Kleinanzeigen","周末跳蚤市场":"Wochenend-Flohmarkt","德国大盘基金":"Deutscher Indexfonds","莱茵物流股份":"Rhein-Logistik AG","政务软件股份":"Behördensoftware AG",
  "月末还会自动结算":"Monatsabrechnung","交易与投资":"Handel und Anlage","所有操作不直接耗时":"Diese Aktionen kosten keine Zeit","即时买卖":"Soforthandel","当前卖价":"Aktueller Preis","买":"Kaufen","卖":"Verkaufen","尚未买入":"Noch nicht gekauft","经营批次":"Handelsprojekt","开始与结算均不耗时":"Start und Abschluss kosten keine Zeit","① 选择要卖的东西":"① Ware wählen","利润越高，风险通常越大":"Mehr Gewinn bedeutet meist mehr Risiko","② 选择销售渠道":"② Verkaufskanal wählen","③ 开始经营批次":"③ Handelsprojekt starten","商品本金":"Warenkapital","渠道费用":"Kanalgebühr","总投入":"Gesamteinsatz","虚构证券市场":"Fiktiver Aktienmarkt","均价与浮盈亏实时显示":"Einstand und Gewinn/Verlust werden angezeigt","现价":"Kurs","未持有 · 买入后记录成本":"Nicht im Depot · Kaufpreis wird gespeichert",
  "设定本职工作":"Nebenjob festlegen","当前语言工资加成":"Sprachbonus beim Lohn","当前事件减压":"Stressbonus bei Ereignissen","基础周薪":"Grundlohn/Woche","精力":"Energie","健康":"Gesundheit","德语":"Deutsch","档案":"Akte","当前本职":"Aktueller Job","设为本职":"Als Job wählen","未解锁":"Gesperrt","私人债务":"Private Schulden","偿还最多 250€":"Bis zu 250 € tilgen","生活记录":"Lebensverlauf","个事件":" Ereignisse","行政事务":"Behördenangelegenheit","这周具体跑什么手续？":"Welche Behördensache erledigst du?","先不跑手续":"Doch nicht","随机事项":"Zufälliges Ereignis","📦 提交完整材料包快速处理":"📦 Vollständige Unterlagen einreichen","周结算":"Wochenabschluss","时间已经推进":"Die Zeit ist vergangen","这一周结束了":"Die Woche ist vorbei","进入新的一周":"In die nächste Woche","经营结算":"Handelsabschluss","完成结算":"Abschluss beenden","处理结果":"Ergebnis","资金":"Geld","材料包":"Unterlagen","学业":"Studium","人脉":"Kontakte","压力":"Stress"
  ,"低于 18 不能工作或接零工；":"Unter 18 kannst du weder arbeiten noch jobben; ","达到 45 可能出现稳定岗位；":"ab 45 kann eine Beförderung erscheinen; ","与德语共同解锁职业；":"schaltet zusammen mit Deutsch Jobs frei; ","可在官僚事件中抵消约 55% 的主要损失。":"reduziert bei Behördenereignissen den Hauptschaden um etwa 55%.","部分方案涉及资金":"einige Optionen betreffen Geld",
  "第 4 周行动结束后进入下个月，并扣除生活费 780€、增加债务利息 3.5%。随机事件发生在已经消耗的这一周内，不会额外再走一周。":"Nach Woche 4 beginnt ein neuer Monat: 780 € Lebenshaltungskosten und 3,5 % Schuldzinsen. Ereignisse verbrauchen keine zusätzliche Woche.","先买入或开一个经营批次，再用“本周行动”推进时间。价格和经营结果会随着周数变化。":"Kaufe Waren oder starte ein Projekt und lass dann mit einer Wochenaktion Zeit vergehen. Preise und Ergebnisse ändern sich wöchentlich.","预期毛利":"Erwartete Marge","风险":"Risiko","客流大、价格好，但平台留痕完整。":"Viele Kunden und gute Preise, aber eine vollständige digitale Spur.","要交摊位费、消耗体力，现金交易更灵活。":"Standgebühr und körperliche Arbeit, dafür flexiblere Barzahlung.","开始批次不耗时间，但资金会立刻锁定；至少推进一周后才能结算。":"Der Start kostet keine Zeit, bindet aber sofort Kapital. Abschluss frühestens nach einer Woche.","换职业不消耗时间。德语不仅解锁职业：超过 40 后，每点德语为本职周薪增加 2€，最多加 80€；德语 60/75 还会分别减少事件压力 2/4 点。":"Ein Jobwechsel kostet keine Zeit. Deutsch schaltet Jobs frei und erhöht ab 40 den Wochenlohn um 2 € pro Punkt, maximal 80 €. Mit 60/75 Deutsch sinkt Ereignisstress um 2/4.","每月增长 3.5%。还清后，你才真正拥有选择。":"Wächst monatlich um 3,5 %. Erst ohne Schulden hast du echte Wahlfreiheit.","你的档案目前还很薄。系统会设法改变这一点。":"Deine Akte ist noch dünn. Das System wird das ändern.","本次主要损失降低约 55%":"Der Hauptschaden sinkt um etwa 55%","已经用掉一周":" hat bereits eine Woche verbraucht","新的市场价格和生活状态已经更新。":"Preise und Lebenswerte wurden aktualisiert.",
  "买货和结算不额外耗时":"Einkauf und Abschluss kosten keine zusätzliche Zeit","参加辅导课和学习小组":"Tutorium und Lerngruppe","推进学业 · 练德语 · 认识同学":"Studium · Deutsch · neue Kontakte","参加大学体育课":"Am Hochschulsport teilnehmen","恢复健康 · 减轻压力 · 消耗精力":"Gesundheit · weniger Stress · kostet Energie","在 WG 集体做饭":"Gemeinsam in der WG kochen","省生活费 · 恢复健康 · 增进室友情":"günstig · gesund · gut für die WG","WG 厨房入门包":"WG-Küchenstarterpaket","二手打印机加墨盒":"Gebrauchter Drucker mit Patronen","搬家纸箱与小家具":"Umzugskartons und Kleinmöbel","校园自制饭盒":"Hausgemachtes Campusessen","选择商品、销售渠道和投入金额，开始一批经营；然后通过“本周行动”推进至少一周，再回来查看能否赚钱。投入成本、回收金额和净利润都会保留在账本里。":"Wähle Ware, Verkaufskanal und Einsatz. Starte ein Projekt, lass mit einer Wochenaktion mindestens eine Woche vergehen und prüfe danach den Gewinn. Einsatz, Rückzahlung und Nettogewinn bleiben im Kassenbuch sichtbar.","消息改变概率，不保证赚钱":"Nachrichten verändern Chancen, garantieren aber keinen Gewinn","本周利好":"Diese Woche günstig","本周利空":"Diese Woche ungünstig","行情平稳":"Stabile Lage","盈利概率变化":"veränderte Gewinnchance"
};

function deText(value){
  let translated=value
    .replace(/第 (\d+) 月 · 第 (\d+) 周/g,"Monat $1 · Woche $2")
    .replace(/第 (\d+) 月/g,"Monat $1")
    .replace(/第 (\d+) 周/g,"Woche $1")
    .replace(/本周工资 (\d+)€/g,"Wochenlohn $1 €")
    .replace(/工资 \+(\d+)€/g,"Lohn +$1 €")
    .replace(/(\d+) 后可能触发晋升/g,"Ab $1: Chance auf Beförderung")
    .replace(/持有 (\d+)/g,"Bestand $1")
    .replace(/均价 (\d+)€/g,"Einstand $1 €")
    .replace(/储物 (\d+)\/(\d+)/g,"Lager $1/$2")
    .replace(/消耗 1 份材料包/g,"Verbraucht 1 Unterlagenpaket")
    .replace(/当前不足/g,"nicht vorhanden")
    .replace(/投入 (\d+)€ 开始批次/g,"$1 € einsetzen und Projekt starten");
  for(const [zh,de] of Object.entries(DE_UI).sort((a,b)=>b[0].length-a[0].length))translated=translated.replaceAll(zh,de);
  return translated;
}

function localizeNode(node,lang){
  if(lang!=="de")return node;
  if(typeof node==="string")return deText(node);
  if(Array.isArray(node))return node.map((item,i)=><React.Fragment key={i}>{localizeNode(item,lang)}</React.Fragment>);
  if(!React.isValidElement(node))return node;
  const props={};
  if(node.props.children!==undefined)props.children=localizeNode(node.props.children,lang);
  if(typeof node.props.title==="string")props.title=deText(node.props.title);
  if(typeof node.props["aria-label"]==="string")props["aria-label"]=deText(node.props["aria-label"]);
  return React.cloneElement(node,props);
}

function Localize({lang,children}){return localizeNode(children,lang);}

function seededPrice(good, week, news) {
  const wave = .78 + ((Math.sin((week + 1) * (good.base + 7) * .113) + 1) / 2) * .48;
  return Math.max(8, Math.round(good.base * wave * (news.mods[good.id] || 1)));
}

const ventureMarketFactor=(newsIndex,goodId)=>NEWS[newsIndex]?.ventureMods?.[goodId]||1;
const ventureMarketLabel=factor=>factor>1.08?"本周利好":factor<.93?"本周利空":"行情平稳";

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
  const [lang,setLang]=useState("zh");
  useEffect(()=>{document.documentElement.lang=lang==="de"?"de":"zh-CN";},[lang]);
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
    setScreen("arrival"); setTab("actions"); setModal(null);
  }

  function applyEffect(base,effect={}){
    const next={...base};
    Object.entries(effect).forEach(([k,v])=>{next[k]=["money","debt"].includes(k)?Math.max(0,(next[k]||0)+v):clamp((next[k]||0)+v);});
    return next;
  }

  function drawEvent(current){
    const eventPool=lang==="de"?DE_EVENTS:BASE_EVENTS;
    const eligible=eventPool.filter(e=>(!e.when||e.when(current))&&!current.seen.slice(-14).includes(e.id));
    if(!eligible.length)return null;
    const index=(current.totalWeek*7+Math.round(current.stress)+Math.round(current.money))%eligible.length;
    return eligible[index];
  }

  function doAction(action,force=false){
    if(modal&&!force)return;
    let next=applyEffect(state,action.run(state));
    let log=lang==="de"?`Monat ${state.month}, Woche ${state.week}: ${deText(action.name)}`:`第 ${state.month} 月第 ${state.week} 周：${action.name}`;
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
    const marketFactor=ventureMarketFactor(state.newsIndex,good.id);
    const activeVenture={goodId:good.id,goodName:good.name,channelId:channel.id,channelName:channel.name,capital:amount,fee:channel.cost,invested:totalInvestment,startWeek:state.totalWeek,readyWeek:state.totalWeek+1,marketFactor,marketLabel:ventureMarketLabel(marketFactor),marketNews:NEWS[state.newsIndex].text};
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
    const marketFactor=batch.marketFactor||1;
    const profitChance=Math.max(.25,Math.min(.78,.52+(marketFactor-1)*.72-good.risk*.002+channel.bonus*.08));
    const salesRoll=((signal*17+state.totalWeek*23+good.id.length*9)%100)/100;
    const profitable=salesRoll<profitChance;
    const swing=.62+((signal*7+state.totalWeek*5)%42)/100;
    let returned=profitable
      ?amount+Math.round(amount*(good.margin+channel.bonus)*swing*marketFactor)
      :Math.round(amount*(1-(.08+((signal*11)%18)/100+good.risk/550)));
    let profit=returned-batch.invested;
    let consequence={stress:good.risk>40?8:3,reputation:good.risk<20?4:-2};
    let result=profitable
      ?`${batch.marketLabel||ventureMarketLabel(marketFactor)}提高了成交机会，但结果仍有波动。投入 ${batch.invested}€，本次净赚 ${profit}€。`
      :`${batch.marketLabel||ventureMarketLabel(marketFactor)}没有带来足够成交量。投入 ${batch.invested}€，滞销、砍价和退货造成净亏 ${Math.abs(profit)}€。`;
    if(caught){
      const fine=Math.round(90+amount*(good.risk/65));
      consequence={stress:18,papers:-8,reputation:-10};
      returned=Math.max(0,returned-fine);
      result=channel.id==="ebay"
        ?`即使行情有利，平台仍冻结了交易并收到权利人投诉。扣除退款与罚款 ${fine}€ 后，本周净结果为 ${returned-batch.invested}€。`
        :`行情不能阻止市场巡查。由于无法出示进货凭证，货物被扣并产生 ${fine}€ 损失，本周净结果为 ${returned-batch.invested}€。`;
    }
    const ledgerEntry={week:state.totalWeek,good:good.name,channel:channel.name,capital:amount,fee:channel.cost,invested:batch.invested,returned,profit:returned-batch.invested,caught,heldWeeks:state.totalWeek-batch.startWeek,marketLabel:batch.marketLabel||ventureMarketLabel(marketFactor)};
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

  if(screen==="intro")return <Localize lang={lang}><main className="landing v2-intro"><div className="flagline"/><nav><span className="brand">DEUTSCHLAND<br/><b>{lang==="de"?"LEBEN":"浮生记"}</b></span><div className="lang-switch"><button className={lang==="zh"?"active":""} onClick={()=>setLang("zh")}>中文</button><button className={lang==="de"?"active":""} onClick={()=>setLang("de")}>Deutsch</button></div></nav><section className="hero"><div className="kicker">12 MONATE · 48 WOCHEN · STUDIEREN & ÜBERLEBEN</div><h1>{lang==="de"?<>Ankommen.<br/><em>Ab Woche eins.</em></>:<>来到德国，<br/><em>从第一周开始。</em></>}</h1><p>{lang==="de"?"Du bist als internationaler Student gerade in Deutschland gelandet. Die Immatrikulation ist noch nicht vollständig, das Zimmer nur vorläufig und dein Deutsch gerade gut genug. Studium, Nebenjobs, Visum und jeder Brief können dieses Jahr verändern。":"你是一名刚抵达德国的外国大学生：学籍尚待激活、房间是临时的、德语勉强够用，还必须靠打工维持生活。课程、考试、签证和每一封信，都可能改变这一年。"}</p><div className="starting-file"><span>🎓</span><div><b>{lang==="de"?"Internationaler Student":"外国大学生"}</b><small>{lang==="de"?"1.900 € · 1.200 € Schulden · Deutsch B1 · Studienbeginn":"现金 1900€ · 债务 1200€ · 德语 B1 · 学业刚起步"}</small></div></div><div className="loop-preview"><span>{lang==="de"?"Studieren & jobben":"学习与打工"}</span><i>→</i><span>{lang==="de"?"Alltag bewältigen":"处理生活"}</span><i>→</i><span>{lang==="de"?"48 Wochen schaffen":"熬过 48 周"}</span></div><button className="primary" onClick={()=>start(PROFILES[0])}>{lang==="de"?"Flug nach Deutschland nehmen":"登上飞往德国的航班"} <span>✈</span></button></section><footer><span>{lang==="de"?"Kein Studienfach nötig":"无需预选专业"}</span><span>{lang==="de"?"Jede Woche formt dein Leben":"留德生活由每周选择形成"}</span></footer></main></Localize>;

  if(screen==="arrival")return <Localize lang={lang}><main className="cinematic arrival-scene"><div className="sky"><span className="cloud c1">☁</span><span className="cloud c2">☁</span><span className="flying-plane">✈</span><div className="germany-line"><i/><i/><i/></div></div><section><small>ANKUNFT · WOCHE 1</small><h1>Willkommen<br/>in Deutschland</h1><p>{lang==="de"?"Das Flugzeug ist gelandet. Das Gepäckband steht noch still, aber Universität, Krankenkasse und Bürgeramt haben dir bereits geschrieben.":"飞机落地。行李转盘还没动，你已经收到大学、保险公司和市政厅的三封邮件。"}</p><button className="primary" onClick={()=>setScreen("game")}>{lang==="de"?"Leben in Deutschland beginnen":"开始德国生活"} <span>→</span></button></section></main></Localize>;

  if(screen==="end"){
    const won=state.month>12&&state.health>0&&state.stress<100&&state.money>0;
    const net=Math.round(state.money-state.debt+Object.entries(state.inventory).reduce((sum,[id,q])=>sum+(prices[id]||0)*q,0));
    return <Localize lang={lang}><main className={`cinematic departure-scene ${won?"continue":"farewell"}`}><div className="departure-sky"><div className="city-silhouette">▥ ▥ ▰ ▥ ▰ ▥</div><span className="departure-plane">✈</span></div><section><small>{won?"48 WOCHEN GESCHAFFT":"ABFLUG"}</small><h1>{won?"Das Leben geht weiter":"Tschüss Deutschland"}</h1><p>{lang==="de"?(won?"Du hast 48 Wochen geschafft. Das Studium ist nicht vorbei und der Briefkasten wird nie leer, aber Deutschland ist nun ein Teil deines Weges.":state.health<=0?"Dein Körper konnte nicht mehr.":state.stress>=100?"Der Stress hat die Grenze überschritten.":"Das Konto ist leer. Dein Leben in Deutschland endet vorerst hier."):(won?"你坚持了 48 周。课程还没有结束，信箱也不会清空，但德国生活已经从陌生的规则变成了你继续前行的一部分。":state.health<=0?"身体先撑不住了。":state.stress>=100?"压力突破了极限。":"账户见底，留德生活暂时在这里结束。")}</p><div className="score"><span>{lang==="de"?"Nettovermögen":"净资产"}<b>{net}€</b></span><span>{lang==="de"?"Studium":"学业进度"}<b>{state.study}</b></span><span>{lang==="de"?"Ereignisse":"处理事件"}<b>{state.seen.length}</b></span></div><button className="primary" onClick={()=>start(PROFILES[0])}>{lang==="de"?"Noch einmal einsteigen":"重新登机"} <span>↻</span></button></section></main></Localize>;
  }

  const totalInventory=Object.values(state.inventory).reduce((a,b)=>a+b,0);
  const currentJob=JOBS.find(j=>j.id===state.jobId)||JOBS[0];
  const languageBonus=Math.min(80,Math.max(0,state.german-40)*2);
  const currentWage=currentJob.wage+languageBonus+(state.flags.promotion?70:0);
  const nextPeriod=lang==="de"?(state.week===4?`Monat ${state.month+1} · Woche 1`:`Monat ${state.month} · Woche ${state.week+1}`):(state.week===4?`第 ${state.month+1} 月 · 第 1 周`:`第 ${state.month} 月 · 第 ${state.week+1} 周`);
  return <Localize lang={lang}><main className="v2-game">
    <div className="sticky-status">
    <header className="v2-head"><div><small>LEBENSAKTE · {lang==="de"?"Internationaler Student":state.name}</small><b>{lang==="de"?`Monat ${state.month} · Woche ${state.week}`:`第 ${state.month} 月 · 第 ${state.week} 周`}</b></div><div className="head-tools"><div className="deadline"><small>{lang==="de"?"Jahresfortschritt":"年度进度"}</small><b>{Math.min(state.totalWeek,48)}/48</b></div><div className="lang-switch compact"><button className={lang==="zh"?"active":""} onClick={()=>setLang("zh")}>{lang==="de"?"ZH":"中"}</button><button className={lang==="de"?"active":""} onClick={()=>setLang("de")}>DE</button></div></div></header>
    <section className="v2-stats"><Stat label={lang==="de"?"Geld":"现金"} value={state.money} type="money"/><Stat label={lang==="de"?"Schulden":"债务"} value={state.debt} type="money"/><Stat label={lang==="de"?"❤️ Gesundheit":"❤️ 健康"} value={state.health}/><Stat label={lang==="de"?"🧠 Stress":"🧠 压力"} value={state.stress} bad/></section>
    <section className="ability-stats" aria-label="能力与行政资源">
      <div title="行动会消耗精力；低于 18 时不能工作或接零工"><span>⚡ 精力</span><b>{state.energy}</b><small>{state.energy<18?"无法工作":state.energy<35?"需要休息":"可正常行动"}</small></div>
      <div title="提高周薪、解锁职业，并降低事件压力"><span>🗣️ 德语</span><b>{state.german}</b><small>{lang==="de"?"Lohn":"工资"} +{languageBonus}€</small></div>
      <div title="代表社会关系；达到 45 后，随机事件中可能出现稳定岗位的晋升机会"><span>🤝 人脉</span><b>{state.reputation}</b><small>{state.reputation>=45?"可能触发晋升事件":"45 后可能触发晋升"}</small></div>
      <div title="代表行政记录完整度；高级职业要求档案达标"><span>🗂️ 档案</span><b>{state.papers}</b><small>解锁职业</small></div>
      <div title="在官僚事件中消耗一份，可显著降低损失"><span>📦 材料包</span><b>{state.packs}</b><small>事件减损</small></div>
      <div title="代表课程、作业与考试的总体进展"><span>🎓 学业</span><b>{state.study}</b><small>课程进度</small></div>
    </section>
    <div className="ticker"><b>本周消息</b><span>{lang==="de"?DE_NEWS[state.newsIndex]:news.text}</span></div>
    <div className="time-rule"><b>时间规则</b><span>⏳ 本周行动＝推进 1 周</span><span>{lang==="de"?"○ Handelsprojekt starten/abschließen und Jobwechsel kosten keine Zeit":"○ 开始/结算经营批次、换职业＝不耗时间"}</span></div>
    <nav className="tabs">{[["actions","本周行动"],["market","交易投资"],["career","职业设定"],["journal","记录"]].map(([id,label])=><button className={tab===id?"active":""} key={id} onClick={()=>setTab(id)}>{label}</button>)}</nav>
    </div>

    <section className="v2-panel">
      {tab==="actions"&&<><div className="panel-title"><div><small>WOCHE {state.totalWeek+1}</small><h2>这一周怎么过？</h2></div><span>每次只能选 1 项</span></div><div className="week-flow"><div className="week-node current"><small>现在</small><b>{lang==="de"?`Monat ${state.month} · Woche ${state.week}`:<>第 {state.month} 月 · 第 {state.week} 周</>}</b></div><div className="flow-arrow"><span>选择行动</span><b>→</b><small>消耗整整一周</small></div><div className="week-node next"><small>行动结束</small><b>{nextPeriod}</b></div><div className="month-weeks"><span>本月进度</span>{[1,2,3,4].map(w=><i key={w} className={w<state.week?"done":w===state.week?"active":""}><b>{w}</b><small>{lang==="de"?"Wo.":"周"}</small></i>)}</div></div><div className="current-job"><span>{currentJob.icon}</span><div><small>当前本职工作</small><b>{currentJob.name}</b></div><strong>{lang==="de"?`Wochenlohn ${currentWage}€`:`本周工资 ${currentWage}€`}</strong><button onClick={()=>setTab("career")}>更换职业</button></div><div className="stat-guide"><b>这些数值会怎样影响生活？</b><p><span>⚡ 精力</span>低于 18 不能工作或接零工；<span>🤝 人脉</span>达到 45 可能出现稳定岗位；<span>🗂️ 档案</span>与德语共同解锁职业；<span>📦 材料包</span>可在官僚事件中抵消约 55% 的主要损失。</p></div><div className="action-grid">{ACTIONS.map(a=>{const effect=a.planner?null:a.run(state);return <button key={a.id} onClick={()=>a.planner?setModal({type:"paperPlanner"}):doAction(a)} disabled={(a.id==="work"||a.id==="gig")&&state.energy<18}><i>{a.icon}</i><span><b>{a.name}</b><small>{a.id==="work"?`${currentJob.name} · 按当前工资结算`:a.sub}</small>{effect?<EffectBadges effect={effect} lang={lang}/>:<EffectBadges lang={lang} effect={{packs:1,papers:1,energy:-1,stress:1,money:1}}/>}</span><em>⏳ 推进1周</em></button>})}</div><div className="month-cost"><b>月末还会自动结算</b><span>{lang==="de"?"Nach Woche 4 beginnt ein neuer Monat: 780 € Lebenshaltungskosten und 3,5 % Schuldzinsen. Ereignisse verbrauchen keine zusätzliche Woche.":"第 4 周行动结束后进入下个月，并扣除生活费 780€、增加债务利息 3.5%。随机事件发生在已经消耗的这一周内，不会额外再走一周。"}</span></div></>}

      {tab==="market"&&<><div className="panel-title"><div><small>NEBENGEWERBE</small><h2>经营批次</h2></div><span>买货和结算不额外耗时</span></div><p className="market-tip">选择商品、销售渠道和投入金额，开始一批经营；然后通过“本周行动”推进至少一周，再回来查看能否赚钱。投入成本、回收金额和净利润都会保留在账本里。</p>
        <div className="venture-block"><div className="subhead"><b>① 选择要卖的东西</b><span>消息改变概率，不保证赚钱</span></div><div className="venture-goods">{HUSTLE_GOODS.map(g=>{const factor=ventureMarketFactor(state.newsIndex,g.id);const label=ventureMarketLabel(factor);return <button key={g.id} className={ventureGood===g.id?"selected":""} onClick={()=>setVentureGood(g.id)}><i>{g.icon}</i><b>{g.name}</b><small>预期毛利 {Math.round(g.margin*100)}% · 风险 {g.risk}</small><em className={factor>1.08?"market-up":factor<.93?"market-down":"market-flat"}>{label}{factor!==1?" · 盈利概率变化":""}</em></button>})}</div>
        <div className="subhead"><b>② 选择销售渠道</b></div><div className="channel-row">{CHANNELS.map(c=><button key={c.id} className={ventureChannel===c.id?"selected":""} onClick={()=>setVentureChannel(c.id)}><i>{c.icon}</i><span><b>{c.name}</b><small>{c.note}</small></span></button>)}</div>
        {state.activeVenture?<div className="active-venture"><div><small>进行中的经营批次 · {state.activeVenture.marketLabel||"行情平稳"}</small><b>{state.activeVenture.goodName} · {state.activeVenture.channelName}</b></div><span>已投入 <b>{state.activeVenture.invested}€</b></span><span>{state.totalWeek>=state.activeVenture.readyWeek?"现在可以结算":"还需推进 1 周"}</span><button onClick={settleVenture} disabled={state.totalWeek<state.activeVenture.readyWeek}>{state.totalWeek>=state.activeVenture.readyWeek?"查看行情并结算":"等待时间推进"}</button></div>:<div className="capital-box"><div><b>③ 开始经营批次</b><strong>{ventureAmount} €</strong></div><input aria-label="投入本金" type="range" min="50" max={Math.max(50,Math.min(800,state.money-250))} step="50" value={Math.min(ventureAmount,Math.max(50,state.money-250))} onChange={e=>setVentureAmount(Number(e.target.value))}/><div className="cost-preview"><span>商品本金<b>{ventureAmount}€</b></span><span>渠道费用<b>{CHANNELS.find(c=>c.id===ventureChannel)?.cost||0}€</b></span><span>总投入<b>{ventureAmount+(CHANNELS.find(c=>c.id===ventureChannel)?.cost||0)}€</b></span></div><small>开始批次不耗时间，但资金会立刻锁定；至少推进一周后才能结算。</small><button onClick={startVenture}>投入 {ventureAmount+(CHANNELS.find(c=>c.id===ventureChannel)?.cost||0)}€ 开始批次 <span>→</span></button></div>}
        {(state.ventureLedger||[]).length>0&&<div className="venture-ledger"><div className="subhead"><b>最近经营账本</b><span>投入 → 回收 → 净结果</span></div>{state.ventureLedger.slice(0,5).map((l,i)=><p key={i}><span>{l.good}<small>{l.channel}</small></span><b>{l.invested}€ → {l.returned}€</b><em className={l.profit>=0?"profit":"loss"}>{l.profit>=0?"+":""}{l.profit}€</em></p>)}</div>}</div>
      </>}

      {tab==="career"&&<><div className="panel-title"><div><small>HAUPTBERUF & SCHULDEN</small><h2>设定本职工作</h2></div><span>德语 {state.german} · 档案 {state.papers}</span></div><p className="career-help">换职业不消耗时间。德语不仅解锁职业：超过 40 后，每点德语为本职周薪增加 2€，最多加 80€；德语 60/75 还会分别减少事件压力 2/4 点。</p><div className="language-bonus"><span>当前语言工资加成<b>+{languageBonus}€ / 周</b></span><span>当前事件减压<b>-{state.german>=75?4:state.german>=60?2:0} 压力</b></span></div><div className="jobs">{JOBS.map(j=>{const unlocked=state.german>=j.requirement&&state.papers>=j.paperRequirement;return <button key={j.id} className={state.jobId===j.id?"selected":""} onClick={()=>switchJob(j)}><i>{j.icon}</i><span><b>{j.name}</b><small>基础周薪 {j.wage}€ · 精力 {j.energy} · 健康 {j.health}{j.requirement?` · 德语 ${j.requirement} · 档案 ${j.paperRequirement}`:""}</small></span><em>{state.jobId===j.id?"当前本职":unlocked?"设为本职":"未解锁"}</em></button>})}</div><div className="debt-box"><span><small>私人债务</small><b>{Math.round(state.debt)} €</b></span><p>每月增长 3.5%。还清后，你才真正拥有选择。</p><button onClick={payDebt}>偿还最多 250€</button></div></>}

      {tab==="journal"&&<><div className="panel-title"><div><small>VERLAUF</small><h2>生活记录</h2></div><span>{state.seen.length} 个事件</span></div><div className="journal">{state.journal.length?state.journal.map((j,i)=><p key={i}><i>{String(state.journal.length-i).padStart(2,"0")}</i>{j}</p>):<div className="empty">你的档案目前还很薄。系统会设法改变这一点。</div>}</div></>}
    </section>

    {toast&&<button className="toast" onClick={()=>setToast("")}>{toast}<span>×</span></button>}
    {modal&&<div className="modal-backdrop"><article className="event-modal">
      {modal.type==="paperPlanner"?<><div className="modal-top"><span>BEHÖRDENPLAN</span><b>行政事务</b></div><h2>这周具体跑什么手续？</h2><p>选择一项后才会推进一周。它们会留下档案、材料包或追回的钱，不再只是“忙了一周”。</p><div className="paper-tasks">{PAPER_TASKS.map(task=><button key={task.id} onClick={()=>doPaperTask(task)}><b>{task.icon} {task.name}</b><span>{task.sub}</span><em>{Object.entries(task.effect).map(([k,v])=>`${effectNames[k]} ${v>0?"+":""}${v}`).join(" · ")}</em></button>)}</div><button className="secondary" onClick={()=>setModal(null)}>先不跑手续</button></>:modal.type==="event"?<><div className="modal-top"><span>{modal.event.office}</span><b>随机事项</b></div><div className="time-passed">{modal.timeLabel}<small>{modal.actionName}已经用掉一周</small></div><h2>{modal.event.title}</h2><p>{modal.event.text}</p><div className="modal-choices">{modal.event.choices.map(c=><button key={c.label} onClick={()=>chooseEvent(c,modal.event)}><b>{c.label}</b><span>{Object.entries(c.effect||{}).map(([k,v])=>`${effectNames[k]} ${v>0?"+":""}${v}`).join(" · ")}</span></button>)}<button className="prepared-choice" disabled={state.packs<1} onClick={()=>choosePrepared(modal.event)}><b>📦 提交完整材料包快速处理</b><span>消耗 1 份材料包 · 本次主要损失降低约 55%{state.packs<1?" · 当前不足":""}</span></button></div></>:modal.type==="weekResult"?<><div className="modal-top"><span>WOCHENABSCHLUSS</span><b>周结算</b></div><div className="time-passed large">{modal.timeLabel}<small>时间已经推进</small></div><h2>这一周结束了</h2><p>{modal.actionName}已经完成。{modal.monthSummary||"新的市场价格和生活状态已经更新。"}</p><button className="primary" onClick={()=>setModal(null)}>进入新的一周 <span>→</span></button></>:modal.type==="ventureResult"?<><div className="modal-top"><span>NEBENGEWERBE</span><b>经营结算</b></div><div className="holding-period">持有 {modal.ledger.heldWeeks} 周后结算<small>开始和结算本身均不耗时间</small></div><h2>{modal.title}</h2><p>{modal.result}</p><div className="venture-result-numbers"><span>总投入<b>{modal.ledger.invested}€</b><small>本金 {modal.ledger.capital}€ + 渠道 {modal.ledger.fee}€</small></span><span>回收金额<b>{modal.ledger.returned}€</b><small>实际回到账户的价值</small></span><span>净利润<b className={modal.ledger.profit>=0?"profit":"loss"}>{modal.ledger.profit>=0?"+":""}{modal.ledger.profit}€</b><small>回收 − 总投入</small></span></div><button className="primary" onClick={()=>setModal(null)}>完成结算 <span>→</span></button></>:<><div className="modal-top"><span>AUSWIRKUNG</span><b>处理结果</b></div>{modal.timeLabel&&<div className="time-passed">{modal.timeLabel}<small>事件发生在已经消耗的这一周</small></div>}<h2>{modal.choice.label}</h2><p>{modal.choice.result}</p>{modal.languageRelief>0&&<div className="language-relief">🗣️ 德语能力令本次压力额外减少 {modal.languageRelief} 点</div>}<button className="primary" onClick={()=>setModal(null)}>进入新的一周 <span>→</span></button></>}
    </article></div>}
  </main></Localize>;
}
