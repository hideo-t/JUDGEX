# Firebase設定ガイド

PRE-JUDGE Suiteでログイン機能と診断履歴保存を有効にするためのFirebase設定手順

## 🚀 クイックスタート（5ステップ）

### ステップ1: Firebaseプロジェクトを作成

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例：`pre-judge-suite`）
4. Google アナリティクスは任意（なしでもOK）
5. 「プロジェクトを作成」をクリック

### ステップ2: Webアプリを追加

1. Firebaseコンソールのプロジェクト画面で「</>」（Webアイコン）をクリック
2. アプリのニックネームを入力（例：`PRE-JUDGE MAP`）
3. 「Firebase Hosting」のチェックは不要
4. 「アプリを登録」をクリック
5. **設定情報をコピー**（次のステップで使用）

表示される設定は以下のような形式：
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "pre-judge-suite.firebaseapp.com",
  projectId: "pre-judge-suite",
  storageBucket: "pre-judge-suite.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### ステップ3: 認証を有効化

1. Firebaseコンソールの左メニューから「Authentication」をクリック
2. 「始める」をクリック
3. 「Sign-in method」タブを選択
4. 「Google」をクリック
5. スイッチを「有効」にする
6. プロジェクトのサポートメールを選択
7. 「保存」をクリック

### ステップ4: Firestoreを有効化

1. 左メニューから「Firestore Database」をクリック
2. 「データベースの作成」をクリック
3. ロケーション：`asia-northeast1`（東京）を推奨
4. 「本番環境モードで開始」を選択
5. 「作成」をクリック

#### セキュリティルールを設定

「ルール」タブで以下を設定：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーは自分のデータのみ読み書き可能
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

「公開」をクリックして保存。

### ステップ5: 設定ファイルを更新

`firebase-config.js` を開き、ステップ2でコピーした設定情報を貼り付け：

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",  // ← ここを実際の値に置き換え
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

---

## ✅ 動作確認

### 1. ローカルでテスト

```bash
# 簡易HTTPサーバーを起動
python -m http.server 8000

# ブラウザで開く
# http://localhost:8000
```

### 2. ログイン機能を確認

1. アプリを開く
2. 同意画面で「ログインモード」を選択
3. 「開始する」をクリック
4. Googleアカウントでログイン

### 3. 履歴保存を確認

1. 診断を完了（JUDGEX²まで）
2. ブラウザを更新
3. 再度ログイン
4. 「📊 履歴を見る」をクリック
5. 過去の診断履歴が表示されることを確認

---

## 🔧 トラブルシューティング

### 問題1: 「Firebase SDK未ロード」エラー

**原因:** ネットワークエラーまたはCDNからのロードに失敗

**解決策:**
1. インターネット接続を確認
2. ブラウザのコンソールでエラーを確認
3. CDN URLが正しいか確認（index.htmlの`<head>`内）

### 問題2: 「Permission denied」エラー

**原因:** Firestoreのセキュリティルールが正しく設定されていない

**解決策:**
1. Firebaseコンソール → Firestore → ルール
2. 上記のセキュリティルールをコピペ
3. 「公開」をクリック

### 問題3: ログインできない

**原因:** 
- Google認証が有効になっていない
- 承認済みドメインに追加されていない

**解決策:**
1. Firebaseコンソール → Authentication → Sign-in method
2. Googleが「有効」になっているか確認
3. 「設定」タブ → 承認済みドメイン
4. 使用するドメインが含まれているか確認
   - `localhost` は自動で含まれる
   - GitHub Pagesの場合：`YOUR_USERNAME.github.io` を追加

### 問題4: 履歴が保存されない

**確認ポイント:**
1. ブラウザのコンソールを開く（F12）
2. 「セッション保存成功」のログが出ているか確認
3. Firebaseコンソール → Firestore → データ
4. `users/{userId}/sessions` にデータがあるか確認

**よくある原因:**
- ログインモードで開始していない（ゲストモードでは保存されない）
- ネットワークエラー
- セキュリティルールの問題

---

## 📊 データ構造

Firestoreに保存されるデータ構造：

```
users/
  └── {userId}/
      └── sessions/
          └── {sessionId}/
              ├── date: Timestamp
              ├── version: "v2.3"
              ├── round: 1
              ├── inputs: {
              │   q1: "...",
              │   q2: "...",
              │   q3: "...",
              │   followup: "..."
              │ }
              ├── map: {
              │   layer: 3,
              │   stuckPoints: [...],
              │   questions: [...]
              │ }
              └── judgex2: {
                  score: 75,
                  label: "引き受け傾向",
                  axisA: 34,
                  axisB: 34,
                  axisC: 32
                }
```

---

## 🔒 セキュリティ上の注意

### 本番環境での推奨設定

1. **APIキーの制限**
   - Google Cloud Console → 認証情報
   - APIキーを選択
   - 「HTTPリファラー」でドメインを制限

2. **Firestoreルールの最適化**
   - 必要最小限の権限のみ許可
   - 書き込みサイズの制限を追加

3. **認証済みドメインの制限**
   - 本番ドメインのみに制限
   - 不要なドメインを削除

---

## 💡 無料枠について

Firebaseの無料枠（Spark プラン）：
- **Authentication**: 無制限
- **Firestore**: 
  - 読み取り: 50,000回/日
  - 書き込み: 20,000回/日
  - ストレージ: 1 GB

**目安:**
- 1診断 = 約2回の書き込み + 1回の読み取り
- 月間利用可能: 約10,000診断

ほとんどのユースケースで無料枠内で運用可能です。

---

## 🚀 次のステップ

設定が完了したら：
1. GitHub Pagesにデプロイ
2. カスタムドメインを設定（オプション）
3. Google Analyticsで利用状況を追跡（オプション）

---

**PRE-JUDGE Suite v2.3** - Firebase統合完了
