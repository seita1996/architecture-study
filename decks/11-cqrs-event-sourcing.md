---
theme: default
title: "第11回: CQRSとEvent Sourcing"
---

# 第11回: CQRS と Event Sourcing

読み書きや状態保存を分ける価値が、コストを上回るか判断する

<!--
話すこと:
- この回は第12回のADR演習とは分ける。
- CQRSとEvent Sourcingは強力だが、採用コストが高い。誤解を解くことを主目的にする。
-->
---

<DiscussionQuestion>
読み取りと書き込みを分ける価値は、どの要求から生まれるのか？
</DiscussionQuestion>

<!--
話すこと:
- 「高度な設計」ではなく、読み取り要求と書き込み要求が本当に違うかを見る。
-->
---

## この回で目指す状態

今日のゴール:

- CQS と CQRS を区別できる
- CQRS は別 DB 必須ではないと説明できる
- Event Sourcing は監査ログそのものではないと説明できる
- Projection、Snapshot、Optimistic concurrency のコストを知る

| 区分 | 扱う内容 |
|---|---|
| Core | CQS / CQRS |
| Core | CQRS は別DB必須ではない |
| Core | Event Sourcing は監査ログではない |
| Core | 採用条件と採用コスト |
| Supplementary | Projection、Snapshot、Replay、optimistic concurrency |
| Advanced | Schema進化、再構築運用、外部副作用 |

<!--
話すこと:
- 60分を推奨する。Core は判断に使える深さまで、Supplementary は目的と主なコストまで、Advanced は別途学習が必要な領域として扱う。
-->
---

## CQS と CQRS

| 用語 | 意味 |
|---|---|
| CQS | 状態を変更しない Query と、状態を変更する Command を分離する原則 |
| CQRS | 書き込みモデルと読み取りモデルを分離する設計 |

CQS の古典的な考え方:

- Query: 値を返し、観測可能な状態を変更しない
- Command: 状態を変更し、値を返さない

実務では、Command が生成IDや処理結果を返すなど、意図的に緩和することもある。

```txt
Write:
  IssueInvoiceInput -> Write Model -> Database

Read:
  SearchInvoiceQuery -> Read Model -> Database
```

保存先を別 DB にすることはあるが、必須ではない。

<!--
話すこと:
- CQRS の中心はモデル分離。物理DB分離は選択肢の一つ。
- CQSのCommand、CQRSのCommand、第10回のCommand Messageは似ているが文脈が違うと補足する。
-->
---

## Command という言葉の違い

| 文脈 | Command の意味 |
|---|---|
| GoF Command | 実行する操作をオブジェクトや関数として表す |
| Command Message | 相手に実行してほしい作業を message として送る |
| CQS Command | 状態を変更する操作 |
| CQRS Command | Write Model へ送る書き込み要求 |

同じ単語でも、どの文脈の話かを確認する。

<!--
話すこと:
- 第10回のCommand Messageと、この回のCQS/CQRS Commandを混同しないようにする。
- 設計議論では「どの意味のCommandか」を確認するだけで誤解が減る。
-->
---

## CQRS が効く場面

- 書き込みは厳密な業務ルールが必要
- 読み取りは検索、集計、一覧最適化が必要
- 読み書きで異なるモデル、スケーリング、更新頻度が必要
- 書き込みモデルをそのまま画面に出すと複雑

向かない場面:

- 単純な CRUD
- 読み取り要件が薄い
- index、cache、read replica、query 改善、materialized view で足りる
- モデル同期の運用コストを払えない

画面用の DTO や専用 Query を一つ作っただけで CQRS になるわけではない。
読み書きで異なるモデルと責務を意図的に分離し、その同期や運用を設計するときに CQRS として扱う。

<!--
話すこと:
- 読み取りが多いだけではCQRSの理由として弱い。まず index、cache、read replica、query 改善、materialized view を比較する。
- モデルを分けると同期、再構築、障害時の調査が増える。
- 第6回の「一覧はQueryで直接読む」と、CQRSとして読み書きモデルを分ける話を混同しない。
-->
---

## Event Sourcing

Event Sourcing は、イベント列を状態の正本とする。

```txt
InvoiceCreated
InvoiceItemAdded
InvoiceIssued
InvoicePaid
```

現在状態の Projection や Snapshot を併存させることはある。
イベント列から状態を再構築できることが重要。

<!--
話すこと:
- 「履歴を保存する」だけではない。現在状態の代わりにイベント列を正本にする。
- 監査ログが必要なだけなら、監査ログテーブルで足りることも多い。
-->
---

## Supplementary: Event Sourcing の処理の流れ

Event Sourcing では、現在状態を直接の正本にしない。

```txt
Event Stream
  -> Aggregate 再構築
  -> Version 確認
  -> New Event append
     -> Aggregate の次回再構築に使う
     -> Projection を同期または非同期に更新
```

用語:

- Aggregate: 関連する状態と不変条件を一貫して扱うまとまり
- Projection: 画面表示や検索に使いやすい読み取り用状態
- Snapshot: イベント数が増えたときの再構築高速化
- Optimistic concurrency: expected version を条件に append し、競合を検出して拒否する
- Replay: 保存済みイベントを再適用して状態やProjectionを作り直すこと

<!--
話すこと:
- Projectionは正本ではなく、イベント列から作られる読み取り用の状態として説明する。
- Snapshotも正本ではなく、再構築を速くするためのキャッシュに近い。
- Projectionは同一transactionで同期更新する場合も、非同期Consumerで更新する場合もある。
- Optimistic concurrencyは、同時更新をロックで待たせるのではなく、version不一致として検出する考え方。
-->
---

## Supplementary: Event Sourcing のコスト

最低限、次を設計する必要がある。

- イベントスキーマの進化
- 過去イベントと現在コードの互換性
- Replay 時の外部副作用
- Projection 再構築
- Snapshot
- Optimistic concurrency
- 運用時の調査方法

Event Sourcing は、モデル化した状態変化を追跡できる。
外部APIの応答やユーザーが何を見たかまで自動で完全記録するわけではない。

<!--
話すこと:
- Replay中にメール送信などの外部副作用を再実行してはいけない。
- Aggregate の状態遷移と、副作用を起動する Handler を分けておくと、Replay 時の事故を避けやすい。
- 過去イベントを今のコードで読めるようにする互換性が難しい。
-->
---

## CQRS と Event Sourcing は別

| 組み合わせ | 成立するか |
|---|---|
| CQRS だけ | 成立する |
| Event Sourcing だけ | 成立する |
| CQRS + Event Sourcing | 成立するが重い |
| どちらも使わない | 多くのCRUDで自然 |

必ずセットで導入するものではない。

<!--
話すこと:
- CQRSは読み書きモデルの分離。Event Sourcingは状態保存の戦略。
- 混ぜて覚えると、必要以上に重い設計になる。
-->
---

## 個人ワーク: 採用する理由はあるか

請求書一覧の要求:

- 画面は単純な一覧と詳細
- 発行処理は業務ルールが少し複雑
- 監査ログは必要
- 月次集計は夜間バッチでよい

考えること:

- CQRS が必要か
- Event Sourcing が必要か
- 監査ログだけでよいか

次の形式で短く書く。

```txt
CQRS Decision:
採用しない / 検討する / 追加調査

Event Sourcing Decision:
採用しない / 検討する / 追加調査

Driver / Priority:
最も重視した読み取り、履歴、再構築要求

Trade-offs:
モデル同期、Projection、Replay、運用コスト

Unknown:
許容遅延、データ量、再構築要件、チームの運用能力
```

<!--
話すこと:
- 正解を一つにしない。どの要求を重く見たかを考えてもらう。
-->
---

## 答え合わせ

この条件なら、まずは CQRS / Event Sourcing なしでよい可能性が高い。

| 要求 | 判断例 |
|---|---|
| 単純一覧 | 通常の Query で足りる |
| 発行ルール | Application Service / Domain Model で扱う |
| 監査ログ | 監査ログテーブルで足りる可能性 |
| 月次集計 | バッチやRead Modelを後で検討 |

読み取り要件が強く分かれたら CQRS を検討する。
状態変化そのものを正本にする必要が出たら Event Sourcing を検討する。

<!--
話すこと:
- 「使わない判断」も判断できることを重視する。
-->
---

## 転移問題: 在庫移動履歴

倉庫の在庫移動を扱う。

条件:

- 現在在庫だけでなく、過去時点の在庫を再現したい
- 入庫、出庫、移動、棚卸差分が業務上の重要な事実
- 後から新しい集計画面を作りたい
- ReplayやProjection再構築を運用する余力は不明

考えること:

- 現在残高と在庫移動台帳のどちらを正本にするか
- 監査ログは業務状態の再構築に十分か
- append-onlyな在庫移動台帳で足りるか
- 汎用Event Sourcing基盤が必要か
- Projection再構築とSchema進化を運用できるか
- 訂正時に過去行を書き換えるのか、訂正・取消・逆仕訳に相当する新しい記録を追加するのか

<!--
話すこと:
- ここでは表を見せず、何を正本にするか、再構築できる履歴か、運用できるかを先に考えてもらう。
- 確認したい観点: 履歴が重要でも、監査ログ、業務台帳、汎用Event Sourcingは別の選択肢。
- 典型的な誤答: 過去再現が必要なら即Event Sourcing、または監査ログがあれば必ず再構築できると考える。
- 最低限出てほしい問い: 何を正本にするか、どの粒度の履歴が必要か、Projection再構築を誰が運用するか。
- 追加情報があれば判断が変わる点: データ量、訂正処理、会計・監査要件、スキーマ変更頻度、再構築時間の許容値。
-->
---

## 転移問題の整理: 在庫移動履歴

| 案 | 見ること |
|---|---|
| 現在在庫を正本にし、監査ログを追加する | 過去再現や再集計が監査ログで足りるか |
| 不変の在庫移動台帳を正本にする | 現在在庫をProjectionとして作れるか |
| 汎用Event Sourcing基盤を導入する | Schema進化、Replay、外部副作用を運用できるか |

「在庫移動台帳を正本にする」は、ドメイン固有に実装した Event Sourcing と見なせる場合がある。
「汎用Event Sourcing基盤」は、その実装・運用を共通化する追加選択肢であり、Event Sourcingの定義そのものではない。

<!--
話すこと:
- 請求書一覧では不要だったが、状態変化そのものが正本になり得る題材では判断が変わる。
- 採用条件と運用能力をセットで見る。
- append-only台帳では、訂正時に過去行を書き換えず、訂正・取消・逆仕訳に相当する新しい記録を追加する運用規則が必要になる。
-->
---

## 対照例: 検討に値する条件

CQRS を検討する例:

- Write 側は厳密な状態遷移を守る
- Read 側は数十種類の検索、集計、一覧最適化がある
- Read 側は数秒遅れてよい
- 読み取り負荷が Write 側へ影響している

Event Sourcing を検討する例:

- 過去時点の状態を再現したい
- 状態変化そのものが業務上の正本
- 後から新しい Projection を構築したい
- イベントスキーマと Replay を運用する能力がある

<!--
話すこと:
- 採用しない例だけだと、参加者は「結局いつも不要」と覚えやすい。
- 不要な条件と検討に値する条件を対で見せ、要求の差を読めるようにする。
-->
---

## 今日の判断基準

| 問い | 見ること |
|---|---|
| CQRS が必要か | 読み書きモデルを分ける価値があるか |
| 別DBが必要か | 性能、運用、障害分離の要求があるか |
| Event Sourcing が必要か | イベント列を状態の正本にしたいか |
| 監査ログで足りるか | 追跡したい情報は何か |
| コストを払えるか | Projection、Replay、Schema進化を運用できるか |

次回は、これまでの設計軸を使って実プロダクトのADRを書く。

<!--
話すこと:
- 次回は新しいパターンを増やさない。判断を記録する回にする。
-->
