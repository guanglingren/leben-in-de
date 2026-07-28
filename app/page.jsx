import React, { useMemo, useState } from "react";

const PROFILES = [
  {
    id: "worker",
    icon: "🧰",
    name: "工薪家庭",
    detail: "本地出生 · 租房 · 一份稳定但不轻松的工作",
    stats: { money: 2300, energy: 75, health: 78, stress: 24, paperwork: 35 }
  },
  {
    id: "newcomer",
    icon: "🧳",
    name: "新移民",
    detail: "德语 B1 · 临时居留 · 对每封信都格外小心",
    stats: { money: 1750, energy: 82, health: 80, stress: 32, paperwork: 15 }
  },
  {
    id: "single",
    icon: "🛒",
    name: "单亲家长",
    detail: "一个孩子 · 兼职工作 · 等待住房补贴",
    stats: { money: 1450, energy: 60, health: 72, stress: 42, paperwork: 42 }
  }
];

const EVENTS = [
  {
    office: "BÜRGERAMT · 居民事务局",
    stamp: "仅限本人",
    title: "你的姓，被系统少打了一个字母",
    text: "新身份证寄到了，但姓氏拼写错误。柜台承认是录入失误，却说“已制成的证件不能直接修改”。你必须重新预约，并再次携带出生证明原件。",
    note: "下一个可预约时间：7 周后",
    choices: [
      { label: "重新预约，先忍着用", hint: "花时间，留下后患", effect: { energy: -10, stress: 8, paperwork: 8 }, result: "你抢到了清晨 07:12 的预约。错误证件暂时还能用——只要别碰上特别认真的人。" },
      { label: "现场要求主管处理", hint: "可能省时间，也可能白等", effect: { energy: -18, stress: 13, paperwork: 15 }, result: "等待 96 分钟后，主管盖了一个章。没人解释为什么这个章刚才不能盖。" }
    ]
  },
  {
    office: "KRANKENKASSE · 医疗保险",
    stamp: "材料不全",
    title: "医保卡突然失效",
    text: "家庭医生的读卡器显示你“当前无保险”。保险公司电话里确认保费一直在扣，但系统需要你书面证明你仍住在登记地址。",
    note: "电话等待时间：43 分钟",
    choices: [
      { label: "自费看病，以后报销", hint: "立即解决，但钱未必回来", effect: { money: -180, health: 8, stress: 4 }, result: "医生看完了病。报销申请需要医生盖章，而医生说账单已经开出，不能补盖。" },
      { label: "先寄 Meldebescheinigung", hint: "省钱，但拖延治疗", effect: { health: -12, energy: -8, paperwork: 12 }, result: "信寄到了隔壁部门。对方会内部转交，预计处理时间为‘若干周’。" }
    ]
  },
  {
    office: "DEUTSCHE BAHN · 铁路",
    stamp: "系统故障",
    title: "你的火车取消了，但并没有“取消”",
    text: "通勤列车停在半路，广播说终点站改变。App 仍显示准点，因此自动赔偿系统认定旅程正常完成。",
    note: "你将在上班后 51 分钟到达",
    choices: [
      { label: "打车去公司", hint: "保住信誉，损失现金", effect: { money: -64, stress: 3 }, result: "出租车比火车快。公司表示理解，但提醒你下次应当‘预留交通风险’。" },
      { label: "继续等，并截屏留证", hint: "省钱，消耗精力", effect: { energy: -14, stress: 9, paperwork: 5 }, result: "客服回复：截屏不能证明你本人在这趟车上，请提供列车员证明。" }
    ]
  },
  {
    office: "FINANZAMT · 税务局",
    stamp: "请勿回复",
    title: "你收到了一封无法回复的信",
    text: "税务局要求你在 14 天内解释一笔两年前的收入。信末尾写着“本邮箱不接收邮件”，电话只在周二和周四 9:00–11:00 开放。",
    note: "今天：星期五",
    choices: [
      { label: "请税务顾问代办", hint: "可靠，但价格不友好", effect: { money: -320, paperwork: 18, stress: -8 }, result: "税务顾问用了四分钟完成表格，并收取了最低一小时费用。" },
      { label: "自己研究并寄挂号信", hint: "便宜，但很费神", effect: { energy: -20, stress: 12, paperwork: 12 }, result: "你按时寄出。三周后收到提醒，因为扫描中心尚未把信录入系统。" }
    ]
  },
  {
    office: "KITA · 幼儿园",
    stamp: "无空位",
    title: "法律保证有托位，幼儿园没有托位",
    text: "市政府确认孩子依法享有托儿名额，同时通知全区没有空位。你可以起诉市政府，但诉讼期间仍需自己照看孩子。",
    note: "候补名单位置：未知",
    choices: [
      { label: "减少工时自己照看", hint: "压力下降，收入减少", effect: { money: -380, energy: -6, stress: -4 }, result: "雇主同意临时减少工时，但无法保证以后恢复原岗位。" },
      { label: "申请紧急名额", hint: "文书战开始了", effect: { energy: -17, stress: 10, paperwork: 20 }, result: "申请表要求雇主证明你必须工作；雇主要求幼儿园证明你没有名额。" }
    ]
  },
  {
    office: "HAUSVERWALTUNG · 物业",
    stamp: "不属我方",
    title: "暖气坏了，各方都很遗憾",
    text: "物业说暖气属于房东负责，房东说整栋楼系统由物业管理，维修公司说只有物业能下单。室内温度降到 15°C。",
    note: "室外温度：-3°C",
    choices: [
      { label: "买电暖器先撑过去", hint: "立刻暖和，电费上涨", effect: { money: -145, health: 6, stress: 2 }, result: "房间暖了。一个月后能源公司根据本月用量上调了全年预付款。" },
      { label: "书面限期要求维修", hint: "依法办事，但身体受罪", effect: { health: -9, energy: -10, paperwork: 13 }, result: "限期函有效。维修预约定在十天后，时间窗口 08:00–18:00。" }
    ]
  },
  {
    office: "AUSLÄNDERBEHÖRDE · 外管局",
    stamp: "等待审核",
    title: "工作许可卡在另一张工作许可上",
    text: "新工作合同需要外管局批准，外管局要求雇主确认职位；雇主则要求你先出示有效工作许可。",
    note: "当前居留：还有 23 天到期",
    choices: [
      { label: "反复抄送双方邮件", hint: "努力制造一次沟通", effect: { energy: -16, stress: 12, paperwork: 18 }, result: "第七封邮件后，有人手动把两个附件放进了同一个档案。" },
      { label: "接受过渡证明继续等", hint: "合法，但很多人不认识它", effect: { money: -80, stress: 8, paperwork: 10 }, result: "你拿到 Fiktionsbescheinigung。银行柜员说从没见过，需要请示主管。" }
    ]
  },
  {
    office: "RUNDFUNKBEITRAG · 广播费",
    stamp: "自动生成",
    title: "同一个住址，被收了两次广播费",
    text: "你和室友已经共用一个缴费号，但系统又给你建立了新账户。热线表示可以在线更正；在线表格却不接受你的旧缴费号格式。",
    note: "催款附加费：8 欧元",
    choices: [
      { label: "先交钱避免催收", hint: "简单，但退款很慢", effect: { money: -63, stress: -3 }, result: "系统立即确认收款。退款需要另填一份纸质表格。" },
      { label: "寄信解释并拒绝付款", hint: "坚持原则，承受风险", effect: { energy: -8, stress: 11, paperwork: 11 }, result: "六周没有回复，但下一封催款信准时到达。" }
    ]
  }
];

const clamp = (n) => Math.max(0, Math.min(100, n));

function Meter({ label, value, money, color }) {
  return (
    <div className="meter">
      <div className="meter-head"><span>{label}</span><strong>{money ? `${value} €` : value}</strong></div>
      {!money && <div className="track"><i style={{ width: `${value}%`, background: color }} /></div>}
    </div>
  );
}

export default function Home() {
  const [screen, setScreen] = useState("intro");
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [month, setMonth] = useState(1);
  const [eventIndex, setEventIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const event = EVENTS[eventIndex % EVENTS.length];
  const date = useMemo(() => `${2026 + Math.floor((month - 1) / 12)} 年 ${((month - 1) % 12) + 1} 月`, [month]);

  function start(selected) {
    setProfile(selected);
    setStats({ ...selected.stats });
    setMonth(1);
    setEventIndex(0);
    setHistory([]);
    setResult(null);
    setScreen("game");
  }

  function choose(choice) {
    const next = { ...stats };
    Object.entries(choice.effect).forEach(([key, delta]) => {
      next[key] = key === "money" ? next[key] + delta : clamp(next[key] + delta);
    });
    setStats(next);
    setResult({ ...choice, next });
    setHistory((old) => [{ month: date, title: event.title, choice: choice.label }, ...old]);
  }

  function advance() {
    if (month >= 12 || result.next.money <= 0 || result.next.health <= 0 || result.next.stress >= 100) {
      setScreen("end");
      return;
    }
    const monthly = {
      ...result.next,
      money: result.next.money + (profile.id === "worker" ? 180 : profile.id === "newcomer" ? 90 : 35),
      energy: clamp(result.next.energy + 6),
      stress: clamp(result.next.stress - 3)
    };
    setStats(monthly);
    setMonth((m) => m + 1);
    setEventIndex((i) => i + 1);
    setResult(null);
  }

  const ending = stats && (stats.money <= 0 ? "账户见底" : stats.health <= 0 ? "健康透支" : stats.stress >= 100 ? "压力崩溃" : "你熬过了一整年");

  if (screen === "intro") return (
    <main className="landing">
      <div className="flagline" />
      <nav><span className="brand">DEUTSCHLAND<br/><b>浮生记</b></span><button className="sound" aria-label="声音">◉</button></nav>
      <section className="hero">
        <div className="kicker">EIN GANZ NORMALES LEBEN · 一种非常正常的生活</div>
        <h1>规则没有错。<br/><em>出错的是你。</em></h1>
        <p>在一个精密运转的社会里，努力工作、按时缴费、提前预约——然后祈祷系统里没有人把你的名字拼错。</p>
        <div className="notice"><span>!</span><div><b>温馨提示</b><small>本游戏包含等待、重复填表、无法接通的电话，以及“这不归我们负责”。</small></div></div>
        <button className="primary" onClick={() => setScreen("profiles")}>领取你的生活档案 <span>→</span></button>
        <button className="text-button" onClick={() => setScreen("about")}>这是一款什么游戏？</button>
      </section>
      <footer><span>无 Cookie · 无需注册</span><span>预计生存时间 8 分钟</span></footer>
    </main>
  );

  if (screen === "about") return (
    <main className="paper-page">
      <button className="back" onClick={() => setScreen("intro")}>← 返回</button>
      <div className="document">
        <span className="doc-no">VORGANG 2026/07–DE</span>
        <h2>这里没有英雄，<br/>只有正在办事的人。</h2>
        <p>《德国浮生记》是一款短篇生活模拟游戏。它关注普通居民——无论本地出生还是拥有外国背景——如何在房租、工作、家庭和层层手续之间保持体面。</p>
        <p>游戏批评的是系统性僵化、信息孤岛与机械执行，不是某个民族，也不是每一位公共服务人员。</p>
        <button className="primary" onClick={() => setScreen("profiles")}>我已阅读并理解 <span>✓</span></button>
      </div>
    </main>
  );

  if (screen === "profiles") return (
    <main className="paper-page">
      <button className="back" onClick={() => setScreen("intro")}>← 返回首页</button>
      <header className="section-head"><small>SCHRITT 1 VON 1</small><h2>选择一份生活档案</h2><p>没有“简单模式”，只有不同形式的困难。</p></header>
      <div className="profiles">
        {PROFILES.map((item) => (
          <button className="profile-card" key={item.id} onClick={() => start(item)}>
            <span className="avatar">{item.icon}</span><span><b>{item.name}</b><small>{item.detail}</small></span><i>→</i>
          </button>
        ))}
      </div>
      <p className="fineprint">档案数据仅用于本局游戏，并将在你关掉页面时像某些部门的申请材料一样消失。</p>
    </main>
  );

  if (screen === "end") return (
    <main className="paper-page end-page">
      <div className="end-stamp">{month >= 12 ? "已存活" : "已结案"}</div>
      <h2>{ending}</h2>
      <p>{month >= 12 ? "这一年，你没有战胜系统，但学会了保留每一封信、每一张截图和每一个 Aktenzeichen。" : "生活不是输在某一次选择，而是在无数次小小的消耗中慢慢失去余地。"}</p>
      <div className="score"><span>坚持月数 <b>{Math.min(month, 12)}</b></span><span>处理事项 <b>{history.length}</b></span><span>最终余额 <b>{stats.money} €</b></span></div>
      <button className="primary" onClick={() => setScreen("profiles")}>换一个身份再来 <span>↻</span></button>
      <button className="text-button" onClick={() => setScreen("intro")}>返回首页</button>
    </main>
  );

  return (
    <main className="game">
      <header className="game-head">
        <div><small>LEBENSAKTE</small><b>德国浮生记</b></div>
        <div className="date"><small>当前月份</small><b>{date}</b></div>
      </header>
      <section className="status">
        <Meter label="可用资金" value={stats.money} money />
        <Meter label="精力" value={stats.energy} color="#d9a21b" />
        <Meter label="健康" value={stats.health} color="#4f7857" />
        <Meter label="压力" value={stats.stress} color="#bd3c2f" />
      </section>
      <div className="progress-row"><span>年度进度</span><div className="dots">{Array.from({length: 12}, (_, i) => <i key={i} className={i < month ? "done" : ""} />)}</div><b>{month}/12</b></div>

      <article className={`event-card ${result ? "resolved" : ""}`}>
        <div className="card-top"><span>{event.office}</span><b>{event.stamp}</b></div>
        <div className="case-number">AZ: {String(eventIndex + 1).padStart(3, "0")}/26 · VORGANG IN BEARBEITUNG</div>
        <h1>{event.title}</h1>
        <p>{event.text}</p>
        <div className="event-note"><span>⌛</span>{event.note}</div>
        {!result ? (
          <div className="choices">
            {event.choices.map((choice) => (
              <button key={choice.label} onClick={() => choose(choice)}>
                <span><b>{choice.label}</b><small>{choice.hint}</small></span><i>→</i>
              </button>
            ))}
          </div>
        ) : (
          <div className="result">
            <small>AUSWIRKUNG · 处理结果</small>
            <p>{result.result}</p>
            <div className="effects">
              {Object.entries(result.effect).map(([key, value]) => <span className={value > 0 && key !== "paperwork" ? "bad" : value < 0 && key !== "money" ? "good" : ""} key={key}>{({money:"资金",energy:"精力",health:"健康",stress:"压力",paperwork:"手续"}[key])} {value > 0 ? "+" : ""}{value}{key === "money" ? "€" : ""}</span>)}
            </div>
            <button className="primary" onClick={advance}>{month >= 12 ? "查看年度结算" : "进入下个月"} <span>→</span></button>
          </div>
        )}
      </article>
      <p className="game-foot">系统状态：正常运行 · 申诉不影响执行</p>
    </main>
  );
}
