# PRE-JUDGE Suite

判断以前を整えて、判断をあなたに返す。

## 概要

PRE-JUDGE Suiteは、ユーザーの迷い・選択・引き受け（責任）を**判断以前の構造**に整形し、**地図（MAP）**と**指数（JUDGEX²）**を返却するツールです。

### 基本原則

- **当てない／決めない／助言しない** をアプリの仕様で担保
- **MAPが先、JUDGEX²は後**（数値が先に出ると支配になる）
- **Layer3だけJUDGEX²**（判断可能状態の確認）

## 機能

### 1. MAP生成（地図）
3つの質問に答えることで、現在地（Layer 1/2/3）を可視化：
- **Layer 1（未整理）**：情報や選択肢が整理されていない状態
- **Layer 2（判断以前）**：選択肢は見えているが、引き受けるものが明確でない状態
- **Layer 3（判断可能）**：決定対象と引き受けるものが明確な状態

各Layerで以下を提示：
- 詰まり点（最大3）
- 判断可能条件（問い）（最大3）

### 2. JUDGEX²（指数）
Layer 3に到達したときのみ計測可能：
- 3つの固定質問に回答
- スコア（0-100）と傾向ラベル（回避/保留/引き受け）を提示
- レーダーチャートで3軸を可視化

### 3. Googleログインと診断履歴 ✨ NEW (v2.3)
**2つの利用モードを選択可能：**

#### ゲストモード（従来通り）
- ログイン不要
- 履歴保存なし
- すぐに始められる

#### ログインモード（新機能）
- Googleアカウントでログイン
- 診断履歴を自動保存
- 過去の診断を振り返り可能
- 成長の可視化（スコア推移グラフ）

**保存される情報：**
- 診断日時
- バージョン番号
- Layer（到達レベル）
- JUDGEX²スコア
- 入力した質問内容

## 技術スタック

- **HTML5** - セマンティックマークアップ
- **CSS3** - カスタムプロパティ、アニメーション、レスポンシブデザイン
- **Vanilla JavaScript** - 依存関係なし、軽量
- **Canvas API** - JUDGEX²レーダーチャート描画

## GitHub Pagesでのデプロイ

### 1. リポジトリの作成

```bash
# ローカルでGitリポジトリを初期化
git init

# ファイルを追加
git add index.html styles.css app.js firebase-config.js README.md

# 初回コミット
git commit -m "Initial commit: PRE-JUDGE Suite v2.3"

# GitHubリポジトリをリモートとして追加（YOUR_USERNAMEとREPO_NAMEを置き換え）
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# mainブランチにプッシュ
git branch -M main
git push -u origin main
```

### 2. GitHub Pagesを有効化

1. GitHubリポジトリのページを開く
2. **Settings** タブをクリック
3. 左サイドバーの **Pages** をクリック
4. **Source** で `main` ブランチを選択
5. **Save** をクリック

数分後、以下のURLでアクセス可能になります：
```
https://YOUR_USERNAME.github.io/REPO_NAME/
```

### 3. Firebase設定（ログイン機能を使う場合）

ログイン機能と履歴保存を有効にするには、Firebase設定が必要です：

1. **FIREBASE_SETUP.md** を参照
2. Firebaseプロジェクトを作成（5分）
3. `firebase-config.js` に設定情報を記入
4. GitHubにプッシュ

詳しくは → [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

**注意:** Firebase設定なしでも、ゲストモードで全機能が利用可能です。

#### トラブルシューティング

ログインが失敗する場合は、**Firebase診断ツール**を使用：

```bash
# ブラウザで firebase-diagnostics.html を開く
```

診断ツールが自動的に以下をチェック：
- ✅ Firebase SDK読み込み
- ✅ firebase-config.js設定
- ✅ Firebase初期化
- ✅ 認証設定
- ✅ Firestore Database
- 💡 承認済みドメイン確認

詳しくは → [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

### 3. カスタムドメイン（オプション）

独自ドメインを使用する場合：
1. DNS設定でCNAMEレコードを追加：`YOUR_USERNAME.github.io` を指定
2. GitHub PagesのSettingsで **Custom domain** に独自ドメインを入力
3. **Enforce HTTPS** にチェック

## ファイル構成

```
pre-judge-suite/
│
├── index.html          # メインHTML
├── styles.css          # スタイルシート
├── app.js             # アプリケーションロジック
└── README.md          # このファイル
```

## 使い方

### 基本的な流れ

1. **同意** - 「助言は求めず、地図と問いの提示のみを受け取ります」にチェック
2. **3つの質問に回答**
   - Q1: 迷いは何？
   - Q2: 選ばなければならないことは何？
   - Q3: 決めたら引き受けるものは何？
3. **MAP生成** - 現在地（Layer）と詰まり点、問いを確認
4. **Layer別の対応**
   - Layer 1: 深掘り質問に回答して再生成
   - Layer 2: 引き受けの言語化をして再生成
   - Layer 3: JUDGEX²を計測
5. **結果確認** - スコアとレーダーチャートで傾向を確認

### セルフ利用 vs オペレーター運用

- **セルフ利用**：個人で使用
- **オペレーター運用**：再設計師などが他者の発話を入力

## カスタマイズ

### 色の変更

`styles.css` の `:root` セクションで色を変更できます：

```css
:root {
    --primary: #2c5f7c;           /* メインカラー */
    --layer1-color: #e74c3c;      /* Layer 1（赤） */
    --layer2-color: #f39c12;      /* Layer 2（橙） */
    --layer3-color: #27ae60;      /* Layer 3（緑） */
}
```

### Layer判定ロジックの調整

`app.js` の `determineLayer()` 関数でロジックを調整できます。

### 質問や詰まり点のカスタマイズ

`generateQuestions()` と `generateStuckPoints()` 関数で内容を変更できます。

## ライセンス

このプロジェクトは自由に使用、改変、配布できます。

## 注意事項

- このツールは専門的な助言の代わりではありません
- 重要な決断をする際は、必要に応じて専門家に相談してください
- ローカルストレージ機能は現在未実装（将来の拡張予定）

## バージョン

**v2.4** - ログインエラーハンドリング強化 (2026年2月9日)
**v2.3** - Googleログインと診断履歴機能追加 (2026年2月9日)
**v2.2** - フォローアップループ問題修正 (2026年2月9日)
**v2.1** - デバッグ機能追加 (2026年2月9日)
**v2.0** - UX大幅改善 (2026年2月9日)
**v1.0** - 初回リリース (2026年2月8日)

## フィードバック

改善提案やバグ報告は、GitHubのIssuesでお願いします。

---

**PRE-JUDGE Suite** - 助言なし、判断は自分で
