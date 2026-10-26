
const $ = (id) => document.getElementById(id);
const titleScreen = $("title-screen");
const storyScreen = $("story-screen");
const mapScreen = $("map-screen");
const explorationScreen = $("exploration-screen");
const saveMenu = $("save-menu");

const storyCGElement = $("story-cg");
const storyClickArea = $("story-click-area");

const narration = $("narration");
const narrationText = $("narration-text");

const dialogueBox = $("dialogue-box");
const nameBox = $("name-box");
const dialogueText = $("dialogue-text");
const dialogueHint = $("dialogue-hint");


const storyPortraitLeft = $("portrait-left");
const storyPortraitRight = $("portrait-right");

const choicePanel = $("choice-panel");
const toast = $("toast");
const langToggleButton = $("lang-toggle-button");
let currentLanguage = 'zh'; 


const speakerNamesEn = {
    "灵泊": "Lingbo",
    "女人": "Woman",
    "老鱼": "Mr.Yu",
    "苗苗": "Miaomiao",
    "？？": "??"
};

const uiStrings = {
    zh: {
        startGame: "开始游戏",
        save: "存档",
        continueHint: "点击继续 ▸",
        continueHintAnywhere: "点击任意处继续 ▸",
        idCardObtained: "获得：ID卡",
        passObtained: "获得：通行证",
        switchedToZh: "已切换至中文",
        switchedToEn: "Switched to English"
    },
    en: {
        startGame: "Start Game",
        save: "Save",
        continueHint: "Click to continue ▸",
        continueHintAnywhere: "Click anywhere to continue ▸",
        idCardObtained: "Obtained: ID Card",
        passObtained: "Obtained: Pass",
        switchedToZh: "已切换至中文",
        switchedToEn: "Switched to English"
    }
};

function getDisplayText(eventOrStep) {
    if (!eventOrStep) return "";
    if (currentLanguage === 'en' && typeof eventOrStep.en === "string" && eventOrStep.en.trim() !== "") {
        return eventOrStep.en;
    }
    return eventOrStep.text || "";
}

function getDisplaySpeaker(eventOrStep) {
    if (!eventOrStep) return "";
    if (currentLanguage === 'en' && eventOrStep.speaker) {
        return speakerNamesEn[eventOrStep.speaker] || eventOrStep.speaker;
    }
    return eventOrStep.speaker || "";
}

const startButtonEl = $("start-button");
const storySaveButtonEl = $("story-save-button");
const mapSaveButtonEl = $("map-save-button");
const continueHintEl = $("continue-hint");

function applyUILanguage() {
    const s = uiStrings[currentLanguage];
    if (startButtonEl) startButtonEl.textContent = s.startGame;
    if (continueHintEl) continueHintEl.textContent = s.continueHint;
    if (dialogueHint) dialogueHint.textContent = s.continueHint;
    if (explorationHint) explorationHint.textContent = s.continueHintAnywhere;
}

let currentExplorationStep = null;

const SAVE_KEY = "lingbo_horror_rpg_save_v2";



let currentScreen = "title";
let currentEventId = "1";
let toastTimer = null;
let isTeleporting = false;

let isTyping = false;
let typingTimer = null;

function typeWriter(element, text, callback) {
    if (!element) return;
    clearInterval(typingTimer);
    isTyping = true;
    element.textContent = "";
    let index = 0;
    typingTimer = setInterval(() => {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
        } else {
            clearInterval(typingTimer);
            isTyping = false;
            if (callback) callback();
        }
    }, 30);
}

function finishTyping(element, text, callback) {
    clearInterval(typingTimer);
    if (element) element.textContent = text;
    isTyping = false;
    if (callback) callback();
}




const bgmAudio = new Audio();
bgmAudio.loop = true;
bgmAudio.volume = 0.6;
let currentBgmSrc = "";

function playBgm(src) {
    if (!src) return;
    if (currentBgmSrc === src && !bgmAudio.paused) return;
    currentBgmSrc = src;
    bgmAudio.src = src;
    bgmAudio.play().catch(() => {
        
    });
}

const appearAudio = new Audio("sound/appear.mp3");
appearAudio.volume = 0.7;

function playAppearSound() {
    try {
        appearAudio.currentTime = 0;
        appearAudio.play().catch(() => {});
    } catch (e) {}
}

const STORY_BGM_FOREST_START = "second-woman-intro";
const STORY_BGM_CBG1_START = "second-woman-go-deeper";

function getStoryBgmSrc(eventId) {
    const idx = getEventIndex(eventId);
    const idxForest = getEventIndex(STORY_BGM_FOREST_START);
    const idxCbg = getEventIndex(STORY_BGM_CBG1_START);
    if (idx >= idxCbg) return "sound/cbg1.mp3";
    if (idx >= idxForest) return "sound/forest.mp3";
    return "sound/wakeup.mp3";
}

function updateStoryBgm(event) {
    if (!event) return;
    playBgm(getStoryBgmSrc(event.id));
}




const storyLines = [
    // --- 第一幕 & 第二幕 ---
    { id: "1", type: "narration", text: "痛……", bg: "images/cg1.PNG" },
    { id: "2", type: "narration", text: "好痛……" },
    { id: "3", type: "narration", text: "……" },
    { id: "4", type: "narration", text: "夜空。" },
    { id: "5", type: "narration", text: "这里是哪儿？", bg: "images/cg2.PNG" },
    { id: "6", type: "narration", text: "我为什么会在这里……" },
    { id: "7", type: "narration", text: "为什么我的头这么痛……" },
    { id: "8", type: "narration", text: "……", bg: "images/cg3.PNG" },
    { id: "9", type: "narration", text: "我……不记得了……" },
    { id: "10", type: "narration", text: "我只记得……" },
    { id: "11", type: "narration", text: "……" },
    { id: "12", type: "narration", text: "我是……" },
    { id: "name-choice", type: "choice", options: [{ text: "灵泊。", next: "investigate-choice" }] },
    { id: "investigate-choice", type: "choice", options: [{ text: "调查周围", next: "look-around" }] },
    { id: "look-around", type: "narration", text: "夜风从身边掠过。四周寂静得有些异常。", bg: "images/bg1.PNG" },
    {
        id: "look-around-8", type: "dialogue", speaker: "灵泊", text: "啧……这里究竟是哪儿啊……",
        leftPortrait: "images/lingbo4.PNG", next: "look-around-9"
    },
    {
        id: "look-around-9", type: "dialogue", speaker: "灵泊", text: "我要赶紧离开这里",
        leftPortrait: "images/lingbo4.PNG", next: "second-woman-intro"
    },
    // 树中女人
    { id: "second-woman-intro", type: "narration", text: "一个人形轮廓在树林尽头，四周的树木高低错落，枝干在头顶交织，将本就黯淡的天光切割成零碎的光斑。地面潮湿而松软，枯枝与腐烂的落叶混杂在一起，踩上去时会发出细微的碎裂声。", rightPortrait: "images/tree4.PNG" },
    { id: "second-woman-approach", type: "narration", text: "灵泊急急忙忙地跑近，拨开挡在面前的枝叶，却在看清那个人影时猛地停下了脚步。", leftPortrait: "images/lingbo4.PNG", rightPortrait: "images/tree4.PNG" },
    { id: "second-woman-identity", type: "narration", text: "那是一个女人。" },
    { id: "second-woman-appearance-1", type: "narration", text: "她嵌合在粗壮的树干里，只有头部以及上半身凸显在外，仿佛树木生长时便将她一并吞了进去。", leftPortrait: "images/lingbo4.PNG", rightPortrait: "images/tree1.PNG" },
    { id: "second-woman-appearance-2", type: "narration", text: "她的皮肤呈现出一种缺乏血色的灰白，脑后却长出了数只形态各异的手。那些手交叠在一起，牢牢地捂住她的双眼，指节泛着青黑色，指尖深深陷进皮肉。", leftPortrait: "images/lingbo4.PNG", rightPortrait: "images/tree1.PNG" },
    { id: "second-woman-motionless", type: "narration", text: "女人的胸膛没有起伏。", leftPortrait: "images/lingbo4.PNG", rightPortrait: "images/tree1.PNG" },
    { id: "second-woman-thought-1", type: "dialogue", speaker: "灵泊", text: "还活着吗……没办法确定", leftPortrait: "images/lingbo4.PNG", rightPortrait: "images/tree1.PNG" },
    { id: "second-woman-thought-2", type: "narration", text: "他盯着女人看了一会儿，迟疑地向前挪了半步。", leftPortrait: "images/lingbo4.PNG", rightPortrait: "images/tree1.PNG" },
    { id: "second-woman-thought-3", type: "dialogue", speaker: "灵泊", text: "先试试看吧。", leftPortrait: "images/lingbo4.PNG", rightPortrait: "images/tree1.PNG" },
    { id: "second-woman-choice-1", type: "choice", options: [{ text: "走上前挥挥手", next: "second-woman-wave" }] },
    { id: "second-woman-wave", type: "narration", text: "灵泊走到女人面前，抬起手，在她眼前小心翼翼地晃了晃。", leftPortrait: "images/lingbo4.PNG", rightPortrait: "images/tree1.PNG" },
    { id: "second-woman-greeting-1", type: "dialogue", speaker: "灵泊", text: "你好……", leftPortrait: "images/lingbo4.PNG", rightPortrait: "images/tree1.PNG" },
    { id: "second-woman-no-response", type: "narration", text: "没有反应。", leftPortrait: "images/lingbo4.PNG", rightPortrait: "images/tree1.PNG" },
    { id: "second-woman-silence", type: "narration", text: "女人依旧保持着原来的姿势，仿佛根本没有察觉到他的存在。", leftPortrait: "images/lingbo4.PNG", rightPortrait: "images/tree1.PNG" },
    { id: "second-woman-forest-sound", type: "narration", text: "四周安静得出奇。只有森林里的树叶在风中沙沙作响，偶尔有不知名的鸟鸣从远处传来。灵泊的声音落进树林深处，又轻飘飘地折返回来。", leftPortrait: "images/lingbo4.PNG", rightPortrait: "images/tree1.PNG" },
    { id: "second-woman-nothing", type: "narration", text: "除此之外，什么也没有发生。", leftPortrait: "images/lingbo4.PNG", rightPortrait: "images/tree1.PNG" },
    { id: "second-woman-choice-2", type: "choice", options: [{ text: "再试试看", next: "second-woman-try-again" }] },
    { id: "second-woman-try-again", type: "narration", text: "灵泊清了清嗓子，又向前凑近了一些。", leftPortrait: "images/lingbo4.PNG", rightPortrait: "images/tree1.PNG" },
    { id: "second-woman-greeting-2", type: "dialogue", speaker: "灵泊", text: "（大声）你好，我想问一下，这里是哪里？", leftPortrait: "images/lingbo4.PNG", rightPortrait: "images/tree1.PNG" },
    { id: "second-woman-first-response", type: "dialogue", speaker: "女人", text: "……", rightPortrait: "images/tree1.PNG", leftPortrait: "images/lingbo4.PNG" },
    { id: "second-woman-responds", type: "narration", text: "短暂的沉默后，她终于有了反应。", leftPortrait: "images/lingbo4.PNG", rightPortrait: "images/tree1.PNG" },
    { id: "second-woman-good-evening", type: "dialogue", speaker: "女人", text: "晚上好。", rightPortrait: "images/tree2.PNG", leftPortrait: "images/lingbo4.PNG" },
    { id: "second-woman-apology", type: "dialogue", speaker: "女人", text: "不好意思。", rightPortrait: "images/tree2.PNG", leftPortrait: "images/lingbo4.PNG" },
    { id: "second-woman-explanation", type: "dialogue", speaker: "女人", text: "这里通常不会来人。", rightPortrait: "images/tree2.PNG", leftPortrait: "images/lingbo4.PNG" },
    { id: "second-woman-calm", type: "narration", text: "她的声音平稳得近乎平淡，听不出惊讶，也没有多少与人交谈时应有的情绪。那几只捂住她双眼的手依旧纹丝不动。", leftPortrait: "images/lingbo4.PNG", rightPortrait: "images/tree1.PNG" },
    { id: "second-woman-surprise", type: "narration", text: "灵泊愣了一下，有些惊讶她的回应。", leftPortrait: "images/lingbo4.PNG", rightPortrait: "images/tree1.PNG" },
    { id: "second-woman-choice-3", type: "choice", options: [{ text: "这里是哪里？", next: "second-woman-graveyard-answer" }] },
    { id: "second-woman-graveyard-answer", type: "dialogue", speaker: "女人", text: "亥塔城外的乱葬岗。", rightPortrait: "images/tree2.PNG", leftPortrait: "images/lingbo4.PNG" },
    { id: "second-woman-shock", type: "dialogue", speaker: "灵泊", text: "什么？？！乱葬岗？为什么我会在乱葬岗里？", leftPortrait: "images/lingbo4.PNG", rightPortrait: "images/tree1.PNG" },
    { id: "second-woman-shock-narration", type: "narration", text: "他的声音不自觉地拔高，随即又像是意识到自己的失态，猛地停了下来。", leftPortrait: "images/lingbo4.PNG", rightPortrait: "images/tree1.PNG" },
    { id: "second-woman-silence-2", type: "dialogue", speaker: "女人", text: "……", rightPortrait: "images/tree1.PNG", leftPortrait: "images/lingbo4.PNG" },
    { id: "second-woman-sigh", type: "narration", text: "女人似乎轻轻叹了口气。", leftPortrait: "images/lingbo4.PNG", rightPortrait: "images/tree3.PNG" },
    { id: "second-woman-doesnt-know", type: "dialogue", speaker: "女人", text: "我不知道。", rightPortrait: "images/tree2.PNG", leftPortrait: "images/lingbo4.PNG" },
    { id: "second-woman-dead-1", type: "dialogue", speaker: "女人", text: "但是既然你出现在亥塔，那就只能说明你已经死了。", rightPortrait: "images/tree2.PNG", leftPortrait: "images/lingbo4.PNG" },
    { id: "second-woman-meaning", type: "dialogue", speaker: "灵泊", text: "您是什么意思？", leftPortrait: "images/lingbo4.PNG", rightPortrait: "images/tree1.PNG" },
    { id: "second-woman-silence-3", type: "dialogue", speaker: "女人", text: "……", rightPortrait: "images/tree1.PNG", leftPortrait: "images/lingbo4.PNG" },
    { id: "second-woman-haeta-explanation", type: "dialogue", speaker: "女人", text: "亥塔，是永晷城十二塔里负责殡葬职能的地方。", rightPortrait: "images/tree2.PNG", leftPortrait: "images/lingbo4.PNG" },
    { id: "second-woman-staff", type: "dialogue", speaker: "女人", text: "除了两个职员以外，这里不会有其他活人。", rightPortrait: "images/tree2.PNG", leftPortrait: "images/lingbo4.PNG" },
    { id: "second-woman-dead-2", type: "dialogue", speaker: "女人", text: "所以既然你出现在这里，就只能说明你已经死了。", rightPortrait: "images/tree2.PNG", leftPortrait: "images/lingbo4.PNG" },
    { id: "second-woman-fingers", type: "narration", text: "女人说话时，捂住双眼的手指微微动了一下。", leftPortrait: "images/lingbo4.PNG", rightPortrait: "images/tree1.PNG" },
    { id: "second-woman-still", type: "narration", text: "除此之外，她没有任何多余的动作。", leftPortrait: "images/lingbo4.PNG", rightPortrait: "images/tree1.PNG" },
    { id: "second-woman-confusion", type: "narration", text: "灵泊看着眼前这个女人的嘴巴一张一合。她的每句话都清晰地传进他的耳朵，可那些字词组合起来，却像是某种无法理解的陌生语言。", bg: "images/black.png" },
    { id: "second-woman-mind-stops", type: "narration", text: "他的大脑停止了思考。", bg: "images/black.png" },
    { id: "second-woman-fear", type: "narration", text: "一阵寒意从脊背窜上后颈，灵泊发现自己正在发抖。他想反驳，想告诉眼前这个女人她说的话有多荒谬，可喉咙像是被什么东西堵住了，半天挤不出一个字。", bg: "images/black.png"},
    { id: "second-woman-memories", type: "narration", text: "然后，一些被他忽略的细节开始重新浮现。",bg: "images/black.png" },
    { id: "second-woman-smell", type: "narration", text: "空气中挥之不去的肉体腐烂的臭味。",bg: "images/bg4.png" },
    { id: "second-woman-bones", type: "narration", text: "疾走时，视野边缘一闪而过的一具具尸骨。", bg: "images/bg5.png"},
    { id: "second-woman-cold-body", type: "narration", text: "自己冰冷而僵硬的身体。",bg: "images/bg6.png" },
    { id: "second-woman-wound", type: "narration", text: "还有……", bg: "images/black.png" },
    { id: "second-woman-face-wound", type: "narration", text: "覆盖了整个右脸的致死伤口。", bg: "images/black.png"  },
    { id: "second-woman-touch-face", type: "narration", text: "灵泊的呼吸逐渐急促起来。他颤抖着抬起右手，摸向自己的脸颊。", bg: "images/black.png" },
    { id: "second-woman-touch-wound", type: "narration", text: "指尖触及皮肤的瞬间，一阵细微的搔动从伤口处传来。",  bg:  "images/black.png"  },
    { id: "second-woman-something-on-face", type: "narration", text: "有什么东西正停留在他的脸上。",bg: "images/black.png"  },
    { id: "second-woman-butterfly", type: "narration", text: "他伸手摸索，碰到了一对轻薄、脆弱的翅膀。那东西似乎受到了惊扰，翅膀微微颤动，却没有立即飞走。", bg: "images/cg4.png"  },
    { id: "second-woman-choice-4", type: "choice", options: [{ text: "将蝴蝶扯下来", next: "second-woman-pull-butterfly" }] },
    { id: "second-woman-pull-butterfly", type: "narration", text: "灵泊捏住蝴蝶的翅膀，试图将它从脸上扯开。",  bg: "images/cg4.png" },
    { id: "second-woman-butterfly-stuck", type: "narration", text: "然而，无论他怎么用力，那只蝴蝶都纹丝不动，仿佛早已与他的皮肉长在了一起。",  bg: "images/cg4.png" },
    { id: "second-woman-butterfly-fail", type: "narration", text: "完全扯不动。", bg: "images/black.png" },
    { id: "second-woman-annoyed", type: "dialogue", speaker: "灵泊", text: "啧。",bg: "images/bg1.PNG",leftPortrait: "images/lingbo8.PNG", rightPortrait: "images/tree1.PNG" },
    { id: "second-woman-silence-4", type: "narration", text: "灵泊沉默片刻，终于缓缓放下了手。", leftPortrait: "images/lingbo8.PNG", rightPortrait: "images/tree1.PNG" },
    { id: "second-woman-ask-answer", type: "dialogue", speaker: "灵泊", text: "好吧，我早就死了，可是为什么我会活过来？您知道些什么吗？", leftPortrait: "images/lingbo8.PNG", rightPortrait: "images/tree1.PNG" },
    { id: "second-woman-doesnt-know-2", type: "dialogue", speaker: "女人", text: "……", rightPortrait: "images/tree1.PNG", leftPortrait: "images/lingbo8.PNG" },
    { id: "second-woman-answer", type: "dialogue", speaker: "女人", text: "我并不清楚，或许你可以去亥塔寻找答案。", rightPortrait: "images/tree2.PNG", leftPortrait: "images/lingbo1.PNG" },
    { id: "second-woman-points", type: "narration", text: "说完，女人缓缓抬起一只手。指向树林更深处的一条小路。", leftPortrait: "images/lingbo1.PNG", rightPortrait: "images/tree2.PNG" },
    { id: "second-woman-path", type: "narration", text: "枯枝横斜，杂草丛生，远处隐约可以看见一座建筑的轮廓。建筑高耸的边缘没入昏暗的天色之中，像是一道沉默的黑影。", leftPortrait: "images/lingbo1.PNG", rightPortrait: "images/tree2.PNG" },
    { id: "second-woman-directions", type: "dialogue", speaker: "女人", text: "你可以在亥塔的门口看到两个职员，或许你可以在那里找到答案。", rightPortrait: "images/tree2.PNG", leftPortrait: "images/lingbo1.PNG" },
    { id: "second-woman-look-path", type: "narration", text: "灵泊顺着她指的方向望去，又回头看了看她。", rightPortrait: "images/tree1.PNG", leftPortrait: "images/lingbo10.PNG" },
    { id: "second-woman-unasked-questions", type: "narration", text: "他还有很多问题。", leftPortrait: "images/lingbo10.PNG", rightPortrait: "images/tree1.PNG" },
    { id: "second-woman-questions", type: "narration", text: "比如，为什么自己会死在这里；为什么脑海里充斥着奇怪的记忆；还有，眼前这个被树木吞噬的女人究竟是什么东西。", leftPortrait: "images/lingbo10.PNG", rightPortrait: "images/tree1.PNG" },
    { id: "second-woman-swallow-questions", type: "narration", text: "但看着女人那张毫无表情的脸，灵泊最终还是把这些问题咽了回去。", rightPortrait: "images/tree1.PNG", leftPortrait: "images/lingbo1.PNG" },
    { id: "second-woman-thanks", type: "dialogue", speaker: "灵泊", text: "……", rightPortrait: "images/tree1.PNG", leftPortrait: "images/lingbo10.PNG" },
    { id: "second-woman-sigh-2", type: "narration", text: "他揉了揉眉心，长长地叹了口气。", rightPortrait: "images/tree1.PNG", leftPortrait: "images/lingbo10.PNG" },
    { id: "second-woman-thanks-2", type: "dialogue", speaker: "灵泊", text: "（叹气）谢谢您。", rightPortrait: "images/tree1.PNG", leftPortrait: "images/lingbo11.PNG" },
    { id: "second-woman-no-answer", type: "narration", text: "女人没有回答。", leftPortrait: "images/lingbo11.PNG", rightPortrait: "images/tree1.PNG" },
    { id: "second-woman-leaves", type: "narration", text: "灵泊转过身，朝着树林深处走去。", leftPortrait: "images/lingbo11.PNG", rightPortrait: "images/tree1.PNG" },
    { id: "second-woman-fading", type: "narration", text: "脚下的枯叶被踩得沙沙作响。随着他逐渐远离，那道嵌在树干里的身影也一点点被枝叶遮挡，最后重新融入昏暗的森林。", bg: "images/black.png" },
    { id: "second-woman-choice-5", type: "choice", options: [{ text: "往深处前进", next: "second-woman-go-deeper" }] },
    { id: "second-woman-go-deeper", type: "narration", text: "灵泊沿着那条杂草丛生的小路，继续朝树林深处走去。", bg: "images/black.png" },

    // --- 第三幕 亥塔 ---
    { id: "third-haita-01", type: "narration", text: "隔着很远距离，灵泊就听到了机器轰鸣运作的声音，直觉告诉他这里死气沉沉，怀着不安的心情，灵泊推开了保安室的门。", bg: "images/black.png", next: "third-haita-02" },
    { id: "third-haita-02", type: "narration", text: "这里空无一人。只有他空落落的回声。", bg: "images/bg2.PNG", next: "third-haita-03" },
    { id: "third-haita-03", type: "narration", text: "隔着很远的距离，灵泊就听到了机器轰鸣运作的声音。", next: "third-haita-04" },
    { id: "third-haita-04", type: "narration", text: "那声音沉闷而持续，仿佛有什么庞大的东西正埋在地下，不知疲倦地重复着某种工作。", next: "third-haita-05" },
    { id: "third-haita-05", type: "narration", text: "直觉告诉他，这里死气沉沉。", next: "third-haita-06" },
    { id: "third-haita-06", type: "narration", text: "怀着不安的心情，灵泊推开了保安室的门。", next: "third-haita-07" },
    { id: "third-haita-07", type: "dialogue", speaker: "灵泊", leftPortrait: "images/lingbo2.PNG", text: "（大声）你好——请问这里有人吗？", next: "third-haita-08" },
    { id: "third-haita-08", type: "narration", text: "没有回应。", next: "third-haita-09" },
    { id: "third-haita-09", type: "narration", text: "他走进保安室。室内空无一人，只有他的声音在狭窄的空间里来回碰撞，最后消失在机器的轰鸣声中。", next: "third-haita-10" },
    { id: "third-haita-10", type: "narration", text: "桌上放着几张纸，墙边的柜子半开着。一台老旧的显示器亮着，画面上是几块模糊不清的监控影像。画面中的走廊、楼梯，以及一扇紧闭的铁门，全都静止不动。", next: "third-haita-11" },
    { id: "third-haita-11", type: "dialogue", speaker: "灵泊", leftPortrait: "images/lingbo8.PNG", text: "完全感受不到人……这里出了什么事吗……" },
    
    // --- 第四幕 电梯 ---
    { id: "fourth-elevator-01", type: "narration", text: "电梯门缓缓合拢。", bg: "images/black.png", next: "fourth-elevator-02" },
    { id: "fourth-elevator-02", type: "narration", text: "狭窄的空间里，机器运转的声音变得格外清晰。灵泊抬起头，看了看贴在电梯内侧的楼层介绍。", bg: "images/bg3.PNG", next: "fourth-elevator-03" },
    { id: "fourth-elevator-03", type: "narration", text: "一楼：安保室\n二楼：报丧馆\n三楼：停灵馆\n四楼：守灵馆\n五楼：入馆室\n六楼：火葬场\n七楼：骨灰保管室", next: "fourth-elevator-04" },
    { id: "fourth-elevator-04", type: "dialogue", speaker: "灵泊", leftPortrait: "images/lingbo7.PNG", text: "……还真是殡葬一条龙啊。", next: "fourth-elevator-05" },
    { id: "fourth-elevator-05", type: "narration", text: "他低下头，试着按了按电梯按钮。", next: "fourth-elevator-06" },
    { id: "fourth-elevator-06", type: "narration", text: "没有反应。", next: "fourth-elevator-07" },
    { id: "fourth-elevator-07", type: "dialogue", speaker: "灵泊", leftPortrait: "images/lingbo10.PNG", text: "……只能通往二楼。", next: "fourth-elevator-08" },
    { id: "fourth-elevator-08", type: "dialogue", speaker: "灵泊", leftPortrait: "images/lingbo11.PNG", text: "（叹气）走一步算一步吧。", next: "fifth-hall-01" },

    // --- 第五幕 引入 ---
    { id: "fifth-hall-01", type: "narration", text: "走廊里的灯光有些昏暗。远处传来持续不断的机器轰鸣声，却看不到任何工作人员的身影。", next: "fifth-hall-02" },
    { id: "fifth-hall-02", type: "dialogue", speaker: "灵泊", leftPortrait: "images/lingbo8.PNG", text: "……总觉得有种很不安的感觉。", next: "fifth-hall-03" },
    { id: "fifth-hall-03", type: "dialogue", speaker: "灵泊", leftPortrait: "images/lingbo8.PNG", text: "二楼真的有人吗？" },

    // --- 第六幕 电梯 ---
    { id: "sixth-elevator-01", type: "narration", text: "灵泊试着按了所有的电梯按钮。", next: "sixth-elevator-02", bg: "images/bg3.PNG" },
    { id: "sixth-elevator-02", type: "narration", text: "只有三楼的按钮亮了光。", next: "sixth-elevator-03" },
    { id: "sixth-elevator-03", type: "dialogue", speaker: "灵泊", leftPortrait: "images/lingbo6.PNG", text: "……三楼…，停灵馆。", next: "sixth-elevator-04" },
    { id: "sixth-elevator-04", type: "dialogue", speaker: "灵泊", leftPortrait: "images/lingbo7.PNG", text: "停灵……这一层会见到尸体吗？" },

    // --- 第八幕 电梯 ---
    { id: "eighth-elevator-01", type: "narration", text: "灵泊再次试着按下所有楼层的按钮。这次，只有五楼的按钮亮了起来。", next: "eighth-elevator-02", bg: "images/bg3.PNG" },
    { id: "eighth-elevator-02", type: "dialogue", speaker: "灵泊", leftPortrait: "images/lingbo10.PNG", text: "……跳过了四楼。", next: "eighth-elevator-03" },
    { id: "eighth-elevator-03", type: "dialogue", speaker: "灵泊", leftPortrait: "images/lingbo8.PNG", text: "我记得之前的员工守则说过四楼不能去。", next: "eighth-elevator-04" },
    { id: "eighth-elevator-04", type: "dialogue", speaker: "灵泊", leftPortrait: "images/lingbo6.PNG", text: "五楼吗？我记得是入棺室。", next: "eighth-elevator-05" },
    { id: "eighth-elevator-05", type: "dialogue", speaker: "灵泊", leftPortrait: "images/lingbo2.PNG", text: "那是干什么的？", next: "eighth-elevator-06" },
    { id: "eighth-elevator-06", type: "dialogue", speaker: "灵泊", leftPortrait: "images/lingbo5.PNG", text: "！", next: "eighth-elevator-07" },
    { id: "eighth-elevator-07", type: "narration", text: "电梯门缓缓打开。" }
];

const storyCG = {};




function getEventById(id) { return storyLines.find((event) => event.id === id); }
function getEventIndex(id) { return storyLines.findIndex((event) => event.id === id); }

function showScreen(screenName) {
    currentScreen = screenName;
    if (titleScreen) titleScreen.classList.toggle("hidden", screenName !== "title");
    if (storyScreen) storyScreen.classList.toggle("hidden", screenName !== "story");
    if (mapScreen) mapScreen.classList.toggle("hidden", screenName !== "map");
    if (explorationScreen) explorationScreen.classList.toggle("hidden", screenName !== "exploration");
}

function updateStoryBackground(event) {
    if (!storyCGElement) return;
    if (event && event.bg) {
        storyCGElement.src = event.bg;
        return;
    }
    const currentIndex = getEventIndex(currentEventId);
    let backgroundPath = "images/scene1.png";
    for (let i = 0; i <= currentIndex; i++) {
        const e = storyLines[i];
        if (e.bg) backgroundPath = e.bg;
    }
    storyCGElement.src = backgroundPath;
}

function startNewGame() {
    currentEventId = "1";
    isTeleporting = false;
    showScreen("story");
    renderStoryLine();
}

function renderStoryLine() {
    const event = getEventById(currentEventId);
    if (!event) {
        showToast("找不到这段剧情，请检查事件 id。");
        return;
    }

    updateStoryBackground(event)   
    updateStoryBackground(event);
    updateStoryBgm(event);

    if (choicePanel) { choicePanel.replaceChildren(); choicePanel.classList.add("hidden"); }
    if (storyClickArea) storyClickArea.classList.remove("hidden");
    if (narration) narration.classList.add("hidden");
    if (dialogueBox) dialogueBox.classList.add("hidden");

    if (storyPortraitLeft) {
        if (event.leftPortrait) {
            storyPortraitLeft.src = event.leftPortrait;
            storyPortraitLeft.classList.remove("hidden");
        } else {
            storyPortraitLeft.classList.add("hidden");
        }
    }
    if (storyPortraitRight) {
        if (event.rightPortrait) {
            storyPortraitRight.src = event.rightPortrait;
            storyPortraitRight.classList.remove("hidden");
        } else {
            storyPortraitRight.classList.add("hidden");
        }
    }

    if (narrationText) narrationText.textContent = "";
    if (dialogueText) dialogueText.textContent = "";
    if (nameBox) nameBox.textContent = getDisplaySpeaker(event);

           if (event.type === "narration") {
        if (narration) narration.classList.remove("hidden");
        if (narrationText) typeWriter(narrationText, getDisplayText(event));
       } else if (event.type === "dialogue") {
        if (dialogueBox) dialogueBox.classList.remove("hidden");
        if (nameBox) nameBox.classList.remove("hidden");
        if (dialogueText) typeWriter(dialogueText, getDisplayText(event));
    } else if (event.type === "choice") {
        if (narration) narration.classList.add("hidden");
        if (dialogueBox) dialogueBox.classList.add("hidden");
        if (storyClickArea) storyClickArea.classList.add("hidden");
     if (choicePanel) choicePanel.classList.remove("hidden");

        (event.options || []).forEach((option) => {
            const button = document.createElement("button");
                       button.className = "choice-button";
            button.textContent = (currentLanguage === 'en' && option.en) ? option.en : option.text;
             button.addEventListener("click", () => {
                playAppearSound();
                currentEventId = option.next;
                renderStoryLine();
            });
            if (choicePanel) choicePanel.appendChild(button);
        });
    }
}

function advanceStory() {
    if (currentScreen !== "story") return;
    
        if (isTyping) {
        const event = getEventById(currentEventId);
        if (event) {
            finishTyping(narrationText, getDisplayText(event));
            finishTyping(dialogueText, getDisplayText(event));
        }
        return;
    }


    const event = getEventById(currentEventId);
    if (!event || event.type === "choice") return;

    if (currentEventId === "third-haita-10") { enterExploration("scene1"); return; }
    if (currentEventId === "fourth-elevator-08") { enterExploration("scene2"); return; }
    if (currentEventId === "fifth-hall-03") { enterExploration("scene2"); return; }
    if (currentEventId === "sixth-elevator-04") { enterExploration("scene4"); return; }
    if (currentEventId === "eighth-elevator-07") { enterExploration("scene8"); return; }

    if (event.next) {
        currentEventId = event.next;
        renderStoryLine();
        return;
    }

    const currentIndex = getEventIndex(currentEventId);
    const nextEvent = storyLines[currentIndex + 1];

    if (nextEvent) {
        currentEventId = nextEvent.id;
        renderStoryLine();
    } else {
        showToast("这一段剧情暂时结束。");
    }
}

if (storyClickArea) storyClickArea.addEventListener("click", advanceStory);





const explorationStage = $("exploration-stage");
const explorationBackground = $("exploration-background");
const explorationHotspotsContainer = $("exploration-hotspots-container");
const explorationPlayerWrap = $("exploration-player-wrap");
const explorationDialogue = $("exploration-dialogue");
const explorationDialogueText = $("exploration-dialogue-text");
const explorationNameBox = $("exploration-name-box");
const explorationHint = $("exploration-hint");
const explorationChoicePanel = $("exploration-choice-panel");

const exPortraitLeft = $("ex-portrait-left");
const exPortraitCenter = $("ex-portrait-center");
const exPortraitRight = $("ex-portrait-right");

let hasIdCard = false;
let hasPass = false;
let hasRadioPlayed = false;
let explored5 = false;
let explored6 = false;
let explored8 = false;
let hasMetMonster = false;
let hasMet02 = false;
let isExploringBusy = false;
let currentExplorationQueue = [];
let currentExplorationIndex = 0;
let currentSceneId = "scene1";

const explorationScenes = {
    scene1: {
        background: "images/cbg1.PNG",
        initPos: { x: "15%", bottom: "5%" },
        playerHeight: "45%",
        hotspots: [
            { target: "paper", style: "left: 4%; top: 37%; width: 7%; height: 15%;", pos: { x: "8%", bottom: "5%" }, scenario: "paper_1" },
            { target: "cabinet", style: "left: 14%; top: 25%; width: 17%; height: 47%;", pos: { x: "22%", bottom: "5%" }, scenario: "cabinet_1" },
            { target: "desk_monitor", style: "left: 36%; top: 11%; width: 35%; height: 39%;", pos: { x: "45%", bottom: "5%" }, scenario: "desk_1" },
            { target: "desk", style: "left: 38%; top: 51%; width: 30%; height: 27%;", pos: { x: "45%", bottom: "5%" }, scenario: "desk_1" },
            { target: "elevator", style: "left: 77%; top: 27%; width: 17%; height: 44%;", pos: { x: "76%", bottom: "5%" }, scenario: "elevator_1" }
        ]
    },
    scene2: {
        background: "images/cbg2.PNG",
        initPos: { x: "50%", bottom: "5%" },
        playerHeight: "45%",
        hotspots: [
            { target: "notice", style: "left: 9%; top: 35%; width: 9%; height: 25%;", pos: { x: "8%", bottom: "5%" }, scenario: "notice_2" },
            { target: "elevator_2", style: "left: 21%; top: 20%; width: 23%; height: 52%;", pos: { x: "32%", bottom: "5%" }, scenario: "elevator_2" },
            { target: "corridor_1", style: "left: 48%; top: 10%; width: 20%; height: 65%;", pos: { x: "58%", bottom: "5%" }, scenario: "corridor_1" },
            { target: "emergency", style: "left: 75%; top: 25%; width: 18%; height: 50%;", pos: { x: "84%", bottom: "5%" }, scenario: "emergency_2" }
        ]
    },
    scene3: {
        background: "images/cbg3.PNG",
        initPos: { x: "50%", bottom: "5%" },
        playerHeight: "30%",
        hotspots: [
            { target: "corridor_2", style: "left: 0%; top: 35%; width: 7%; height: 40%;", pos: { x: "4%", bottom: "5%" }, scenario: "corridor_2" },
            { target: "door_2", style: "left: 16%; top: 35%; width: 18%; height: 38%;", pos: { x: "24%", bottom: "5%" }, scenario: "door_2" },
            { target: "desk_2", style: "left: 34%; top: 57%; width: 23%; height: 21%;", pos: { x: "45%", bottom: "5%" }, scenario: "desk_2" },
            { target: "cabinet_2", style: "left: 52%; top: 46%; width: 24%; height: 24%;", pos: { x: "64%", bottom: "5%" }, scenario: "cabinet_2" },
            { target: "elevator_3", style: "left: 82%; top: 36%; width: 14%; height: 35%;", pos: { x: "88%", bottom: "5%" }, scenario: "elevator_3" }
        ]
    },
    scene4: {
        background: "images/cbg4.PNG",
        initPos: { x: "75%", bottom: "5%" },
        playerHeight: "45%",
        hotspots: [
            { target: "door_left_4", style: "left: 0%; top: 32%; width: 11%; height: 42%;", pos: { x: "5%", bottom: "5%" }, scenario: "door_left_4" },
            { target: "door_mid_4", style: "left: 22%; top: 32%; width: 15%; height: 40%;", pos: { x: "28%", bottom: "5%" }, scenario: "door_mid_4" },
            { target: "notice_4", style: "left: 51%; top: 40%; width: 6%; height: 15%;", pos: { x: "55%", bottom: "5%" }, scenario: "notice_4" },
            { target: "elevator_4", style: "left: 58%; top: 26%; width: 19%; height: 48%;", pos: { x: "68%", bottom: "5%" }, scenario: "elevator_4" },
            { target: "corridor_4", style: "left: 83%; top: 0%; width: 17%; height: 100%;", pos: { x: "90%", bottom: "5%" }, scenario: "corridor_4" }
        ]
    },
    scene5: {
        background: "images/cbg5.PNG",
        initPos: { x: "70%", bottom: "5%" },
        playerHeight: "45%",
        hotspots: [
            { target: "emergency_5", style: "left: 2%; top: 25%; width: 13%; height: 48%;", pos: { x: "5%", bottom: "5%" }, scenario: "emergency_5" },
            { target: "door_5", style: "left: 22%; top: 32%; width: 23%; height: 40%;", pos: { x: "34%", bottom: "5%" }, scenario: "door_5" },
            { target: "white_door_5", style: "left: 55%; top: 28%; width: 21%; height: 45%;", pos: { x: "65%", bottom: "5%" }, scenario: "white_door_5" },
            { target: "corridor_5", style: "left: 84%; top: 20%; width: 16%; height: 60%;", pos: { x: "90%", bottom: "5%" }, scenario: "corridor_5" }
        ]
    },
    scene6: {
        background: "images/cbg6.PNG",
        initPos: { x: "15%", bottom: "5%" },
        playerHeight: "45%",
        hotspots: [
            { target: "white_door_6", style: "left: 3%; top: 30%; width: 22%; height: 43%;", pos: { x: "12%", bottom: "5%" }, scenario: "white_door_6" },
            { target: "cabinet_6", style: "left: 35%; top: 37%; width: 65%; height: 37%;", pos: { x: "65%", bottom: "5%" }, scenario: "cabinet_6" },
            { target: "pass_6", style: "left: 78%; top: 82%; width: 6%; height: 8%;", pos: { x: "81%", bottom: "5%" }, scenario: "pass_6" }
        ]
    },
    scene7: {
        background: "images/cbg8.PNG",
        initPos: { x: "15%", bottom: "5%" },
        playerHeight: "45%",
        hotspots: [
            { target: "door_7", style: "left: 0%; top: 33%; width: 17%; height: 40%;", pos: { x: "8%", bottom: "5%" }, scenario: "door_7" },
            { target: "table_7", style: "left: 23%; top: 39%; width: 23%; height: 23%;", pos: { x: "34%", bottom: "5%" }, scenario: "table_7" },
            { target: "monster_7", style: "left: 55%; top: 32%; width: 24%; height: 37%;", pos: { x: "66%", bottom: "5%" }, scenario: "monster_7_after" }
        ]
    },
    scene8: {
        background: "images/cbg9.PNG",
        initPos: { x: "75%", bottom: "5%" },
        playerHeight: "45%",
        hotspots: [
            { target: "corridor_8", style: "left: 0%; top: 15%; width: 10%; height: 70%;", pos: { x: "5%", bottom: "5%" }, scenario: "corridor_8" },
            { target: "black_door_8", style: "left: 15%; top: 20%; width: 25%; height: 60%;", pos: { x: "28%", bottom: "5%" }, scenario: "black_door_8" },
            { target: "notice_8", style: "left: 47%; top: 35%; width: 22%; height: 30%;", pos: { x: "58%", bottom: "5%" }, scenario: "notice_8" },
            { target: "elevator_8", style: "left: 70%; top: 20%; width: 18%; height: 60%;", pos: { x: "80%", bottom: "5%" }, scenario: "elevator_8" }
        ]
    },
    scene9: {
        background: "images/cbg10.PNG",
        initPos: { x: "15%", bottom: "5%" },
        playerHeight: "45%",
        hotspots: [
            { target: "door_9", style: "left: 0%; top: 25%; width: 25%; height: 55%;", pos: { x: "15%", bottom: "5%" }, scenario: "door_9" },
            { target: "coffin_9", style: "left: 25%; top: 45%; width: 28%; height: 30%;", pos: { x: "40%", bottom: "5%" }, scenario: "coffin_9" },
            { target: "tablet_9", style: "left: 58%; top: 45%; width: 15%; height: 30%;", pos: { x: "65%", bottom: "5%" }, scenario: "tablet_9" },
            { target: "wreath_9", style: "left: 75%; top: 30%; width: 25%; height: 45%;", pos: { x: "85%", bottom: "5%" }, scenario: "wreath_9" }
        ]
    },
    scene10: {
        background: "images/cbg11.PNG",
        initPos: { x: "75%", bottom: "5%" },
        playerHeight: "45%",
        hotspots: [
            { target: "emergency_10", style: "left: 0%; top: 25%; width: 18%; height: 45%;", pos: { x: "10%", bottom: "5%" }, scenario: "emergency_10" },
            { target: "door_mid_10", style: "left: 25%; top: 25%; width: 15%; height: 50%;", pos: { x: "32%", bottom: "5%" }, scenario: "door_mid_10" },
            { target: "door_04_10", style: "left: 50%; top: 25%; width: 15%; height: 50%;", pos: { x: "58%", bottom: "5%" }, scenario: "door_04_10" },
            { target: "corridor_10", style: "left: 85%; top: 0%; width: 15%; height: 100%;", pos: { x: "90%", bottom: "5%" }, scenario: "corridor_10" }
        ]
    },
    scene11: {
        background: "images/cbg12.PNG",
        hidePlayer: true,
        hotspots: [
            { target: "left_arrow", style: "left: 23%; top: 55%; width: 15%; height: 18%;", scenario: "left_arrow_11" },
            { target: "stairs", style: "left: 42%; top: 28%; width: 15%; height: 38%;", scenario: "stairs_11" },
            { target: "right_arrow", style: "left: 63%; top: 55%; width: 12%; height: 18%;", scenario: "right_arrow_11" }
        ]
    },
    scene12: {
        background: "images/cbg13.PNG", 
        hidePlayer: true,
        hotspots: []
    }
};

const explorationScenarios = {
    paper_1: [
        { type: "dialogue", speaker: "灵泊", text: "这是……亥塔的员工守则？", portrait: "images/lingbo6.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "还挺多字的", portrait: "images/lingbo10.PNG" },
        { type: "narration", text: "亥塔夜间值守人员工作守则\n内部文件｜请于上岗前仔细阅读\n为确保亥塔日常殡葬工作的正常进行，所有值守人员必须遵守以下规定。违反规定造成的后果，由当事人自行承担。\n第一条：亥塔夜间仅安排两名职员值守。\n第二条：非工作需要，不得在凌晨两点后回应建筑内部传来的呼叫。【注：设备故障提示音不在此列。】\n第三条：四楼仅供授权人员进入。\n第四条：遗体交接必须以书面记录为准。\n第五条：值守期间不得擅自离开岗位。如需前往其他区域，请提前通知另一名值守人员。若对方无法回应，请留在原地等待进一步指示。\n感谢各位员工的配合。\n——亥塔管理处" },
        { type: "dialogue", speaker: "灵泊", text: "什么乱七八糟的……", portrait: "images/lingbo8.PNG" }
    ],
    cabinet_1: [
        { type: "dialogue", speaker: "灵泊", text: "摆放的都很整齐。", portrait: "images/lingbo1.PNG" },
        { type: "narration", text: "柜子里整齐地摆放着两份日常用品。其中一份物品较为齐全，另一份则显得有些空缺。空缺的那块空间里还放着一张工作 ID 卡。" },
        { type: "dialogue", speaker: "灵泊", text: "这是？", portrait: "images/lingbo2.PNG" },
        { type: "action", text: "【获得id卡】", action: "get_id_card" },
        { type: "dialogue", speaker: "灵泊", text: "01……这张卡的主人是谁？", portrait: "images/lingbo8.PNG" },
        { type: "narration", text: "他翻过卡片看了看，没有找到更多信息。" },
        { type: "dialogue", speaker: "灵泊", text: "先收着吧。说不定用得上。", portrait: "images/lingbo10.PNG" }
    ],
    desk_1: [
        { type: "narration", text: "桌上放着一个烟灰缸、一张折叠起来的纸，以及一台电话。桌子正对着监控屏幕。" },
        { type: "choice", options: [
            { text: "烟灰缸", next: "desk_1_ashtray" },
            { text: "纸", next: "desk_1_paper" },
            { text: "电话", next: "desk_1_phone" },
            { text: "监控", next: "desk_1_monitor" }
        ]}
    ],
    desk_1_ashtray: [
        { type: "narration", text: "烟灰缸里还留着尚未完全熄灭的烟头，灰烬没有散开。" },
        { type: "dialogue", speaker: "灵泊", text: "……", portrait: "images/lingbo10.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "刚刚还有人在这里。", portrait: "images/lingbo8.PNG" }
    ],
    desk_1_paper: [
        { type: "dialogue", speaker: "灵泊", text: "让我看看这张纸上写了什么。", portrait: "images/lingbo6.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "……辞职信？", portrait: "images/lingbo2.PNG" },
        { type: "narration", text: "亥塔管理处：\n本人因个人原因，申请辞去夜间值守职务。\n此前所发生的一切，我不再追究。\n请尽快批准。\n02" },
        { type: "dialogue", speaker: "灵泊", text: "署名是02？", portrait: "images/lingbo8.PNG" }
    ],
    desk_1_phone: [
        { type: "narration", text: "灵泊拿起听筒，试着拨弄了一下按键。" },
        { type: "dialogue", speaker: "灵泊", text: "……", portrait: "images/lingbo10.PNG" },
        { type: "narration", text: "没有什么反应。" }
    ],
    desk_1_monitor: [
        { type: "narration", text: "灵泊走到监控屏幕前。屏幕上的画面分别显示着几处不同的走廊与房间。机器仍在运作，画面却看不到任何人影。\n无论哪个画面，都没有他自己的身影。" },
        { type: "dialogue", speaker: "灵泊", text: "……", portrait: "images/lingbo10.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "……算了。", portrait: "images/lingbo10.PNG" }
    ],
    elevator_1: [
        { type: "conditional", check: () => hasIdCard,
          ifTrue: [ { type: "choice", options: [ { text: "使用id卡", next: "elevator_1_success" } ] } ],
          ifFalse: [ { type: "narration", text: "需要id卡才能向上通行。" } ]
        }
    ],
    elevator_1_success: [ { type: "action", action: "enter_elevator_story" } ],
    notice_2: [
        { type: "narration", text: "一张纸被贴在楼层介绍牌上，几乎覆盖了原本的全部内容。只能从纸张上方露出的部分，辨认出楼层的名称和用途。" },
        { type: "dialogue", speaker: "灵泊", text: "二楼，报丧馆。", portrait: "images/lingbo6.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "负责向逝者的亲友、邻里及有关单位通知死讯，并告知相关丧事安排……", portrait: "images/lingbo6.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "……原来是做这个的。", portrait: "images/lingbo1.PNG" },
        { type: "narration", text: "介绍牌上覆盖着的那张纸似乎是一份紧急通知。\n\n由于突发紧急情况，亥塔部分功能性房间及紧急通道暂时关闭。未经许可，任何人员不得擅自进入相关区域。\n如需协助，请联系亥塔当值职员。\n署名：01" },
        { type: "dialogue", speaker: "灵泊", text: "……又是01", portrait: "images/lingbo8.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "紧急通道也被封锁了？", portrait: "images/lingbo7.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "看来，只能一层一层找过去了。", portrait: "images/lingbo11.PNG" }
    ],
    elevator_2: [
        { type: "dialogue", speaker: "灵泊", text: "灵泊按下电梯按钮。", portrait: "images/lingbo1.PNG" },
        { type: "narration", text: "没有反应。" },
        { type: "narration", text: "他又试着按了几次，按钮始终没有亮起。" },
        { type: "dialogue", speaker: "灵泊", text: "……坏了？", portrait: "images/lingbo2.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "刚才明明还能用。", portrait: "images/lingbo8.PNG" }
    ],
    corridor_1: [
        { type: "narration", text: "黑黢黢的，什么都看不清。" },
        { type: "action", action: "jump_scene", sceneId: "scene3" }
    ],
    emergency_2: [
        { type: "narration", text: "灵泊走到紧急通道门前，试着推门。" },
        { type: "narration", text: "门纹丝不动。" },
        { type: "narration", text: "他又用力推了一下，依旧没有任何反应。" },
        { type: "dialogue", speaker: "灵泊", text: "……完全打不开。", portrait: "images/lingbo7.PNG" }
    ],
    corridor_2: [
        { type: "narration", text: "黑黢黢的，什么都看不清。" },
        { type: "action", action: "jump_scene", sceneId: "scene2" }
    ],
    door_2: [
        { type: "narration", text: "很气派的门，门框宽大厚重，光是看着就能想象门后的房间有多么宽敞。门上挂着一块牌子。\n资料馆。" },
        { type: "narration", text: "灵泊试着推开大门。" },
        { type: "narration", text: "大门丝毫不动。" },
        { type: "dialogue", speaker: "灵泊", text: "……锁着了吗？", portrait: "images/lingbo2.PNG" }
    ],
    desk_2: [ { type: "narration", text: "上面只放了一个收音机。" } ],
    elevator_3: [
        { type: "conditional", check: () => hasIdCard,
          ifTrue: [
              { type: "dialogue", speaker: "灵泊", text: "……试试之前的id卡吧。", portrait: "images/lingbo6.PNG" },
              { type: "choice", options: [ { text: "使用id卡", next: "elevator_3_success" } ] }
          ],
          ifFalse: [ { type: "narration", text: "需要id卡才能向上通行。" } ]
        }
    ],
    elevator_3_success: [ { type: "action", action: "enter_sixth_elevator_story" } ],
        radio_2_first: [
        { type: "narration", text: "灵泊随手拨弄了几下旋钮。" },
        { type: "narration", text: "一阵杂音突然响起，紧接着，一段欢快的节目开场音乐从收音机里传了出来。" },
        { type: "dialogue", speaker: "灵泊", text: "！", centerPortrait: "images/lingbo5.PNG" },
        { type: "dialogue", speaker: "？？", text: "欢迎收听由鱿鱼志带来的《鱿鱼夜话》节目！", leftPortrait: "images/fish2.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "？", rightPortrait: "images/lingbo2.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "？？", text: "如果您有一些适合在夜里说的奇事，怪事和邪事，欢迎投稿给小编。我是《鱿鱼夜话》的老鱼。", leftPortrait: "images/fish2.PNG", rightPortrait: "images/cat1.PNG" },
        { type: "dialogue", speaker: "？？", text: "我是苗苗。", rightPortrait: "images/cat2.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "老鱼", text: "好啦，老惯例为新观众介绍一下，我们是来自卯塔的非官方夜间灵异节目。每周三晚上十点到十一点，咱们准时开播！", leftPortrait: "images/fish3.PNG", rightPortrait: "images/cat1.PNG" },
        { type: "dialogue", speaker: "老鱼", text: "好啦，话不多说，开始我们今天的灵异故事。苗苗，你先来还是我先来？", leftPortrait: "images/fish3.PNG", rightPortrait: "images/cat1.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "我先来吧。", rightPortrait: "images/cat1.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "今天的投稿人id叫做栗子不甜，我咱们就叫他L吧。这是一篇求助稿。", rightPortrait: "images/cat1.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "L说他是亥塔的员工……", rightPortrait: "images/cat1.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "老鱼", text: "亥塔的员工？哇塞，那这次的投稿很难得了。", leftPortrait: "images/fish3.PNG", rightPortrait: "images/cat1.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "！是这里？", centerPortrait: "images/lingbo5.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "是啊，投稿人自己也说家里托了不少关系才拿到这份工作，当时亥塔除了刚入职的他，就只有一位老前辈。", rightPortrait: "images/cat1.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "L 说，亥塔的工作其实挺轻松的。平时看看监控，每隔一个小时巡逻一次，也不需要什么专业技能。反正就是怎么轻松怎么来。", rightPortrait: "images/cat1.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "老鱼", text: "诶？那还挺奇怪的，亥塔不是负责永晷城殡葬事务的吗？如果只有他们两个人，那这座塔怎么运作起来的？守灵，火葬，入殓……都没有人来管的吗？", leftPortrait: "images/fish2.PNG", rightPortrait: "images/cat1.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "你还真问到点子上了。我后来私信问过 L 这个问题，L说他们巡逻一般只负责走廊，很多房间都不开放，有时候连楼层都上不去。", rightPortrait: "images/cat3.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "所以他怀疑亥塔高层自己有一批秘密员工，至于具体情况。他不清楚，可能是因为自己的权限不够高。", rightPortrait: "images/cat1.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "他也问过前辈，但那位前辈看起来迷迷糊糊的好像也不太清楚的样子。", rightPortrait: "images/cat1.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "老鱼", text: "也是。毕竟亥塔的保密程度一直挺高的。", leftPortrait: "images/fish1.PNG", rightPortrait: "images/cat1.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "好啦，继续说 L 的故事。", rightPortrait: "images/cat2.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "前辈老是打发L去干活，他自己呢就呆在一楼打盹儿。L觉得自己反正是新来的多熟悉一下工作流程也没啥不好，就这么干了呗。", rightPortrait: "images/cat1.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "结果第一年下来，几乎天天都是这样。前辈把活儿交给他，自己在下面乐得清闲。", rightPortrait: "images/cat1.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "老鱼", text: "哎哟，这前辈还真会带新人啊。", leftPortrait: "images/fish3.PNG", rightPortrait: "images/cat1.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "唉，本来一直这样的话L说他其实也无所谓，毕竟整天坐在一楼他也闲得无聊，虽然每天巡逻的路线他现在闭着眼都能走，但好歹比一整天屁股不离椅子强。", rightPortrait: "images/cat4.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "只是从今年开始，他觉得前辈有点古怪。、", rightPortrait: "images/cat1.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "前辈以前每天都跟尸体似的躺在一楼安保室的沙发上。结果有时候 L 巡逻回来，竟然发现前辈不在了。", rightPortrait: "images/cat1.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "看了楼道监控也没发现那人去了哪里。没过多久，前辈却又从外面跑了回来。", rightPortrait: "images/cat1.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "L 问他去哪儿了，他就说自己想出去走走。", rightPortrait: "images/cat1.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "L心里就觉得很奇怪，心想难道我们外面不是一片荒地和乱葬岗吗？有啥好走的啊，一般人不都嫌晦气吗。", rightPortrait: "images/cat1.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "……", centerPortrait: "images/lingbo10.PNG" },
        { type: "dialogue", speaker: "老鱼", text: "有古怪。", leftPortrait: "images/fish4.PNG", rightPortrait: "images/cat1.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "要知道离亥塔最近的居民区也要乘车开上半小时才能到，何况这儿根本没交通工具给他们。", rightPortrait: "images/cat1.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "老鱼", text: "如果不是收到L的投稿，我都要怀疑这地方是不是在搞监禁了。", leftPortrait: "images/fish3.PNG", rightPortrait: "images/cat1.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "害，总之这还只是个开始。", rightPortrait: "images/cat2.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "随着时间推移，L 发现前辈不正常的举动越来越多。他总是跑到某一层的走廊里，尝试打开各个房间的门，有时还会跑到塔外，不知道在做些什么。", rightPortrait: "images/cat1.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "而且，前辈的精神状态似乎也越来越差。他看起来焦虑得很，每天坐立不安。", rightPortrait: "images/cat1.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "L 也问过他到底发生了什么，需不需要帮忙，但每次都被前辈搪塞过去。", rightPortrait: "images/cat1.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "老鱼", text: "是不是因为前辈长时间呆在一个封闭的地方精神出问题了呢？你看他原来都是呆在一楼不出门的。", leftPortrait: "images/fish2.PNG", rightPortrait: "images/cat1.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "不过，还有一件事让 L 感到很不安。他曾经打电话向上层汇报前辈的异常情况，但一直没有收到任何回复。", rightPortrait: "images/cat4.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "到了这个时候，他才开始觉得有些不对劲。", rightPortrait: "images/cat4.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "老鱼", text: "毕竟抛开灵异不谈，和一个精神不稳定的人生活在一座封闭建筑内也很危险啊！", leftPortrait: "images/fish2.PNG", rightPortrait: "images/cat1.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "对。不过，真正让他决定向我们投稿的是最近发生的一件事。", rightPortrait: "images/cat1.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "某天，L 巡逻的时候，突然听见亥塔里传来了‘嘟嘟’声。", rightPortrait: "images/cat1.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "他说，那声音听起来就像有什么重物敲在实木上，音调很低。", rightPortrait: "images/cat1.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "一开始他觉得这声音还蛮正常的，毕竟亥塔那么多建筑，有时候机械啊什么的热胀冷缩就会发出这种声音，但奇怪的是，这个声音随着时间的流逝越来越大，直到在一楼安保室都能听得很清楚。", rightPortrait: "images/cat1.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "其实，他那时候已经开始起疑了。他也试着在巡逻的时候寻找声音的来源，但一直一无所获。", rightPortrait: "images/cat1.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "L 打电话向亥塔高层反映过这个情况，但还是没有得到任何回复。", rightPortrait: "images/cat1.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "其实他那时候已经开始起疑了。他也试着在巡逻的时候寻找声音的来源，但一直一无所获。", rightPortrait: "images/cat1.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "而前辈呢，本来他的情况虽然不太好，但也还没有到失控的程度。但是某天在一楼安保室时，他和前辈都清楚的听到了那个‘嘟嘟’声。", rightPortrait: "images/cat1.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "前辈一下子就像疯了一样跑到自己的房间说‘别杀我别杀我’‘求求你们了，我要回家’之类的话。", rightPortrait: "images/cat4.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "老鱼", text: "唉……", leftPortrait: "images/fish4.PNG", rightPortrait: "images/cat1.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "L自己一直没遇到什么问题，但是也不敢呆在这儿了。惨的是他当初签的合同是三年，也就是他还需要在亥塔干两年。", rightPortrait: "images/cat1.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "所以他才给我们投稿。他觉得咱们鱿鱼志接触过不少灵异故事，说不定能帮他分析分析，他到底遇到了什么。", rightPortrait: "images/cat1.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "啧……怎么说呢，咱们对亥塔的了解确实不多。就像之前说过的，那里的保密措施非常严格。这种情况至少我是第一次听说。", rightPortrait: "images/cat3.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "老鱼", text: "我倒是觉得投稿人的前辈更像是某种应激障碍，你看，在一个封闭的地方呆这么久，然后看投稿人和前辈也不是很熟的样子，会不会加重了他原本就有的心里疾病呢？", leftPortrait: "images/fish2.PNG", rightPortrait: "images/cat1.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "那这样的话那个声音又怎么解释呢？", rightPortrait: "images/cat3.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "dialogue", speaker: "老鱼", text: "会不会是亥塔的员工工作发出的动静啊？毕竟投稿人也没见过亥塔真正的运作方式。", leftPortrait: "images/fish2.PNG", rightPortrait: "images/cat1.PNG" },
        { type: "dialogue", speaker: "老鱼", text: "说不定前辈知道些什么，知道这座塔究竟是怎么运作起来的。也许是因为这个秘密刺激到了前辈呢？", leftPortrait: "images/fish2.PNG", rightPortrait: "images/cat1.PNG" },
        { type: "dialogue", speaker: "苗苗", text: "有可能……", rightPortrait: "images/cat1.PNG", leftPortrait: "images/fish1.PNG" },
        { type: "narration", text: "收音机突然发出一阵急促的电流声。" },
        { type: "dialogue", speaker: "灵泊", text: "诶？", centerPortrait: "images/lingbo2.PNG" },
        { type: "narration", text: "收音机似乎没有收到信号。" },
        { type: "narration", text: "灵泊试着重新拨弄收音机。" },
        { type: "dialogue", speaker: "灵泊", text: "可恶……找不到刚才的波段了。", centerPortrait: "images/lingbo8.PNG" },
        { type: "narration", text: "节目里的声音戛然而止，只剩下断断续续的杂音。" },
        { type: "narration", text: "灵泊试着重新拨弄收音机的旋钮。" }
    ],
    radio_2_repeat: [
        { type: "narration", text: "灵泊试着重新拨弄收音机的旋钮。" },
        { type: "dialogue", speaker: "灵泊", text: "可恶……找不到刚才的波段了。", portrait: "images/lingbo8.PNG" }
    ],
    cabinet_2: [
        { type: "narration", text: "灵泊简单翻了一下，大部分柜子里几乎什么东西都没有。" },
        { type: "dialogue", speaker: "灵泊", text: "！", portrait: "images/lingbo5.PNG" },
        { type: "narration", text: "右上角的柜子里面放着一张字条，上面沾着暗红色的血迹。\n\n【字条】\n都是骗人的！\n只要来了就一定会死的！！\n必须要逃出去！！！" },
        { type: "dialogue", speaker: "灵泊", text: "……", portrait: "images/lingbo10.PNG" }
    ],
    door_left_4: [
        { type: "dialogue", speaker: "灵泊", text: "灵泊走上前，试着推了推门。", portrait: "images/lingbo1.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "打不开。", portrait: "images/lingbo10.PNG" }
    ],
    door_mid_4: [
        { type: "dialogue", speaker: "灵泊", text: "灵泊试着推了推门。", portrait: "images/lingbo1.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "打不开。", portrait: "images/lingbo10.PNG" }
    ],
    notice_4: [
        { type: "dialogue", speaker: "灵泊", text: "灵泊停在介绍牌前，仔细阅读上面的文字。", portrait: "images/lingbo6.PNG" },
        { type: "narration", text: "停灵馆\n逝者过世后、火化或下葬前，其遗体或骨灰可暂时安置于停灵室，并由工作人员轮流守护。" },
        { type: "dialogue", speaker: "灵泊", text: "……工作人员？", portrait: "images/lingbo2.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "奇怪。刚才电台里那个人，不是说自己只负责巡逻和安保吗？", portrait: "images/lingbo8.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "难道……这里真的有秘密员工？", portrait: "images/lingbo8.PNG" }
    ],
    elevator_4: [
        { type: "conditional", check: () => explored5 && explored6 && explored8,
          ifTrue: [
              { type: "dialogue", speaker: "灵泊", text: "看来这层已经调查完了，走吧。", portrait: "images/lingbo1.PNG" },
              { type: "choice", options: [ { text: "使用ID卡", next: "elevator_4_success" } ] }
          ],
          ifFalse: [
              { type: "dialogue", speaker: "灵泊", text: "先把这一层调查完，再试着上去吧。", portrait: "images/lingbo8.PNG" }
          ]
        }
    ],
    elevator_4_success: [ { type: "action", action: "enter_eighth_elevator_story" } ],
    corridor_4: [
        { type: "narration", text: "黑黢黢的，什么都看不清。" },
        { type: "action", action: "jump_scene", sceneId: "scene5" }
    ],
    emergency_5: [
        { type: "dialogue", speaker: "灵泊", text: "灵泊走到紧急通道门前……", portrait: "images/lingbo6.PNG" },
        { type: "narration", text: "门纹丝不动。" },
        { type: "narration", text: "他又加大力气推了一下……" },
        { type: "dialogue", speaker: "灵泊", text: "这层的紧急通道也完全打不开。", portrait: "images/lingbo7.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "好在这层的电梯能用。", portrait: "images/lingbo10.PNG" }
    ],
    door_5: [
        { type: "conditional", check: () => hasPass,
          ifTrue: [
              { type: "dialogue", speaker: "灵泊", text: "试试刚才捡到的通行证吧。", portrait: "images/lingbo6.PNG" },
              { type: "choice", options: [ { text: "使用通行证", next: "door_5_success" } ] }
          ],
          ifFalse: [
              { type: "dialogue", speaker: "灵泊", text: "灵泊停在一扇厚重的大门前。", portrait: "images/lingbo1.PNG" },
              { type: "dialogue", speaker: "灵泊", text: "这个门……看上去需要刷卡才能打开。", portrait: "images/lingbo6.PNG" },
              { type: "dialogue", speaker: "灵泊", text: "旁边有一个介绍牌。", portrait: "images/lingbo6.PNG" },
              { type: "dialogue", speaker: "灵泊", text: "停灵室。", portrait: "images/lingbo6.PNG" },
              { type: "dialogue", speaker: "灵泊", text: "……", portrait: "images/lingbo10.PNG" },
              { type: "dialogue", speaker: "灵泊", text: "里面不会真的有死人吧？", portrait: "images/lingbo7.PNG" },
              { type: "dialogue", speaker: "灵泊", text: "我不是很想进去……", portrait: "images/lingbo9.PNG" }
          ]
        }
    ],
    door_5_success: [
        { type: "dialogue", speaker: "灵泊", text: "……！", portrait: "images/lingbo5.PNG" },
        { type: "narration", text: "卡片通过验证。沉重的大门缓缓升起……" },
        { type: "action", action: "jump_scene", sceneId: "scene7" }
    ],
    white_door_5: [
        { type: "dialogue", speaker: "灵泊", text: "灵泊走到一扇白色的大门前。", portrait: "images/lingbo6.PNG" },
        { type: "narration", text: "门上方标注着三个字：停尸房。" },
        { type: "dialogue", speaker: "灵泊", text: "……", portrait: "images/lingbo10.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "我真的应该进去吗……", portrait: "images/lingbo7.PNG" },
        { type: "narration", text: "灵泊小心翼翼地推了推门。门竟然打开了。" },
        { type: "dialogue", speaker: "灵泊", text: "！", portrait: "images/lingbo5.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "……目前遇到的第一个可以进入的房间居然是停尸房。", portrait: "images/lingbo9.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "好可疑……", portrait: "images/lingbo8.PNG" },
        { type: "action", action: "jump_scene", sceneId: "scene6" }
    ],
    corridor_5: [
        { type: "narration", text: "黑黢黢的，什么都看不清。" },
        { type: "action", action: "jump_scene", sceneId: "scene4" }
    ],
    white_door_6: [ { type: "action", action: "jump_scene", sceneId: "scene5" } ],
    cabinet_6: [
        { type: "narration", text: "柜子密密麻麻地排列在房间里……" },
        { type: "dialogue", speaker: "灵泊", text: "柜子上都有编号……", portrait: "images/lingbo6.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "……是尸体的编号吗？", portrait: "images/lingbo2.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "我完全不想靠近这些东西……", portrait: "images/lingbo9.PNG" }
    ],
    pass_6: [
        { type: "dialogue", speaker: "灵泊", text: "！", portrait: "images/lingbo5.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "这是什么？", portrait: "images/lingbo2.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "……是一张通行证。", portrait: "images/lingbo6.PNG" },
        { type: "narration", text: "他看了看卡片的正反面……" },
        { type: "dialogue", speaker: "灵泊", text: "没有写清楚用途……", portrait: "images/lingbo8.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "究竟是用来打开哪里的门的？", portrait: "images/lingbo2.PNG" },
        { type: "action", action: "get_pass" }
    ],
    door_7: [
        { type: "dialogue", speaker: "灵泊", text: "（内心）……赶紧离开吧。", portrait: "images/lingbo10.PNG" },
        { type: "choice", options: [ { text: "离开", next: "door_7_leave" } ] }
    ],
    door_7_leave: [ { type: "action", action: "jump_scene", sceneId: "scene5" } ],
    table_7: [
        { type: "narration", text: "桌子上摆着两根没有点燃的蜡烛……" },
        { type: "dialogue", speaker: "灵泊", text: "太暗了，看不清……", portrait: "images/lingbo8.PNG" }
    ],
    monster_7_first_meet: [
        { type: "narration", text: "房间很暗，血腥味很重，房间中央似乎有一个人影。", bg: "images/black.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "！", leftPortrait: "images/lingbo5.PNG", bg: "images/cbg8.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "（内心）那是个人吗？不太确定……要不要靠近一点看看？", leftPortrait: "images/lingbo7.PNG" },
        { type: "narration", text: "灵泊小心翼翼地走近了一些。" },
        { type: "dialogue", speaker: "灵泊", text: "嘶……", leftPortrait: "images/lingbo8.PNG" },
        { type: "narration", text: "等眼睛终于适应黑暗，看清那人的样子时，灵泊不自觉地发出了声音。\n那人的头盖骨被掀开，血淋淋的大脑暴露在外，头顶罩着一个透明的玻璃罩。胸膛到小腹的位置被划开了一道口子，粗绳勉强将伤口缝合，却仍能看见里面裸露的肺脏与肠子。" },
        { type: "dialogue", speaker: "灵泊", text: "……", leftPortrait: "images/lingbo10.PNG", rightPortrait: "images/x3.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "（内心）天哪……这人还活着吗？", leftPortrait: "images/lingbo5.PNG", rightPortrait: "images/x3.PNG" },
        { type: "narration", text: "突然间，那人似乎睁开了眼睛。" },
        
        { type: "dialogue", speaker: "？？", text: "……", rightPortrait: "images/x1.PNG", leftPortrait: "images/lingbo5.PNG" },
        { type: "dialogue", speaker: "？？", text: "你好呀。", rightPortrait: "images/x5.PNG", leftPortrait: "images/lingbo7.PNG" },
        
        { type: "dialogue", speaker: "灵泊", text: "！", leftPortrait: "images/lingbo5.PNG", rightPortrait: "images/x5.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "你、你好……", leftPortrait: "images/lingbo7.PNG", rightPortrait: "images/x1.PNG" },
        
        { type: "dialogue", speaker: "？？", text: "你是谁呀？这里一般不能来人的。", rightPortrait: "images/x5.PNG", leftPortrait: "images/lingbo8.PNG" },
        
        { type: "dialogue", speaker: "灵泊", text: "……我是灵泊。不好意思，我不是故意闯进来的。我其实是来这里找工作人员的。", leftPortrait: "images/lingbo8.PNG", rightPortrait: "images/x1.PNG" },
        
        { type: "dialogue", speaker: "？？", text: "你不是工作人员吗？那你怎么会出现在这里？", rightPortrait: "images/x4.PNG", leftPortrait: "images/lingbo8.PNG" },
        
        { type: "dialogue", speaker: "灵泊", text: "我不是……我醒来的时候就在这附近了。我来这里是想了解情况的。", leftPortrait: "images/lingbo8.PNG", rightPortrait: "images/x1.PNG" },
        { type: "narration", text: "灵泊犹豫了一下。" },
        { type: "dialogue", speaker: "灵泊", text: "这里是不是出了什么事？我来的时候，一直都没有看到工作人员。", leftPortrait: "images/lingbo8.PNG", rightPortrait: "images/x1.PNG" },
        
        { type: "dialogue", speaker: "？？", text: "哎呀，那可真遗憾。", rightPortrait: "images/x4.PNG", leftPortrait: "images/lingbo10.PNG" },
        { type: "narration", text: "它轻轻动了一下脑袋，玻璃罩随着动作发出一声轻响。" },
        { type: "dialogue", speaker: "？？", text: "你看，我这个样子，完全没办法知道外面发生了什么呢。", rightPortrait: "images/x5.PNG", leftPortrait: "images/lingbo10.PNG" },
        { type: "narration", text: "灵泊顺着它的视线往下看，这才发现它的大腿以下空空荡荡，根本没有双腿。" },
        
        { type: "dialogue", speaker: "灵泊", text: "……", leftPortrait: "images/lingbo10.PNG", rightPortrait: "images/x5.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "(内心)……我还是不要问了。", leftPortrait: "images/lingbo10.PNG", rightPortrait: "images/x1.PNG" },
        
        { type: "dialogue", speaker: "？？", text: "不过，这儿应该没什么事吧？", rightPortrait: "images/x4.PNG", leftPortrait: "images/lingbo10.PNG" },
        { type: "narration", text: "它像是突然想起了什么，语气依旧轻快。" },
        
        { type: "dialogue", speaker: "？？", text: "哎呀，不对。算算时间，应该快到祂的进食时间了。", rightPortrait: "images/x5.PNG", leftPortrait: "images/lingbo10.PNG" },
        { type: "dialogue", speaker: "？？", text: "“不过没什么啦，这不重要。你要问的东西我也不太清楚呢。”", rightPortrait: "images/x5.PNG", leftPortrait: "images/lingbo10.PNG" },
        
        { type: "dialogue", speaker: "灵泊", text: "……。", leftPortrait: "images/lingbo10.PNG", rightPortrait: "images/x1.PNG" },
        { type: "narration", text: "它眨了眨眼睛。" },
        
        { type: "dialogue", speaker: "？？", text: "哎呀，最近总是这样，脑子里乱糟糟的，老是忘记事儿。", rightPortrait: "images/x5.PNG", leftPortrait: "images/lingbo10.PNG" },
        
        { type: "dialogue", speaker: "灵泊", text: "……", leftPortrait: "images/lingbo10.PNG", rightPortrait: "images/x5.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "（内心）……算了，跟它好像也问不出什么，但我还是很在意那个……", leftPortrait: "images/lingbo9.PNG", rightPortrait: "images/x5.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "那个，你刚才说的……进食时间，是指什么？", leftPortrait: "images/lingbo2.PNG", rightPortrait: "images/x1.PNG" },
        
        { type: "dialogue", speaker: "？？", text: "进食时间？", rightPortrait: "images/x4.PNG", leftPortrait: "images/lingbo2.PNG" },
        { type: "narration", text: "它重复了一遍，似乎很努力地在思考什么。" },
        { type: "dialogue", speaker: "？？", text: "啊……那个啊。", rightPortrait: "images/x4.PNG", leftPortrait: "images/lingbo2.PNG" },
        { type: "narration", text: "它笑了起来。" },
        { type: "dialogue", speaker: "？？", text: "就是吃东西的时候呀。", rightPortrait: "images/x5.PNG", leftPortrait: "images/lingbo2.PNG" },
        
        { type: "dialogue", speaker: "灵泊", text: "……", leftPortrait: "images/lingbo10.PNG", rightPortrait: "images/x1.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "（内心）这不是废话吗……", leftPortrait: "images/lingbo9.PNG", rightPortrait: "images/x1.PNG" },
        
        { type: "dialogue", speaker: "？？", text: "不过，祂不是什么时候都吃的。要等到时间到了，才可以吃。", rightPortrait: "images/x5.PNG", leftPortrait: "images/lingbo9.PNG" },
        
        { type: "dialogue", speaker: "灵泊", text: "……你说的‘祂’是谁？谁要吃东西？", leftPortrait: "images/lingbo8.PNG", rightPortrait: "images/x1.PNG" },
        
        { type: "dialogue", speaker: "？？", text: "你说的谁是谁呀？", rightPortrait: "images/x4.PNG", leftPortrait: "images/lingbo8.PNG" },
        
        { type: "dialogue", speaker: "灵泊", text: "……", leftPortrait: "images/lingbo10.PNG", rightPortrait: "images/x5.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "没事儿，就当我没问。", leftPortrait: "images/lingbo10.PNG", rightPortrait: "images/x5.PNG" },
        
        { type: "narration", text: "灵泊下意识地往后退了一步。\n虽然对方看上去暂时没有什么攻击他的意思，但光是站在这里，就已经让他浑身不自在了。他实在不想继续靠近那张桌子。" },
        
        { type: "dialogue", speaker: "？？", text: "哎呀，你要走了吗？", rightPortrait: "images/x5.PNG", leftPortrait: "images/lingbo10.PNG" },
        
        { type: "dialogue", speaker: "灵泊", text: "……嗯。我还要去找其他人。", leftPortrait: "images/lingbo1.PNG", rightPortrait: "images/x1.PNG" },
        
        { type: "dialogue", speaker: "？？", text: "其他人？", rightPortrait: "images/x4.PNG", leftPortrait: "images/lingbo1.PNG" },
        { type: "narration", text: "它想了一会儿。" },
        
        { type: "dialogue", speaker: "？？", text: "这里还有其他人吗？", rightPortrait: "images/x5.PNG", leftPortrait: "images/lingbo1.PNG" },
        
        { type: "dialogue", speaker: "灵泊", text: "……", leftPortrait: "images/lingbo10.PNG", rightPortrait: "images/x5.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "你不知道吗？", leftPortrait: "images/lingbo2.PNG", rightPortrait: "images/x1.PNG" },
        
        { type: "dialogue", speaker: "？？", text: "不知道呀。", rightPortrait: "images/x5.PNG", leftPortrait: "images/lingbo2.PNG" },
        { type: "dialogue", speaker: "？？", text: "不对，之前好像也有人来过。", rightPortrait: "images/x4.PNG", leftPortrait: "images/lingbo2.PNG" },
        
        { type: "dialogue", speaker: "灵泊", text: "！", leftPortrait: "images/lingbo5.PNG", rightPortrait: "images/x1.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "什么时候？是工作人员吗？", leftPortrait: "images/lingbo8.PNG", rightPortrait: "images/x1.PNG" },
        
        { type: "dialogue", speaker: "？？", text: "唔……", rightPortrait: "images/x4.PNG", leftPortrait: "images/lingbo8.PNG" },
        { type: "narration", text: "它歪着脑袋，似乎在努力回忆。" },
        
        { type: "dialogue", speaker: "？？", text: "记不清啦。", rightPortrait: "images/x5.PNG", leftPortrait: "images/lingbo8.PNG" },
        
        { type: "dialogue", speaker: "灵泊", text: "……", leftPortrait: "images/lingbo10.PNG", rightPortrait: "images/x3.PNG" },
        
        { type: "dialogue", speaker: "？？", text: "哎呀，不过也没关系。反正最后都会回来的。", rightPortrait: "images/x5.PNG", leftPortrait: "images/lingbo10.PNG" },
        
        { type: "dialogue", speaker: "灵泊", text: "……回来？", leftPortrait: "images/lingbo2.PNG", rightPortrait: "images/x5.PNG" },
        
        { type: "dialogue", speaker: "？？", text: "嗯。", rightPortrait: "images/x3.PNG", leftPortrait: "images/lingbo2.PNG" },
        { type: "narration", text: "它重新闭上了眼睛。" },
        
        { type: "dialogue", speaker: "？？", text: "我有点困了。", rightPortrait: "images/x3.PNG", leftPortrait: "images/lingbo2.PNG" },
        
        { type: "narration", text: "灵泊站在原地等了一会儿。\n那人没有再说话。" },
        
        { type: "dialogue", speaker: "灵泊", text: "（内心）……睡着了？", leftPortrait: "images/lingbo10.PNG", rightPortrait: "images/x3.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "（内心）……算了，这里实在待不下去了。", leftPortrait: "images/lingbo11.PNG", rightPortrait: "images/x3.PNG" },
        
        { type: "narration", text: "这里实在是待不下去了。" },
        
        { type: "dialogue", speaker: "灵泊", text: "赶紧走吧。", leftPortrait: "images/lingbo10.PNG", rightPortrait: "images/x3.PNG" }
    ],
    monster_7_after: [
        { type: "dialogue", speaker: "灵泊", text: "（内心）……我还是别打扰它了。", portrait: "images/lingbo10.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "（内心）赶紧走吧。", portrait: "images/lingbo10.PNG" }
    ],
    corridor_8: [
        { type: "narration", text: "黑黢黢的，什么都看不清。" },
        { type: "action", action: "jump_scene", sceneId: "scene10" }
    ],
    black_door_8: [
        { type: "dialogue", speaker: "灵泊", text: "！", portrait: "images/lingbo5.PNG" },
        { type: "narration", text: "一扇厚重的大门，似乎需要刷卡才能打开。" },
        { type: "dialogue", speaker: "灵泊", text: "这个门长得好像之前在三楼的那扇……", portrait: "images/lingbo8.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "用之前那张通行证试试？", portrait: "images/lingbo2.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "不过打开门之后应该不会看到跟刚才一样的怪人吧……", portrait: "images/lingbo7.PNG" },
        { type: "choice", options: [ { text: "使用通行证", next: "black_door_8_success" } ] }
    ],
    black_door_8_success: [
        { type: "narration", text: "卡片通过验证。\n沉重的大门缓缓升起，露出门后的空间。" },
        { type: "action", action: "jump_scene", sceneId: "scene9" }
    ],
    notice_8: [
        { type: "dialogue", speaker: "灵泊", text: "入馆室……负责逝者的接运、安置……", portrait: "images/lingbo6.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "哦—原来是入殓和办葬礼的地方。", portrait: "images/lingbo1.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "感觉比之前的那层楼好多了。", portrait: "images/lingbo3.PNG" }
    ],
    elevator_8: [
        { type: "dialogue", speaker: "灵泊", text: "？", portrait: "images/lingbo2.PNG" },
        { type: "narration", text: "电梯按钮没有反应。" },
        { type: "dialogue", speaker: "灵泊", text: "这里的电梯还真有脾气。", portrait: "images/lingbo7.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "算了，先调查一下这层看看吧。", portrait: "images/lingbo10.PNG" }
    ],
    door_9: [ { type: "action", action: "jump_scene", sceneId: "scene8" } ],
    coffin_9: [
        { type: "narration", text: "这看上去像是一口棺材。" },
        { type: "dialogue", speaker: "灵泊", text: "（内心）里面不会躺着人吧……", portrait: "images/lingbo7.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "应该不会吧……试试看。", portrait: "images/lingbo8.PNG" },
        { type: "narration", text: "灵泊伸手敲了敲棺材板。传来一阵清脆的声响。" },
        { type: "dialogue", speaker: "灵泊", text: "听上去是空心的。", portrait: "images/lingbo6.PNG" }
    ],
    tablet_9: [
        { type: "narration", text: "牌位看上去非常新，表面没有积灰。" },
        { type: "dialogue", speaker: "灵泊", text: "！", portrait: "images/lingbo5.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "牌位上有名字。", portrait: "images/lingbo8.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "我看看……", portrait: "images/lingbo6.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "01？", portrait: "images/lingbo2.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "……", portrait: "images/lingbo10.PNG" }
    ],
    wreath_9: [
        { type: "dialogue", speaker: "灵泊", text: "这个……好像是葬礼上用的装饰。", portrait: "images/lingbo6.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "嘶……头好痛……", portrait: "images/lingbo8.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "（内心）……总感觉在哪儿见过。", portrait: "images/lingbo8.PNG" }
    ],
    emergency_10: [
        { type: "narration", text: "灵泊走到紧急通道门前，伸手推了推。" },
        { type: "dialogue", speaker: "灵泊", text: "！", portrait: "images/lingbo5.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "居然可以打开", portrait: "images/lingbo2.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "应该可以从这里通往六楼或者四楼。", portrait: "images/lingbo6.PNG" },
        { type: "choice", options: [ { text: "进入紧急通道", next: "emergency_10_enter" } ] }
    ],
    emergency_10_enter: [ { type: "action", action: "jump_scene", sceneId: "scene11" } ],
    door_mid_10: [
        { type: "narration", text: "灵泊走上前，试着推了推门。" },
        { type: "dialogue", speaker: "灵泊", text: "打不开。", portrait: "images/lingbo10.PNG" }
    ],
    door_04_10: [
        { type: "narration", text: "灵泊试着推了推门。" },
        { type: "dialogue", speaker: "灵泊", text: "打不开。", portrait: "images/lingbo10.PNG" }
    ],
    corridor_10: [
        { type: "narration", text: "黑黢黢的，什么都看不清。" },
        { type: "action", action: "jump_scene", sceneId: "scene8" }
    ],
    left_arrow_11: [
        { type: "dialogue", speaker: "灵泊", text: "可以去四楼。", portrait: "images/lingbo6.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "！", portrait: "images/lingbo5.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "铁栏杆……需要剪开才能通往四楼……", portrait: "images/lingbo8.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "四楼到底有什么啊？", portrait: "images/lingbo7.PNG" }
    ],
    stairs_11: [
        { type: "dialogue", speaker: "灵泊", text: "五楼电梯没办法用，只能走楼梯上去了。", portrait: "images/lingbo8.PNG" }
    ],
    right_arrow_11: [
        { type: "dialogue", speaker: "灵泊", text: "不管怎么样，还是先上楼试试看吧。", portrait: "images/lingbo6.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "希望楼上的紧急通道没锁。", portrait: "images/lingbo11.PNG" },
        { type: "action", action: "jump_scene", sceneId: "scene12" }
    ],
        scene12_first_meet: [
        { type: "narration", text: "似乎有个人影堵在六楼的楼道。" },
        { type: "dialogue", speaker: "灵泊", text: "！", leftPortrait: "images/lingbo5.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "（内心）不会是和之前的怪人一样的吧？", leftPortrait: "images/lingbo7.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "（内心）现在返回五楼还来得及吗……", leftPortrait: "images/lingbo7.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "（内心）小心一点总是没错的……", leftPortrait: "images/lingbo8.PNG" },
        { type: "dialogue", speaker: "？？", text: "谁！谁在那里？", rightPortrait: "images/guarder3.PNG", leftPortrait: "images/lingbo8.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "（内心）！被发现了！", leftPortrait: "images/lingbo5.PNG", rightPortrait: "images/guarder1.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "（内心）不过，对方看上去可以交流。", leftPortrait: "images/lingbo1.PNG", rightPortrait: "images/guarder1.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "（内心）应该……不会和刚才的怪人一样吧？", leftPortrait: "images/lingbo7.PNG", rightPortrait: "images/guarder1.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "呃……你好，我是灵泊。我醒来的时候就在塔外了……", leftPortrait: "images/lingbo7.PNG", rightPortrait: "images/guarder1.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "我来这里是因为有人建议我来亥塔找工作人员求助……", leftPortrait: "images/lingbo8.PNG", rightPortrait: "images/guarder1.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "结果我一直在这里找工作人员，没有找到……", leftPortrait: "images/lingbo9.PNG", rightPortrait: "images/guarder1.PNG" },
        { type: "dialogue", speaker: "？？", text: "……", rightPortrait: "images/guarder1.PNG", leftPortrait: "images/lingbo9.PNG" },
        { type: "dialogue", speaker: "？？", text: "谁建议你过来的？", rightPortrait: "images/guarder6.PNG", leftPortrait: "images/lingbo9.PNG" },
        { type: "dialogue", speaker: "？？", text: "亥塔附近只有一个乱葬岗，你怎么会出现在那里？", rightPortrait: "images/guarder6.PNG", leftPortrait: "images/lingbo9.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "（内心）我也想知道啊……", leftPortrait: "images/lingbo9.PNG", rightPortrait: "images/guarder6.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "我并不知道她是谁。", leftPortrait: "images/lingbo10.PNG", rightPortrait: "images/guarder6.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "我醒来的时候就在乱葬岗，什么都不记得了。没多久遇见了一个女人，她告诉我可以来亥塔寻求帮助。", leftPortrait: "images/lingbo8.PNG", rightPortrait: "images/guarder6.PNG" },
        { type: "dialogue", speaker: "？？", text: "女人？", rightPortrait: "images/guarder2.PNG", leftPortrait: "images/lingbo8.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "嗯。", leftPortrait: "images/lingbo1.PNG", rightPortrait: "images/guarder2.PNG" },
        { type: "dialogue", speaker: "？？", text: "……她长什么样？", rightPortrait: "images/guarder6.PNG", leftPortrait: "images/lingbo1.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "（内心）还是不要透露的比较好", leftPortrait: "images/lingbo8.PNG", rightPortrait: "images/guarder6.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "我记不太清了。", leftPortrait: "images/lingbo10.PNG", rightPortrait: "images/guarder6.PNG" },
        { type: "dialogue", speaker: "？？", text: "……", rightPortrait: "images/guarder1.PNG", leftPortrait: "images/lingbo10.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "你问这么仔细，是有什么问题吗？", leftPortrait: "images/lingbo2.PNG", rightPortrait: "images/guarder1.PNG" },
        { type: "dialogue", speaker: "？？", text: "……", rightPortrait: "images/guarder4.PNG", leftPortrait: "images/lingbo2.PNG" },
        { type: "dialogue", speaker: "？？", text: "没什么。", rightPortrait: "images/guarder5.PNG", leftPortrait: "images/lingbo2.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "（内心）……好敷衍……这算什么回答。", leftPortrait: "images/lingbo9.PNG", rightPortrait: "images/guarder5.PNG" },
        { type: "dialogue", speaker: "？？", text: "那你在这里待了多久？", rightPortrait: "images/guarder1.PNG", leftPortrait: "images/lingbo9.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "我也不清楚。至少已经调查过好几层了。", leftPortrait: "images/lingbo8.PNG", rightPortrait: "images/guarder1.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "因为电梯不能正常使用，我只能一层一层找上来。", leftPortrait: "images/lingbo6.PNG", rightPortrait: "images/guarder1.PNG" },
        { type: "dialogue", speaker: "？？", text: "你去了几楼？", rightPortrait: "images/guarder2.PNG", leftPortrait: "images/lingbo6.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "二楼，三楼、五楼……", leftPortrait: "images/lingbo6.PNG", rightPortrait: "images/guarder2.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "四楼没去成，入口被铁栏杆挡住了。", leftPortrait: "images/lingbo8.PNG", rightPortrait: "images/guarder2.PNG" },
        { type: "dialogue", speaker: "？？", text: "你去过三楼？", rightPortrait: "images/guarder3.PNG", leftPortrait: "images/lingbo8.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "嗯。怎么了？", leftPortrait: "images/lingbo2.PNG", rightPortrait: "images/guarder3.PNG" },
        { type: "dialogue", speaker: "？？", text: "……没什么。", rightPortrait: "images/guarder5.PNG", leftPortrait: "images/lingbo2.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "（内心）又是没什么。", leftPortrait: "images/lingbo9.PNG", rightPortrait: "images/guarder5.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "（内心）他刚才明明很在意，肯定有什么事情。", leftPortrait: "images/lingbo8.PNG", rightPortrait: "images/guarder5.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "（内心）我也得想办法套一些信息出来。", leftPortrait: "images/lingbo1.PNG", rightPortrait: "images/guarder5.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "那你呢？你为什么一个人待在六楼？", leftPortrait: "images/lingbo2.PNG", rightPortrait: "images/guarder5.PNG" },
        { type: "dialogue", speaker: "？？", text: "……", rightPortrait: "images/guarder4.PNG", leftPortrait: "images/lingbo2.PNG" },
        { type: "dialogue", speaker: "？？", text: "因为我想要调查一下亥塔的通道。", rightPortrait: "images/guarder1.PNG", leftPortrait: "images/lingbo2.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "通道？", leftPortrait: "images/lingbo2.PNG", rightPortrait: "images/guarder1.PNG" },
        { type: "dialogue", speaker: "？？", text: "你也看到了，通往四楼的楼道堵住了，所以需要找一条没有障碍、可以通行的路线。", rightPortrait: "images/guarder1.PNG", leftPortrait: "images/lingbo2.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "……原来如此", leftPortrait: "images/lingbo1.PNG", rightPortrait: "images/guarder1.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "（内心）可是，他为什么这么在意通道？", leftPortrait: "images/lingbo8.PNG", rightPortrait: "images/guarder1.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "（内心）如果只是想去其他楼层，应该还有电梯才对。", leftPortrait: "images/lingbo8.PNG", rightPortrait: "images/guarder1.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "（内心）……不对，电梯现在已经不能正常使用了。", leftPortrait: "images/lingbo8.PNG", rightPortrait: "images/guarder1.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "（内心）至少先确认一件事。", leftPortrait: "images/lingbo1.PNG", rightPortrait: "images/guarder1.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "请告诉我现在这里到底发生了什么吧。", leftPortrait: "images/lingbo8.PNG", rightPortrait: "images/guarder1.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "我总觉得这里怪怪的。", leftPortrait: "images/lingbo7.PNG", rightPortrait: "images/guarder1.PNG" },
        { type: "dialogue", speaker: "？？", text: "……", rightPortrait: "images/guarder4.PNG", leftPortrait: "images/lingbo7.PNG" },
        { type: "dialogue", speaker: "？？", text: "你在下面的时候，没有遇到什么奇怪的东西？", rightPortrait: "images/guarder2.PNG", leftPortrait: "images/lingbo7.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "遇到了。", leftPortrait: "images/lingbo1.PNG", rightPortrait: "images/guarder2.PNG" },
        { type: "dialogue", speaker: "？？", text: "什么？", rightPortrait: "images/guarder2.PNG", leftPortrait: "images/lingbo1.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "一个……很难形容的人。", leftPortrait: "images/lingbo8.PNG", rightPortrait: "images/guarder2.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "他的头骨被打开了，胸口也被切开，里面的东西都能看见。", leftPortrait: "images/lingbo8.PNG", rightPortrait: "images/guarder2.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "我本来以为他已经死了，结果他突然跟我说话。", leftPortrait: "images/lingbo7.PNG", rightPortrait: "images/guarder2.PNG" },
        { type: "dialogue", speaker: "？？", text: "……", rightPortrait: "images/guarder1.PNG", leftPortrait: "images/lingbo7.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "怎么，你也遇到了？", leftPortrait: "images/lingbo2.PNG", rightPortrait: "images/guarder1.PNG" },
        { type: "dialogue", speaker: "？？", text: "……", rightPortrait: "images/guarder4.PNG", leftPortrait: "images/lingbo2.PNG" },
        { type: "dialogue", speaker: "？？", text: "……差不多。", rightPortrait: "images/guarder5.PNG", leftPortrait: "images/lingbo2.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "（内心）什么叫差不多？", leftPortrait: "images/lingbo9.PNG", rightPortrait: "images/guarder5.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "所以那到底是什么东西？", leftPortrait: "images/lingbo8.PNG", rightPortrait: "images/guarder5.PNG" },
        { type: "dialogue", speaker: "？？", text: "我也不清楚。", rightPortrait: "images/guarder4.PNG", leftPortrait: "images/lingbo8.PNG" },
        { type: "dialogue", speaker: "？？", text: "但我知道，这座塔发生了什么变故。", rightPortrait: "images/guarder6.PNG", leftPortrait: "images/lingbo8.PNG" },
        { type: "dialogue", speaker: "？？", text: "从某一天开始，这里的一切就慢慢变得奇怪起来。", rightPortrait: "images/guarder6.PNG", leftPortrait: "images/lingbo8.PNG" },
        { type: "dialogue", speaker: "？？", text: "一开始，我以为是自己想多了。毕竟这里的工作本来就有些特殊，也许只是我还不习惯。", rightPortrait: "images/guarder6.PNG", leftPortrait: "images/lingbo8.PNG" },
        { type: "dialogue", speaker: "？？", text: "但是后来，发生的事情越来越奇怪。", rightPortrait: "images/guarder6.PNG", leftPortrait: "images/lingbo8.PNG" },
        { type: "dialogue", speaker: "？？", text: "奇怪到我已经没办法找理由说服我自己。", rightPortrait: "images/guarder6.PNG", leftPortrait: "images/lingbo8.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "……工作？", leftPortrait: "images/lingbo2.PNG", rightPortrait: "images/guarder6.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "等等，你是这里的工作人员？", leftPortrait: "images/lingbo5.PNG", rightPortrait: "images/guarder6.PNG" },
        { type: "dialogue", speaker: "？？", text: "是。", rightPortrait: "images/guarder1.PNG", leftPortrait: "images/lingbo5.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "（内心）太好了！终于遇到人了！", leftPortrait: "images/lingbo5.PNG", rightPortrait: "images/guarder1.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "（内心）但好像情况没我想的那么简单……", leftPortrait: "images/lingbo8.PNG", rightPortrait: "images/guarder1.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "我在下面发现了一些东西。比如一张工牌，还有一封辞职信。", leftPortrait: "images/lingbo8.PNG", rightPortrait: "images/guarder1.PNG" },
        { type: "dialogue", speaker: "？？", text: "……", rightPortrait: "images/guarder4.PNG", leftPortrait: "images/lingbo8.PNG" },
        { type: "dialogue", speaker: "？？", text: "……你在哪里发现的？", rightPortrait: "images/guarder6.PNG", leftPortrait: "images/lingbo8.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "在下面的办公室附近。", leftPortrait: "images/lingbo6.PNG", rightPortrait: "images/guarder6.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "那张工牌是01的。", leftPortrait: "images/lingbo8.PNG", rightPortrait: "images/guarder6.PNG" },
        { type: "dialogue", speaker: "？？", text: "……", rightPortrait: "images/guarder1.PNG", leftPortrait: "images/lingbo8.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "（内心）他的反应……他果然认识这个01。", leftPortrait: "images/lingbo8.PNG", rightPortrait: "images/guarder1.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "01是你的同事？", leftPortrait: "images/lingbo2.PNG", rightPortrait: "images/guarder1.PNG" },
        { type: "dialogue", speaker: "？？", text: "……是。", rightPortrait: "images/guarder1.PNG", leftPortrait: "images/lingbo2.PNG" },
        { type: "dialogue", speaker: "？？", text: "他已经死了。", rightPortrait: "images/guarder6.PNG", leftPortrait: "images/lingbo2.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "（内心）……死了？", leftPortrait: "images/lingbo5.PNG", rightPortrait: "images/guarder6.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "……我很抱歉。", leftPortrait: "images/lingbo11.PNG", rightPortrait: "images/guarder6.PNG" },
        { type: "dialogue", speaker: "？？", text: "没什么好抱歉的。", rightPortrait: "images/guarder4.PNG", leftPortrait: "images/lingbo11.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "所以，你现在是在调查他的死因吗？", leftPortrait: "images/lingbo2.PNG", rightPortrait: "images/guarder4.PNG" },
        { type: "dialogue", speaker: "？？", text: "不完全是。", rightPortrait: "images/guarder1.PNG", leftPortrait: "images/lingbo2.PNG" },
        { type: "dialogue", speaker: "？？", text: "我发现，这座塔可能根本没打算让我们活着离开。", rightPortrait: "images/guarder6.PNG", leftPortrait: "images/lingbo2.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "……你是说，亥塔会杀死这里的工作人员？", leftPortrait: "images/lingbo5.PNG", rightPortrait: "images/guarder6.PNG" },
        { type: "dialogue", speaker: "？？", text: "我不清楚，但是为了自己的安全，我必须要搞清楚发生了什么。", rightPortrait: "images/guarder6.PNG", leftPortrait: "images/lingbo5.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "……", leftPortrait: "images/lingbo10.PNG", rightPortrait: "images/guarder6.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "（内心）他说得这么肯定，却又说自己不清楚。", leftPortrait: "images/lingbo9.PNG", rightPortrait: "images/guarder6.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "（内心）……他应该也还没弄明白。", leftPortrait: "images/lingbo10.PNG", rightPortrait: "images/guarder6.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "楼下有些房间打不开，有些地方根本不像是正常工作的场所。", leftPortrait: "images/lingbo8.PNG", rightPortrait: "images/guarder6.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "还有一些东西……一时间很难说清楚。", leftPortrait: "images/lingbo8.PNG", rightPortrait: "images/guarder6.PNG" },
        { type: "dialogue", speaker: "？？", text: "……", rightPortrait: "images/guarder4.PNG", leftPortrait: "images/lingbo8.PNG" },
        { type: "dialogue", speaker: "？？", text: "看来你确实不是专门来找麻烦的。", rightPortrait: "images/guarder1.PNG", leftPortrait: "images/lingbo8.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "……我本来也没打算找麻烦啊。", leftPortrait: "images/lingbo7.PNG", rightPortrait: "images/guarder1.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "我只是想弄清楚自己为什么会出现在乱葬岗，然后找到离开这里的方法。", leftPortrait: "images/lingbo8.PNG", rightPortrait: "images/guarder1.PNG" },
        { type: "dialogue", speaker: "？？", text: "……", rightPortrait: "images/guarder1.PNG", leftPortrait: "images/lingbo8.PNG" },
        { type: "dialogue", speaker: "？？", text: "我也是。", rightPortrait: "images/guarder7.PNG", leftPortrait: "images/lingbo8.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "……", leftPortrait: "images/lingbo10.PNG", rightPortrait: "images/guarder7.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "（内心）至少这一点，我们的目的是一样的。", leftPortrait: "images/lingbo1.PNG", rightPortrait: "images/guarder7.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "既然我们现在都想弄清楚这里发生了什么，要不要交换一下知道的事情？", leftPortrait: "images/lingbo2.PNG", rightPortrait: "images/guarder7.PNG" },
        { type: "dialogue", speaker: "？？", text: "可以。", rightPortrait: "images/guarder1.PNG", leftPortrait: "images/lingbo2.PNG" },
        { type: "dialogue", speaker: "？？", text: "不过我不保证我知道的事情一定是客观的。", rightPortrait: "images/guarder7.PNG", leftPortrait: "images/lingbo2.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "没关系。我也一样。", leftPortrait: "images/lingbo1.PNG", rightPortrait: "images/guarder7.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "对了。", leftPortrait: "images/lingbo2.PNG", rightPortrait: "images/guarder7.PNG" },
        { type: "dialogue", speaker: "？？", text: "？", rightPortrait: "images/guarder2.PNG", leftPortrait: "images/lingbo2.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "我们说了这么久，我好像还不知道你叫什么。", leftPortrait: "images/lingbo2.PNG", rightPortrait: "images/guarder2.PNG" },
        { type: "dialogue", speaker: "灵泊", text: "你刚才一直在问我的事情，我还以为你会先介绍自己呢。", leftPortrait: "images/lingbo2.PNG", rightPortrait: "images/guarder2.PNG" },
        { type: "dialogue", speaker: "？？", text: "……啊。", rightPortrait: "images/guarder5.PNG", leftPortrait: "images/lingbo2.PNG" },
        { type: "dialogue", speaker: "？？", text: "抱歉，我忘了。", rightPortrait: "images/guarder5.PNG", leftPortrait: "images/lingbo2.PNG" },
        { type: "dialogue", speaker: "？？", text: "我是亥塔工作人员之一，编号02。", rightPortrait: "images/guarder1.PNG", leftPortrait: "images/lingbo2.PNG" },
        { type: "narration", text: "——chapter 1 ends" }
    ]
};





function enterExploration(sceneId) {
    if (!explorationScenes[sceneId]) {
        showToast("找不到该探索场景的配置。");
        return;
    }
    currentSceneId = sceneId;
    const sceneConfig = explorationScenes[sceneId];

    if (sceneId === "scene5") explored5 = true;
    if (sceneId === "scene6") explored6 = true;
    if (sceneId === "scene7") explored8 = true;

    showScreen("exploration");
    playBgm("sound/cbg1.mp3");

    if (sceneId === "scene6" && hasPass) {
        if (explorationBackground) explorationBackground.src = "images/cbg7.PNG";
    } else {
        if (explorationBackground) explorationBackground.src = sceneConfig.background;
    }

    if (explorationPlayerWrap) {
        if (sceneConfig.hidePlayer) {
            explorationPlayerWrap.style.display = "none";
        } else {
            explorationPlayerWrap.style.display = "block";
            explorationPlayerWrap.style.left = sceneConfig.initPos.x;
            explorationPlayerWrap.style.bottom = sceneConfig.initPos.bottom;
            explorationPlayerWrap.style.height = sceneConfig.playerHeight || "45%";
        }
    }

    if (explorationHotspotsContainer) {
        explorationHotspotsContainer.innerHTML = "";
        sceneConfig.hotspots.forEach(hotspotData => {
            const btn = document.createElement("button");
            btn.className = "exploration-hotspot";
            btn.dataset.target = hotspotData.target;
            btn.style.cssText = hotspotData.style;
            explorationHotspotsContainer.appendChild(btn);
        });
    }

    isTeleporting = false;
    isExploringBusy = false;
    hideExplorationUI();

    if (sceneId === "scene7" && !hasMetMonster) {
        hasMetMonster = true;
        currentExplorationQueue = explorationScenarios.monster_7_first_meet;
        currentExplorationIndex = 0;
        isExploringBusy = true;
        playExplorationStep();
    } else if (sceneId === "scene12" && !hasMet02) {
        hasMet02 = true;
        currentExplorationQueue = explorationScenarios.scene12_first_meet;
        currentExplorationIndex = 0;
        isExploringBusy = true;
        playExplorationStep();
    }
}

function hideExplorationUI() {
    if (explorationDialogue) explorationDialogue.classList.add("hidden");
    if (explorationChoicePanel) explorationChoicePanel.classList.add("hidden");
    if (explorationHint) explorationHint.classList.add("hidden");
    if (explorationNameBox) explorationNameBox.classList.add("hidden");
    if (exPortraitLeft) { exPortraitLeft.classList.add("hidden"); exPortraitLeft.classList.remove("fish-large"); }
    if (exPortraitCenter) { exPortraitCenter.classList.add("hidden"); exPortraitCenter.classList.remove("monster-large"); }
    if (exPortraitRight) { exPortraitRight.classList.add("hidden"); exPortraitRight.classList.remove("monster-large", "guard-large"); }
}

function playExplorationStep() {
    if (currentExplorationIndex >= currentExplorationQueue.length) {
        isExploringBusy = false;
        return;
    }

       const step = currentExplorationQueue[currentExplorationIndex];
    currentExplorationStep = step;
    
    if (explorationChoicePanel) explorationChoicePanel.classList.add("hidden");
    if (explorationHint) explorationHint.classList.add("hidden");

    if (step.type === "choice") {
        showExplorationChoices(step.options);
    } 
    else if (step.type === "conditional") {
        if (step.check()) {
            currentExplorationQueue = step.ifTrue;
        } else {
            currentExplorationQueue = step.ifFalse;
        }
        currentExplorationIndex = 0;
        playExplorationStep();
        return;
    } 
    else if (step.type === "action") {
           if (step.action === "get_id_card") { hasIdCard = true; showToast(uiStrings[currentLanguage].idCardObtained); } 
        else if (step.action === "get_pass") { hasPass = true; showToast(uiStrings[currentLanguage].passObtained); if(explorationBackground) explorationBackground.src = "images/cbg7.PNG"; }
        else if (step.action === "enter_elevator_story") { hideExplorationUI(); currentEventId = "fourth-elevator-01"; showScreen("story"); renderStoryLine(); return; }
        else if (step.action === "enter_sixth_elevator_story") { hideExplorationUI(); currentEventId = "sixth-elevator-01"; showScreen("story"); renderStoryLine(); return; }
        else if (step.action === "enter_eighth_elevator_story") { hideExplorationUI(); currentEventId = "eighth-elevator-01"; showScreen("story"); renderStoryLine(); return; }
        else if (step.action === "jump_scene") { hideExplorationUI(); enterExploration(step.sceneId); return; }

        if (explorationDialogue) explorationDialogue.classList.remove("hidden");
        if (exPortraitLeft) exPortraitLeft.classList.add("hidden");
        if (exPortraitCenter) exPortraitCenter.classList.add("hidden");
        if (exPortraitRight) exPortraitRight.classList.add("hidden");
        if (explorationNameBox) explorationNameBox.classList.add("hidden");
        
          if (explorationDialogueText) typeWriter(explorationDialogueText, getDisplayText(step));
        
        currentExplorationIndex++;
        if (explorationHint) explorationHint.classList.remove("hidden");
        return;
    } 
    else {
        if (explorationDialogue) explorationDialogue.classList.remove("hidden");
        
        if (exPortraitLeft) { exPortraitLeft.classList.add("hidden"); exPortraitLeft.classList.remove("fish-large"); }
        if (exPortraitCenter) { exPortraitCenter.classList.add("hidden"); exPortraitCenter.classList.remove("monster-large"); }
        if (exPortraitRight) { exPortraitRight.classList.add("hidden"); exPortraitRight.classList.remove("monster-large", "guard-large"); }

        if (step.leftPortrait) { 
            exPortraitLeft.src = step.leftPortrait; 
            exPortraitLeft.classList.remove("hidden"); 
            if(step.leftPortrait.includes("fish")) exPortraitLeft.classList.add("fish-large"); 
        }
        if (step.centerPortrait) { 
            exPortraitCenter.src = step.centerPortrait; 
            exPortraitCenter.classList.remove("hidden"); 
        }
        if (step.rightPortrait) { 
            exPortraitRight.src = step.rightPortrait; 
            exPortraitRight.classList.remove("hidden"); 
            if(step.rightPortrait.includes("/x")) exPortraitRight.classList.add("monster-large");
            if(step.rightPortrait.includes("guarder")) exPortraitRight.classList.add("guard-large"); 
        }
        
        if (step.portrait) {
            exPortraitLeft.src = step.portrait; exPortraitLeft.classList.remove("hidden");
        }

        if (step.type === "dialogue") {
            if (explorationNameBox) {
                explorationNameBox.classList.remove("hidden");
                explorationNameBox.textContent = getDisplaySpeaker(step);
            }
        } else {
            if (explorationNameBox) explorationNameBox.classList.add("hidden");
        }
         if (explorationDialogueText) {
            typeWriter(explorationDialogueText, getDisplayText(step));
        }
        if (explorationHint) explorationHint.classList.remove("hidden");
        
        currentExplorationIndex++;
    }
}

function showExplorationChoices(options) {
    if (explorationDialogue) explorationDialogue.classList.add("hidden");
    if (explorationChoicePanel) {
        explorationChoicePanel.replaceChildren();
        explorationChoicePanel.classList.remove("hidden");
    }
    
    options.forEach(opt => {
          const btn = document.createElement("button");
        btn.className = "exploration-choice-btn";
        btn.textContent = (currentLanguage === 'en' && opt.en) ? opt.en : opt.text;
             btn.addEventListener("click", (e) => {
            e.stopPropagation();
            playAppearSound();
            if (explorationChoicePanel) explorationChoicePanel.classList.add("hidden");
            currentExplorationQueue = explorationScenarios[opt.next];
            currentExplorationIndex = 0;
            isExploringBusy = true;
            playExplorationStep();
        });
        if (explorationChoicePanel) explorationChoicePanel.appendChild(btn);
    });
}

if (explorationScreen) {
    explorationScreen.addEventListener("click", (event) => {
        if (currentScreen !== "exploration") return;
        if (isTeleporting) return;
        if (event.target.closest(".exploration-choice-btn")) return;

        if (isExploringBusy) {
            const lastStep = currentExplorationQueue[currentExplorationIndex - 1];
            if (lastStep && lastStep.type === "choice") return;

            
            if (isTyping) {
                finishTyping(explorationDialogueText, getDisplayText(lastStep));
                return;
            }

            
            playExplorationStep();
            return;
        }

        const hotspot = event.target.closest(".exploration-hotspot");
        if (hotspot) {
            const targetId = hotspot.dataset.target;
            const sceneConfig = explorationScenes[currentSceneId];
            const hotspotData = sceneConfig.hotspots.find(h => h.target === targetId);
            if (!hotspotData) return;

            let scenarioKey = hotspotData.scenario;
            if (targetId === "desk_2") {
                if (hasRadioPlayed) {
                    scenarioKey = "radio_2_repeat";
                } else {
                    scenarioKey = "radio_2_first";
                    hasRadioPlayed = true;
                }
            }

            const scenario = explorationScenarios[scenarioKey];
            if (!scenario) return;

            hideExplorationUI();
            isTeleporting = true;
            setTimeout(() => {
                if (explorationPlayerWrap && explorationPlayerWrap.style.display !== "none") {
                    explorationPlayerWrap.style.left = hotspotData.pos.x;
                    explorationPlayerWrap.style.bottom = hotspotData.pos.bottom;
                }
                isTeleporting = false;
                currentExplorationQueue = scenario;
                currentExplorationIndex = 0;
                isExploringBusy = true;
                playExplorationStep();
            }, 1200);
            return;
        }

        if (explorationDialogue && !explorationDialogue.classList.contains("hidden")) {
            hideExplorationUI();
        }
    });
}




function getSaveData() {
    return { currentScreen, currentEventId, currentSceneId, hasIdCard, hasPass, hasRadioPlayed, explored5, explored6, explored8, hasMetMonster, hasMet02 };
}

function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add("hidden"), 2000);
}



window.debugStory = function(id) { currentEventId = id; showScreen("story"); renderStoryLine(); };
window.debugScene = function(sceneId, withItems = true) { if (withItems) { hasIdCard = true; hasPass = true; } enterExploration(sceneId); };




const startButton = $("start-button");

if (startButton) startButton.addEventListener("click", startNewGame);



if (langToggleButton) {
    langToggleButton.addEventListener("click", () => {
        currentLanguage = currentLanguage === 'zh' ? 'en' : 'zh';
        applyUILanguage();
        showToast(uiStrings[currentLanguage].switchedToEn ? (currentLanguage === 'zh' ? uiStrings.zh.switchedToZh : uiStrings.en.switchedToEn) : "");

        if (currentScreen === "story") {
            renderStoryLine();
        }

        if (currentScreen === "exploration" && currentExplorationStep) {
            if (explorationDialogue && !explorationDialogue.classList.contains("hidden")) {
                if (explorationDialogueText) {
                    finishTyping(explorationDialogueText, getDisplayText(currentExplorationStep));
                }
                if (currentExplorationStep.type === "dialogue") {
                    if (explorationNameBox) {
                        explorationNameBox.classList.remove("hidden");
                        explorationNameBox.textContent = getDisplaySpeaker(currentExplorationStep);
                    }
                } else {
                    if (explorationNameBox) explorationNameBox.classList.add("hidden");
                }
            }
        }
    });
}

applyUILanguage();


speakerNamesEn["老鱼"] = "Mr.Yu";
speakerNamesEn["？？"] = "???";

// 
const storyEn = {
    "1": "It hurts...",
    "2": "It hurts so much...",
    "3": "...",
    "4": "The night sky.",
    "5": "Where am I?",
    "6": "Why am I here...?",
    "7": "Why does my head hurt so much...?",
    "8": "...",
    "9": "I... can't remember...",
    "10": "All I remember is...",
    "11": "...",
    "12": "My name is...",
    "look-around": "The night wind brushes past me. The silence around me feels strangely unnatural.",
    "look-around-8": "Tch... Where the hell am I...?",
    "look-around-9": "I need to get out of here. Now.",

    "second-woman-intro": "At the far end of the woods stood a vaguely human silhouette. Trees of varying heights crowded the area, their branches intertwining overhead and breaking the already dim light into scattered patches.\nThe ground was damp and soft, covered in dead branches and rotting leaves that crunched faintly underfoot.",
    "second-woman-approach": "Lingbo hurried towards the figure, pushing aside the branches in his way. But the moment he got a clear look at it, he stopped dead in his tracks.",
    "second-woman-identity": "It was a woman.",
    "second-woman-appearance-1": "Her body was embedded in a thick tree trunk. Only her head and upper torso protruded from the wood, as though the tree had swallowed her whole as it grew.",
    "second-woman-appearance-2": "Her skin was a bloodless shade of grey-white. Yet several hands of different shapes had grown from the back of her head. They overlapped, firmly covering her eyes. Their knuckles were tinged with blue-black, their fingertips digging deep into her flesh.",
    "second-woman-motionless": "The woman's chest did not rise or fall.",
    "second-woman-thought-1": "Is she alive...? I can't tell.",
    "second-woman-thought-2": "He stared at her for a while, then hesitantly took half a step forward.",
    "second-woman-thought-3": "Guess I'll try.",
    "second-woman-wave": "Lingbo approached the woman and cautiously waved his hand in front of her face.",
    "second-woman-greeting-1": "Hello...?",
    "second-woman-no-response": "There was no response.",
    "second-woman-silence": "The woman remained perfectly still, as though she hadn't noticed his presence at all.",
    "second-woman-forest-sound": "The forest was eerily quiet. Only the leaves rustled in the wind, accompanied by the occasional call of some unknown bird in the distance. Lingbo's voice drifted into the depths of the woods, then floated faintly back to him.",
    "second-woman-nothing": "Nothing else happened.",
    "second-woman-try-again": "Lingbo cleared his throat and leaned a little closer.",
    "second-woman-greeting-2": "(Louder) Hello! Could you tell me where I am?",
    "second-woman-first-response": "...",
    "second-woman-responds": "After a brief silence, she finally responded.",
    "second-woman-good-evening": "Good evening.",
    "second-woman-apology": "I'm sorry.",
    "second-woman-explanation": "People don't usually come here.",
    "second-woman-calm": "Her voice was so even that it was almost flat. There was no surprise in it, nor much of the emotion one might expect from an ordinary conversation.\nThe hands covering her eyes remained perfectly motionless.",
    "second-woman-surprise": "Lingbo froze for a moment, surprised that she had answered at all.",
    "second-woman-graveyard-answer": "The mass graveyard outside Haita.",
    "second-woman-shock": "What?! A mass graveyard? Why am I in a mass graveyard?!",
    "second-woman-shock-narration": "His voice rose involuntarily. Then, as though suddenly realising how hysterical he sounded, he stopped himself.",
    "second-woman-silence-2": "...",
    "second-woman-sigh": "The woman seemed to let out a faint sigh.",
    "second-woman-doesnt-know": "I don't know.",
    "second-woman-dead-1": "But if you've appeared in Haita, that can only mean you're already dead.",
    "second-woman-meaning": "What do you mean?",
    "second-woman-silence-3": "...",
    "second-woman-haeta-explanation": "Haita is one of the Twelve Towers of Yonggui City. It handles funerary affairs.",
    "second-woman-staff": "Apart from the two staff members, there shouldn't be any other living people here.",
    "second-woman-dead-2": "So if you've appeared here, that can only mean you're already dead.",
    "second-woman-fingers": "As she spoke, the fingers covering her eyes twitched ever so slightly.",
    "second-woman-still": "Other than that, she made no movement.",
    "second-woman-confusion": "Lingbo watched the woman's mouth open and close. Every word reached his ears perfectly clearly, yet when strung together, they sounded like some strange language he couldn't understand.",
    "second-woman-mind-stops": "His mind went blank.",
    "second-woman-fear": "A chill crept up his spine and into the back of his neck. Lingbo realised he was trembling. He wanted to argue, to tell the woman how absurd her words were, but it felt as though something had lodged itself in his throat. He couldn't force out a single word.",
    "second-woman-memories": "Then the details he'd overlooked began to resurface.",
    "second-woman-smell": "The lingering stench of rotting flesh in the air.",
    "second-woman-bones": "The scattered bones he'd glimpsed at the edges of his vision while running.",
    "second-woman-cold-body": "His own cold, rigid body.",
    "second-woman-wound": "And...",
    "second-woman-face-wound": "The fatal wound covering the entire right side of his face.",
    "second-woman-touch-face": "Lingbo's breathing grew increasingly ragged. Trembling, he raised his right hand and reached towards his cheek.",
    "second-woman-touch-wound": "The instant his fingertips touched his skin, he felt a faint tickling sensation coming from the wound.",
    "second-woman-freeze": "Lingbo froze.",
    "second-woman-something-on-face": "Something was resting on his face.",
    "second-woman-butterfly": "He reached around blindly and touched a pair of delicate, fragile wings. The creature seemed startled. Its wings fluttered slightly, but it didn't immediately fly away.",
    "second-woman-carrion-butterfly": "There had been a carrion butterfly feeding on the right side of his face this entire time.",
    "second-woman-pull-butterfly": "Lingbo pinched the butterfly's wings and tried to tear it away from his face.",
    "second-woman-butterfly-stuck": "But no matter how hard he pulled, the butterfly wouldn't budge, as though it had grown into his flesh.",
    "second-woman-butterfly-fail": "It wouldn't come off. Not at all.",
    "second-woman-annoyed": "Tch.",
    "second-woman-silence-4": "He fell silent for a moment before finally lowering his hand.",
    "second-woman-ask-answer": "Fine. I was already dead. But why did I come back to life? Do you know anything?",
    "second-woman-doesnt-know-2": "...",
    "second-woman-answer": "I'm not sure. Perhaps you can find some answers at Haita.",
    "second-woman-points": "As she spoke, the woman slowly raised one hand and pointed towards a narrow path deeper in the woods.",
    "second-woman-path": "Dead branches crisscrossed the path, and weeds grew wild along its edges. Far away, the silhouette of a building was barely visible. Its towering outline disappeared into the gloom, like a silent shadow.",
    "second-woman-directions": "You'll find two staff members at the entrance to Haita. Perhaps they'll have some answers.",
    "second-woman-look-path": "Lingbo followed the direction of her gesture, then turned back to look at her.",
    "second-woman-unasked-questions": "He still had so many questions.",
    "second-woman-questions": "Why had he died here? Why was his mind filled with strange fragments of memory? And what exactly was this woman, swallowed by a tree?",
    "second-woman-swallow-questions": "But looking at her expressionless face, Lingbo ultimately swallowed his questions.",
    "second-woman-thanks": "...",
    "second-woman-sigh-2": "He rubbed his temples and let out a long sigh.",
    "second-woman-thanks-2": "(Sighs) Thank you.",
    "second-woman-no-answer": "The woman didn't reply.",
    "second-woman-leaves": "Lingbo turned around and headed deeper into the woods.",
    "second-woman-fading": "Dead leaves crunched beneath his feet. As he moved farther away, the figure embedded in the tree was gradually obscured by the branches, until she finally disappeared into the darkness of the forest.",
    "second-woman-go-deeper": "Lingbo followed the narrow path overgrown with weeds, continuing deeper into the woods.",

    "third-haita-01": "From a considerable distance, Lingbo could already hear the rumble of machinery. The sound was heavy and continuous, as though some enormous machine lay buried underground, tirelessly repeating the same task over and over. Something about this place felt lifeless. His instincts told him that much. Uneasy, Lingbo pushed open the door to the security room.",
    "third-haita-02": "The room was empty. Only the hollow echo of his own voice remained.",
    "third-haita-03": "From a considerable distance, Lingbo could already hear the rumble of machinery.",
    "third-haita-04": "The sound was heavy and continuous, as though some enormous machine lay buried underground, tirelessly repeating the same task over and over.",
    "third-haita-05": "Something about this place felt lifeless. His instincts told him that much.",
    "third-haita-06": "Uneasy, Lingbo pushed open the door to the security room.",
    "third-haita-07": "(Calling out) Hello—? Is anyone here?",
    "third-haita-08": "There was no response.",
    "third-haita-09": "He stepped inside. The room was empty. His voice echoed through the confined space before fading into the rumble of the machinery.",
    "third-haita-10": "Several sheets of paper lay on the desk, and a cabinet stood partially open against the wall. An old monitor was still switched on, displaying several blurry surveillance feeds. The corridors, stairwells, and a tightly shut metal door on the screens all remained perfectly still.",
    "third-haita-11": "I can't sense anyone here at all... What happened to this place...?",

    "fourth-elevator-01": "The elevator doors slowly slid shut.",
    "fourth-elevator-02": "Inside the confined space, the sound of the machinery became much more distinct. Lingbo looked up at the floor directory posted on the inner wall of the elevator.",
    "fourth-elevator-03": "1F: Security Room\n2F: Death Notification Hall\n3F: Vigil Hall\n4F: Wake Hall\n5F: Preparation Hall\n6F: Crematorium\n7F: Ashes Repository",
    "fourth-elevator-04": "...Well, they've got the whole funeral process covered, don't they?",
    "fourth-elevator-05": "He lowered his head and tried pressing the elevator buttons.",
    "fourth-elevator-06": "Nothing happened.",
    "fourth-elevator-07": "...It can only take me to the second floor.",
    "fourth-elevator-08": "(Sighs) Well, one step at a time, I guess.",

    "fifth-hall-01": "The lights in the corridor were dim. The continuous rumble of machinery echoed from somewhere in the distance, yet not a single staff member was in sight.",
    "fifth-hall-02": "...Something about this place feels deeply unsettling.",
    "fifth-hall-03": "Is there really anyone on the second floor?",

    "sixth-elevator-01": "Lingbo tried pressing every button in the elevator.",
    "sixth-elevator-02": "Only the button for the third floor lit up.",
    "sixth-elevator-03": "...Third floor. Vigil Hall.",
    "sixth-elevator-04": "A place for keeping vigil... Does that mean I'll find corpses on this floor?",

    "eighth-elevator-01": "Lingbo tried pressing the buttons for every floor again. This time, only the button for the fifth floor lit up.",
    "eighth-elevator-02": "...It skipped the fourth floor.",
    "eighth-elevator-03": "I remember the staff regulations said the fourth floor was off-limits.",
    "eighth-elevator-04": "The fifth floor... I think it was called the Preparation Hall.",
    "eighth-elevator-05": "What do they do there?",
    "eighth-elevator-06": "!",
    "eighth-elevator-07": "The elevator doors slowly slid open."
};

// 
const storyChoiceEn = {
    "name-choice::灵泊。": "Lingbo.",
    "investigate-choice::调查周围": "Look around.",
    "second-woman-choice-1::走上前挥挥手": "Walk up and wave.",
    "second-woman-choice-2::再试试看": "Try again.",
    "second-woman-choice-3::这里是哪里？": "Where am I?",
    "second-woman-choice-4::将蝴蝶扯下来": "Pull the butterfly off.",
    "second-woman-choice-5::往深处前进": "Head deeper into the woods."
};

storyLines.forEach(ev => {
    if (storyEn[ev.id]) ev.en = storyEn[ev.id];
    if (ev.type === "choice" && ev.options) {
        ev.options.forEach(opt => {
            const k = `${ev.id}::${opt.text}`;
            if (storyChoiceEn[k]) opt.en = storyChoiceEn[k];
        });
    }
});

// 3
const explorationEn = {
    paper_1: [
        "What's this...? Haita's staff regulations?",
        "That's quite a lot of text...",
        "Haita Night Shift Staff Regulations\nInternal Document | Please Read Carefully Before Your Shift\nTo ensure the smooth operation of Haita's daily funerary services, all on-duty staff must comply with the following regulations. Any consequences resulting from violations shall be borne by the individual responsible.\nRule 1: Only two staff members are assigned to Haita's night shift.\nRule 2: Unless required for work, do not respond to calls originating from within the building after 2:00 a.m.\nNote: Equipment malfunction alerts are exempt from this rule.\nRule 3: The fourth floor is restricted to authorised personnel only.\nRule 4: All transfers of human remains must be documented in writing.\nRule 5: Staff must not leave their posts without authorisation during their shift. If you need to visit another area, notify the other on-duty staff member in advance. If they do not respond, remain where you are and wait for further instructions.\nThank you for your cooperation.\n— Haita Administration",
        "What kind of nonsense is this...?"
    ],
    cabinet_1: [
        "Everything's arranged pretty neatly.",
        "Two sets of everyday supplies were neatly arranged inside the cabinet. One was relatively complete, while the other seemed to be missing a few items. An employee ID card lay in the space where the missing items should have been.",
        "What's this?",
        "[Obtained: ID Card]",
        "01... Who does this card belong to?",
        "He turned the card over, but found no further information.",
        "I'll hold on to it for now. Might come in handy."
    ],
    desk_1: [
        "On the desk sat an ashtray, a folded piece of paper, and a telephone. The desk faced the surveillance monitors."
    ],
    desk_1_ashtray: [
        "A cigarette butt remained in the ashtray, not yet completely extinguished. The ashes were still undisturbed.",
        "...",
        "Someone was here just a moment ago."
    ],
    desk_1_paper: [
        "Let's see what this says.",
        "...A resignation letter?",
        "To Haita Administration,\nFor personal reasons, I hereby submit my resignation from my position on the night shift.\nI will not pursue the matter of what happened previously.\nPlease approve my resignation as soon as possible.\n02",
        "It's signed by 02?"
    ],
    desk_1_phone: [
        "Lingbo picked up the receiver and fiddled with the buttons.",
        "...",
        "Nothing happened."
    ],
    desk_1_monitor: [
        "Lingbo walked over to the surveillance monitors. Each screen displayed a different corridor or room. The machines were still running, yet not a single person could be seen.\nHis own reflection—or any sign of his presence—was nowhere to be found on any of the screens.",
        "...",
        "...Forget it."
    ],
    notice_2: [
        "A sheet of paper had been pasted over the floor directory, almost completely covering its original contents. Only the exposed strip at the top revealed the name and purpose of the floor.",
        "Second floor. Death Notification Hall.",
        "Responsible for notifying the relatives, friends, neighbours, and relevant organisations of the deceased, and informing them of the arrangements for the funeral...",
        "...So that's what this place does.",
        "The sheet of paper covering the directory appeared to be an emergency notice.\n\nEMERGENCY NOTICE\nDue to an unforeseen emergency, certain functional rooms and emergency passageways within Haita Tower have been temporarily closed.\nNo personnel may enter the affected areas without authorisation.\nFor assistance, please contact the Haita staff member on duty.\nSigned: 01",
        "...01 again.",
        "The emergency passageways have been sealed off, too?",
        "Looks like I'll have to search the floors one by one."
    ],
    elevator_2: [
        "Lingbo pressed the elevator button.",
        "Nothing happened.",
        "He tried pressing it several more times, but the button never lit up.",
        "...Is it broken?",
        "But it was working just a moment ago."
    ],
    corridor_1: [
        "It was pitch-black. Nothing could be seen."
    ],
    emergency_2: [
        "Lingbo walked up to the emergency passageway door and tried pushing it open.",
        "The door did not budge.",
        "He pushed again, harder this time, but it still refused to move.",
        "...It's completely stuck."
    ],
    corridor_2: [
        "It was pitch-black. Nothing could be seen."
    ],
    door_2: [
        "The door was imposing, with a broad, heavy frame. Just looking at it was enough to imagine how spacious the room beyond must be.\nA sign hung on the door.\nArchives.",
        "Lingbo tried pushing the door open.",
        "It did not move at all.",
        "...Is it locked?"
    ],
    desk_2: [
        "There was only a radio on the table."
    ],
    radio_2_first: [
        "Lingbo casually fiddled with its knobs.",
        "A burst of static crackled through the speaker. Then, a cheerful programme jingle suddenly played.",
        "!",
        "Welcome to Squid After Dark, brought to you by Squid Chronicle!",
        "?",
        "If you've got any strange, bizarre, or downright eerie stories that are best told at night, send them our way! I'm Mr.Yu, your host for Squid After Dark.",
        "And I'm Miaomiao.",
        "All right, for any new listeners out there, here's the usual introduction. We're an unofficial late-night paranormal show from Mao Tower. Every Wednesday, from ten to eleven at night, we're here right on schedule!",
        "Now, without further ado, let's get into today's paranormal story. Miaomiao, would you like to go first, or shall I?",
        "I'll go first.",
        "Today's submission comes from someone whose username is Lizi isn't Sweet. Let's call them L. It's a request for help.",
        "L says they're an employee at Haita Tower...",
        "An employee at Haita Tower? Whoa! Now that's a rare submission.",
        "! This place?",
        "That's right. The sender even mentioned that their family had to pull quite a few strings to get them the job. At the time, apart from L, who had only just started, there was just one senior employee working there.",
        "According to L, the work at Haita was actually pretty easy. They mostly watched the surveillance feeds and patrolled once every hour. Nothing that required any special skills. Basically, they just took it easy whenever they could.",
        "Huh? That's strange. Isn't Haita Tower responsible for funeral services throughout Yonggui City? If there are only two of them, how does the whole tower even operate? Keeping vigil, cremation, preparing the bodies... Is nobody looking after any of that?",
        "Now that's exactly the right question. I actually sent L a private message to ask about this. L said their patrols were generally limited to the corridors. Many rooms weren't open to them, and sometimes they couldn't even access the other floors.",
        "So L suspects that the higher-ups at Haita have a separate group of secret employees. As for the details, L has no idea. Maybe their clearance just isn't high enough.",
        "L even asked the senior employee about it, but the man seemed absent-minded and didn't appear to know much either.",
        "Fair enough. Haita has always been extremely secretive, after all.",
        "Anyway, back to L's story.",
        "The senior employee was always sending L off to do the work, while he himself stayed on the first floor, dozing away. L figured that, as a newcomer, getting more familiar with the procedures couldn't hurt, so they went along with it.",
        "And that's how things went for almost the entire first year. The senior employee handed all the work over to L, leaving himself free to relax downstairs.",
        "Well, what a wonderful mentor! Really showing the new recruit the ropes!",
        "Well, L said they wouldn't have minded if things had stayed that way. Sitting around on the first floor all day was boring, after all. They could practically walk their patrol route with their eyes closed by now, but at least it was better than being glued to a chair all day.",
        "But starting this year, L began to notice that something was off about the senior employee.",
        "He used to spend every day lying on the sofa in the first-floor security room, practically like a corpse himself. But sometimes, when L returned from a patrol, the man would be gone.",
        "L checked the corridor surveillance footage, but couldn't find any sign of where he'd gone. Then, before long, the senior employee would come hurrying back from outside.",
        "When L asked where he'd been, he'd simply say he'd gone out for a walk.",
        "L found that strange. They thought, 'Isn't there nothing but wasteland and a mass graveyard outside? What's there to walk around and see? Wouldn't most people find a place like that too ominous to visit?'",
        "...",
        "Something's definitely off.",
        "The nearest residential area is at least a half-hour drive from Haita. And it's not as if there's any transport available for them out there.",
        "If L hadn't sent us this story, I'd almost suspect they were running some kind of prison in there.",
        "Well, anyway, that was only the beginning.",
        "As time went on, L noticed more and more strange behaviour from the senior employee. He kept going to the corridor on a particular floor, trying the doors of different rooms. Sometimes he'd even venture outside the tower, apparently to do something or other.",
        "And his mental state seemed to be getting worse, too. He looked increasingly anxious, constantly restless and unable to sit still.",
        "L asked him what was happening and whether he needed any help, but every time, the senior employee brushed the questions aside.",
        "Could it be that he'd developed some kind of mental health problem after spending so long cooped up in an enclosed place? I mean, he used to stay on the first floor and never go outside.",
        "There was something else that made L uneasy. They once called the higher-ups to report the senior employee's abnormal behaviour, but never received a response.",
        "It was only then that L began to feel something was seriously wrong.",
        "Even putting the paranormal stuff aside, living in a sealed-off building with someone whose mental state is deteriorating sounds dangerous enough!",
        "Exactly. But what finally made L decide to send us a submission was something that happened recently.",
        "One day, while L was on patrol, they suddenly heard a thunk, thunk sound coming from somewhere inside Haita.",
        "L said it sounded like some heavy object striking solid wood. The sound was low and dull.",
        "At first, L didn't think much of it. Haita is such a huge structure, after all. Sometimes machinery makes noises like that as materials expand and contract. But the strange thing was, the sound grew louder as time went on, until it could be heard clearly even from the first-floor security room.",
        "Actually, L had already begun to suspect something was wrong by then. They tried to track down the source of the sound during their patrols, but never found anything.",
        "L called the higher-ups at Haita to report the noise, but once again, there was no response.",
        "Actually, L had already begun to suspect something was wrong by then. They tried to track down the source of the sound during their patrols, but never found anything.",
        "As for the senior employee, although his condition hadn't been great, he hadn't completely lost control. But one day, while they were both in the first-floor security room, they heard that thunk, thunk sound loud and clear.",
        "The senior employee suddenly went completely berserk. He ran to his room, shouting things like, 'Don't kill me! Don't kill me!' and 'Please, I'm begging you! I want to go home!'",
        "Oh, dear...",
        "L hadn't experienced anything unusual themselves, but they no longer dared to stay there either. The worst part was that the contract they'd signed was for three years. They still had another two years to go at Haita.",
        "That's why they sent us the story. They figured that Squid Chronicle had covered quite a few paranormal cases, so maybe we could help them work out what they'd encountered.",
        "Honestly... we don't know much about Haita either. Like I said earlier, security and confidentiality there are extremely strict. This is the first time I've ever heard of anything like this.",
        "Personally, I think the senior employee sounds more like someone suffering from a trauma-related disorder. Think about it: spending so long in an enclosed place. And from the way L describes him, it doesn't sound like the two of them were particularly close. Could that have made an existing psychological condition worse?",
        "Then how do you explain the sound?",
        "Could it have been the noise of Haita's employees doing their work? After all, the sender has never seen how the tower actually operates.",
        "Maybe the senior employee knew something about how the tower really works. Perhaps whatever secret he discovered was what pushed him over the edge?",
        "That's possible...",
        "Suddenly, a burst of rapid static crackled from the radio.",
        "Huh?",
        "It seemed the radio had lost its signal.",
        "Lingbo tried adjusting the knobs again.",
        "Damn it... I can't find that frequency anymore.",
        "The voices from the programme cut off abruptly, leaving only intermittent static.",
        "Lingbo tried turning the radio dial again."
    ],
    radio_2_repeat: [
        "Lingbo tried turning the radio dial again.",
        "Damn it... I can't find that frequency anymore."
    ],
    cabinet_2: [
        "Lingbo gave the filing cabinet a quick look. Most of the drawers were almost completely empty.",
        "!",
        "Inside the top-right drawer lay a scrap of paper, stained with dark red blood.\n\n[Scrap of Paper]\nIt's all lies!\nEveryone who comes here is doomed to die!!\nI have to get out of here!!!",
        "..."
    ],
    door_left_4: [
        "Lingbo walked up to the door and tried pushing it open.",
        "It won't open."
    ],
    door_mid_4: [
        "Lingbo tried pushing the door open.",
        "It won't open."
    ],
    notice_4: [
        "Lingbo stopped in front of the information board and carefully read the text.",
        "Vigil Hall\nAfter a person's death and before their cremation or burial, their body or ashes may be temporarily placed in a vigil room, where staff take turns keeping watch over them.",
        "...Staff?",
        "That's strange. Didn't the person on the radio say they were only responsible for patrolling and security?",
        "Could it be... that there really are secret employees here?"
    ],
    corridor_4: [
        "It was pitch-black. Nothing could be seen."
    ],
    emergency_5: [
        "Lingbo walked up to the emergency passageway door and pushed against it.",
        "The door did not budge.",
        "He tried again, putting more force into it, but the door still refused to move.",
        "The emergency passageway on this floor is completely inaccessible, too.",
        "At least the elevator on this floor still works."
    ],
    door_5_success: [
        "...!",
        "The card was accepted. The heavy door slowly rose, revealing the space beyond."
    ],
    white_door_5: [
        "Lingbo walked up to a white door.",
        "Three characters were written above it: Morgue.",
        "...",
        "Should I really go in...?",
        "Lingbo cautiously pushed against the door. To his surprise, it opened.",
        "!",
        "...Of all the rooms I've come across, the first one I can actually enter is the morgue.",
        "That's suspicious..."
    ],
    corridor_5: [
        "It was pitch-black. Nothing could be seen."
    ],
    cabinet_6: [
        "The cabinets were packed tightly together. Their long, upright compartments resembled rows of coffins standing on end.",
        "Every cabinet has a number...",
        "...Are those the bodies' identification numbers?",
        "I really don't want to get anywhere near these things..."
    ],
    pass_6: [
        "!",
        "What's this?",
        "...An access card.",
        "He examined both sides of the card but found no other useful information.",
        "It doesn't say what it's for...",
        "Which door is this supposed to open?"
    ],
    door_7: [
        "(Inner Thought)...I need to get out of here."
    ],
    table_7: [
        "Two unlit candles and a framed photograph sat on the table, as though someone had set them out to mourn the dead.",
        "It's too dark. I can't make anything out..."
    ],
    monster_7_first_meet: [
        "The room was dark and reeked of blood. A human-shaped figure seemed to be sitting in the middle of it.",
        "!",
        "(Inner Thought)Is that a person? I can't really tell... Should I get a little closer?",
        "Lingbo cautiously moved closer.",
        "Hiss...",
        "At last, his eyes adjusted to the darkness. As soon as he made out the figure's appearance, an involuntary sound escaped him.\nThe person's skull had been opened, exposing a blood-soaked brain beneath a transparent glass dome covering the top of their head. A long incision ran from their chest to their lower abdomen. Thick rope had been used to crudely stitch the wound shut, but their exposed lungs and intestines were still visible through the gaps.",
        "...",
        "(Inner Thought)Oh my god... Is this person still alive?",
        "Suddenly, the figure seemed to open its eyes.",
        "...",
        "Hello there.",
        "!",
        "H-hello...",
        "Who are you? People aren't usually allowed in here.",
        "...I'm Lingbo. Sorry, I didn't mean to intrude. I'm actually here looking for the staff.",
        "You're not a staff member? Then what are you doing here?",
        "I'm not... I woke up somewhere nearby. I came here to find out what's going on.",
        "Lingbo hesitated for a moment.",
        "Has something happened here? I haven't seen a single staff member since I arrived.",
        "Oh dear. What a shame.",
        "It moved its head slightly, causing the glass dome to make a faint clinking sound.",
        "You see, in my current state, there's no way for me to know what's happening outside.",
        "Following its gaze, Lingbo finally noticed that everything below its thighs was empty. It had no legs at all.",
        "...",
        "(Inner Thought)...I'd better not ask.",
        "But there shouldn't be anything wrong here, should there?",
        "It seemed to suddenly remember something, though its tone remained light and cheerful.",
        "Oh, wait. Come to think of it, it should be nearly time for It to feed.",
        "But it's nothing to worry about. It doesn't matter. I don't really know the answers to your questions anyway.",
        "...",
        "It blinked.",
        "Oh dear. I've been like this a lot lately. My mind's all muddled, and I keep forgetting things.",
        "...",
        "(Inner Thought)...Forget it. I don't think I'll get anything useful out of it. But I'm still curious about that...",
        "Um... what you said just now... about feeding time. What does that mean?",
        "Feeding time?",
        "It repeated the words, seemingly trying very hard to think.",
        "Ah... that.",
        "It smiled.",
        "It's when you eat, of course.",
        "...",
        "(Inner Thought)That's stating the obvious...",
        "But It doesn't eat just whenever it wants. It has to wait until the time is right.",
        "...Who do you mean by 'It'? Who's going to eat?",
        "Who do you mean by who?",
        "...",
        "Never mind. Forget I asked.",
        "Lingbo instinctively took a step back.\nThe figure didn't seem to have any intention of attacking him, at least for now. Even so, just standing there made his skin crawl. He really didn't want to go any closer to that table.",
        "Oh? Are you leaving?",
        "...Yeah. I still need to find the others.",
        "The others?",
        "It thought for a moment.",
        "Are there other people here?",
        "...",
        "You don't know?",
        "Nope.",
        "Wait, no. I think someone came here before.",
        "!",
        "When? Was it a staff member?",
        "Hmm...",
        "It tilted its head, apparently trying to remember.",
        "I can't remember.",
        "...",
        "Oh well, it doesn't matter. They'll all come back eventually anyway.",
        "...Come back?",
        "Mm-hmm.",
        "It closed its eyes again.",
        "I'm getting a little sleepy.",
        "Lingbo stood there and waited for a while.\nThe figure said nothing more.",
        "(Inner Thought)...Did it fall asleep?",
        "(Inner Thought)...Forget it. I really can't stay here any longer.",
        "Lingbo really couldn't stay here any longer.",
        "I'd better get out of here. Now."
    ],
    monster_7_after: [
        "(Inner Thought)...I'd better leave it alone.",
        "(Inner Thought)I need to get out of here. Now."
    ],
    corridor_8: [
        "It was pitch-black. Nothing could be seen."
    ],
    black_door_8: [
        "!",
        "A heavy door stood before him. It appeared to require a card to open.",
        "This door looks a lot like the one on the third floor...",
        "Should I try the access card from earlier?",
        "But I hope there's no one like that strange person behind this door..."
    ],
    black_door_8_success: [
        "The card was accepted.\nThe heavy door slowly rose, revealing the space beyond."
    ],
    notice_8: [
        "Preparation Hall... Responsible for transporting and receiving the deceased, preparing and applying makeup to their bodies, and making funeral arrangements.",
        "Ohhh... So this is where they prepare the bodies and organise funerals.",
        "This floor feels much better than the last one."
    ],
    elevator_8: [
        "?",
        "The elevator buttons did not respond.",
        "This elevator really has a mind of its own.",
        "Forget it. I'd better investigate this floor first."
    ],
    coffin_9: [
        "It looked like a coffin.",
        "(Inner Thought)There isn't actually someone lying inside, is there...?",
        "There probably isn't... Let's check.",
        "Lingbo reached out and knocked on the coffin lid. A clear, hollow sound rang out.",
        "Sounds hollow."
    ],
    tablet_9: [
        "The memorial tablet looked brand-new, with no dust on its surface.",
        "!",
        "There's a name on the tablet.",
        "Let's see...",
        "01?",
        "..."
    ],
    wreath_9: [
        "This... looks like a decoration used at funerals.",
        "Ugh... My head hurts...",
        "(Inner Thought)...I feel like I've seen this somewhere before."
    ],
    emergency_10: [
        "Lingbo walked up to the emergency passageway door and pushed it.",
        "!",
        "It actually opens!",
        "I should be able to reach either the sixth or fourth floor through here."
    ],
    door_mid_10: [
        "Lingbo walked up to the door and tried pushing it open.",
        "It won't open."
    ],
    door_04_10: [
        "Lingbo tried pushing the door open.",
        "It won't open."
    ],
    corridor_10: [
        "It was pitch-black. Nothing could be seen."
    ],
    left_arrow_11: [
        "The fourth floor is this way.",
        "!",
        "Iron bars... I'll need to cut through them before I can get to the fourth floor...",
        "What exactly is on the fourth floor?"
    ],
    stairs_11: [
        "The elevator on the fifth floor isn't working. I'll have to take the stairs."
    ],
    right_arrow_11: [
        "Whatever happens, I'd better try going upstairs first.",
        "I hope the emergency passageway upstairs isn't locked."
    ],
    scene12_first_meet: [
        "A human silhouette seemed to be blocking the corridor on the sixth floor.",
        "!",
        "(Inner Thought)Please don't tell me it's another one of those strange people...",
        "(Inner Thought)Is it too late to turn back to the fifth floor...?",
        "(Inner Thought)Better safe than sorry...",
        "Who! Who's there?!",
        "(Inner Thought)! I've been spotted!",
        "(Inner Thought)But... he seem capable of having a conversation.",
        "(Inner Thought)He won't be like that strange person from earlier... right?",
        "Uh... hello. I'm Lingbo. I woke up outside the tower...",
        "I came here because someone suggested I seek help from the staff at Haita...",
        "But I've been searching for staff this whole time and haven't found anyone...",
        "...",
        "Who told you to come here?",
        "There's only a mass graveyard near Haita. How did you end up there?",
        "(Inner Thought)I wish I knew...",
        "I don't know who she was.",
        "I woke up in the mass graveyard with no memories at all. Not long after that, I met a woman who told me I could come to Haita for help.",
        "A woman?",
        "Yeah.",
        "...What did she look like?",
        "(Inner Thought)I'd better not tell them too much.",
        "I don't really remember.",
        "...",
        "Why are you asking so many questions? Is something wrong?",
        "...",
        "Nothing.",
        "(Inner Thought)...He was a pretty dismissive answer. What was that supposed to mean?",
        "How long have you been here?",
        "I'm not sure. I've investigated several floors already, at least.",
        "The elevator isn't working properly, so I've had to make my way up one floor at a time.",
        "Which floors have you been to?",
        "The second, third, and fifth floors...",
        "I couldn't get to the fourth floor. Iron bars were blocking the entrance.",
        "You've been to the third floor?",
        "Yeah. Why?",
        "...Nothing.",
        "(Inner Thought)Nothing again.",
        "(Inner Thought)He was clearly concerned just now. There must be something going on.",
        "(Inner Thought)I need to find a way to get some information out of him, too.",
        "What about you? Why are you here on the sixth floor all alone?",
        "...",
        "Because I wanted to investigate the passageways in Haita.",
        "The passageways?",
        "You've seen it yourself. The corridor leading to the fourth floor is blocked, so I need to find an unobstructed route that I can actually use.",
        "...I see.",
        "(Inner Thought)But why is he so concerned about the passageways?",
        "(Inner Thought)If he just wanted to reach another floor, he could use the elevator.",
        "(Inner Thought)...No, wait. The elevator isn't working properly anymore.",
        "(Inner Thought)At least I need to confirm one thing first.",
        "Please tell me what's happening here.",
        "Something about this place feels wrong.",
        "...",
        "When you were downstairs, did you encounter anything strange?",
        "I did.",
        "What?",
        "Someone... who's difficult to describe.",
        "His skull had been opened, and his chest had been cut open, too. I could see everything inside.",
        "I thought he was dead, but then he suddenly started talking to me.",
        "...",
        "What? Have you encountered him, too?",
        "...",
        "...Something like that.",
        "(Inner Thought)What does 'something like that' mean?",
        "So what exactly was that thing?",
        "I don't know either.",
        "But I know something has happened to this tower.",
        "Ever since a certain day, everything here has gradually started to become strange.",
        "At first, I thought I was imagining things. The work here has always been a little unusual, after all. Maybe I just hadn't gotten used to it.",
        "But then, stranger and stranger things began to happen.",
        "Things I could no longer explain away, no matter how hard I tried.",
        "...Your work?",
        "Wait. You're a staff member here?",
        "Yes.",
        "(Inner Thought)Thank goodness! I've finally found someone!",
        "(Inner Thought)But... things don't seem to be as simple as I'd hoped.",
        "I found a few things downstairs. An employee ID card, for example, and a resignation letter.",
        "...",
        "...Where did you find them?",
        "Near the office downstairs.",
        "The ID card belonged to 01.",
        "...",
        "(Inner Thought)That reaction... He really does know 01.",
        "Was 01 your colleague?",
        "...Yes.",
        "He's dead.",
        "(Inner Thought)...Dead?",
        "...I'm sorry.",
        "There's nothing to be sorry for.",
        "So are you investigating the cause of his death?",
        "Not exactly.",
        "I've realised that this tower may never have intended to let us leave alive.",
        "...You mean Haita is going to kill the staff working here?",
        "I don't know. But for my own safety, I have to figure out what's going on.",
        "...",
        "(Inner Thought)He sounds so certain, yet he keep saying he doesn't know.",
        "(Inner Thought)...He probably hasn't figured it all out either.",
        "Some rooms downstairs won't open, and some places don't look like normal working areas at all.",
        "And there are other things... It's hard to explain everything at once.",
        "...",
        "It seems you're not here to cause trouble after all.",
        "...I wasn't planning to cause trouble in the first place.",
        "I just want to find out why I woke up in a mass graveyard, and then find a way to get out of here.",
        "...",
        "Neither am I.",
        "...",
        "(Inner Thought)At least we have that much in common.",
        "Since we're both trying to figure out what's happened here, how about we exchange what we know?",
        "All right.",
        "But I can't guarantee that everything I know is completely objective.",
        "That's fine. Neither can I.",
        "Oh, right.",
        "?",
        "We've been talking for so long, but I still don't know your name.",
        "You've been asking me questions this whole time. I thought you'd introduce yourself first.",
        "...Oh.",
        "Sorry. I forgot.",
        "I'm one of Haita's staff members. My identification number is 02.",
        "— End of Chapter 1 —"
    ]
};

// 4
const explorationChoiceEn = {
    "desk_1::烟灰缸": "Ashtray",
    "desk_1::纸": "Paper",
    "desk_1::电话": "Telephone",
    "desk_1::监控": "Surveillance Monitors",
    "elevator_1::使用id卡": "Use ID Card",
    "elevator_3::使用id卡": "Use ID Card",
    "elevator_4::使用ID卡": "Use ID Card",
    "door_5::使用通行证": "Use Access Card",
    "door_7::离开": "Leave",
    "black_door_8::使用通行证": "Use Access Card",
    "emergency_10::进入紧急通道": "Enter Emergency Passageway"
};

// 5
const explorationCondEn = {
    elevator_1: {
        ifFalse: ["An ID card is required to access the upper floors."]
    },
    elevator_3: {
        ifTrue: ["...Let's try that ID card from earlier."],
        ifFalse: ["An ID card is required to access the upper floors."]
    },
    elevator_4: {
        ifTrue: ["Looks like I've finished investigating this floor. Let's go."],
        ifFalse: ["I'll finish investigating this floor first, then try going up."]
    },
    door_5: {
        ifTrue: ["Let's try the access card I picked up earlier."],
        ifFalse: [
            "Lingbo stopped in front of a heavy door.",
            "This door... looks like it needs a card to open.",
            "There's an information board beside it.",
            "Vigil Room.",
            "...",
            "There aren't actually dead bodies in there, are there?",
            "I really don't want to go inside..."
        ]
    }
};

// 6
Object.keys(explorationEn).forEach(key => {
    const arr = explorationScenarios[key];
    if (!arr) return;
    explorationEn[key].forEach((en, i) => {
        if (arr[i] && en) arr[i].en = en;
    });
});

// 7
function injectChoiceEn(arr, key) {
    arr.forEach(step => {
        if (step.type === "choice" && step.options) {
            step.options.forEach(opt => {
                const k = `${key}::${opt.text}`;
                if (explorationChoiceEn[k]) opt.en = explorationChoiceEn[k];
            });
        }
        if (step.type === "conditional") {
            if (step.ifTrue) injectChoiceEn(step.ifTrue, key);
            if (step.ifFalse) injectChoiceEn(step.ifFalse, key);
        }
    });
}
Object.keys(explorationScenarios).forEach(k => injectChoiceEn(explorationScenarios[k], k));

// 8
Object.keys(explorationCondEn).forEach(key => {
    const arr = explorationScenarios[key];
    if (!arr) return;
    arr.forEach(step => {
        if (step.type !== "conditional") return;
        if (step.ifTrue && explorationCondEn[key].ifTrue) {
            explorationCondEn[key].ifTrue.forEach((en, i) => {
                if (step.ifTrue[i] && en) step.ifTrue[i].en = en;
            });
        }
        if (step.ifFalse && explorationCondEn[key].ifFalse) {
            explorationCondEn[key].ifFalse.forEach((en, i) => {
                if (step.ifFalse[i] && en) step.ifFalse[i].en = en;
            });
        }
    });
});
showScreen("title");