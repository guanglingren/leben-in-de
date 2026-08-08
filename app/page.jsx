import React, { useEffect, useMemo, useState } from "react";
import {addGuestbookMessage,getGuestbookMessages,getVisitCount,registerVisit} from "./supabase";

const PROFILES = [
  { id: "student", icon: "🎓", name: "外国大学生", detail: "刚下飞机 · 德语 B1 · 学籍待激活 · 一叠陌生的信", money: 1900, debt: 1200, health: 80, stress: 28, energy: 78, german: 46, papers: 35, reputation: 25, study:22, wage: 410 }
];

const DE_EVENTS = [
  {id:"de-seminar",title:"Dein Name fehlt auf der Seminarliste",office:"UNIVERSITÄT",text:"Der Dozent verweist auf das Prüfungsamt, das Prüfungsamt auf Moodle. Moodle sagt: erfolgreich angemeldet.",choices:[
    {label:"Mit drei Screenshots zum Dozenten",effect:{energy:-8,stress:5,study:8,papers:5},result:"Du wirst handschriftlich ergänzt. Handschriftliche Listen gelten allerdings nicht im System."},
    {label:"Teilnehmen und weiter mailen",effect:{energy:-5,stress:8,study:5,german:2},result:"Du lernst etwas und erhältst zugleich die Bitte, keine doppelten Anfragen zu senden."}
  ]},
  {id:"de-exam",title:"Das Prüfungsportal macht zwei Minuten zu früh dicht",office:"PRÜFUNGSAMT",text:"Auf der Website steht 23:59 Uhr. Der Server hält sich offenbar an eine andere Zeitzone.",choices:[
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
  {id:"de-permit",title:"Für den Job brauchst du die Erlaubnis – für die Erlaubnis den Vertrag",office:"AUSLÄNDERBEHÖRDE",text:"Der Arbeitgeber will erst die Arbeitserlaubnis sehen. Die Behörde verlangt vorher den unterschriebenen Arbeitsvertrag.",choices:[
    {label:"Alle Stellen gleichzeitig anschreiben",effect:{energy:-15,stress:11,papers:18},result:"Nach der siebten Mail landen beide Anhänge endlich in derselben Akte."},
    {label:"Eine Fiktionsbescheinigung beantragen",effect:{money:-80,stress:7,papers:12},result:"Die Bank kennt das Dokument nicht und fragt die Zentrale."}
  ]},
  {id:"de-radio",title:"Zweimal Rundfunkbeitrag für dieselbe Wohnung",office:"BEITRAGSSERVICE",text:"Du und dein Mitbewohner nutzen bereits dieselbe Beitragsnummer. Das System hat vorsorglich trotzdem ein zweites Beitragskonto angelegt.",choices:[
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
  ]},
  {id:"de-fax",title:"Die digitale Signatur ist ungültig, das Fax aber gültig",office:"AMT FÜR DIGITALISIERUNG",text:"Du hast ein digital signiertes PDF hochgeladen. Die Digitalisierungsstelle bittet dich, es auszudrucken, zu unterschreiben und zurückzufaxen.",choices:[
    {label:"Im Schreibwarenladen faxen",effect:{money:-18,energy:-7,papers:10,stress:5},result:"Das Fax kommt an. Die Bestätigung wird per Briefpost verschickt."},
    {label:"Die Vorschrift ausdrucken und mitschicken",effect:{money:-8,energy:-11,papers:13,stress:8},result:"Drei Wochen später kommt die Antwort: Dein Schreiben wurde als PDF eingescannt."}
  ]},
  {id:"de-termin2",title:"Dieser Termin dient nur dazu, einen anderen Termin zu buchen",office:"BÜRGERBÜRO",text:"Am Schalter erfährst du, dass heute nur deine Identität geprüft wird. Für den eigentlichen Vorgang brauchst du eine neue Wartenummer.",choices:[
    {label:"Höflich eine neue Nummer nehmen",effect:{energy:-9,stress:8,papers:7},result:"Der neue Termin ist in acht Wochen – im selben Gebäude, am selben Schalter."},
    {label:"Fragen, ob es heute gleich erledigt werden kann",effect:{energy:-14,stress:12,reputation:-2},result:"Man erklärt dir gewissenhaft, warum „gleich miterledigen“ kein Begriff des Verwaltungsrechts ist."}
  ]},
  {id:"de-letter",title:"Ein Brief kündigt an, dass ein weiterer Brief kommt",office:"VERSICHERUNG",text:"Seite eins erklärt, der eigentliche Bescheid werde separat verschickt. Seite zwei erklärt, gegen diese Mitteilung solle kein Widerspruch eingelegt werden.",choices:[
    {label:"Einen neuen Aktenordner dafür anlegen",effect:{money:-6,papers:8,stress:4},result:"Der Ordnerrücken lautet: Noch nicht erhalten, aber aufbewahrungspflichtig."},
    {label:"Den Brief erst einmal auf den Stapel legen",effect:{stress:7,papers:-4},result:"Drei Wochen später kommt der Bescheid. Nun fehlt die Nummer aus dem Ankündigungsbrief."}
  ]},
  {id:"de-bio",title:"Dein Biomüllbeutel ist nicht bio genug",office:"ABFALLBERATUNG",text:"Die Stadt empfiehlt kompostierbare Beutel. Der Entsorger erklärt, seine Anlage könne genau diese Beutel nicht erkennen.",choices:[
    {label:"Küchenabfälle in Zeitungspapier wickeln",effect:{energy:-4,papers:3,reputation:4},result:"Auf der Zeitung steht, dass die Stadt papierlos werden will."},
    {label:"Amtlich anerkannte Papiertüten kaufen",effect:{money:-12,stress:3},result:"Die Tüte ist undicht, bevor du den Müllraum erreichst."}
  ]},
  {id:"de-parcelshop",title:"Der Paketshop ist offen – nur Pakete gehen heute nicht",office:"PAKETSHOP",text:"Der Laden ist geöffnet, der Inhaber ist da. Nur der Kollege, der sich mit dem Paketsystem auskennt, hat heute frei.",choices:[
    {label:"Morgen wiederkommen",effect:{energy:-5,stress:4},result:"Morgen wird das System gewartet, übermorgen ist Sonntag."},
    {label:"Das Gerät gemeinsam untersuchen",effect:{energy:-9,reputation:5,papers:3},result:"Du startest das Gerät neu und leistest kostenlos zehn Minuten IT-Support."}
  ]},
  {id:"de-internet",title:"Das Internetproblem lässt sich nur online melden",office:"INTERNETANBIETER",text:"Die Leitung ist ausgefallen. Die Hotline verweist auf den Onlinechat; der Onlinechat verlangt eine Verbindung mit deinem Heim-WLAN.",choices:[
    {label:"Mit mobilen Daten einen Hotspot öffnen",effect:{money:-24,energy:-8,stress:6},result:"Die Diagnose bestätigt, dass deine Internetverbindung nicht funktioniert."},
    {label:"Den Router zehn Sekunden vom Strom trennen",effect:{energy:-3,stress:-2},result:"Es funktioniert tatsächlich. Kurz darauf kommt die Zufriedenheitsumfrage."}
  ]}
];

const JOBS = [
  { id: "shift", name: "仓库夜班", wage: 410, energy: -24, health: -6, stress: 7, abilityReq:0, socialReq:0, icon: "📦" },
  { id: "delivery", name: "外卖接单", wage: 340, energy: -17, health: -3, stress: 4, abilityReq:0, socialReq:0, icon: "🚲" },
  { id: "office", name: "大学办公室助理", wage: 440, energy: -16, health: -1, stress: 5, abilityReq:55, socialReq:45, icon: "🏫" },
  { id: "hiwi", name: "大学 HiWi 学生助理", wage: 480, energy: -14, health: 0, stress: 3, abilityReq:60, socialReq:50, icon: "🔬" },
  { id: "agency", name: "学生事务翻译", wage: 540, energy: -15, health: -1, stress: 5, abilityReq:72, socialReq:65, icon: "🗣️" }
];

const BASE_MONTHLY_COST = 1050;

const ACADEMIC_MILESTONES = [
  {week:16,required:40,title:"第一次学业进度审查",penalty:{money:-80,stress:10,papers:-4},reward:{stress:-4,reputation:4}},
  {week:32,required:65,title:"续注册与学业进度审查",penalty:{money:-140,stress:15,papers:-7},reward:{stress:-6,reputation:6}}
];

const GOODS = [
  { id: "bike", name: "二手自行车", icon: "🚲", base: 95, note: "罢工和好天气时走俏", risk:2 },
  { id: "heater", name: "电暖器", icon: "♨️", base: 70, note: "寒潮时价格暴涨", risk:2 },
  { id: "ticket", name: "来路不明的 Deutschlandticket", icon: "🎫", base: 49, note: "便宜，但查票和实名制都不是摆设", risk:32, active:false },
  { id: "phone", name: "翻新旧手机", icon: "📱", base: 120, note: "办线上手续的刚需", risk:8 },
  { id: "furniture", name: "宜家小桌", icon: "🪑", base: 45, note: "开学季需求上升", risk:1, active:false },
  { id: "printer", name: "家用打印机", icon: "🖨️", base: 85, note: "任何手续都可能需要它", risk:4 },
  { id: "shoes", name: "高仿名牌鞋", icon: "👟", base: 135, note: "利润高，Abmahnung 也很贵", risk:55 },
  { id: "sticks", name: "破解电视棒", icon: "📺", base: 90, note: "畅销，但平台与权利人都可能来信", risk:68, active:false }
];

const MARKETS = [
  {id:"campus",icon:"🎓",name:"校园与学生宿舍",note:"教材季、搬家季的价格变化最明显",goods:["bike","furniture","printer","heater"]},
  {id:"kleinanzeigen",icon:"💻",name:"Kleinanzeigen",note:"选择多、成交快，也会留下完整的平台记录",goods:["phone","bike","printer","shoes","sticks"]},
  {id:"flohmarkt",icon:"⛺",name:"周末跳蚤市场",note:"现金交易灵活，但不是每件货都有凭证",goods:["heater","furniture","phone","ticket","shoes"]}
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
  { text:"新学期开学，大批新生正在购买教材和 WG 生活用品。",mods:{bike:1.14,furniture:1.3,printer:1.18},ventureMods:{books:1.28,wgkit:1.25,printerset:1.16,moving:1.14} },
  { text:"考试季临近，图书馆座位和打印店同时告急。",mods:{printer:1.38,phone:1.1},ventureMods:{books:1.3,printerset:1.32,lunchbox:1.1} },
  { text:"学生宿舍集中换房，搬家纸箱、家具和电暖器需求上涨。",mods:{furniture:1.34,heater:1.18},ventureMods:{moving:1.34,wgkit:1.3} },
  { text:"周末大型跳蚤市场开张，二手商品供应突然增加。",mods:{bike:.82,phone:.86,furniture:.78},ventureMods:{phones:.86,shoes:.88,moving:.9,wgkit:.92} },
  { text:"校园国际文化节即将举行，运动用品和二手手机更受欢迎。",mods:{bike:1.12,phone:1.2,shoes:1.15},ventureMods:{lunchbox:1.32,shoes:1.16} },
  { text:"市政府将更多手续转到线上，旧手机和打印设备需求上升。",mods:{phone:1.3,printer:1.27},ventureMods:{phones:1.26,printerset:1.2} },
  { text:"消费者中心警告假货和破解设备，平台开始集中清查。",mods:{shoes:.62,sticks:.55,ticket:.76},ventureMods:{shoes:.62,sticks:.58} },
  { text:"假期开始，校园人流下降，毕业生正在集中清理家具。",mods:{furniture:.7,bike:.82,printer:.86},ventureMods:{books:.76,lunchbox:.78,moving:1.16,wgkit:.88} }
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

const OPPORTUNITY_EVENTS = [
  {id:"opp-refund",office:"GUTE NACHRICHT",title:"之前整理的材料终于帮你追回了一笔钱",text:"那份几乎被你忘记的退款申请突然获批。看来 Aktenzeichen 偶尔也会通向钱。",choices:[
    {label:"直接存下来准备还债",effect:{money:170,debt:-80,stress:-5},result:"一部分直接抵扣债务，剩下的钱让账户终于有了一点缓冲。"},
    {label:"拿去补齐学习和生活用品",effect:{money:80,study:8,health:5},result:"打印纸、教材和一顿正常的饭，比冲动消费更像一种胜利。"}
  ]},
  {id:"opp-contact",office:"NETZWERK",title:"之前认识的同学给你介绍了一个短期机会",text:"这次不需要重新填写十页申请表，因为有人愿意把你的名字直接转给负责人。",choices:[
    {label:"接下有报酬的校园任务",effect:{money:220,energy:-6,reputation:6,study:3},result:"工作不轻松，但第一次有人因为认识你而省略了“请走正式流程”。"},
    {label:"换成教授的推荐与辅导",effect:{study:12,german:4,reputation:8,stress:-3},result:"没有即时收入，但下一次学业检查突然没那么可怕了。"}
  ]},
  {id:"opp-paperwork",office:"AKTE VOLLSTÄNDIG",title:"柜台发现你的材料居然一次齐全",text:"工作人员翻了两遍，最后承认没有缺少任何附件。隔壁窗口甚至过来看了一眼。",choices:[
    {label:"顺便把另一件事一起办了",effect:{papers:5,reputation:4,energy:6,stress:-8},result:"两个事项在同一天完成。你不仅补齐了记录，也认识了一个以后能问手续的人。"},
    {label:"见好就收，早点回家",effect:{energy:15,health:5,stress:-10},result:"你在天黑之前离开了政府大楼，并拥有了一个完整的下午。"}
  ]}
];

const DE_OPPORTUNITY_EVENTS = OPPORTUNITY_EVENTS.map((event,index)=>[
  {title:"Deine alten Unterlagen bringen endlich eine Erstattung",text:"Ein fast vergessener Antrag wurde bewilligt.",choices:[["Für die Schulden zurücklegen","Ein Teil wird verrechnet, der Rest schafft etwas Luft."],["Für Studium und Alltag verwenden","Papier, Bücher und eine richtige Mahlzeit fühlen sich wie ein Sieg an."]]},
  {title:"Ein Kontakt vermittelt dir eine kurzfristige Chance",text:"Diesmal landet dein Name ohne zehnseitige Bewerbung direkt bei der zuständigen Person.",choices:[["Bezahlte Aufgabe annehmen","Zum ersten Mal spart ein Kontakt dir den offiziellen Umweg."],["Empfehlung und Tutorium wählen","Kein schnelles Geld, aber die Studienkontrolle wirkt weniger bedrohlich."]]},
  {title:"Am Schalter ist deine Akte tatsächlich vollständig",text:"Die Unterlagen werden zweimal geprüft. Es fehlt wirklich nichts.",choices:[["Noch eine Sache gleich miterledigen","Zwei Vorgänge an einem Tag – fast ein Verstoß gegen Naturgesetze."],["Rechtzeitig nach Hause gehen","Du verlässt das Amt noch vor Einbruch der Dunkelheit."]]},
  {title:"Dein Preisgefühl zahlt sich aus",text:"Jemand zieht eilig um und verkauft gute Sachen günstig. Du kennst den üblichen Preis.",choices:[["Mit sicherem Aufschlag weiterverkaufen","Kein Reichtum, aber Gewinn durch eine eigene Entscheidung."],["Etwas behalten und Neuen helfen","Weniger Gewinn, dafür wirst du zur hilfreichen Person im Adressbuch."]]}
][index]).map((copy,index)=>({...OPPORTUNITY_EVENTS[index],title:copy.title,text:copy.text,choices:OPPORTUNITY_EVENTS[index].choices.map((choice,i)=>({...choice,label:copy.choices[i][0],result:copy.choices[i][1]}))}));

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
  { id:"permit", title:"学生工作许可卡在另一张许可上", office:"AUSLÄNDERBEHÖRDE", text:"新学生工合同要外管局确认；外管局要雇主确认职位；雇主则要你先出示已经批准的工作许可。", when:s=>s.profileId==="student"&&!s.flags.permit, choices:[
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
  ]},
  { id:"permit-followup", title:"学生工作许可终于寄到了", office:"AUSLÄNDERBEHÖRDE", text:"许可批准日期是三周前，信封上的邮戳是昨天。雇主现在又需要你证明当时已经获准工作。", when:s=>s.flags.permit&&!s.flags.permitDone, choices:[
    { label:"带完整邮件记录去人事部", effect:{money:120,papers:6,stress:-5}, flag:"permitDone", result:"人事终于补发了被暂扣的工资，并把文件归入正确员工档案。" },
    { label:"先接受下一班工作", effect:{money:210,energy:-8,reputation:5}, flag:"permitDone", result:"手续没有变简单，但至少许可开始真正产生收入。" }
  ]},
  { id:"rent-followup", title:"租客协会寄来了房租重新计算结果", office:"MIETERVEREIN", text:"房东所谓的“草案”确实多算了一部分面积。新的计算表用了五页解释旧表为何不成立。", when:s=>s.flags.mieterverein&&!s.flags.rentRefund, choices:[
    { label:"要求退回多收的租金", effect:{money:180,papers:5,stress:-4}, flag:"rentRefund", result:"退款到账。房东在转账备注里写了“无承认法律义务”。" },
    { label:"换取未来几个月不涨租", effect:{stress:-8,reputation:6}, flag:"rentRefund", result:"没有立即拿到钱，但接下来每个月的住房支出更稳定了。" }
  ]},
  { id:"heating-followup", title:"暖气维修终于来了，但你必须全天在家", office:"HAUSVERWALTUNG", text:"维修时间仍是08:00–18:00。师傅在17:42到达，并问为什么没人早点告诉他故障原因。", when:s=>s.flags.rentFight&&!s.flags.heatingDone, choices:[
    { label:"请假等维修完成", effect:{money:-70,health:8,stress:-7}, flag:"heatingDone", result:"暖气恢复了。你第一次觉得书面限期也可能产生热量。" },
    { label:"请室友代为开门", effect:{reputation:8,health:6,energy:5}, flag:"heatingDone", result:"室友帮了忙，你答应下次替他等一个没有具体时段的包裹。" }
  ]}
];

const ACTIONS = [
  { id:"work", icon:"💼", name:"做本职工作", sub:"按当前职业结算工资", run:s=>{const job=JOBS.find(j=>j.id===s.jobId)||JOBS[0];const abilityBonus=Math.min(60,Math.max(0,integrationScore(s)-40)*2);const overdrawn=s.energy+job.energy<15||s.health<45;return {money:job.wage+abilityBonus+(s.flags.promotion?45:0),energy:job.energy,health:overdrawn?job.health:0,stress:job.stress,reputation:3};}},
  { id:"gig", icon:"🚲", name:"接一次临时零工", sub:"不改变本职 · 德语越好收入越高", run:s=>({money:190+Math.round(s.german*.9),energy:-19,health:-6,stress:7}) },
  { id:"paper", icon:"🏛️", name:"处理积压手续", sub:"选择一项具体行政任务", planner:true },
  { id:"learn", icon:"📚", name:"学德语", sub:"解锁好工作 · 费脑", run:()=>({german:7,energy:-11,stress:2,money:-25}) },
  { id:"study", icon:"🎓", name:"准备课程和考试", sub:"推进学业 · 消耗精力", run:()=>({study:11,energy:-13,stress:3,money:-12}) },
  { id:"rest", icon:"🛋️", name:"在家休息", sub:"恢复健康和精力", run:()=>({energy:30,health:8,stress:-10,money:-18}) },
  { id:"drink", icon:"🍺", name:"去酒吧喝酒", sub:"压力大降 · 伤身烧钱", run:()=>({money:-48,stress:-18,health:-7,energy:-3,reputation:4}) },
  { id:"social", icon:"🤝", name:"参加社区活动", sub:"积累人脉 · 小额花费", run:()=>({money:-22,energy:-4,stress:-7,reputation:8,german:2}) },
  { id:"tutorial", icon:"🧑‍🎓", name:"参加辅导课和学习小组", sub:"推进学业 · 练德语 · 认识同学", run:()=>({study:9,german:3,reputation:4,energy:-10,stress:1,money:-8}) },
  { id:"sport", icon:"🏐", name:"参加大学体育课", sub:"恢复健康 · 减轻压力 · 轻度消耗精力", run:()=>({health:11,stress:-9,reputation:5,energy:-6,money:-18}) },
  { id:"mealprep", icon:"🍲", name:"在 WG 集体做饭", sub:"省生活费 · 恢复精力 · 增进室友情", run:()=>({money:-24,health:6,stress:-6,reputation:7,energy:3}) },
  { id:"doctor", icon:"🩺", name:"照顾身体", sub:"花钱治疗 · 恢复健康", run:()=>({money:-95,health:18,energy:8,stress:-5}) }
];

const WEEKLY_BETS = [
  {id:"bet-shift",icon:"🌙",name:"替人顶三晚夜班",sub:"主管暗示会记住你，但没有写进合同",risk:"低风险 · 稳定现金，透支身体",run:s=>({money:380+Math.round(s.german*.8),energy:-27,health:-7,stress:10,reputation:7})},
  {id:"bet-refund",icon:"🧾",name:"追一笔可能存在的退费",sub:"论坛说同类账单有人拿回了钱，也有人等了半年",risk:"中风险 · 成功会连本带利追回",run:s=>{const roll=(s.totalWeek*23+s.papers*3+s.german)%100;return roll<48+Math.round(s.papers/5)?{money:330,papers:7,energy:-12,stress:-5}:{money:-35,papers:4,energy:-14,stress:9};}},
  {id:"bet-exam",icon:"🎓",name:"押教授最后一节课的重点",sub:"用一周冲刺三道题，押错就来不及补",risk:"高风险 · 学业可能大幅推进",run:s=>{const roll=(s.totalWeek*31+s.study*2+s.german)%100;return roll<54?{study:20,german:3,energy:-16,stress:-4}:{study:3,energy:-17,stress:15};}},
  {id:"bet-contact",icon:"🤝",name:"替同学解决一件麻烦事",sub:"没有工资；这份人情也许很快就能变现",risk:"未知回报 · 押人脉",run:s=>{const roll=(s.totalWeek*29+s.reputation*5)%100;return roll<62?{money:180,reputation:14,german:3,energy:-12}:{reputation:8,energy:-14,stress:7,money:-25};}}
];

function weeklyChoices(state){
  const work=ACTIONS.find(a=>a.id==="work");
  const progress=state.study<=state.german
    ? {...ACTIONS.find(a=>a.id==="study"),category:"补补短板",name:"把落下的课补回来",sub:"去图书馆坐一周，至少别让下一次检查太难看"}
    : {...ACTIONS.find(a=>a.id==="learn"),category:"补补短板",name:"把德语再练顺一点",sub:"多开几次口，下回碰到窗口和客服少卡壳"};
  const social={...ACTIONS.find(a=>a.id==="social"),category:"出去走走",name:"去混个脸熟",sub:"参加社区活动，练练德语；以后碰上麻烦，也许能找到人问"};
  return [
    {...work,category:"挣钱 / 喘气"},
    progress,
    social
  ];
}

const TRADE_WEEK_ACTION={id:"trade-week",icon:"🛒",name:"完成本周交易",sub:"成交已经发生；推进一周，查看新行情",run:()=>({energy:-9,stress:2,reputation:2})};

const PAPER_TASKS = [
  { id:"folder", icon:"🗂️", name:"整理个人档案", sub:"补齐文件并建立办事记录，直接提升社会资源", effect:{papers:8,reputation:3,energy:-10,stress:3} },
  { id:"termin", icon:"📅", name:"抢一次 Behörden-Termin", sub:"预约、复印、排队，同时积累档案与办事关系", effect:{papers:10,reputation:5,energy:-14,stress:6} },
  { id:"refund", icon:"🧾", name:"核对旧账并申请退费", sub:"翻出一笔重复扣款，同时补全往来记录", effect:{money:90,papers:5,energy:-12,stress:4} }
];

const clamp = n => Math.max(0, Math.min(100, Math.round(n)));
const integrationScore=s=>Math.round(((s.study||0)+(s.german||0))/2);
const socialScore=s=>Math.round(((s.reputation||0)+(s.papers||0))/2);
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
  "第 4 周行动结束后进入下个月，并扣除生活费 1050€、增加债务利息 3.5%。随机事件发生在已经消耗的这一周内，不会额外再走一周。":"Nach Woche 4 beginnt ein neuer Monat: 1.050 € Lebenshaltungskosten und 3,5 % Schuldzinsen. Ereignisse verbrauchen keine zusätzliche Woche.","先买入或开一个经营批次，再用“本周行动”推进时间。价格和经营结果会随着周数变化。":"Kaufe Waren oder starte ein Projekt und lass dann mit einer Wochenaktion Zeit vergehen. Preise und Ergebnisse ändern sich wöchentlich.","预期毛利":"Erwartete Marge","风险":"Risiko","客流大、价格好，但平台留痕完整。":"Viele Kunden und gute Preise, aber eine vollständige digitale Spur.","要交摊位费、消耗体力，现金交易更灵活。":"Standgebühr und körperliche Arbeit, dafür flexiblere Barzahlung.","开始批次不耗时间，但资金会立刻锁定；至少推进一周后才能结算。":"Der Start kostet keine Zeit, bindet aber sofort Kapital. Abschluss frühestens nach einer Woche.","换职业不消耗时间。留德能力超过 40 后会增加本职周薪，最多加 60€；德语 60/75 还会分别减少事件压力 2/4 点。":"Ein Jobwechsel kostet keine Zeit. Ab 40 Punkten erhöht die Bleibeperspektive den Wochenlohn, höchstens um 60 €. Mit 60/75 Deutsch sinkt Ereignisstress um 2/4.","每月增长 3.5%。还清后，你才真正拥有选择。":"Wächst monatlich um 3,5 %. Erst ohne Schulden hast du echte Wahlfreiheit.","你的档案目前还很薄。系统会设法改变这一点。":"Deine Akte ist noch dünn. Das System wird das ändern.","本次主要损失降低约 55%":"Der Hauptschaden sinkt um etwa 55%","已经用掉一周":" hat bereits eine Woche verbraucht","新的市场价格和生活状态已经更新。":"Preise und Lebenswerte wurden aktualisiert.",
  "买货和结算不额外耗时":"Einkauf und Abschluss kosten keine zusätzliche Zeit","参加辅导课和学习小组":"Tutorium und Lerngruppe","推进学业 · 练德语 · 认识同学":"Studium · Deutsch · neue Kontakte","参加大学体育课":"Am Hochschulsport teilnehmen","恢复健康 · 减轻压力 · 消耗精力":"Gesundheit · weniger Stress · kostet Energie","在 WG 集体做饭":"Gemeinsam in der WG kochen","省生活费 · 恢复健康 · 增进室友情":"günstig · gesund · gut für die WG","WG 厨房入门包":"WG-Küchenstarterpaket","二手打印机加墨盒":"Gebrauchter Drucker mit Patronen","搬家纸箱与小家具":"Umzugskartons und Kleinmöbel","校园自制饭盒":"Hausgemachtes Campusessen","选择商品、销售渠道和投入金额，开始一批经营；然后通过“本周行动”推进至少一周，再回来查看能否赚钱。投入成本、回收金额和净利润都会保留在账本里。":"Wähle Ware, Verkaufskanal und Einsatz. Starte ein Projekt, lass mit einer Wochenaktion mindestens eine Woche vergehen und prüfe danach den Gewinn. Einsatz, Rückzahlung und Nettogewinn bleiben im Kassenbuch sichtbar.","消息改变概率，不保证赚钱":"Nachrichten verändern Chancen, garantieren aber keinen Gewinn","本周利好":"Diese Woche günstig","本周利空":"Diese Woche ungünstig","行情平稳":"Stabile Lage","盈利概率变化":"veränderte Gewinnchance","大学 HiWi 学生助理":"Studentische Hilfskraft (HiWi)","学业检查":"Studienkontrolle","第16周需 40 · 第32周需 65 · 期末建议 85":"Woche 16: 40 · Woche 32: 65 · Ziel zum Jahresende: 85","达到60可解锁 HiWi，并降低大学相关事件压力。":"Ab 60 wird ein HiWi-Job freigeschaltet und Uni-Ereignisse verursachen weniger Stress.","本月已经还过一次债务了。下个月才能再次还款。":"Du hast diesen Monat bereits Schulden getilgt. Nächsten Monat geht es wieder.","本月偿还债务":"Schuldentilgung in diesem Monat","本月已还款":"Diesen Monat bereits getilgt","本月偿还最多 250€":"Diesen Monat bis zu 250 € tilgen","债务已还清":"Schulden abbezahlt"
};

Object.assign(DE_UI,{
  "换职业不消耗时间。德语提高本职工资并降低事件压力；档案与学业共同决定能否获得办公室、HiWi 和学生事务岗位。":"Ein Jobwechsel kostet keine Zeit. Deutsch erhöht den Lohn und senkt Ereignisstress; Akte und Studium entscheiden über Büro-, HiWi- und Studierendenwerk-Jobs.",
  "大学事件减压":"Weniger Stress bei Uni-Ereignissen",
  "每月增长 3.5%，每月最多偿还一次。不能在同一个月连续清空债务。":"Monatlich 3,5 % Zinsen; Tilgung ist nur einmal pro Monat möglich.",
  "第一次学业进度审查":"Erste Studienfortschrittskontrolle",
  "续注册与学业进度审查":"Rückmeldung und Studienfortschrittskontrolle",
  "进度达标":"Fortschritt erfüllt",
  "进度不足，收到书面警告":"Fortschritt zu niedrig, schriftliche Warnung",
  "学校确认学业进度正常。":"Die Hochschule bestätigt einen ausreichenden Studienfortschritt.",
  "未通过：扣除补办费用并增加压力，学业需达到 ":"nicht bestanden: zusätzliche Gebühren und Stress; erforderlich sind "
  ,"达到60解锁 HiWi，并降低大学事件压力":"Ab 60: HiWi-Job und weniger Stress bei Uni-Ereignissen"
  ,"留言板":"Gästebuch"
  ,"这周，把时间花在哪里？":"Wofür nutzt du diese Woche?"
  ,"四种主动方向，只能最终执行一种":"Vier Möglichkeiten – entscheide dich für eine"
  ,"完成交易后进入下一周":"Schließe den Handel ab und gehe in die nächste Woche"
  ,"必须在第 48 周前留下来":"Du musst bis Woche 48 eine Perspektive aufgebaut haben"
  ,"本周线索 · 会影响际遇和市场，但不保证准确":"Hinweis der Woche · beeinflusst Ereignisse und Preise, ohne Garantie"
  ,"精力":"Energie"
  ,"自我提升":"Weiterentwicklung"
  ,"经营关系":"Kontakte"
  ,"工作 / 休息":"Arbeiten / Erholen"
  ,"工作或休息":"Arbeiten oder erholen"
  ,"提升留德能力":"Perspektive in Deutschland verbessern"
  ,"本周侧重课程与考试，稳定推进留德能力":"Diese Woche liegt der Schwerpunkt auf Kursen und Prüfungen"
  ,"本周侧重德语与沟通，稳定推进留德能力":"Diese Woche liegt der Schwerpunkt auf Deutsch und Kommunikation"
  ,"经营社会资源":"Soziale Ressourcen aufbauen"
  ,"参加社区活动，积累联系人并练习沟通":"An einer Nachbarschaftsaktion teilnehmen, Kontakte knüpfen und Deutsch üben"
  ,"交易":"Handel"
  ,"先查看详情 →":"Details ansehen →"
  ,"查看不会推进时间":"Ansehen kostet keine Zeit"
  ,"行动之后，生活仍可能找上门":"Nach der Aktion kann der Alltag dazwischenkommen"
  ,"查看和返回不推进时间；确定行动后，约六成周次会随机遇到办事推诿、系统矛盾或教条规定。":"Ansehen und Zurückgehen kosten keine Zeit. Nach einer bestätigten Aktion tritt in etwa sechs von zehn Wochen ein unerwartetes Alltagsereignis ein."
  ,"展开看病与其他生活安排":"Arztbesuch und weitere Alltagsoptionen anzeigen"
  ,"本周方案 · 尚未执行":"Wochenplan · noch nicht ausgeführt"
  ,"现在只是查看方案":"Du siehst dir den Plan nur an"
  ,"可以返回比较其他选择；确认后才会推进一周。下方已计入每周自然恢复的 10 点精力。":"Du kannst zurückgehen und vergleichen. Erst die Bestätigung lässt eine Woche vergehen. Die natürliche Erholung von 10 Energie ist bereits eingerechnet."
  ,"工作，还是先恢复精力？":"Arbeiten oder erst Energie tanken?"
  ,"确定执行，推进一周":"Ausführen und eine Woche weiter"
  ,"精力不足，无法工作":"Zu wenig Energie zum Arbeiten"
  ,"🛌 这周休息":"🛌 Diese Woche erholen"
  ,"精力共恢复 40 · 健康 +8 · 压力 -10 · 生活支出 18€":"Energie insgesamt +40 · Gesundheit +8 · Stress -10 · Ausgaben 18 €"
  ,"恢复后再工作 →":"Erholen und später arbeiten →"
  ,"← 返回比较其他选择":"← Zurück und andere Optionen vergleichen"
  ,"周末事件 · 已经发生":"Unerwartetes Ereignis · bereits eingetreten"
  ,"本周行动已经完成":"Die Wochenaktion ist abgeschlossen"
  ,"这个事件必须处理；可以暂时收起查看状态，但不能改选本周行动。":"Dieses Ereignis muss geklärt werden. Du kannst es kurz minimieren, aber die Wochenaktion nicht mehr ändern."
  ,"暂时收起查看状态 · 之后仍需处理":"Kurz minimieren · später weiterbearbeiten"
  ,"留德能力":"Bleibeperspektive"
  ,"社会资源":"Soziale Ressourcen"
  ,"成长与职业":"Entwicklung und Beruf"
  ,"记录":"Verlauf"
  ,"工作":"Arbeit"
  ,"能力与行政资源":"Fähigkeiten und soziale Ressourcen"
  ,"行动会消耗精力；低于 18 时不能工作或接零工":"Aktionen kosten Energie; unter 18 kannst du weder arbeiten noch jobben"
  ,"由学业与德语共同构成；影响工资、检查和职业":"Setzt sich aus Studium und Deutsch zusammen und beeinflusst Lohn, Kontrollen und Jobs"
  ,"由人脉与档案共同构成；影响事件损失和职业":"Setzt sich aus Kontakten und Akte zusammen und beeinflusst Ereignisverluste und Jobs"
  ,"事件减损已生效":"Ereignisschutz aktiv"
  ,"45 后降低损失":"Ab 45 sinken Verluste"
  ,"工资":"Lohn"
  ,"只关注两个成长指标":"Zwei zentrale Entwicklungswerte"
  ,"“留德能力”整合学业与德语，“社会资源”整合人脉与档案。它们直接决定事件减损、学业检查、工资成长和职业解锁。":"Die „Bleibeperspektive“ verbindet Studienfortschritt und Deutschkenntnisse; „Soziale Ressourcen“ bündeln Kontakte und Aktenlage. Beide beeinflussen Ereignisschutz, Studienkontrollen, Lohnentwicklung und Jobzugang."
  ,"留德能力工资加成":"Lohnbonus durch Bleibeperspektive"
  ,"事件综合减损":"Gesamter Ereignisschutz"
  ,"已生效":"aktiv"
  ,"社会资源45后生效":"ab 45 sozialen Ressourcen"
  ,"周薪":"Wochenlohn"
  ,"无门槛":"Keine Voraussetzung"
  ,"这周，你选择了交易":"Diese Woche hast du den Handel gewählt"
  ,"本周行动已锁定":"Wochenaktion festgelegt"
  ,"交易进行中":"Handel läuft"
  ,"可以继续买卖；完成入口已固定在屏幕底部。":"Du kannst weiter handeln; der Abschluss bleibt unten am Bildschirm erreichbar."
  ,"本周已选择交易":"Handel als Wochenaktion gewählt"
  ,"还可以继续买卖":"Du kannst noch weiter handeln"
  ,"结束交易，进入下一周 →":"Handel beenden und nächste Woche beginnen →"
  ,"自动存档":"Automatischer Spielstand"
  ,"外国大学生":"Internationaler Student"
  ,"刚下飞机 · 德语 B1 · 学籍待激活 · 一叠陌生的信":"Gerade gelandet · Deutsch B1 · Immatrikulation offen · ein Stapel unbekannter Briefe"
  ,"统一交易平台":"Handelsplattform"
  ,"我的持仓":"Mein Bestand"
  ,"手上的货，现在值多少？":"Was ist dein Bestand heute wert?"
  ,"全部卖出":"Alles verkaufen"
  ,"买入均价":"Durchschnittlicher Kaufpreis"
  ,"现在卖出":"Verkauf heute"
  ,"本周进货价":"Einkaufspreis diese Woche"
  ,"本周可卖价":"Verkaufspreis diese Woche"
  ,"卖一件收到":"Erlös pro Stück"
  ,"库存 / 平均成本":"Bestand / Durchschnittskosten"
  ,"现在全部卖出":"Gewinn bei Komplettverkauf"
  ,"当前没有库存":"Derzeit kein Bestand"
  ,"查看持仓盈亏 →":"Bestand und Ergebnis ansehen →"
  ,"查看全部报价 →":"Alle Preise ansehen →"
  ,"继续查看持仓 →":"Bestand weiter ansehen →"
  ,"手里的货，涨了还是跌了？":"Sind deine Sachen mehr oder weniger wert?"
  ,"去市场转一圈":"Eine Runde über den Markt"
  ,"先看今天能卖多少钱，再决定要不要动手":"Schau erst, was du heute dafür bekommst, und entscheide dann."
  ,"看看这周的行情，不买也没关系":"Schau dich diese Woche um – du musst nichts kaufen."
  ,"先逛不算行动，第一笔成交才算":"Nur schauen zählt noch nicht. Erst der erste Kauf oder Verkauf legt deine Wochenaktion fest."
  ,"淘货":"Stöbern"
  ,"再看看手里的货 →":"Noch mal nach deinen Sachen sehen →"
  ,"看看赚了还是赔了 →":"Nachsehen: Gewinn oder Verlust? →"
  ,"进去转转 →":"Eine Runde drehen →"
  ,"不交易，返回本周选择":"Ohne Handel zurück zur Wochenwahl"
  ,"副业账本与进阶经营":"Nebengewerbe und Handelsbuch"
  ,"可选的进阶玩法":"Optionale vertiefte Spielweise"
  ,"① 选择要卖的东西":"① Ware auswählen"
  ,"② 选择销售渠道":"② Verkaufskanal auswählen"
  ,"③ 开始经营批次":"③ Handelsprojekt starten"
  ,"进行中的经营批次":"Laufendes Handelsprojekt"
  ,"已投入":"Investiert"
  ,"现在可以结算":"Jetzt abrechenbar"
  ,"还需推进 1 周":"Noch eine Woche"
  ,"查看行情并结算":"Marktlage prüfen und abrechnen"
  ,"等待时间推进":"Auf die nächste Woche warten"
  ,"投入本金":"Eingesetztes Kapital"
  ,"最近经营账本":"Letzte Handelsprojekte"
  ,"投入 → 回收 → 净结果":"Einsatz → Rückfluss → Ergebnis"
  ,"生活记录":"Verlauf"
  ,"待处理：":"Offen: "
  ,"继续处理 →":"Weiterbearbeiten →"
  ,"生活安排":"Alltagsplanung"
  ,"行动方案 · 尚未执行":"Aktionsplan · noch nicht ausgeführt"
  ,"尚未消耗时间，可以返回改选工作、学习、休息或交易。":"Es ist noch keine Zeit vergangen. Du kannst zurückgehen und Arbeit, Lernen, Erholung oder Handel wählen."
  ,"← 返回本周选择 · 不推进时间":"← Zurück zur Wochenwahl · keine Zeit vergeht"
  ,"进入新的一周":"In die nächste Woche"
  ,"事件发生在已经消耗的这一周":"Das Ereignis gehört zur bereits vergangenen Woche"
  ,"德语能力令本次压力额外减少":"Deine Deutschkenntnisse senken den Stress zusätzlich um"
  ,"点":"Punkte"
  ,"持有":"Gehalten"
  ,"周后结算":"Wochen bis zur Abrechnung"
  ,"开始和结算本身均不耗时间":"Start und Abrechnung kosten keine zusätzliche Zeit"
  ,"本金":"Kapital"
  ,"回收金额":"Rückfluss"
  ,"实际回到账户的价值":"Tatsächlich gutgeschriebener Betrag"
  ,"净利润":"Nettogewinn"
  ,"回收 − 总投入":"Rückfluss minus Gesamteinsatz"
  ,"至少要留下 200€ 生活费。":"Mindestens 200 € müssen für den Alltag auf dem Konto bleiben."
  ,"已有一个经营批次在进行中。先推进时间并结算。":"Es läuft bereits ein Handelsprojekt. Lass erst Zeit vergehen und rechne es anschließend ab."
  ,"至少要留下 200€ 生活费，并支付渠道成本。":"Mindestens 200 € müssen als Reserve bleiben; zusätzlich fallen Kanalkosten an."
  ,"已备货。完成下一次本周行动后将自动结算。":"Die Ware ist beschafft. Nach der nächsten Wochenaktion wird automatisch abgerechnet."
  ,"当前没有等待结算的经营批次。":"Es wartet kein Handelsprojekt auf die Abrechnung."
  ,"买入后至少要保留 250€ 现金。":"Nach dem Kauf müssen mindestens 250 € verfügbar bleiben."
  ,"你没有持有这只股票。":"Du hältst diese Aktie nicht."
  ,"本周已经发生交易；请完成交易并推进一周。":"Du hast diese Woche bereits gehandelt. Schließe den Handel ab und gehe eine Woche weiter."
  ,"储物空间满了。":"Dein Lager ist voll."
  ,"补补短板":"Lücken schließen"
  ,"把落下的课补回来":"Beim Studium wieder aufholen"
  ,"去图书馆坐一周，至少别让下一次检查太难看":"Eine Woche in der Bibliothek – damit die nächste Kontrolle nicht ganz so wehtut"
  ,"把德语再练顺一点":"Das Deutsch etwas flüssiger bekommen"
  ,"多开几次口，下回碰到窗口和客服少卡壳":"Mehr sprechen, damit es beim nächsten Amt oder Kundendienst weniger hakt"
  ,"出去走走":"Unter Leute"
  ,"去混个脸熟":"Sich mal blicken lassen"
  ,"参加社区活动，练练德语；以后碰上麻烦，也许能找到人问":"Beim Nachbarschaftstreffen Deutsch üben und Leute kennenlernen – vielleicht weiß später jemand Rat"
  ,"挣钱 / 喘气":"Geld verdienen / durchatmen"
  ,"先歇口气吧":"Erst mal durchatmen"
  ,"去上班，还是歇一周":"Arbeiten gehen oder eine Woche Pause machen"
  ,"这状态硬撑也干不了活，先把觉补回来":"So wird das mit der Arbeit nichts. Erst einmal ausschlafen."
  ,"这周去挣钱，还是先喘口气？":"Diese Woche Geld verdienen oder erst einmal durchatmen?"
  ,"这状态真上不了班":"So kannst du wirklich nicht arbeiten"
  ,"去上班，推进一周":"Zur Arbeit gehen und eine Woche weiter"
  ,"就这么过这一周":"So verbringe ich diese Woche"
  ,"🛌 这周先不硬撑":"🛌 Diese Woche nicht auf Biegen und Brechen"
  ,"睡够了再说 →":"Erst ausschlafen, dann weiter →"
  ,"先查看":"Erst ansehen"
  ,"利润高，Abmahnung 也很贵":"Hohe Marge – aber eine Abmahnung kann sehr teuer werden"
  ,"本周已经成交：交易就是本周行动。可以继续调整货物，完成后推进一周。":"Du hast diese Woche bereits gehandelt. Damit steht Handel als Wochenaktion fest; du kannst den Bestand noch anpassen und anschließend die Woche abschließen."
  ,"第一笔成交后，本周行动确定为交易":"Mit dem ersten Abschluss wird Handel zur Wochenaktion"
  ,"当前可卖价已经达到或超过平均成本，可以考虑卖出。":"Der aktuelle Verkaufspreis deckt deine Durchschnittskosten; ein Verkauf wäre jetzt ohne Verlust möglich."
  ,"新的市场价格和生活状态已经更新。":"Marktpreise und Lebenssituation wurden aktualisiert."
  ,"这一周结束了":"Die Woche ist vorbei"
  ,"完成结算":"Abrechnung abschließen"
});

function deText(value){
  let translated=value
    .replace(/第 (\d+) 月 · 第 (\d+) 周/g,"Monat $1 · Woche $2")
    .replace(/第 (\d+) 月第 (\d+) 周/g,"Monat $1, Woche $2")
    .replace(/第 (\d+) 月/g,"Monat $1")
    .replace(/第 (\d+) 周/g,"Woche $1")
    .replace(/本周工资 (\d+)€/g,"Wochenlohn $1 €")
    .replace(/工资 \+(\d+)€/g,"Lohn +$1 €")
    .replace(/(\d+) 后可能触发晋升/g,"Ab $1: Chance auf Beförderung")
    .replace(/持有 (\d+)/g,"Bestand $1")
    .replace(/均价 (\d+)€/g,"Einstand $1 €")
    .replace(/储物 (\d+)\/(\d+)/g,"Lager $1/$2")
    .replace(/还剩 (\d+) 周/g,"noch $1 Wochen")
    .replace(/下一次月末结算还有 (\d+) 周/g,"Nächste Monatsabrechnung in $1 Wochen")
    .replace(/本周结束扣生活费 (\d+)€/g,"Am Wochenende werden $1 € Lebenshaltungskosten abgebucht")
    .replace(/工作可得约 (\d+)€；也可选择休息恢复精力/g,"Arbeit bringt etwa $1 €; alternativ kannst du dich erholen")
    .replace(/上班能拿约 (\d+)€；真累了，也可以少赚一周换口气/g,"Arbeiten bringt etwa $1 €; wenn du wirklich erschöpft bist, kannst du dir stattdessen eine Woche Pause gönnen")
    .replace(/当前精力不足以工作，可休息恢复约 (\d+) 点精力/g,"Zu wenig Energie zum Arbeiten; Erholung bringt etwa $1 Energie")
    .replace(/做 (.+) 预计获得约 (\d+)€；如果撑不住，也可以把这周用于休息。/g,"Im Job „$1“ erhältst du voraussichtlich etwa $2 €. Wenn es zu viel wird, kannst du diese Woche zur Erholung nutzen.")
    .replace(/去做 (.+)，大概能拿 (\d+)€。要是已经撑不住，少赚一周也比把身体拖垮强。/g,"Im Job „$1“ bekommst du ungefähr $2 €. Wenn du schon am Limit bist, ist eine Woche weniger Lohn besser, als dich völlig kaputtzumachen.")
    .replace(/周薪 (\d+)€/g,"Wochenlohn $1 €")
    .replace(/社会资源(\d+)后生效/g,"aktiv ab $1 sozialen Ressourcen")
    .replace(/(\d+) 个事件/g,"$1 Ereignisse")
    .replace(/需要留德能力 (\d+)、社会资源 (\d+)/g,"Benötigt Bleibeperspektive $1 und soziale Ressourcen $2")
    .replace(/下周开始做：(.+)/g,"Ab nächster Woche: $1")
    .replace(/还需推进 (\d+) 周才能结算。/g,"Noch $1 Woche(n) bis zur Abrechnung.")
    .replace(/本月偿还债务 (\d+)€/g,"Diesen Monat $1 € Schulden getilgt")
    .replace(/买入 (\d+) 件 (.+)：共 (\d+)€/g,"$1 × $2 für insgesamt $3 € gekauft")
    .replace(/卖出 (\d+) 件 (.+)：收入 (\d+)€，实际赚 (\d+)€/g,"$1 × $2 verkauft: $3 € Erlös, $4 € Gewinn")
    .replace(/卖出 (\d+) 件 (.+)：收入 (\d+)€，实际亏 (\d+)€/g,"$1 × $2 verkauft: $3 € Erlös, $4 € Verlust")
    .replace(/月末已扣生活费 (\d+)€，债务增加利息 (\d+)€。/g,"Zum Monatsende wurden $1 € Lebenshaltungskosten abgebucht; die Schulden stiegen um $2 € Zinsen.")
    .replace(/留德能力 (\d+)\/(\d+)/g,"Bleibeperspektive $1/$2")
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

function Stat({label,value,type="bar",bad=false,onClick,hint}) {
  const content=<><span>{label}</span><b>{type==="money"?`${Math.round(value)} €`:Math.round(value)}</b>{hint&&<small>{hint}</small>}{type==="bar"&&<i><em style={{width:`${clamp(value)}%`}} className={bad?"danger":""}/></i>}</>;
  return onClick?<button type="button" className="v2-stat stat-button" onClick={onClick}>{content}</button>:<div className="v2-stat">{content}</div>;
}

function WeeklyMarket({state,lang,prices,onTrade}){
  const locked=state.marketVisitWeek===state.totalWeek;
  const totalQty=Object.values(state.inventory||{}).reduce((sum,n)=>sum+n,0);
  const holdings=GOODS.filter(g=>(state.inventory?.[g.id]||0)>0);
  const holdingValue=holdings.reduce((sum,g)=>sum+Math.round(prices[g.id]*.9)*(state.inventory[g.id]||0),0);
  const holdingCost=holdings.reduce((sum,g)=>sum+(state.inventoryCost?.[g.id]||0),0);
  return <section className="weekly-market" id="weekly-market">
    <div className="weekly-market-head"><div><small>WOCHENMARKT · 统一交易平台</small><h3>{lang==="de"?"Alle Angebote auf einen Blick":"全部商品，一次看完"}</h3></div><span>{lang==="de"?`Lager ${totalQty}/${state.capacity}`:`储物 ${totalQty}/${state.capacity}`}</span></div>
    <button className="back-to-actions" onClick={()=>document.getElementById("weekly-actions")?.scrollIntoView({behavior:"smooth",block:"start"})}>← {lang==="de"?"Ohne Handel zurück":"不交易，返回本周选择"}</button>
    <p className="market-freedom">{locked?"本周已经成交：交易就是本周行动。可以继续调整货物，完成后推进一周。":"浏览全部报价不会推进时间。第一笔成交后，“交易”会成为本周行动。"}</p>
    {holdings.length>0&&<section className="portfolio-spotlight" id="portfolio-spotlight"><header><div><small>MEIN BESTAND · 我的持仓</small><h4>手上的货，现在值多少？</h4></div><span>全部卖出 <b className={holdingValue-holdingCost>=0?"profit":"loss"}>{holdingValue-holdingCost>=0?"+":""}{Math.round(holdingValue-holdingCost)}€</b></span></header><div>{holdings.map(g=>{const qty=state.inventory[g.id],avg=(state.inventoryCost[g.id]||0)/qty,sell=Math.round(prices[g.id]*.9),profit=Math.round((sell-avg)*qty);return <article key={g.id}><i>{g.icon}</i><span><b>{g.name} × {qty}</b><small>买入均价 <strong>{Math.round(avg)}€</strong> → 现在卖出 <strong>{sell}€</strong></small></span><em className={profit>=0?"profit":"loss"}>{profit>=0?"+":""}{profit}€</em><button onClick={()=>onTrade(g,"sell",qty,"platform")}>全部卖出</button></article>})}</div></section>}
    <div className="trade-explain">💡 低风险商品波动较小；高回报商品通常价格更不稳定，并可能遭遇平台审核或查处。</div>
    <div className="weekly-goods">{GOODS.filter(g=>g.active!==false).map(g=>{
      const qty=state.inventory?.[g.id]||0,totalCost=state.inventoryCost?.[g.id]||0,avg=qty?totalCost/qty:0;
      const tradeAbility=integrationScore(state),tradeSocial=socialScore(state);
      const contactDiscount=(tradeSocial>=75?.08:tradeSocial>=50?.04:0)+(tradeAbility>=75?.04:tradeAbility>=60?.02:0);
      const buy=Math.max(1,Math.round(prices[g.id]*(1-contactDiscount))),sell=Math.max(1,Math.round(prices[g.id]*.9));
      const old=seededPrice(g,Math.max(0,state.totalWeek-1),NEWS[Math.floor(Math.max(0,state.totalWeek-1)/4)%NEWS.length]);
      const change=buy-old,changePct=old?Math.round(change/old*100):0;
      const direction=change>0?"↑":change<0?"↓":"→";
      const maxBuy=Math.max(0,Math.min(state.capacity-totalQty,Math.floor((state.money-200)/buy)));
      const potential=qty?Math.round((sell-avg)*qty):0;
      const breakEven=qty?Math.max(0,Math.ceil(avg-sell)):0;
      return <article key={g.id} className={g.risk>=30?"risky":""}><header><i>{g.icon}</i><div><b>{g.name}</b><small>{g.note}</small></div><em className={change>0?"market-up":change<0?"market-down":"market-flat"}>{direction} {change===0?"0":`${change>0?"+":""}${change}€`} ({changePct>0?"+":""}{changePct}%)</em></header><div className="quote-row"><span>{lang==="de"?"Einkauf diese Woche":"本周进货价"}<b>{buy}€</b><small>{lang==="de"?"Das zahlst du":"买一件支付"}</small></span><span>{lang==="de"?"Verkaufswert diese Woche":"本周可卖价"}<b>{sell}€</b><small>{lang==="de"?"Das erhältst du":"卖一件收到"}</small></span><span>{lang==="de"?"Bestand / Ø-Kosten":"库存 / 平均成本"}<b>{qty} / {qty?`${Math.round(avg)}€`:"—"}</b><small>{qty?(lang==="de"?`Einstand ${Math.round(avg)}€`:`回本基准 ${Math.round(avg)}€`):"—"}</small></span><span className={potential>=0?"profit":"loss"}>{lang==="de"?"Gewinn bei Verkauf":"现在全部卖出"}<b>{qty?`${potential>=0?"+":""}${potential}€`:"—"}</b><small>{qty?`${sell}€ − ${Math.round(avg)}€ × ${qty}`:"当前没有库存"}</small></span></div>{qty>0&&<div className={breakEven>0?"break-even waiting":"break-even ready"}>{breakEven>0?(lang==="de"?`Noch ${breakEven}€ pro Stück bis zur Gewinnschwelle`:`每件可卖价还需上涨 ${breakEven}€ 才能回本`):(lang==="de"?"Der aktuelle Verkaufswert liegt über deinen Kosten.":"当前可卖价已经达到或超过平均成本，可以考虑卖出。")}</div>}<div className="risk-line neutral-risk">{g.risk>=30?"⚠":g.risk>=8?"△":"○"} {lang==="de"?`Risiko ${g.risk}/100`:`交易风险 ${g.risk}/100`}</div><div className="quantity-trade"><button disabled={maxBuy<1} onClick={()=>onTrade(g,"buy",1,"platform")}>+1 {lang==="de"?"kaufen":"买入"}</button><button disabled={maxBuy<2} onClick={()=>onTrade(g,"buy",maxBuy,"platform")}>{lang==="de"?"Max kaufen":"尽量买"}</button><button disabled={qty<1} onClick={()=>onTrade(g,"sell",1,"platform")}>-1 {lang==="de"?"verkaufen":"卖出"}</button><button disabled={qty<1} onClick={()=>onTrade(g,"sell",qty,"platform")}>{lang==="de"?"Alles verkaufen":"全部卖"}</button></div></article>
    })}</div>
  </section>;
}

function TradeLedger({state,lang,prices}){
  const holdings=GOODS.filter(g=>(state.inventory?.[g.id]||0)>0);
  return <section className="trade-ledger-panel"><div className="panel-title"><div><small>HANDELSBUCH</small><h2>{lang==="de"?"Lager und Handelsbuch":"库存与交易账本"}</h2></div><span>{lang==="de"?"Kaufpreis → heutiger Verkaufswert":"成本 → 当前卖出价值"}</span></div><p className="market-tip">{lang==="de"?"Gehandelt wird direkt vor der Wochenaktion. Hier siehst du nur Bestand, Einstandspreise und abgeschlossene Geschäfte.":"买卖入口已经放进“本周行动”。这里专门查看库存成本、当前潜在盈亏和最近成交记录。"}</p>
    <div className="holding-grid">{holdings.length?holdings.map(g=>{const qty=state.inventory[g.id],avg=(state.inventoryCost[g.id]||0)/qty,sell=Math.round(prices[g.id]*.9),profit=Math.round((sell-avg)*qty);return <article key={g.id}><i>{g.icon}</i><div><b>{g.name}</b><small>{qty} 件 · 均价 {Math.round(avg)}€ · 当前卖价 {sell}€</small></div><em className={profit>=0?"profit":"loss"}>{profit>=0?"+":""}{profit}€</em></article>}):<div className="empty">{lang==="de"?"Noch kein Bestand. Wähle unter „Wochenaktion“ zuerst einen Markt.":"目前没有库存。请先在“本周行动”里选择本周市场。"}</div>}</div>
    <div className="trade-history"><div className="subhead"><b>{lang==="de"?"Letzte Geschäfte":"最近成交"}</b><span>{lang==="de"?"Neue Einträge zuerst":"最新在前"}</span></div>{(state.tradeLedger||[]).length?(state.tradeLedger||[]).slice(0,12).map((entry,index)=><p key={index}><span>{entry.mode==="buy"?"买入":"卖出"} {entry.good}<small>{entry.market==="platform"?"统一交易平台":MARKETS.find(m=>m.id===entry.market)?.name||"交易平台"} · {entry.qty} 件 × {entry.unitPrice}€</small></span><b>{entry.mode==="sell"&&entry.result!==null?`${entry.result>=0?"+":""}${entry.result}€`:`-${entry.qty*entry.unitPrice}€`}</b></p>):<div className="empty">{lang==="de"?"Noch keine Geschäfte.":"还没有成交记录。"}</div>}</div>
  </section>;
}

function ProgressBenefits({state,lang}){
  const social=socialScore(state),ability=integrationScore(state);
  const lossTier=social>=80?"25%":social>=60?"15%":social>=45?"8%":"—";
  const abilityTier=ability>=75?"事件压力 −4":ability>=60?"事件压力 −2":ability>=40?"可通过首次检查":"40 后通过首次检查";
  return <div className="progress-benefits career-benefits"><span><b>🤝 社会资源 {social}</b><small>{`整合人脉与档案 · 事件损失${lossTier==="—"?"在45后降低":`降低 ${lossTier}`}`}</small></span><span><b>🎓 留德能力 {ability}</b><small>{`整合学业与德语 · ${abilityTier} · 工资 +${Math.min(80,Math.max(0,ability-40)*2)}€`}</small></span></div>;
}

export default function Home() {
  const SAVE_KEY="aktenleben-save-v1";
  const readSavedGame=()=>{
    try{
      const saved=JSON.parse(localStorage.getItem(SAVE_KEY)||"null");
      if(!saved?.state||!saved?.screen)return null;
      return {...saved,version:2,lang:saved.lang==="de"?"de":"zh",modal:saved.modal||null};
    }catch{return null;}
  };
  const initialSave=readSavedGame();
  const [lang,setLang]=useState(initialSave?.lang||"zh");
  useEffect(()=>{
    document.documentElement.lang=lang==="de"?"de":"zh-CN";
    document.title=lang==="de"?"AKTENLEBEN｜48 Wochen Deutschland":"AKTENLEBEN｜留德浮生记";
  },[lang]);
  const [visitCount,setVisitCount]=useState(null);
  const [messages,setMessages]=useState([]);
  const [guestbookLoading,setGuestbookLoading]=useState(false);
  const [guestbookError,setGuestbookError]=useState("");
  const [guestbookForm,setGuestbookForm]=useState({nickname:"",message:""});
  useEffect(()=>{
    let active=true;
    (async()=>{
      try{
        const counted=sessionStorage.getItem("aktenleben-visit-counted");
        const total=counted?await getVisitCount():await registerVisit();
        if(!counted)sessionStorage.setItem("aktenleben-visit-counted","1");
        if(active)setVisitCount(total);
      }catch{if(active)setVisitCount(null);}
    })();
    return()=>{active=false;};
  },[]);
  const [screen,setScreen]=useState("intro");
  const [state,setState]=useState(null);
  const [playerName,setPlayerName]=useState("");
  const [savedGame,setSavedGame]=useState(initialSave);
  const [saveError,setSaveError]=useState(false);
  const [tab,setTab]=useState("actions");
  const [modal,setModal]=useState(null);
  const [toast,setToast]=useState("");
  const [ventureGood,setVentureGood]=useState("phones");
  const [ventureChannel,setVentureChannel]=useState("ebay");
  const [ventureAmount,setVentureAmount]=useState(150);
  const [previewMarket,setPreviewMarket]=useState(null);

  useEffect(()=>{
    if(!state||!["arrival","game","end"].includes(screen))return;
    const persistentModal=["event","weekResult","ventureResult","result"].includes(modal?.type)?modal:null;
    const saved={version:2,state,screen,tab,lang,modal:persistentModal,savedAt:Date.now()};
    try{
      localStorage.setItem(SAVE_KEY,JSON.stringify(saved));
      setSavedGame(saved);
      setSaveError(false);
    }catch{
      setSaveError(true);
    }
  },[state,screen,tab,lang,modal]);

  function randomizeName(){
    const zhNames=["林安","周宁","陈晓雨","王子涵","李明远","赵可欣","孙宇航","吴嘉禾"];
    const deNames=["Mia Chen","Lina Wang","Leo Zhang","Noah Li","Emma Zhou","Felix Lin","Sophie Wu","Max Zhao"];
    const names=lang==="de"?deNames:zhNames;
    setPlayerName(names[Math.floor(Math.random()*names.length)]);
  }

  function continueGame(){
    if(!savedGame?.state)return;
    setState(savedGame.state);
    setTab(savedGame.tab==="market"?"actions":savedGame.tab||"actions");
    setLang(savedGame.lang==="de"?"de":"zh");
    setScreen(["arrival","game","end"].includes(savedGame.screen)?savedGame.screen:"game");
    setModal(savedGame.modal||null);
  }

  function clearSavedGame(){
    try{localStorage.removeItem(SAVE_KEY);}catch{}
    setSavedGame(null);
    setSaveError(false);
    setState(null);
    setScreen("intro");
  }

  async function loadGuestbook(){
    setGuestbookLoading(true);setGuestbookError("");
    try{setMessages(await getGuestbookMessages());}
    catch{setGuestbookError(lang==="de"?"Das Gästebuch ist noch nicht mit der Datenbank verbunden.":"留言板尚未连接数据库，请先完成 Supabase 初始化。");}
    finally{setGuestbookLoading(false);}
  }

  useEffect(()=>{if(tab==="guestbook")loadGuestbook();},[tab]);

  async function submitGuestbook(event){
    event.preventDefault();
    const nickname=guestbookForm.nickname.trim();
    const message=guestbookForm.message.trim();
    if(!nickname||!message){setGuestbookError(lang==="de"?"Bitte Name und Nachricht eingeben.":"请填写昵称和留言。");return;}
    const last=Number(localStorage.getItem("aktenleben-last-message")||0);
    if(Date.now()-last<60000){setGuestbookError(lang==="de"?"Bitte warte eine Minute bis zur nächsten Nachricht.":"每次留言请间隔一分钟。");return;}
    setGuestbookLoading(true);setGuestbookError("");
    try{
      const saved=await addGuestbookMessage({nickname,message,language:lang});
      localStorage.setItem("aktenleben-last-message",String(Date.now()));
      setMessages(current=>[saved,...current].filter(Boolean).slice(0,50));
      setGuestbookForm({nickname:"",message:""});
    }catch{setGuestbookError(lang==="de"?"Die Nachricht konnte nicht gespeichert werden.":"留言提交失败，请稍后再试。");}
    finally{setGuestbookLoading(false);}
  }

  const news=state?NEWS[state.newsIndex%NEWS.length]:NEWS[0];
  const prices=useMemo(()=>state?Object.fromEntries(GOODS.map(g=>[g.id,seededPrice(g,state.totalWeek,news)])): {},[state?.totalWeek,state?.newsIndex]);
  const stockPrices=useMemo(()=>state?Object.fromEntries(STOCKS.map(s=>[s.id,stockPrice(s,state.totalWeek)])): {},[state?.totalWeek]);

  function start(profile,name=playerName){
    const cleanName=name.trim()||(lang==="de"?"Mia Chen":"林安");
    setState({...profile,name:cleanName,profileId:profile.id,month:1,week:1,totalWeek:0,jobId:"shift",inventory:{},inventoryCost:{},tradeLedger:[],marketVisitWeek:-1,marketLocation:null,stocks:{},stockCost:{},activeVenture:null,ventureLedger:[],packs:0,flags:{},seen:[],journal:[],newsIndex:0,capacity:6,businessRuns:0,lastDebtPaymentMonth:0,academicWarnings:0});
    setScreen("arrival"); setTab("actions"); setModal(null);
  }

  function applyEffect(base,effect={}){
    const next={...base};
    Object.entries(effect).forEach(([k,v])=>{next[k]=["money","debt"].includes(k)?Math.max(0,(next[k]||0)+v):clamp((next[k]||0)+v);});
    return next;
  }

  const hasEnded=s=>s.health<=0||s.stress>=100||s.money<=0||s.month>12;
  function commitState(next){
    setState(next);
    if(hasEnded(next)){setScreen("end");setModal(null);return true;}
    return false;
  }

  function drawEvent(current){
    if(current.totalWeek%6===0){
      const opportunities=lang==="de"?DE_OPPORTUNITY_EVENTS:OPPORTUNITY_EVENTS;
      const opportunityUnlocked=e=>e.id==="opp-refund"?current.papers>=50:e.id==="opp-contact"?current.reputation>=45:e.id==="opp-paperwork"?current.papers>=65:true;
      const unlocked=opportunities.filter(e=>opportunityUnlocked(e)&&!current.seen.slice(-14).includes(e.id));
      if(unlocked.length)return unlocked[(current.totalWeek/6-1)%unlocked.length];
    }
    const eventPool=lang==="de"?DE_EVENTS:BASE_EVENTS;
    const recentWindow=Math.min(14,Math.max(6,eventPool.length-3));
    const eligible=eventPool.filter(e=>(!e.when||e.when(current))&&!current.seen.slice(-recentWindow).includes(e.id));
    if(!eligible.length)return null;
    const index=(current.totalWeek*7+Math.round(current.stress)+Math.round(current.money))%eligible.length;
    return eligible[index];
  }

  function doAction(action,force=false){
    if(modal&&!force)return;
    if(state.marketVisitWeek===state.totalWeek&&action.id!=="trade-week"){setToast("本周已经发生交易；请完成交易并推进一周。");document.getElementById("weekly-market")?.scrollIntoView({behavior:"smooth",block:"start"});return;}
    const minimumEnergy=["work","gig"].includes(action.id)?18:["learn","study","tutorial","sport","social"].includes(action.id)||action.id.startsWith("paper-")?10:0;
    if(state.energy<minimumEnergy){setToast(lang==="de"?`Für diese Aktion brauchst du mindestens ${minimumEnergy} Energie.`:`精力至少需要 ${minimumEnergy} 才能进行这项行动。`);setModal(null);return;}
    const actionEffect=action.run(state);
    let next=applyEffect(state,actionEffect);
    next=applyEffect(next,{energy:10});
    const progressNotes=[];
    if(action.id==="learn"){
      if(state.german<50&&next.german>=50){next=applyEffect(next,{stress:-4,papers:3});progressNotes.push("德语达到50：日常沟通更顺，压力降低并补全了一部分档案。");}
      if(state.german<60&&next.german>=60){next=applyEffect(next,{papers:4,reputation:4});progressNotes.push("留德能力取得突破：你更能看懂往来文件，也积累了一批可靠联系人。");}
      if(state.german<75&&next.german>=75){next=applyEffect(next,{stress:-6,reputation:6});progressNotes.push("德语达到75：复杂沟通不再完全依赖运气，社会关系也更稳定。");}
    }
    let log=lang==="de"?`Monat ${state.month}, Woche ${state.week}: ${deText(action.name)}`:`第 ${state.month} 月第 ${state.week} 周：${action.name}`;
    let nextWeek=state.week+1, nextMonth=state.month, newsIndex=state.newsIndex;
    let monthSummary=progressNotes.join(" ");
    if(nextWeek>4){
      nextWeek=1; nextMonth+=1; newsIndex+=1;
      const living=Math.max(950,BASE_MONTHLY_COST-(next.flags.mieterverein?25:0)-(next.flags.rentFight?15:0)-(next.reputation>=70?20:0));
      const interest=Math.ceil(next.debt*.035);
      next=applyEffect(next,{money:-living,debt:interest,stress:next.money<living?12:1,energy:8});
      log+=`；月末扣除生活费 ${living}€，债务利息 ${interest}€`;
      monthSummary=`${monthSummary} 月末已扣生活费 ${living}€，债务增加利息 ${interest}€。`.trim();
    }
    next={...next,week:nextWeek,month:nextMonth,totalWeek:state.totalWeek+1,newsIndex,journal:[log,...state.journal].slice(0,20)};
    const milestone=ACADEMIC_MILESTONES.find(item=>item.week===next.totalWeek);
    if(milestone){
      const passed=integrationScore(next)>=milestone.required;
      next=applyEffect(next,passed?milestone.reward:milestone.penalty);
      next={...next,academicWarnings:(next.academicWarnings||0)+(passed?0:1),journal:[`${milestone.title}：留德能力 ${integrationScore(next)}/${milestone.required}，${passed?"进度达标":"进度不足，收到书面警告"}`,...next.journal].slice(0,20)};
      const academicSummary=passed?`${milestone.title}通过，学校确认学业进度正常。`:`${milestone.title}未通过：扣除补办费用并增加压力，学业需达到 ${milestone.required}。`;
      monthSummary=`${monthSummary} ${academicSummary}`.trim();
    }
    const riskyGoods=GOODS.filter(g=>g.risk>=30&&(next.inventory?.[g.id]||0)>0);
    if(riskyGoods.length){
      const exposure=riskyGoods.reduce((sum,g)=>sum+g.risk*(next.inventory[g.id]||0),0);
      const inspectionProtection=(next.papers>=80?8:next.papers>=60?4:0)+(next.german>=75?6:next.german>=60?3:0)+(next.reputation>=80?5:0);
      const inspectionRoll=(next.totalWeek*29+Math.round(next.money)+next.papers*3)%100;
      if(inspectionRoll<Math.max(2,Math.min(42,Math.round(exposure/8)-inspectionProtection))){
        const seized=riskyGoods.reduce((sum,g)=>sum+(next.inventory[g.id]||0),0);
        const inventory={...next.inventory},inventoryCost={...next.inventoryCost};
        riskyGoods.forEach(g=>{inventory[g.id]=0;inventoryCost[g.id]=0;});
        const fine=Math.max(35,75-(next.german>=75?15:0)-(next.papers>=80?10:0));
        next=applyEffect({...next,inventory,inventoryCost},{money:-fine,stress:14,papers:-6,reputation:-5});
        monthSummary=`${monthSummary} 平台审核与市场监管同时出现：${seized} 件高风险库存被扣，并收到 ${fine}€ 处理费用。`.trim();
      }
    }
    if(next.activeVenture&&next.totalWeek>=next.activeVenture.readyWeek){
      const resolved=resolveVenture(next);
      next=resolved.next;
      if(commitState(next))return;
      setModal({type:"ventureResult",title:resolved.title,result:resolved.result,ledger:resolved.ledger});
      return;
    }
    if(commitState(next))return;
    const timeLabel=`${periodLabel(state)} → ${periodLabel(next)}`;
    const event=drawEvent(next);
    const eventRoll=(next.totalWeek*37+next.newsIndex*11+Math.round(next.stress))%100;
    const shouldEvent=next.totalWeek%6===0||eventRoll<62;
    if(event&&shouldEvent)setModal({type:"event",event,timeLabel,actionName:action.name,monthSummary});
    else setModal({type:"weekResult",actionName:action.name,timeLabel,monthSummary});
  }

  function chooseEvent(choice,event){
    const languageRelief=integrationScore(state)>=75?4:integrationScore(state)>=60?2:0;
    const academicOffice=["UNIVERSITÄT","PRÜFUNGSAMT","SEMINAR","BIBLIOTHEK"].includes(event.office);
    const ability=integrationScore(state),social=socialScore(state);
    const academicRelief=academicOffice?(ability>=75?4:ability>=60?2:0):0;
    const adjusted={...choice.effect};
    if(adjusted.stress>0)adjusted.stress=Math.max(0,adjusted.stress-languageRelief-academicRelief);
    if(adjusted.energy<0&&social>=45)adjusted.energy=Math.round(adjusted.energy*(social>=80?.65:social>=60?.8:.92));
    if(adjusted.papers>0&&state.papers>=60)adjusted.papers=Math.max(1,Math.round(adjusted.papers*(state.papers>=80?.35:.65)));
    if(adjusted.money<0&&social>=45)adjusted.money=Math.round(adjusted.money*(social>=80?.75:social>=60?.88:.95));
    if(adjusted.stress>0&&state.reputation>=80)adjusted.stress=Math.max(0,adjusted.stress-2);
    let next=applyEffect(state,adjusted);
    if(choice.flag)next={...next,flags:{...next.flags,[choice.flag]:true}};
    next={...next,seen:[...next.seen,event.id],journal:[`${event.office}：${event.title}｜${choice.label}`,...next.journal].slice(0,20)};
    const timeLabel=modal?.timeLabel;
    if(commitState(next))return;
    setModal({type:"result",choice,event,timeLabel,languageRelief,academicRelief});
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
    if(commitState(next))return;
    setModal({type:"result",choice:{label:"提交完整材料包快速处理",result:"你拿出了原件、复印件、回执、Aktenzeichen 和按日期排列的往来信件。工作人员短暂沉默后，事情居然办下来了。"},event,timeLabel:modal?.timeLabel,prepared:true});
  }

  function trade(good,mode,requested=1,marketId=state.marketLocation){
    const qty=state.inventory?.[good.id]||0;
    const totalCost=state.inventoryCost?.[good.id]||0;
    const avgCost=qty>0?totalCost/qty:0;
    const totalQty=Object.values(state.inventory).reduce((a,b)=>a+b,0);
    const tradeAbility=integrationScore(state),tradeSocial=socialScore(state);
    const contactDiscount=(tradeSocial>=75?.08:tradeSocial>=50?.04:0)+(tradeAbility>=75?.04:tradeAbility>=60?.02:0);
    const unitPrice=mode==="buy"?Math.max(1,Math.round(prices[good.id]*(1-contactDiscount))):Math.max(1,Math.round(prices[good.id]*.9));
    const reserveLimit=Math.max(0,Math.floor((state.money-200)/unitPrice));
    const amount=mode==="buy"?Math.max(0,Math.min(requested,state.capacity-totalQty,reserveLimit)):Math.max(0,Math.min(requested,qty));
    if(mode==="buy"&&amount<1){setToast(totalQty>=state.capacity?"储物空间满了。":"至少要留下 200€ 生活备用金。");return;}
    if(mode==="sell"&&qty<=0){setToast("你没有这件东西。");return;}
    const inventory={...state.inventory,[good.id]:qty+(mode==="buy"?amount:-amount)};
    const inventoryCost={...state.inventoryCost,[good.id]:mode==="buy"?totalCost+unitPrice*amount:Math.max(0,totalCost-avgCost*amount)};
    const realized=Math.round((unitPrice-avgCost)*amount);
    const entry={week:state.totalWeek,market:marketId,good:good.name,mode,qty:amount,unitPrice,result:mode==="sell"?realized:null};
    setState({...state,money:state.money+(mode==="buy"?-unitPrice*amount:unitPrice*amount),inventory,inventoryCost,marketVisitWeek:state.totalWeek,marketLocation:marketId,tradeLedger:[entry,...(state.tradeLedger||[])].slice(0,30)});
    setToast(mode==="buy"
      ?`买入 ${amount} 件 ${good.name}：共 ${unitPrice*amount}€`
      :`卖出 ${amount} 件 ${good.name}：收入 ${unitPrice*amount}€，实际${realized>=0?"赚":"亏"} ${Math.abs(realized)}€`);
  }

  function openTrading(){
    const hasHoldings=Object.values(state.inventory||{}).some(qty=>qty>0);
    const target=document.getElementById(hasHoldings?"portfolio-spotlight":"weekly-market");
    if(!target)return;
    const sticky=document.querySelector(".sticky-status");
    const offset=(sticky?.getBoundingClientRect().height||0)+18;
    window.scrollTo({top:Math.max(0,target.getBoundingClientRect().top+window.scrollY-offset),behavior:"smooth"});
  }

  function finishTradeWeek(){
    const target=document.getElementById("weekly-actions");
    if(target)window.scrollTo({top:Math.max(0,target.getBoundingClientRect().top+window.scrollY-12),behavior:"auto"});
    doAction(TRADE_WEEK_ACTION);
  }

  function payDebt(){
    if(state.lastDebtPaymentMonth===state.month){setToast("本月已经还过一次债务了。下个月才能再次还款。");return;}
    const amount=Math.min(250,state.money-200,state.debt);
    if(amount<=0){setToast("至少要留下 200€ 生活费。");return;}
    setState({...state,money:state.money-amount,debt:state.debt-amount,lastDebtPaymentMonth:state.month});
    setModal(null);
    setToast(`本月偿还债务 ${amount}€`);
  }

  function switchJob(job){
    if(integrationScore(state)<job.abilityReq||socialScore(state)<job.socialReq){setToast(`需要留德能力 ${job.abilityReq}、社会资源 ${job.socialReq}`);return;}
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
    setModal(null);setTab("actions");
    setToast(`已备货。完成下一次本周行动后将自动结算。`);
  }

  function resolveVenture(current){
    const batch=current.activeVenture;
    const good=HUSTLE_GOODS.find(g=>g.id===batch.goodId);
    const channel=CHANNELS.find(c=>c.id===batch.channelId);
    const amount=batch.capital;
    const signal=(batch.startWeek*37+amount+good.risk*3+(channel.id==="ebay"?19:7))%100;
    const caught=signal<Math.max(2,good.risk+channel.risk);
    const marketFactor=batch.marketFactor||1;
    const profitChance=Math.max(.25,Math.min(.78,.52+(marketFactor-1)*.72-good.risk*.002+channel.bonus*.08));
    const salesRoll=((signal*17+current.totalWeek*23+good.id.length*9)%100)/100;
    const profitable=salesRoll<profitChance;
    const swing=.62+((signal*7+current.totalWeek*5)%42)/100;
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
    const ledgerEntry={week:current.totalWeek,good:good.name,channel:channel.name,capital:amount,fee:channel.cost,invested:batch.invested,returned,profit:returned-batch.invested,caught,heldWeeks:current.totalWeek-batch.startWeek,marketLabel:batch.marketLabel||ventureMarketLabel(marketFactor)};
    let next=applyEffect(current,{...consequence,money:returned});
    next={...next,activeVenture:null,businessRuns:(next.businessRuns||0)+1,ventureLedger:[ledgerEntry,...(next.ventureLedger||[])].slice(0,8),journal:[`经营结算：${good.name}，净结果 ${ledgerEntry.profit>=0?"+":""}${ledgerEntry.profit}€`,...next.journal].slice(0,20)};
    return {next,result,ledger:ledgerEntry,title:caught?"副业翻车了":"这批货卖完了"};
  }

  function settleVenture(){
    const batch=state.activeVenture;
    if(!batch){setToast("当前没有等待结算的经营批次。");return;}
    if(state.totalWeek<batch.readyWeek){setToast(`还需推进 ${batch.readyWeek-state.totalWeek} 周才能结算。`);return;}
    const resolved=resolveVenture(state);
    const next=resolved.next;
    if(commitState(next))return;
    setModal({type:"ventureResult",title:resolved.title,result:resolved.result,ledger:resolved.ledger});
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

  if(screen==="intro")return <Localize lang={lang}><main className="landing v2-intro">
    <div className="flagline"/>
    <nav><span className="brand"><b>AKTENLEBEN</b><small>{lang==="de"?"LEBEN IN AKTEN":"留德浮生记"}</small></span><div className="lang-switch"><button className={lang==="zh"?"active":""} onClick={()=>setLang("zh")}>中文</button><button className={lang==="de"?"active":""} onClick={()=>setLang("de")}>Deutsch</button></div></nav>
    <section className="hero"><div className="kicker">{lang==="de"?"48 WOCHEN ZWISCHEN STUDIUM, ARBEIT UND AMT":"在学业、打工与官僚机构之间活过48周"}</div><h1>{lang==="de"?<>Ankommen.<br/><em>Ab Woche eins.</em></>:<>来到德国，<br/><em>从第一周开始。</em></>}</h1><p>{lang==="de"?"Du bist als internationaler Student gerade in Deutschland gelandet. Die Immatrikulation ist noch nicht vollständig, das Zimmer nur vorläufig und dein Deutsch gerade gut genug. Studium, Nebenjobs, Visum und jeder Brief können dieses Jahr verändern.":"你是一名刚抵达德国的外国大学生：学籍尚待激活、房间是临时的、德语勉强够用，还必须靠打工维持生活。课程、考试、签证和每一封信，都可能改变这一年。"}</p>
      {savedGame?.state&&<div className="continue-card"><span>自动存档</span><b>{savedGame.state.name} · {lang==="de"?`Monat ${savedGame.state.month}, Woche ${savedGame.state.week}`:`第 ${savedGame.state.month} 月 · 第 ${savedGame.state.week} 周`}</b><small>{lang==="de"?"Auf diesem Gerät gespeichert":"进度已保存在这台设备"}</small><div><button onClick={continueGame}>{lang==="de"?"Weiterspielen":"继续游戏"} →</button><button onClick={clearSavedGame}>{lang==="de"?"Löschen":"删除存档"}</button></div></div>}
      <div className="name-setup"><label htmlFor="player-name">{lang==="de"?"Wie heißt du?":"给自己起个名字"}</label><div><input id="player-name" maxLength="18" value={playerName} onChange={event=>setPlayerName(event.target.value)} placeholder={lang==="de"?"Dein Name":"输入名字"}/><button type="button" onClick={randomizeName}>↻ {lang==="de"?"Zufällig":"随机生成"}</button></div><small>{lang==="de"?"Der Name erscheint in deiner Lebensakte.":"名字会显示在你的生活档案与自动存档中。"}</small></div>
      <div className="starting-file"><span>🎓</span><div><b>{lang==="de"?"Internationaler Student":"外国大学生"}</b><small>{lang==="de"?"1.900 € · 1.200 € Schulden · Deutsch B1 · Studienbeginn":"现金 1900€ · 债务 1200€ · 德语 B1 · 学业刚起步"}</small></div></div><div className="loop-preview"><span>{lang==="de"?"Studieren & jobben":"学习与打工"}</span><i>→</i><span>{lang==="de"?"Alltag bewältigen":"处理生活"}</span><i>→</i><span>{lang==="de"?"48 Wochen schaffen":"熬过 48 周"}</span></div><button className="primary" onClick={()=>start(PROFILES[0])}>{lang==="de"?"Flug nach Deutschland nehmen":"登上飞往德国的航班"} <span>✈</span></button></section>
    <footer><span>{lang==="de"?"Kein Studienfach nötig":"无需预选专业"}</span><span>👁 {visitCount===null?"—":visitCount} {lang==="de"?"Besuche":"次访问"}</span><span>{lang==="de"?"Jede Woche formt dein Leben":"留德生活由每周选择形成"}</span></footer>
  </main></Localize>;

  if(screen==="arrival")return <Localize lang={lang}><main className="cinematic arrival-scene"><div className="sky"><span className="cloud c1">☁</span><span className="cloud c2">☁</span><span className="flying-plane">✈</span><div className="germany-line"><i/><i/><i/></div></div><section><small>ANKUNFT · WOCHE 1</small><h1>Willkommen<br/>in Deutschland</h1><p>{lang==="de"?"Das Flugzeug ist gelandet. Das Gepäckband steht noch still, aber Universität, Krankenkasse und Bürgeramt haben dir bereits geschrieben.":"飞机落地。行李转盘还没动，你已经收到大学、保险公司和市政厅的三封邮件。"}</p><button className="primary" onClick={()=>setScreen("game")}>{lang==="de"?"Leben in Deutschland beginnen":"开始德国生活"} <span>→</span></button></section></main></Localize>;

  if(screen==="end"){
    const survived=state.month>12&&state.health>0&&state.stress<100&&state.money>0;
    const finalAbility=integrationScore(state);
    const excellent=survived&&finalAbility>=85&&state.debt<=0&&state.health>=45&&state.stress<=70;
    const stable=survived&&finalAbility>=65&&state.debt<=600;
    const outcome=excellent?"excellent":stable?"stable":survived?"probation":"failed";
    const endingTitle=outcome==="excellent"?"Angekommen?":outcome==="stable"?"Das Leben geht weiter":outcome==="probation"?"Auf Bewährung":"Tschüss Deutschland";
    const net=Math.round(state.money-state.debt+Object.entries(state.inventory).reduce((sum,[id,q])=>sum+(prices[id]||0)*q,0));
    const endingText=lang==="de"
      ?outcome==="excellent"?"Studium im Plan, schuldenfrei und trotzdem liegt schon der nächste Behördenbrief im Kasten. Angekommen ist vielleicht kein Zustand, sondern eine fortlaufende Akte.":outcome==="stable"?"Du hast 48 Wochen geschafft, den Anschluss gehalten und die Schulden unter Kontrolle gebracht. Das Leben geht weiter.":outcome==="probation"?`Du hast überlebt, aber ${finalAbility<65?"deine Ankommensfähigkeit reicht nicht":"deine Schulden sind noch zu hoch"}. Deutschland gibt dir keine Niederlage, sondern eine weitere Frist.`:state.health<=0?"Dein Körper konnte nicht mehr.":state.stress>=100?"Der Stress hat die Grenze überschritten.":"Das Konto ist leer. Dein Leben in Deutschland endet vorerst hier."
      :outcome==="excellent"?"留德能力达标、债务清零，信箱里却已经躺着下一封政府来信。所谓安顿下来，也许只是学会继续处理下一份档案。":outcome==="stable"?"你坚持了48周，留德能力达标，也把债务控制在可承受范围内。Das Leben geht weiter。":outcome==="probation"?`你活过了48周，但${finalAbility<65?"留德能力尚未达到要求":"债务仍然过高"}。德国没有立即让你离开，只给了你下一份限期整改通知。`:state.health<=0?"身体先撑不住了。":state.stress>=100?"压力突破了极限。":"账户见底，留德生活暂时在这里结束。";
    return <Localize lang={lang}><main className={`cinematic departure-scene ${outcome==="excellent"||outcome==="stable"?"continue":"farewell"}`}><div className="departure-sky"><div className="city-silhouette">▥ ▥ ▰ ▥ ▰ ▥</div><span className="departure-plane">✈</span></div><section><small>{survived?"48 WOCHEN GESCHAFFT":"ABFLUG"}</small><h1>{endingTitle}</h1><p>{endingText}</p><div className="score"><span>{lang==="de"?"Nettovermögen":"净资产"}<b>{net}€</b></span><span>{lang==="de"?"Bleibeperspektive":"留德能力"}<b>{finalAbility}</b></span><span>{lang==="de"?"Schulden":"剩余债务"}<b>{Math.round(state.debt)}€</b></span></div><button className="primary" onClick={()=>{clearSavedGame();setPlayerName(state.name||"");}}>{lang==="de"?"Noch einmal einsteigen":"重新登机"} <span>↻</span></button></section></main></Localize>;
  }

  const totalInventory=Object.values(state.inventory).reduce((a,b)=>a+b,0);
  const currentJob=JOBS.find(j=>j.id===state.jobId)||JOBS[0];
  const ability=integrationScore(state),social=socialScore(state);
  const languageBonus=Math.min(60,Math.max(0,ability-40)*2);
  const currentWage=currentJob.wage+languageBonus+(state.flags.promotion?45:0);
  const featuredChoices=weeklyChoices(state);
  const restAction=ACTIONS.find(a=>a.id==="rest");
  const tradeChoice={id:"browse-trade",icon:"🛒",name:totalInventory>0?"手里的货，涨了还是跌了？":"去市场转一圈",sub:totalInventory>0?"先看今天能卖多少钱，再决定要不要动手":"看看这周的行情，不买也没关系",risk:"先逛不算行动，第一笔成交才算"};
  const previewAction=action=>setModal({type:"actionPreview",action});
  const previewEffect=action=>{const effect=action.run(state);return {...effect,energy:(effect.energy||0)+10};};
  const nextPeriod=lang==="de"?(state.week===4?`Monat ${state.month+1} · Woche 1`:`Monat ${state.month} · Woche ${state.week+1}`):(state.week===4?`第 ${state.month+1} 月 · 第 1 周`:`第 ${state.month} 月 · 第 ${state.week+1} 周`);
  return <Localize lang={lang}><main className="v2-game">
    <div className="sticky-status">
    <header className="v2-head"><div className="current-period"><small>LEBENSAKTE · {state.name}</small><b>{lang==="de"?`Monat ${state.month} · Woche ${state.week}`:`第 ${state.month} 月 · 第 ${state.week} 周`}</b><em>{lang==="de"?"Nächste Aktion":"下次行动"} → {nextPeriod}</em></div><div className="head-tools"><div className="deadline"><small>{lang==="de"?"Jahresfortschritt":"年度进度"}</small><b>{Math.min(state.totalWeek,48)}/48</b><div className="header-weeks" aria-label={lang==="de"?"Monatsfortschritt":"本月进度"}>{[1,2,3,4].map(w=><i key={w} className={w<state.week?"done":w===state.week?"active":""}>{w}</i>)}</div></div><div className="lang-switch compact"><button className={lang==="zh"?"active":""} onClick={()=>setLang("zh")}>{lang==="de"?"ZH":"中"}</button><button className={lang==="de"?"active":""} onClick={()=>setLang("de")}>DE</button></div></div></header>
    <section className="v2-stats"><Stat label={lang==="de"?"Geld":"现金"} value={state.money} type="money"/><Stat label={lang==="de"?"Schulden":"债务"} value={state.debt} type="money" onClick={()=>setModal({type:"debtPay"})} hint={state.debt<=0?(lang==="de"?"Abbezahlt":"已还清"):(lang==="de"?"Zum Tilgen antippen":"点击还款")}/><Stat label={lang==="de"?"❤️ Gesundheit":"❤️ 健康"} value={state.health}/><Stat label={lang==="de"?"🧠 Stress":"🧠 压力"} value={state.stress} bad/></section>
    <section className="ability-stats" aria-label="能力与行政资源">
      <div title="行动会消耗精力；低于 18 时不能工作或接零工"><span>⚡ 精力</span><b>{state.energy}</b><small>{state.energy<18?"无法工作":state.energy<35?"需要休息":"可正常行动"}</small></div>
      <div title="由学业与德语共同构成；影响工资、检查和职业"><span>🎓 留德能力</span><b>{ability}</b><small>{lang==="de"?"Lohn":"工资"} +{languageBonus}€</small></div>
      <div title="由人脉与档案共同构成；影响事件损失和职业"><span>🤝 社会资源</span><b>{social}</b><small>{social>=45?"事件减损已生效":"45 后降低损失"}</small></div>
    </section>
    <div className="academic-strip"><b>🎯 {lang==="de"?"Ziele für 48 Wochen":"48周目标"}</b><span>{lang==="de"?"Bleibeperspektive mindestens 65 · Schulden höchstens 600 €":"留德能力至少 65 · 债务降至 600€ 以下"}</span><small>{lang==="de"?"85 Punkte und schuldenfrei: bestes Ende":"留德能力85＋债务清零可达成更好结局"}</small><em>🎓 {ability}/65 · 🏦 {Math.round(state.debt)}/600€</em></div>
    <div className="ticker"><b>本周消息</b><span>{lang==="de"?DE_NEWS[state.newsIndex]:news.text}</span></div>
    <div className="time-rule"><b>时间规则</b><span>⏳ 本周行动＝推进 1 周</span><span>{lang==="de"?"○ Ein Marktbesuch sowie Kauf, Verkauf und Jobwechsel kosten keine Zeit":"○ 每周访问一个市场；买卖与换职业不额外耗时"}</span></div>
    <nav className="tabs">{[["actions","本周行动"],["career","成长与职业"],["journal","记录"],["guestbook","留言板"]].map(([id,label])=><button className={tab===id?"active":""} key={id} onClick={()=>setTab(id)}>{label}</button>)}</nav>
    </div>

    <section className="v2-panel">
      {tab==="market"&&<TradeLedger state={state} lang={lang} prices={prices}/>}
      {tab==="guestbook"&&<><div className="panel-title"><div><small>GÄSTEBUCH</small><h2>{lang==="de"?"Gästebuch":"访客留言板"}</h2></div><span>👁 {visitCount===null?"—":visitCount} {lang==="de"?"Besuche":"次访问"}</span></div>
        <form className="guestbook-form" onSubmit={submitGuestbook}><label><span>{lang==="de"?"Name":"昵称"}</span><input maxLength="24" value={guestbookForm.nickname} onChange={event=>setGuestbookForm({...guestbookForm,nickname:event.target.value})} placeholder={lang==="de"?"Maximal 24 Zeichen":"最多24个字"}/></label><label><span>{lang==="de"?"Nachricht":"留言"}</span><textarea maxLength="300" rows="4" value={guestbookForm.message} onChange={event=>setGuestbookForm({...guestbookForm,message:event.target.value})} placeholder={lang==="de"?"Was möchtest du anderen Studierenden sagen?":"想对其他留学生或作者说些什么？"}/><small>{guestbookForm.message.length}/300</small></label><button disabled={guestbookLoading}>{guestbookLoading?(lang==="de"?"Wird gespeichert…":"正在提交…"):(lang==="de"?"Nachricht hinterlassen":"提交留言")}</button>{guestbookError&&<p className="guestbook-error">{guestbookError}</p>}</form>
        <div className="guestbook-list">{guestbookLoading&&!messages.length?<div className="empty">{lang==="de"?"Gästebuch wird geladen…":"正在读取留言…"}</div>:messages.length?messages.map(item=><article key={item.id}><header><b>{item.nickname}</b><time>{new Date(item.created_at).toLocaleDateString(lang==="de"?"de-DE":"zh-CN")}</time></header><p>{item.message}</p></article>):!guestbookError&&<div className="empty">{lang==="de"?"Noch keine Einträge. Schreib den ersten.":"还没有留言，来写下第一条吧。"}</div>}</div>
      </>}
      {tab==="actions"&&<div id="weekly-actions"><div className="panel-title decision-title"><div><small>WOCHE {state.totalWeek+1} · 还剩 {48-state.totalWeek} 周</small><h2>{state.marketVisitWeek===state.totalWeek?"这周，你选择了交易":"这周，把时间花在哪里？"}</h2></div><span>{state.marketVisitWeek===state.totalWeek?"完成交易后进入下一周":"四种主动方向，只能最终执行一种"}</span></div><div className="weekly-pressure"><b>必须在第 48 周前留下来</b><span>🎓 留德能力 {ability}/65</span><span>🏦 债务 {Math.round(state.debt)}/600€</span><em>{state.week===4?`⚠ 本周结束扣生活费 ${BASE_MONTHLY_COST}€`:"下一次月末结算还有 "+(5-state.week)+" 周"}</em></div><div className="rumor-card"><small>本周线索 · 会影响际遇和市场，但不保证准确</small><p>{lang==="de"?DE_NEWS[state.newsIndex]:news.text}</p></div><div className="featured-actions five-actions">{[...featuredChoices,tradeChoice].map(a=>{const isTrade=a.id==="browse-trade";return <button key={a.id} className={isTrade?"trade-choice":""} onClick={()=>isTrade?openTrading():previewAction(a)} disabled={!isTrade&&state.marketVisitWeek===state.totalWeek}><span className="choice-kind">{isTrade?"淘货":a.category}</span><i>{a.id==="work"&&state.energy<35?"🛌":a.icon}</i><b>{a.id==="work"?state.energy<35?"先歇口气吧":"去上班，还是歇一周":a.name}</b><small>{a.id==="work"?state.energy<18?`这状态硬撑也干不了活，先把觉补回来`:`上班能拿约 ${currentWage}€；真累了，也可以少赚一周换口气`:a.sub}</small>{(a.risk||isTrade)&&<strong>{isTrade?a.risk:a.risk}</strong>}<em>{isTrade?(state.marketVisitWeek===state.totalWeek?"再看看手里的货 →":totalInventory>0?"看看赚了还是赔了 →":"进去转转 →"):"先查看详情 →"}</em></button>})}</div><details className="more-actions"><summary>展开看病与其他生活安排</summary><div className="action-grid">{ACTIONS.filter(a=>!["work","rest","study","learn","social"].includes(a.id)).map(a=><button key={a.id} onClick={()=>a.planner?setModal({type:"paperPlanner"}):previewAction(a)} disabled={(a.id==="gig"&&state.energy<18)||state.marketVisitWeek===state.totalWeek}><i>{a.icon}</i><span><b>{a.name}</b><small>{a.sub}</small></span><em>先查看</em></button>)}</div></details><div className="month-cost"><b>行动之后，生活仍可能找上门</b><span>查看和返回不推进时间；确定行动后，约六成周次会随机遇到办事推诿、系统矛盾或教条规定。</span></div></div>}
      {tab==="actions"&&<>{state.marketVisitWeek===state.totalWeek&&<div className="trade-selected-action compact"><i>🛒</i><span><small>本周行动已锁定</small><b>交易进行中</b><p>可以继续买卖；完成入口已固定在屏幕底部。</p></span></div>}<WeeklyMarket state={state} lang={lang} prices={prices} onTrade={trade}/></>}

      {tab==="market"&&<><div className="panel-title"><div><small>NEBENGEWERBE</small><h2>副业账本与进阶经营</h2></div><span>可选的进阶玩法</span></div><p className="market-tip">不想研究复杂规则，可以直接在“本周行动”选择“经营本周推荐商品”，系统会依据本周消息完成进货和销售。这里保留给想自己挑商品、渠道和投入金额的玩家。</p>
        <div className="venture-block"><div className="subhead"><b>① 选择要卖的东西</b><span>消息改变概率，不保证赚钱</span></div><div className="venture-goods">{HUSTLE_GOODS.map(g=>{const factor=ventureMarketFactor(state.newsIndex,g.id);const label=ventureMarketLabel(factor);return <button key={g.id} className={ventureGood===g.id?"selected":""} onClick={()=>setVentureGood(g.id)}><i>{g.icon}</i><b>{g.name}</b><small>预期毛利 {Math.round(g.margin*100)}% · 风险 {g.risk}</small><em className={factor>1.08?"market-up":factor<.93?"market-down":"market-flat"}>{label}{factor!==1?" · 盈利概率变化":""}</em></button>})}</div>
        <div className="subhead"><b>② 选择销售渠道</b></div><div className="channel-row">{CHANNELS.map(c=><button key={c.id} className={ventureChannel===c.id?"selected":""} onClick={()=>setVentureChannel(c.id)}><i>{c.icon}</i><span><b>{c.name}</b><small>{c.note}</small></span></button>)}</div>
        {state.activeVenture?<div className="active-venture"><div><small>进行中的经营批次 · {state.activeVenture.marketLabel||"行情平稳"}</small><b>{state.activeVenture.goodName} · {state.activeVenture.channelName}</b></div><span>已投入 <b>{state.activeVenture.invested}€</b></span><span>{state.totalWeek>=state.activeVenture.readyWeek?"现在可以结算":"还需推进 1 周"}</span><button onClick={settleVenture} disabled={state.totalWeek<state.activeVenture.readyWeek}>{state.totalWeek>=state.activeVenture.readyWeek?"查看行情并结算":"等待时间推进"}</button></div>:<div className="capital-box"><div><b>③ 开始经营批次</b><strong>{ventureAmount} €</strong></div><input aria-label="投入本金" type="range" min="50" max={Math.max(50,Math.min(800,state.money-250))} step="50" value={Math.min(ventureAmount,Math.max(50,state.money-250))} onChange={e=>setVentureAmount(Number(e.target.value))}/><div className="cost-preview"><span>商品本金<b>{ventureAmount}€</b></span><span>渠道费用<b>{CHANNELS.find(c=>c.id===ventureChannel)?.cost||0}€</b></span><span>总投入<b>{ventureAmount+(CHANNELS.find(c=>c.id===ventureChannel)?.cost||0)}€</b></span></div><small>开始批次不耗时间，但资金会立刻锁定；至少推进一周后才能结算。</small><button onClick={startVenture}>投入 {ventureAmount+(CHANNELS.find(c=>c.id===ventureChannel)?.cost||0)}€ 开始批次 <span>→</span></button></div>}
        {(state.ventureLedger||[]).length>0&&<div className="venture-ledger"><div className="subhead"><b>最近经营账本</b><span>投入 → 回收 → 净结果</span></div>{state.ventureLedger.slice(0,5).map((l,i)=><p key={i}><span>{l.good}<small>{l.channel}</small></span><b>{l.invested}€ → {l.returned}€</b><em className={l.profit>=0?"profit":"loss"}>{l.profit>=0?"+":""}{l.profit}€</em></p>)}</div>}</div>
      </>}

      {tab==="career"&&<><div className="panel-title"><div><small>ENTWICKLUNG & BERUF</small><h2>成长与职业</h2></div><span>只关注两个成长指标</span></div><p className="career-help">“留德能力”整合学业与德语，“社会资源”整合人脉与档案。它们直接决定事件减损、学业检查、工资成长和职业解锁。</p><ProgressBenefits state={state} lang={lang}/><div className="language-bonus"><span>留德能力工资加成<b>+{languageBonus}€ / 周</b></span><span>事件综合减损<b>{social>=45?"已生效":"社会资源45后生效"}</b></span></div><div className="jobs">{JOBS.map(j=>{const unlocked=ability>=j.abilityReq&&social>=j.socialReq;return <button key={j.id} className={state.jobId===j.id?"selected":""} onClick={()=>switchJob(j)}><i>{j.icon}</i><span><b>{j.name}</b><small>周薪 {j.wage}€ · 精力 {j.energy} · 健康 {j.health} · 压力 {j.stress}{j.abilityReq?` · 留德能力 ${j.abilityReq} · 社会资源 ${j.socialReq}`:" · 无门槛"}</small></span><em>{state.jobId===j.id?"当前本职":unlocked?"设为本职":"未解锁"}</em></button>})}</div><div className="debt-box"><span><small>私人债务</small><b>{Math.round(state.debt)} €</b></span><p>每月增长 3.5%，每月最多偿还一次。不能在同一个月连续清空债务。</p><button onClick={payDebt} disabled={state.lastDebtPaymentMonth===state.month||state.debt<=0}>{state.debt<=0?"债务已还清":state.lastDebtPaymentMonth===state.month?"本月已还款":"本月偿还最多 250€"}</button></div></>}

      {tab==="journal"&&<><div className="panel-title"><div><small>VERLAUF</small><h2>生活记录</h2></div><span>{state.seen.length} 个事件</span></div><div className="journal">{state.journal.length?state.journal.map((j,i)=><p key={i}><i>{String(state.journal.length-i).padStart(2,"0")}</i>{j}</p>):<div className="empty">你的档案目前还很薄。系统会设法改变这一点。</div>}</div></>}
    </section>

    {saveError&&<div className="toast save-warning">{lang==="de"?"Automatisches Speichern ist in diesem Browser blockiert. Bitte erlaube Website-Daten.":"浏览器阻止了自动存档，请允许此网站保存本地数据。"}</div>}
    {state.marketVisitWeek===state.totalWeek&&!modal&&<div className="trade-finish-dock"><span><small>本周已选择交易</small><b>还可以继续买卖</b></span><button onClick={finishTradeWeek}>结束交易，进入下一周 →</button></div>}
    {toast&&<button className="toast" onClick={()=>setToast("")}>{toast}<span>×</span></button>}
    {modal?.type==="debtPay"&&<div className="modal-backdrop"><article className="event-modal debt-modal"><div className="modal-top"><span>SCHULDEN</span><b>{lang==="de"?"Schulden tilgen":"偿还债务"}</b></div><h2>{Math.round(state.debt)} €</h2><p>{lang==="de"?"Einmal pro Monat kannst du bis zu 250 € tilgen. Mindestens 200 € müssen für den Alltag auf dem Konto bleiben.":"每月可以还款一次，最多偿还 250€；账户必须至少保留 200€ 生活备用金。"}</p><div className="debt-preview"><span>{lang==="de"?"Verfügbares Geld":"当前现金"}<b>{Math.round(state.money)}€</b></span><span>{lang==="de"?"Tilgung jetzt":"本次可还"}<b>{Math.max(0,Math.round(Math.min(250,state.money-200,state.debt)))}€</b></span></div><button className="primary" onClick={payDebt} disabled={state.lastDebtPaymentMonth===state.month||state.debt<=0||state.money<=200}>{state.debt<=0?(lang==="de"?"Schulden abbezahlt":"债务已还清"):state.lastDebtPaymentMonth===state.month?(lang==="de"?"Diesen Monat bereits getilgt":"本月已经还款"):state.money<=200?(lang==="de"?"Nicht genug Reserve":"现金不足，需保留 200€"):(lang==="de"?"Jetzt tilgen":"立即还款")} <span>→</span></button><button className="secondary" onClick={()=>setModal(null)}>{lang==="de"?"Schließen":"暂不还款"}</button></article></div>}
    {modal?.type==="event"&&modal.minimized&&<button className="pending-event" onClick={()=>setModal({...modal,minimized:false})}><span>{modal.event.office}</span><b>待处理：{modal.event.title}</b><em>继续处理 →</em></button>}
    {modal&&!modal.minimized&&modal.type!=="debtPay"&&<div className="modal-backdrop"><article className="event-modal">
      {modal.type==="actionPreview"?<><div className="modal-top"><span>{modal.action.category||"生活安排"}</span><b>本周方案 · 尚未执行</b></div><div className="decision-state optional"><b>现在只是查看方案</b><span>可以返回比较其他选择；确认后才会推进一周。下方已计入每周自然恢复的 10 点精力。</span></div><h2>{modal.action.id==="work"?`这周去挣钱，还是先喘口气？`:modal.action.name}</h2><p>{modal.action.id==="work"?`去做 ${currentJob.name}，大概能拿 ${currentWage}€。要是已经撑不住，少赚一周也比把身体拖垮强。`:modal.action.sub}</p><div className="action-effect-preview">{Object.entries(previewEffect(modal.action)).map(([k,v])=><span key={k}><small>{effectNames[k]}</small><b className={v>=0?"profit":"loss"}>{v>0?"+":""}{v}{k==="money"?"€":""}</b></span>)}</div>{modal.action.risk&&<div className="preview-risk">{modal.action.risk}</div>}<button className="primary" disabled={modal.action.id==="work"&&state.energy<18} onClick={()=>doAction(modal.action,true)}>{modal.action.id==="work"?(state.energy<18?"这状态真上不了班":"去上班，推进一周"):"就这么过这一周"} <span>→</span></button>{modal.action.id==="work"&&<button className="recovery-choice" onClick={()=>doAction(restAction,true)}><b>🛌 这周先不硬撑</b><span>精力共恢复 40 · 健康 +8 · 压力 -10 · 生活支出 18€</span><em>睡够了再说 →</em></button>}<button className="secondary" onClick={()=>setModal(null)}>← 返回比较其他选择</button></>:modal.type==="paperPlanner"?<><div className="modal-top"><span>AKTIONSWAHL</span><b>行动方案 · 尚未执行</b></div><div className="decision-state optional"><b>现在只是查看方案</b><span>尚未消耗时间，可以返回改选工作、学习、休息或交易。</span></div><h2>这周具体跑什么手续？</h2><p>只有选择下面一项，才会把“处理手续”确定为本周行动并推进一周。</p><div className="paper-tasks">{PAPER_TASKS.map(task=><button key={task.id} onClick={()=>doPaperTask(task)}><b>{task.icon} {task.name}</b><span>{task.sub}</span><em>{Object.entries(task.effect).map(([k,v])=>`${effectNames[k]} ${v>0?"+":""}${v}`).join(" · ")}</em></button>)}</div><button className="secondary" onClick={()=>setModal(null)}>← 返回本周选择 · 不推进时间</button></>:modal.type==="event"?<><div className="modal-top"><span>{modal.event.office}</span><b>周末事件 · 已经发生</b></div><div className="decision-state required"><b>本周行动已经完成</b><span>这个事件必须处理；可以暂时收起查看状态，但不能改选本周行动。</span></div><div className="time-passed">{modal.timeLabel}<small>{modal.actionName}已经用掉一周</small></div><h2>{modal.event.title}</h2><p>{modal.event.text}</p><div className="modal-choices">{modal.event.choices.map(c=><button key={c.label} onClick={()=>chooseEvent(c,modal.event)}><b>{c.label}</b><span>{Object.entries(c.effect||{}).map(([k,v])=>`${effectNames[k]} ${v>0?"+":""}${v}`).join(" · ")}</span></button>)}</div><button className="secondary inspect-state" onClick={()=>setModal({...modal,minimized:true})}>暂时收起查看状态 · 之后仍需处理</button></>:modal.type==="weekResult"?<><div className="modal-top"><span>WOCHENABSCHLUSS</span><b>周结算</b></div><div className="time-passed large">{modal.timeLabel}<small>时间已经推进</small></div><h2>这一周结束了</h2><p>{modal.actionName}已经完成。{modal.monthSummary||"新的市场价格和生活状态已经更新。"}</p><button className="primary" onClick={()=>setModal(null)}>进入新的一周 <span>→</span></button></>:modal.type==="ventureResult"?<><div className="modal-top"><span>NEBENGEWERBE</span><b>经营结算</b></div><div className="holding-period">持有 {modal.ledger.heldWeeks} 周后结算<small>开始和结算本身均不耗时间</small></div><h2>{modal.title}</h2><p>{modal.result}</p><div className="venture-result-numbers"><span>总投入<b>{modal.ledger.invested}€</b><small>本金 {modal.ledger.capital}€ + 渠道 {modal.ledger.fee}€</small></span><span>回收金额<b>{modal.ledger.returned}€</b><small>实际回到账户的价值</small></span><span>净利润<b className={modal.ledger.profit>=0?"profit":"loss"}>{modal.ledger.profit>=0?"+":""}{modal.ledger.profit}€</b><small>回收 − 总投入</small></span></div><button className="primary" onClick={()=>setModal(null)}>完成结算 <span>→</span></button></>:<><div className="modal-top"><span>AUSWIRKUNG</span><b>处理结果</b></div>{modal.timeLabel&&<div className="time-passed">{modal.timeLabel}<small>事件发生在已经消耗的这一周</small></div>}<h2>{modal.choice.label}</h2><p>{modal.choice.result}</p>{modal.languageRelief>0&&<div className="language-relief">🗣️ 德语能力令本次压力额外减少 {modal.languageRelief} 点</div>}<button className="primary" onClick={()=>setModal(null)}>进入新的一周 <span>→</span></button></>}
    </article></div>}
  </main></Localize>;
}
