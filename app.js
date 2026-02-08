// ========================================
// PRE-JUDGE Suite - アプリケーションロジック
// ========================================

// グローバル状態
const AppState = {
    sessionId: null,
    round: 0,
    currentStep: 'consent', // consent, q1, q2, q3, map, followup, judgex, result
    inputs: {
        q1: '',
        q2: '',
        q3: '',
        followup: ''
    },
    map: null,
    judgex2: null
};

// 禁止語（助言的な言葉を排除）
const FORBIDDEN_WORDS = ['おすすめ', '良い', '悪い', '正しい', '間違い', 'すべき', 'べき'];

// 例文データ
const EXAMPLES = {
    q1: [
        '営業職から企画職に転職するか迷っている。現在30歳で、今の会社で5年働いているが、新しいことに挑戦したい気持ちと安定を失う不安がある。',
        '東京から地方に移住するか迷っている。リモートワークが可能になったが、キャリアや人間関係への影響が心配。',
        '大学院に進学するか就職するか決められない。研究は好きだが、経済的な負担と年齢のことを考えると不安。'
    ],
    q2: [
        '①今の会社で営業を続ける ②同業他社の企画職に転職する ③異業種の企画職に挑戦する という3つの選択肢がある。',
        '①東京に残って今の仕事を続ける ②地方に移住してリモートワークをする ③地方で転職する のいずれかを選ぶ必要がある。',
        '①大学院に進学して研究を続ける ②民間企業に就職する ③1年間休学して考える のどれかを決めなければならない。'
    ],
    q3: [
        '転職すると年収が100万円下がる可能性がある。営業の専門性を捨てることになる。失敗したら30代後半で再転職が難しくなる。一方、今のまま続けると新しいスキルが身につかず、将来の選択肢が狭まる。',
        '移住すると友人や仕事仲間との関係が薄くなる。予想外の生活コストがかかる可能性がある。東京に残ると、ずっと憧れていたライフスタイルを諦めることになる。',
        '進学すると2年間の収入がなく、奨学金の返済も増える。就職すると研究を続けられず、後悔する可能性がある。休学すると同期より1年遅れることになる。'
    ]
};

// ========================================
// 初期化
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    setupPresetButtons();
    setupExampleButtons();
});

function initializeApp() {
    // セッションIDを生成
    AppState.sessionId = generateSessionId();
}

function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ========================================
// イベントリスナー
// ========================================
function setupEventListeners() {
    // 同意チェック
    document.getElementById('consentCheck').addEventListener('change', (e) => {
        document.getElementById('btnStart').disabled = !e.target.checked;
    });

    // 開始ボタン
    document.getElementById('btnStart').addEventListener('click', () => {
        AppState.currentStep = 'q1';
        showStep('step-q1');
        updateProgress(1);
    });

    // Q1の次へ
    document.getElementById('btnQ1Next').addEventListener('click', () => {
        AppState.inputs.q1 = document.getElementById('q1').value.trim();
        AppState.currentStep = 'q2';
        document.getElementById('q1Preview').textContent = AppState.inputs.q1;
        showStep('step-q2');
        updateProgress(2);
    });

    // Q2の戻る・次へ
    document.getElementById('btnQ2Back').addEventListener('click', () => {
        AppState.currentStep = 'q1';
        showStep('step-q1');
        updateProgress(1);
    });

    document.getElementById('btnQ2Next').addEventListener('click', () => {
        AppState.inputs.q2 = document.getElementById('q2').value.trim();
        AppState.currentStep = 'q3';
        document.getElementById('q1q2Preview').innerHTML = `
            <div style="margin-bottom: 8px;"><strong>迷い：</strong>${AppState.inputs.q1}</div>
            <div><strong>選択：</strong>${AppState.inputs.q2}</div>
        `;
        showStep('step-q3');
        updateProgress(3);
    });

    // Q3の戻る・MAP生成
    document.getElementById('btnQ3Back').addEventListener('click', () => {
        AppState.currentStep = 'q2';
        showStep('step-q2');
        updateProgress(2);
    });

    document.getElementById('btnGenerateMap').addEventListener('click', () => {
        generateMap();
    });

    // 文字カウンターとバリデーション
    ['q1', 'q2', 'q3'].forEach(id => {
        const textarea = document.getElementById(id);
        const nextButton = id === 'q1' ? 'btnQ1Next' : id === 'q2' ? 'btnQ2Next' : 'btnGenerateMap';
        
        textarea.addEventListener('input', () => {
            updateCharCounter(id);
            validateInput(id, nextButton);
        });
    });

    // フォローアップ送信
    document.getElementById('btnSubmitFollowup').addEventListener('click', () => {
        submitFollowup();
    });

    // JUDGEX²計測
    document.getElementById('btnCalculateJudgex').addEventListener('click', () => {
        calculateJudgex();
    });

    // リセット
    document.getElementById('btnReset').addEventListener('click', () => {
        resetApp();
    });

    // JUDGEX²の選択肢が選ばれたら計測ボタンを有効化
    document.querySelectorAll('input[name="j1"], input[name="j2"], input[name="j3"]').forEach(input => {
        input.addEventListener('change', () => {
            checkJudgexComplete();
        });
    });
}

// ========================================
// プリセットボタンのセットアップ
// ========================================
function setupPresetButtons() {
    // プリセットの表示/非表示トグル
    ['Q1', 'Q2', 'Q3'].forEach(q => {
        const toggle = document.getElementById(`togglePreset${q}`);
        const options = document.getElementById(`preset${q}`);
        
        if (toggle && options) {
            toggle.addEventListener('click', () => {
                const isVisible = options.style.display !== 'none';
                options.style.display = isVisible ? 'none' : 'grid';
                toggle.textContent = isVisible ? '表示' : '非表示';
            });
        }
    });

    // プリセットボタンのクリック処理
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const text = this.getAttribute('data-text');
            const parent = this.closest('.step');
            const textarea = parent.querySelector('.question-input');
            
            if (textarea) {
                // 既存のテキストがある場合は追加、ない場合は置き換え
                if (textarea.value.trim()) {
                    textarea.value += '\n' + text;
                } else {
                    textarea.value = text;
                }
                
                // カウンター更新とバリデーション
                const id = textarea.id;
                updateCharCounter(id);
                
                const nextButton = id === 'q1' ? 'btnQ1Next' : id === 'q2' ? 'btnQ2Next' : 'btnGenerateMap';
                validateInput(id, nextButton);
                
                // ボタンのフィードバック
                this.style.background = 'var(--primary-light)';
                this.style.color = 'white';
                setTimeout(() => {
                    this.style.background = '';
                    this.style.color = '';
                }, 300);
            }
        });
    });
}

// ========================================
// 例文ボタンのセットアップ
// ========================================
function setupExampleButtons() {
    ['Q1', 'Q2', 'Q3'].forEach((q, index) => {
        const btn = document.getElementById(`example${q}`);
        if (btn) {
            btn.addEventListener('click', () => {
                const key = q.toLowerCase();
                const examples = EXAMPLES[key];
                const randomExample = examples[Math.floor(Math.random() * examples.length)];
                const textarea = document.getElementById(key);
                
                // モーダル風に表示（簡易版）
                const confirmed = confirm(`例文を挿入しますか？\n\n"${randomExample}"`);
                if (confirmed) {
                    textarea.value = randomExample;
                    updateCharCounter(key);
                    const nextButton = key === 'q1' ? 'btnQ1Next' : key === 'q2' ? 'btnQ2Next' : 'btnGenerateMap';
                    validateInput(key, nextButton);
                }
            });
        }
    });
}

// ========================================
// 文字カウンターとバリデーション
// ========================================
function updateCharCounter(textareaId) {
    const textarea = document.getElementById(textareaId);
    const counter = document.querySelector(`.char-counter[data-for="${textareaId}"] .char-count`);
    const counterDiv = document.querySelector(`.char-counter[data-for="${textareaId}"]`);
    
    if (textarea && counter) {
        const length = textarea.value.length;
        counter.textContent = length;
        
        if (length >= 10) {
            counterDiv.classList.add('valid');
        } else {
            counterDiv.classList.remove('valid');
        }
    }
}

function validateInput(textareaId, buttonId) {
    const textarea = document.getElementById(textareaId);
    const button = document.getElementById(buttonId);
    
    if (textarea && button) {
        const isValid = textarea.value.trim().length >= 10;
        button.disabled = !isValid;
    }
}

// ========================================
// プログレスバー更新
// ========================================
function updateProgress(step) {
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progressBar');
    const progressStep = document.getElementById('progressStep');
    
    progressContainer.style.display = 'block';
    
    const percentage = (step / 3) * 100;
    progressBar.style.width = percentage + '%';
    progressStep.textContent = `ステップ ${step}`;
}

// ========================================
// ステップ管理
// ========================================
function showStep(stepId) {
    console.log('showStep呼び出し:', stepId);
    
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    
    const targetStep = document.getElementById(stepId);
    if (targetStep) {
        targetStep.classList.add('active');
        console.log('ステップを表示:', stepId);
    } else {
        console.error('ステップが見つかりません:', stepId);
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========================================
// MAP生成
// ========================================
function generateMap() {
    // 入力を取得（既に保存されている）
    AppState.inputs.q3 = document.getElementById('q3').value.trim();

    // バリデーション
    const warning = document.getElementById('validationWarning');
    if (AppState.inputs.q1.length < 10 || 
        AppState.inputs.q2.length < 10 || 
        AppState.inputs.q3.length < 10) {
        warning.style.display = 'block';
    } else {
        warning.style.display = 'none';
    }

    // ラウンドをインクリメント
    AppState.round++;

    // CORE処理
    const coreResult = processCORE(AppState.inputs);
    AppState.map = coreResult;

    // MAPを表示
    displayMap(coreResult);

    // 次のステップへ
    AppState.currentStep = 'map';
    showStep('step-map');
    
    // プログレスバーを非表示
    document.getElementById('progress-container').style.display = 'none';
}

// ========================================
// CORE処理（判定ロジック）
// ========================================
function processCORE(inputs) {
    const q1 = inputs.q1 || '';
    const q2 = inputs.q2 || '';
    const q3 = inputs.q3 || '';

    // Layer判定
    const layer = determineLayer(q1, q2, q3);

    // 詰まり点の生成
    const stuckPoints = generateStuckPoints(q1, q2, q3, layer);

    // 判断可能条件（問い）の生成
    const questions = generateQuestions(q1, q2, q3, layer);

    // 要約（内部用）
    const summary = generateSummary(q1, q2, q3);

    return {
        layer,
        stuckPoints,
        questions,
        summary,
        layerReason: getLayerReason(layer)
    };
}

// Layer判定ロジック
function determineLayer(q1, q2, q3) {
    // 特徴量を計算
    const hasDecisionObject = detectDecisionKeywords(q2);
    const hasResponsibility = detectResponsibilityKeywords(q3);
    const clarityScore = calculateClarityScore(q1, q2, q3);

    // Layer判定
    if (!hasDecisionObject || clarityScore <= 1) {
        return 1; // 未整理
    } else if (hasDecisionObject && !hasResponsibility) {
        return 2; // 判断以前
    } else {
        return 3; // 判断可能
    }
}

function detectDecisionKeywords(text) {
    const keywords = ['選ぶ', '決める', '転職', '買う', '別れる', '移住', '契約', '辞める', '始める', '変える'];
    return keywords.some(keyword => text.includes(keyword));
}

function detectResponsibilityKeywords(text) {
    const keywords = ['引き受ける', '失う', '責任', '代償', 'リスク', '負担', '払う', '覚悟', '犠牲'];
    return keywords.some(keyword => text.includes(keyword));
}

function calculateClarityScore(q1, q2, q3) {
    let score = 0;
    
    // 文字数チェック
    if (q1.length >= 30) score++;
    if (q2.length >= 30) score++;
    if (q3.length >= 30) score++;
    
    // 具体性チェック（数字、固有名詞、期限など）
    const allText = q1 + q2 + q3;
    if (/\d+/.test(allText)) score++; // 数字がある
    if (/[年月日週]/.test(allText)) score++; // 期限表現がある
    
    return score;
}

function getLayerReason(layer) {
    switch(layer) {
        case 1:
            return '情報が不足しているか、決定対象が明確ではありません';
        case 2:
            return '決定対象は明確ですが、引き受けるものが定義されていません';
        case 3:
            return '決定対象と引き受けるものが明確です';
        default:
            return '';
    }
}

// 詰まり点の生成
function generateStuckPoints(q1, q2, q3, layer) {
    const points = [];
    
    if (layer === 1) {
        points.push({
            category: '情報不足',
            text: '何を決めるのかが曖昧です'
        });
        points.push({
            category: '対象未定義',
            text: '選択肢が明確ではありません'
        });
    } else if (layer === 2) {
        points.push({
            category: '責任未定義',
            text: '何を引き受けるかが曖昧です'
        });
        
        if (q3.length < 20) {
            points.push({
                category: '代償不明',
                text: '決定による代償が具体化されていません'
            });
        }
    } else {
        // Layer 3 でも状況に応じて詰まり点を提示
        if (q1.includes('怖い') || q1.includes('不安')) {
            points.push({
                category: '恐怖',
                text: '失敗や評価への不安があります'
            });
        }
        
        if (q2.includes('期限') || q2.includes('急')) {
            points.push({
                category: '期限圧',
                text: '時間的なプレッシャーがあります'
            });
        }
    }
    
    // 最大3つまで
    return points.slice(0, 3);
}

// 判断可能条件（問い）の生成
function generateQuestions(q1, q2, q3, layer) {
    const questions = [];
    
    if (layer === 1) {
        questions.push('何を選ぶ必要がありますか？');
        questions.push('いつまでに決める必要がありますか？');
        questions.push('決めないとどうなりますか？');
    } else if (layer === 2) {
        questions.push('引き受けること／引き受けないことは何ですか？');
        questions.push('最悪の結果を引き受けるなら、どこまでが許容範囲ですか？');
        questions.push('この決定によって何を手放しますか？');
    } else {
        questions.push('期限をいつに設定すると、逃げずに判断できますか？');
        questions.push('結果が悪かったとき、何をどう修正しますか？');
        questions.push('決めた後の「後悔しない条件」は何ですか？');
    }
    
    return questions.slice(0, 3);
}

// 要約生成（評価なし）
function generateSummary(q1, q2, q3) {
    let summary = '';
    if (q1) summary += `${q1}を迷っている。`;
    if (q2) summary += `選ぶ必要があるのは${q2}。`;
    if (q3) summary += `決めた場合の引き受けは${q3}。`;
    return summary;
}

// ========================================
// MAP表示
// ========================================
function displayMap(map) {
    console.log('displayMap呼び出し - Layer:', map.layer);
    
    // デバッグ情報を表示（開発用）
    const debugInfo = document.getElementById('debugInfo');
    const debugLayer = document.getElementById('debugLayer');
    const debugButton = document.getElementById('debugButton');
    
    // URLパラメータでデバッグモードを有効化
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('debug') === 'true') {
        debugInfo.style.display = 'block';
        debugLayer.textContent = map.layer;
    }
    
    // Layer表示
    const layerIndicator = document.getElementById('layerIndicator');
    const layerDescription = document.getElementById('layerDescription');
    
    layerIndicator.innerHTML = `<div class="layer-badge layer${map.layer}">Layer ${map.layer}</div>`;
    
    const layerDescriptions = {
        1: '未整理：情報や選択肢が整理されていない状態',
        2: '判断以前：選択肢は見えているが、引き受けるものが明確でない状態',
        3: '判断可能：決定対象と引き受けるものが明確な状態'
    };
    layerDescription.textContent = layerDescriptions[map.layer];

    // 詰まり点
    const stuckPointsContainer = document.getElementById('stuckPoints');
    stuckPointsContainer.innerHTML = '';
    map.stuckPoints.forEach((point, index) => {
        const pointEl = document.createElement('div');
        pointEl.className = 'stuck-point';
        pointEl.style.animationDelay = `${index * 0.1}s`;
        pointEl.innerHTML = `
            <div class="stuck-point-category">${point.category}</div>
            <div class="stuck-point-text">${point.text}</div>
        `;
        stuckPointsContainer.appendChild(pointEl);
    });

    // 判断可能条件（問い）
    const questionsContainer = document.getElementById('questions');
    questionsContainer.innerHTML = '';
    map.questions.forEach((question, index) => {
        const questionEl = document.createElement('div');
        questionEl.className = 'question-item';
        questionEl.style.animationDelay = `${index * 0.1}s`;
        questionEl.textContent = question;
        questionsContainer.appendChild(questionEl);
    });

    // Layer別のアクション
    const actionsContainer = document.getElementById('layerActions');
    actionsContainer.innerHTML = '';

    if (map.layer === 1) {
        // Layer 1: 追加質問へ
        const btn = document.createElement('button');
        btn.className = 'btn btn-primary';
        btn.textContent = '深掘りする';
        btn.id = 'btnDeepDive';
        btn.onclick = (e) => {
            e.preventDefault();
            console.log('深掘りボタンがクリックされました');
            if (debugButton) debugButton.textContent = 'クリックされた！';
            setupFollowup(1);
        };
        actionsContainer.appendChild(btn);
        console.log('Layer 1のボタンを追加しました');
        if (debugButton) debugButton.textContent = '深掘りボタン追加済み';
    } else if (map.layer === 2) {
        // Layer 2: 引き受けの言語化へ
        const btn = document.createElement('button');
        btn.className = 'btn btn-primary';
        btn.textContent = '引き受けを言語化する';
        btn.id = 'btnAccept';
        btn.onclick = (e) => {
            e.preventDefault();
            console.log('引き受けボタンがクリックされました');
            if (debugButton) debugButton.textContent = 'クリックされた！';
            setupFollowup(2);
        };
        actionsContainer.appendChild(btn);
        console.log('Layer 2のボタンを追加しました');
        if (debugButton) debugButton.textContent = '引き受けボタン追加済み';
    } else {
        // Layer 3: JUDGEX²へ
        const btn = document.createElement('button');
        btn.className = 'btn btn-primary';
        btn.textContent = 'JUDGEX²を計測する';
        btn.id = 'btnJudgex';
        btn.onclick = (e) => {
            e.preventDefault();
            console.log('JUDGEX²ボタンがクリックされました');
            if (debugButton) debugButton.textContent = 'クリックされた！';
            showStep('step-judgex');
        };
        actionsContainer.appendChild(btn);
        console.log('Layer 3のボタンを追加しました');
        if (debugButton) debugButton.textContent = 'JUDGEX²ボタン追加済み';
    }
}

// ========================================
// フォローアップ（Layer 1/2の追加質問）
// ========================================
function setupFollowup(layer) {
    console.log('setupFollowup呼び出し - Layer:', layer);
    
    const title = document.getElementById('followupTitle');
    const description = document.getElementById('followupDescription');

    if (layer === 1) {
        title.textContent = '深掘り';
        description.textContent = '何が一番ひっかかっていますか？（一言で）';
    } else if (layer === 2) {
        title.textContent = '引き受けの言語化';
        description.textContent = '引き受けること／引き受けないことは何ですか？';
    }

    const followupTextarea = document.getElementById('followupAnswer');
    followupTextarea.value = '';
    
    // 既存のイベントリスナーをクリア（重複防止）
    const newTextarea = followupTextarea.cloneNode(true);
    followupTextarea.parentNode.replaceChild(newTextarea, followupTextarea);
    
    // 新しいイベントリスナーを設定
    const textarea = document.getElementById('followupAnswer');
    textarea.addEventListener('input', () => {
        updateCharCounter('followupAnswer');
    });
    
    updateCharCounter('followupAnswer');
    
    console.log('step-followupを表示します');
    showStep('step-followup');
}

function submitFollowup() {
    const followupAnswer = document.getElementById('followupAnswer').value.trim();
    
    if (!followupAnswer) {
        alert('回答を入力してください');
        return;
    }

    // 入力を追加
    AppState.inputs.followup = followupAnswer;

    // もう一度MAP生成（既存の入力 + フォローアップ）
    const coreResult = processCORE({
        q1: AppState.inputs.q1 + ' ' + followupAnswer,
        q2: AppState.inputs.q2,
        q3: AppState.inputs.q3 + ' ' + followupAnswer
    });
    
    AppState.map = coreResult;
    AppState.round++;

    displayMap(coreResult);
    showStep('step-map');
}

// ========================================
// JUDGEX²
// ========================================
function checkJudgexComplete() {
    const j1 = document.querySelector('input[name="j1"]:checked');
    const j2 = document.querySelector('input[name="j2"]:checked');
    const j3 = document.querySelector('input[name="j3"]:checked');
    
    document.getElementById('btnCalculateJudgex').disabled = !(j1 && j2 && j3);
}

function calculateJudgex() {
    const j1 = document.querySelector('input[name="j1"]:checked').value;
    const j2 = document.querySelector('input[name="j2"]:checked').value;
    const j3 = document.querySelector('input[name="j3"]:checked').value;

    // スコア計算
    const scores = {
        j1: { A: 34, B: 22, C: 10, D: 0 },
        j2: { A: 34, B: 22, C: 10, D: 0 },
        j3: { A: 32, B: 20, C: 8, D: 0 }
    };

    const axisA = scores.j1[j1];
    const axisB = scores.j2[j2];
    const axisC = scores.j3[j3];
    const totalScore = axisA + axisB + axisC;

    // 傾向ラベル
    let label = '';
    let labelClass = '';
    if (totalScore >= 0 && totalScore <= 33) {
        label = '回避傾向';
        labelClass = 'avoid';
    } else if (totalScore >= 34 && totalScore <= 66) {
        label = '保留傾向';
        labelClass = 'pending';
    } else {
        label = '引き受け傾向';
        labelClass = 'accept';
    }

    // 結果を保存
    AppState.judgex2 = {
        score: totalScore,
        label,
        labelClass,
        axisA,
        axisB,
        axisC
    };

    // 結果を表示
    displayJudgexResult();
    showStep('step-result');
}

function displayJudgexResult() {
    const result = AppState.judgex2;

    // スコアバー
    const scoreBar = document.getElementById('scoreBar');
    scoreBar.style.width = '0%';
    setTimeout(() => {
        scoreBar.style.width = result.score + '%';
    }, 100);

    // スコア数値
    const scoreNumber = document.getElementById('scoreNumber');
    animateNumber(scoreNumber, 0, result.score, 1000);

    // ラベル
    const scoreLabel = document.getElementById('scoreLabel');
    scoreLabel.textContent = result.label;
    scoreLabel.className = `score-label ${result.labelClass}`;

    // レーダーチャート
    drawRadarChart(result.axisA, result.axisB, result.axisC);
}

function animateNumber(element, start, end, duration) {
    const startTime = Date.now();
    
    function update() {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        const current = Math.floor(start + (end - start) * progress);
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    update();
}

function drawRadarChart(axisA, axisB, axisC) {
    const canvas = document.getElementById('radarCanvas');
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 100;

    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 背景の六角形（グリッド）
    ctx.strokeStyle = '#e1e8ed';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) {
        drawHexagon(ctx, centerX, centerY, radius * (i / 3), '#e1e8ed');
    }

    // 軸
    const angles = [0, 120, 240]; // 3軸
    const labels = ['責任引受', '期限耐性', '代償明文化'];
    const values = [axisA / 34, axisB / 34, axisC / 32]; // 正規化（0-1）

    ctx.strokeStyle = '#2c5f7c';
    ctx.lineWidth = 1;
    angles.forEach((angle, i) => {
        const rad = (angle - 90) * Math.PI / 180;
        const x = centerX + radius * Math.cos(rad);
        const y = centerY + radius * Math.sin(rad);
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();

        // ラベル
        ctx.fillStyle = '#1a1a1a';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        const labelX = centerX + (radius + 20) * Math.cos(rad);
        const labelY = centerY + (radius + 20) * Math.sin(rad);
        ctx.fillText(labels[i], labelX, labelY);
    });

    // データポリゴン
    ctx.fillStyle = 'rgba(44, 95, 124, 0.3)';
    ctx.strokeStyle = '#2c5f7c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    angles.forEach((angle, i) => {
        const rad = (angle - 90) * Math.PI / 180;
        const r = radius * values[i];
        const x = centerX + r * Math.cos(rad);
        const y = centerY + r * Math.sin(rad);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // データポイント
    ctx.fillStyle = '#2c5f7c';
    angles.forEach((angle, i) => {
        const rad = (angle - 90) * Math.PI / 180;
        const r = radius * values[i];
        const x = centerX + r * Math.cos(rad);
        const y = centerY + r * Math.sin(rad);
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
}

function drawHexagon(ctx, x, y, radius, color) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    for (let i = 0; i <= 3; i++) {
        const angle = (i * 120 - 90) * Math.PI / 180;
        const px = x + radius * Math.cos(angle);
        const py = y + radius * Math.sin(angle);
        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.closePath();
    ctx.stroke();
}

// ========================================
// リセット
// ========================================
function resetApp() {
    if (confirm('最初から始めますか？入力内容は失われます。')) {
        // 状態をクリア
        AppState.round = 0;
        AppState.currentStep = 'consent';
        AppState.inputs = { q1: '', q2: '', q3: '', followup: '' };
        AppState.map = null;
        AppState.judgex2 = null;

        // 入力フィールドをクリア
        document.getElementById('q1').value = '';
        document.getElementById('q2').value = '';
        document.getElementById('q3').value = '';
        document.getElementById('followupAnswer').value = '';

        // 文字カウンターをリセット
        document.querySelectorAll('.char-count').forEach(counter => {
            counter.textContent = '0';
        });
        document.querySelectorAll('.char-counter').forEach(counter => {
            counter.classList.remove('valid');
        });

        // ボタンを無効化
        document.getElementById('btnQ1Next').disabled = true;
        document.getElementById('btnQ2Next').disabled = true;
        document.getElementById('btnGenerateMap').disabled = true;

        // JUDGEX²の選択をクリア
        document.querySelectorAll('input[name="j1"], input[name="j2"], input[name="j3"]').forEach(input => {
            input.checked = false;
        });

        // プログレスバーをリセット
        document.getElementById('progressBar').style.width = '0%';
        document.getElementById('progress-container').style.display = 'none';

        // 最初のステップへ
        showStep('step-consent');
    }
}

// ========================================
// セッション保存・復元（オプション）
// ========================================
function saveSession() {
    localStorage.setItem('prejudge_session', JSON.stringify(AppState));
}

function loadSession() {
    const saved = localStorage.getItem('prejudge_session');
    if (saved) {
        try {
            const state = JSON.parse(saved);
            Object.assign(AppState, state);
        } catch (e) {
            console.error('セッション復元エラー:', e);
        }
    }
}
