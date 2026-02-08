# Firebase設定完了 - 次のステップ

## ✅ 完了した設定

firebase-config.js にFirebaseプロジェクト「judgex-f5512」の設定を反映しました。

## 🔧 次に必要な設定（3ステップ）

### ステップ1: Google認証を有効化

1. [Firebase Console](https://console.firebase.google.com/) を開く
2. プロジェクト「judgex-f5512」を選択
3. 左メニューから **Authentication** をクリック
4. 「始める」をクリック（初回のみ）
5. **Sign-in method** タブを選択
6. **Google** をクリック
7. スイッチを「**有効**」にする
8. プロジェクトのサポートメールを選択
9. **保存** をクリック

---

### ステップ2: Firestoreを有効化してセキュリティルールを設定

#### 2-1. Firestoreを作成

1. Firebase Console の左メニューから **Firestore Database** をクリック
2. 「**データベースの作成**」をクリック
3. ロケーション：**asia-northeast1**（東京）を選択
4. 「**本番環境モードで開始**」を選択
5. 「**作成**」をクリック

#### 2-2. セキュリティルールを設定

1. Firestore Database 画面で **ルール** タブをクリック
2. 以下のルールをコピーして貼り付け：

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

3. **公開** をクリック

---

### ステップ3: 承認済みドメインを追加

#### ローカルテスト用（localhost）

localhostは自動で含まれているので設定不要です。

#### GitHub Pages用

1. Firebase Console → **Authentication** → **Settings** タブ
2. **承認済みドメイン** セクションまでスクロール
3. **ドメインを追加** をクリック
4. 以下を入力：
   ```
   YOUR_USERNAME.github.io
   ```
   ※ `YOUR_USERNAME` を実際のGitHubユーザー名に置き換え
5. **追加** をクリック

**例:**
- GitHubユーザー名が `tanaka` の場合: `tanaka.github.io`
- リポジトリ名は含めない（`tanaka.github.io/pre-judge-suite` ではない）

---

## 🧪 動作確認

### ローカルでテスト

1. 簡易HTTPサーバーを起動：
   ```bash
   python -m http.server 8000
   ```

2. ブラウザで開く：
   ```
   http://localhost:8000
   ```

3. アプリを開いて「ログインモード」を選択

4. Googleログインを試す

### Firebase診断ツールで確認

1. ブラウザで `firebase-diagnostics.html` を開く
2. 「診断開始」をクリック
3. すべての項目が ✅ になることを確認
4. 「ログインテスト」をクリック
5. ログインできることを確認

---

## ❌ よくあるエラー

### エラー1: auth/unauthorized-domain

**原因:** 承認済みドメインに追加されていない

**解決策:**
- ステップ3を実施
- 使用しているドメイン（localhost または your-username.github.io）を追加

### エラー2: permission-denied

**原因:** Firestoreセキュリティルールが設定されていない

**解決策:**
- ステップ2-2を実施
- セキュリティルールを正しくコピペ
- 「公開」を忘れずにクリック

### エラー3: Firebase SDKが読み込まれない

**原因:** ネットワークエラーまたはCDNの問題

**解決策:**
- インターネット接続を確認
- ブラウザのキャッシュをクリア
- 別のブラウザで試す

---

## 📝 チェックリスト

設定が完了したら、以下を確認：

- [ ] Google認証を有効化した
- [ ] Firestoreを作成した
- [ ] セキュリティルールを設定した（公開した）
- [ ] 承認済みドメインを追加した（GitHub Pages使用時）
- [ ] firebase-diagnostics.html で全項目 ✅
- [ ] ログインテストが成功した

すべて ✅ になったら、GitHub Pagesにデプロイして本番環境でもテスト！

---

## 🚀 GitHub Pagesへのデプロイ

```bash
# すべてのファイルをコミット
git add .
git commit -m "feat: Firebase設定完了 v2.4"

# GitHubにプッシュ
git push origin main
```

数分後、以下のURLでアクセス：
```
https://YOUR_USERNAME.github.io/REPO_NAME/
```

---

## 💡 次回以降の使い方

設定は一度だけでOK！次回からは：

1. アプリを開く
2. 「ログインモード」を選択
3. Googleでログイン
4. 診断を実施
5. 自動保存 ✨

履歴は「📊 履歴を見る」からいつでも確認できます。

---

**PRE-JUDGE Suite v2.4** - 設定完了まであと少し！
