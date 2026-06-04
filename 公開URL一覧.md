# 公開URL一覧（これが唯一の正解）

最終更新：2026/06/04

---

## 大原則：公開先は「Cloudflare Pages」に統一

本番サイトは **Cloudflare Pages** の1つだけ。ここだけ覚えればOK。

```
https://ai-workshop3.pages.dev/
```

- **git push すると、約1〜2分で自動で公開されます**（手動アップロード不要）
- VercelやGitHub Pagesの古いURLは**使わない**（下記「使わないURL」参照）

---

## みんなで見るメインサイト（夜のフィードバック会で使う）

| 項目 | URL |
|---|---|
| 簡易サイト（個人別アドバイスタブ） | https://ai-workshop3.pages.dev/preparation-vol3.html |
| パスワード | `otaku2026` |

→「個人別アドバイス」タブで、各メンバーのお名前をクリックすると
　「サンプルLPを見る」ボタン＋「デザイン参考（モデリング先）」が開きます。

---

## 各メンバーのサンプルLP 直リンク

ベースURL：`https://ai-workshop3.pages.dev/` ＋ 下記パス

### Team A
| No | 名前 | サンプルLP |
|---|---|---|
| 001 | 尾野さおり | 準備中 |
| 002 | 三宅純子（すみー）| https://ai-workshop3.pages.dev/feedback/A_Team/002_Sumie_VideoEditor/sample-lp.html |
| 003 | 庄子真穂（Kakky）| https://ai-workshop3.pages.dev/feedback/A_Team/003_Kakky_ShortVideo/sample-lp.html |
| 004 | 室橋夏絵 | 準備中 |
| 005 | 原のどか | 準備中 |
| 006 | 高木友紀 | 準備中 |

### Team B
| No | 名前 | サンプルLP |
|---|---|---|
| 007 | 玉腰由佳 | https://ai-workshop3.pages.dev/feedback/B_Team/007_Yuka_WomenEntrepreneur/sample-lp.html |
| 008 | 杉山きえ | 準備中 |
| 009 | 山田佳代 | https://ai-workshop3.pages.dev/feedback/B_Team/009_Kayo_LifeCoach/sample-lp.html |
| 010 | 和田あゆみ | https://ai-workshop3.pages.dev/feedback/B_Team/010_Kuwamon_Architect/sample-lp.html |
| 011 | 萩原愛子 | 準備中 |
| 012 | 平野なな | https://ai-workshop3.pages.dev/feedback/B_Team/012_Nana_SNSOps/sample-lp.html |

---

## フォルダの決まり（新しいLPを足すとき）

各メンバーのLPは、必ずこの形で置く：

```
feedback/<チーム>/<番号>_<名前>_<肩書き>/sample-lp.html
例）feedback/A_Team/001_Saori_Porcelain/sample-lp.html
```

- ファイル名は必ず **sample-lp.html**（バラバラにしない）
- 置いたら `preparation-vol3.html` の `PARTICIPANTS` 名簿に1行追記すると、
  簡易サイトに「サンプルLPを見る」ボタンが自動で出る

---

## 公開のしかた（友人エンジニア向けメモ）

このリポジトリはCloudflare Pagesと連動しているので、**git push だけで公開される**。

```bash
git add .
git commit -m "変更内容"
git push origin main
# → 約1〜2分後に https://ai-workshop3.pages.dev/ に反映
```

夜のフィードバック（文字起こし）を各メンバーの `feedback.md` などに反映する場合も、
同じく push すれば自動公開される。

---

## 使わないURL（混乱の元・放置されている古いもの）

以下は**古くて中身が更新されない**ので、絶対に共有しない：

- ~~https://ai-workshop-otaku.vercel.app/~~（Vercel・連動切れ）
- ~~https://ai-workshop-blond-eta.vercel.app/~~（Vercel・旧）
- ~~https://gokigen-design.github.io/ai-workshop/~~（GitHub Pages・未設定で404）

※ これらの「死んだ公開先」自体は各サービスのダッシュボード側に残っています。
　 完全に消したい場合は、Vercel／GitHubの管理画面から手動削除が必要です（あやが後日対応でOK）。
