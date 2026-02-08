// Firebase設定
// 注意: 本番環境では環境変数を使用してください

const firebaseConfig = {
    // ここにFirebaseプロジェクトの設定を入れます
    // Firebase Console (https://console.firebase.google.com/) で作成
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Firebase初期化フラグ
let firebaseInitialized = false;
let auth = null;
let db = null;

// Firebase初期化
async function initializeFirebase() {
    if (firebaseInitialized) return;
    
    try {
        // Firebase SDKがロードされているか確認
        if (typeof firebase === 'undefined') {
            console.warn('Firebase SDK未ロード - ログイン機能は無効');
            return false;
        }
        
        // Firebase初期化
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        
        firebaseInitialized = true;
        console.log('Firebase初期化完了');
        
        // 認証状態の監視
        auth.onAuthStateChanged(handleAuthStateChanged);
        
        return true;
    } catch (error) {
        console.error('Firebase初期化エラー:', error);
        return false;
    }
}

// 認証状態変更ハンドラ
function handleAuthStateChanged(user) {
    console.log('認証状態変更:', user ? user.email : 'ログアウト');
    
    if (user) {
        // ログイン済み
        AppState.user = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
        };
        updateUIForLoggedIn();
        
        // 過去の履歴を読み込み
        loadUserHistory();
    } else {
        // ログアウト
        AppState.user = null;
        AppState.history = [];
        updateUIForLoggedOut();
    }
}

// Googleログイン
async function signInWithGoogle() {
    if (!auth) {
        alert('ログイン機能が利用できません');
        return;
    }
    
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        console.log('ログイン成功:', result.user.email);
        return result.user;
    } catch (error) {
        console.error('ログインエラー:', error);
        alert('ログインに失敗しました: ' + error.message);
        return null;
    }
}

// ログアウト
async function signOut() {
    if (!auth) return;
    
    try {
        await auth.signOut();
        console.log('ログアウト成功');
    } catch (error) {
        console.error('ログアウトエラー:', error);
        alert('ログアウトに失敗しました');
    }
}

// セッション保存
async function saveSession() {
    if (!db || !AppState.user) {
        console.log('保存スキップ（未ログイン）');
        return;
    }
    
    try {
        const sessionData = {
            sessionId: AppState.sessionId,
            date: firebase.firestore.FieldValue.serverTimestamp(),
            version: 'v2.2',
            round: AppState.round,
            inputs: {
                q1: AppState.inputs.q1,
                q2: AppState.inputs.q2,
                q3: AppState.inputs.q3,
                followup: AppState.inputs.followup || ''
            },
            map: AppState.map ? {
                layer: AppState.map.layer,
                stuckPoints: AppState.map.stuckPoints,
                questions: AppState.map.questions
            } : null,
            judgex2: AppState.judgex2 ? {
                score: AppState.judgex2.score,
                label: AppState.judgex2.label,
                axisA: AppState.judgex2.axisA,
                axisB: AppState.judgex2.axisB,
                axisC: AppState.judgex2.axisC
            } : null
        };
        
        await db.collection('users')
            .doc(AppState.user.uid)
            .collection('sessions')
            .doc(AppState.sessionId)
            .set(sessionData, { merge: true });
        
        console.log('セッション保存成功:', AppState.sessionId);
    } catch (error) {
        console.error('セッション保存エラー:', error);
    }
}

// 履歴読み込み
async function loadUserHistory() {
    if (!db || !AppState.user) return;
    
    try {
        const snapshot = await db.collection('users')
            .doc(AppState.user.uid)
            .collection('sessions')
            .orderBy('date', 'desc')
            .limit(50)
            .get();
        
        AppState.history = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            AppState.history.push({
                id: doc.id,
                ...data,
                date: data.date ? data.date.toDate() : null
            });
        });
        
        console.log('履歴読み込み完了:', AppState.history.length, '件');
        updateHistoryDisplay();
    } catch (error) {
        console.error('履歴読み込みエラー:', error);
    }
}

// UI更新（ログイン済み）
function updateUIForLoggedIn() {
    const loginBtn = document.getElementById('btnGoogleLogin');
    const logoutBtn = document.getElementById('btnLogout');
    const userInfo = document.getElementById('userInfo');
    const historyBtn = document.getElementById('btnViewHistory');
    
    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
    if (historyBtn) historyBtn.style.display = 'inline-block';
    
    if (userInfo && AppState.user) {
        userInfo.style.display = 'flex';
        userInfo.innerHTML = `
            ${AppState.user.photoURL ? `<img src="${AppState.user.photoURL}" alt="Avatar" class="user-avatar">` : ''}
            <span class="user-email">${AppState.user.email}</span>
        `;
    }
}

// UI更新（ログアウト）
function updateUIForLoggedOut() {
    const loginBtn = document.getElementById('btnGoogleLogin');
    const logoutBtn = document.getElementById('btnLogout');
    const userInfo = document.getElementById('userInfo');
    const historyBtn = document.getElementById('btnViewHistory');
    
    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (userInfo) userInfo.style.display = 'none';
    if (historyBtn) historyBtn.style.display = 'none';
}
