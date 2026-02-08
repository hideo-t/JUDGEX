// Firebase設定
// プロジェクト: judgex-f5512

const firebaseConfig = {
    apiKey: "AIzaSyAgr9fxd3NJPTmOQhYtgdmk3Nl1tZkDP4g",
    authDomain: "judgex-f5512.firebaseapp.com",
    projectId: "judgex-f5512",
    storageBucket: "judgex-f5512.firebasestorage.app",
    messagingSenderId: "953096049730",
    appId: "1:953096049730:web:0f14ba0a302c1f764309db",
    measurementId: "G-L6H6WRQHH5"
};

// 設定が完了しているかチェック
function isFirebaseConfigured() {
    return firebaseConfig.apiKey !== "YOUR_API_KEY" && 
           firebaseConfig.projectId !== "YOUR_PROJECT_ID";
}

// Firebase初期化フラグ
let firebaseInitialized = false;
let auth = null;
let db = null;

// Firebase初期化
async function initializeFirebase() {
    if (firebaseInitialized) return true;
    
    try {
        // Firebase SDKがロードされているか確認
        if (typeof firebase === 'undefined') {
            console.warn('Firebase SDK未ロード');
            showFirebaseError('Firebase SDKが読み込まれていません。ネットワーク接続を確認してください。');
            return false;
        }
        
        // 設定が完了しているか確認
        if (!isFirebaseConfigured()) {
            console.warn('Firebase未設定');
            showFirebaseInfo('Firebase設定が必要です。FIREBASE_SETUP.mdを参照してください。');
            return false;
        }
        
        // Firebase初期化
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        
        firebaseInitialized = true;
        console.log('✅ Firebase初期化完了');
        console.log('プロジェクトID:', firebaseConfig.projectId);
        
        // 認証状態の監視
        auth.onAuthStateChanged(handleAuthStateChanged);
        
        return true;
    } catch (error) {
        console.error('❌ Firebase初期化エラー:', error);
        
        // エラーの種類に応じたメッセージ
        let errorMessage = 'Firebase初期化に失敗しました。';
        
        if (error.code === 'auth/invalid-api-key') {
            errorMessage = 'APIキーが無効です。firebase-config.jsの設定を確認してください。';
        } else if (error.message.includes('project')) {
            errorMessage = 'プロジェクトIDが正しくありません。firebase-config.jsを確認してください。';
        }
        
        showFirebaseError(errorMessage);
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
    console.log('🔐 Googleログイン開始');
    
    if (!auth) {
        const message = 'Firebase認証が初期化されていません。\n\n' +
                       'Firebase設定が必要です。\n' +
                       'FIREBASE_SETUP.mdを参照してください。\n\n' +
                       'または「ゲストモード」でご利用ください。';
        alert(message);
        return null;
    }
    
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        
        // ログインプロンプトを強制表示
        provider.setCustomParameters({
            prompt: 'select_account'
        });
        
        console.log('ログインポップアップを表示...');
        const result = await auth.signInWithPopup(provider);
        
        console.log('✅ ログイン成功:', result.user.email);
        alert('ログインに成功しました！\n' + result.user.email);
        
        return result.user;
    } catch (error) {
        console.error('❌ ログインエラー:', error);
        console.error('エラーコード:', error.code);
        console.error('エラーメッセージ:', error.message);
        
        // エラーの種類に応じたメッセージ
        let errorMessage = 'ログインに失敗しました。';
        
        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'ログインがキャンセルされました。';
            // キャンセルの場合はアラートを表示しない
            console.log('ユーザーがキャンセル');
            return null;
        } else if (error.code === 'auth/unauthorized-domain') {
            errorMessage = '⚠️ このドメインは承認されていません。\n\n' +
                          '【解決方法】\n' +
                          '1. Firebase Console を開く\n' +
                          '2. Authentication → Settings → 承認済みドメイン\n' +
                          '3. このドメインを追加してください\n\n' +
                          '現在のドメイン: ' + window.location.hostname;
        } else if (error.code === 'auth/popup-blocked') {
            errorMessage = 'ポップアップがブロックされました。\n' +
                          'ブラウザのポップアップブロックを解除してください。';
        } else if (error.code === 'auth/network-request-failed') {
            errorMessage = 'ネットワークエラーが発生しました。\n' +
                          'インターネット接続を確認してください。';
        } else {
            errorMessage = 'ログインエラー: ' + error.message + '\n\n' +
                          'エラーコード: ' + error.code;
        }
        
        alert(errorMessage);
        return null;
    }
}

// ログアウト
async function signOut() {
    if (!auth) return;
    
    try {
        await auth.signOut();
        console.log('✅ ログアウト成功');
        alert('ログアウトしました');
    } catch (error) {
        console.error('❌ ログアウトエラー:', error);
        alert('ログアウトに失敗しました: ' + error.message);
    }
}

// Firebase情報表示
function showFirebaseInfo(message) {
    const infoDiv = document.createElement('div');
    infoDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #fef3c7;
        border: 2px solid #f59e0b;
        color: #92400e;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 400px;
        font-size: 14px;
        line-height: 1.5;
    `;
    infoDiv.innerHTML = `
        <strong>💡 情報</strong><br>
        ${message}
        <br><br>
        <button onclick="this.parentElement.remove()" style="
            background: #f59e0b;
            color: white;
            border: none;
            padding: 5px 15px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 10px;
        ">閉じる</button>
    `;
    document.body.appendChild(infoDiv);
    
    setTimeout(() => {
        if (infoDiv.parentElement) {
            infoDiv.remove();
        }
    }, 10000);
}

// Firebaseエラー表示
function showFirebaseError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #fee;
        border: 2px solid #f44;
        color: #c00;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 400px;
        font-size: 14px;
        line-height: 1.5;
    `;
    errorDiv.innerHTML = `
        <strong>❌ エラー</strong><br>
        ${message}
        <br><br>
        <button onclick="this.parentElement.remove()" style="
            background: #f44;
            color: white;
            border: none;
            padding: 5px 15px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 10px;
        ">閉じる</button>
    `;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        if (errorDiv.parentElement) {
            errorDiv.remove();
        }
    }, 15000);
}

// セッション保存
async function saveSession() {
    if (!db || !AppState.user) {
        console.log('保存スキップ（未ログイン）');
        return;
    }
    
    // 保存状態を表示
    showSaveStatus('saving', '💾', '保存中...');
    
    try {
        const sessionData = {
            sessionId: AppState.sessionId,
            date: firebase.firestore.FieldValue.serverTimestamp(),
            version: 'v2.5',
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
        
        console.log('✅ セッション保存成功:', AppState.sessionId);
        
        // 保存成功を表示
        showSaveStatus('saved', '✅', '保存完了！');
        
        // 3秒後に非表示
        setTimeout(() => {
            const saveStatus = document.getElementById('saveStatus');
            if (saveStatus) {
                saveStatus.style.display = 'none';
            }
        }, 3000);
        
    } catch (error) {
        console.error('❌ セッション保存エラー:', error);
        
        // エラーを表示
        showSaveStatus('error', '❌', '保存失敗: ' + error.message);
        
        if (error.code === 'permission-denied') {
            alert('保存権限がありません。\nFirestoreのセキュリティルールを確認してください。\n\nNEXT_STEPS.md のステップ2を参照してください。');
        } else {
            alert('保存エラー: ' + error.message);
        }
    }
}

// 保存状態を表示
function showSaveStatus(status, icon, text) {
    const saveStatus = document.getElementById('saveStatus');
    const saveStatusIcon = document.getElementById('saveStatusIcon');
    const saveStatusText = document.getElementById('saveStatusText');
    
    if (!saveStatus) return;
    
    saveStatus.style.display = 'flex';
    saveStatus.className = 'save-status ' + status;
    saveStatusIcon.textContent = icon;
    saveStatusText.textContent = text;
}

// 履歴読み込み
async function loadUserHistory() {
    if (!db || !AppState.user) return;
    
    try {
        console.log('📚 履歴を読み込み中...');
        
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
        
        console.log('✅ 履歴読み込み完了:', AppState.history.length, '件');
        updateHistoryDisplay();
    } catch (error) {
        console.error('❌ 履歴読み込みエラー:', error);
        
        if (error.code === 'permission-denied') {
            alert('履歴の読み込み権限がありません。\nFirestoreのセキュリティルールを確認してください。');
        }
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
    
    if (loginBtn) loginBtn.style.display = 'inline-flex';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (userInfo) userInfo.style.display = 'none';
    if (historyBtn) historyBtn.style.display = 'none';
}

