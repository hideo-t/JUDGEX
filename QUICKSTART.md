# クイックスタートガイド 🚀

PRE-JUDGE SuiteをGitHub Pagesで**5分で公開**する方法

## 必要なもの

- GitHubアカウント
- ローカルにこのフォルダ

## 手順

### 1. GitHubでリポジトリを作成

1. https://github.com/new にアクセス
2. Repository name: `pre-judge-suite`（または好きな名前）
3. Public を選択
4. **「Add a README file」のチェックは外す**（既にREADME.mdがあるため）
5. 「Create repository」をクリック

### 2. ローカルからプッシュ

ターミナル（コマンドプロンプト）を開き、このフォルダで以下を実行：

```bash
# Gitリポジトリを初期化
git init

# すべてのファイルを追加
git add .

# 初回コミット
git commit -m "Initial commit: PRE-JUDGE Suite"

# GitHubリポジトリと接続（YOUR_USERNAMEを自分のユーザー名に変更）
git remote add origin https://github.com/YOUR_USERNAME/pre-judge-suite.git

# プッシュ
git branch -M main
git push -u origin main
```

### 3. GitHub Pagesを有効化

1. GitHubのリポジトリページで **Settings** をクリック
2. 左サイドバーの **Pages** をクリック
3. **Source** セクションで:
   - Branch: `main` を選択
   - Folder: `/ (root)` のまま
4. **Save** をクリック

**完了！** 数分後、以下のURLで公開されます：
```
https://YOUR_USERNAME.github.io/pre-judge-suite/
```

## よくある問題

### Q: git commandが見つからない

**A:** Gitをインストールする必要があります
- Windows: https://git-scm.com/download/win
- Mac: ターミナルで `git --version` を実行（自動インストール開始）
- Linux: `sudo apt-get install git`

### Q: Permission deniedエラー

**A:** SSH keyを設定するか、HTTPSで認証します
```bash
# GitHubのPersonal Access Tokenを使う場合
git remote set-url origin https://YOUR_TOKEN@github.com/YOUR_USERNAME/pre-judge-suite.git
```

Personal Access Tokenの作成: https://github.com/settings/tokens

### Q: ページが404エラー

**A:** 以下を確認：
1. GitHub Pages設定で `main` ブランチが選択されているか
2. 数分待つ（初回デプロイは時間がかかる）
3. `index.html` がリポジトリのルートにあるか

## 次のステップ

### カスタムドメインを設定する

1. ドメインのDNS設定で以下を追加：
   ```
   Type: CNAME
   Name: www (または @)
   Value: YOUR_USERNAME.github.io
   ```

2. GitHub PagesのSettingsで:
   - **Custom domain** に `www.yourdomain.com` を入力
   - **Enforce HTTPS** にチェック

### 更新をプッシュする

ファイルを変更したら：
```bash
git add .
git commit -m "Update: 変更内容の説明"
git push
```

数分で変更が反映されます。

## サポート

問題が発生した場合：
1. README.mdの「注意事項」セクションを確認
2. GitHubリポジトリのIssuesで質問

---

**PRE-JUDGE Suite** - あなたの判断を、あなたに返す
