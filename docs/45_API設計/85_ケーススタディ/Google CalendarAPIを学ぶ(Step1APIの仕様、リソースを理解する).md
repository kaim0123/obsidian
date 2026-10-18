---
title: "Google CalendarAPIを学ぶ(Step1:APIの仕様、リソースを理解する)"
source: "https://qiita.com/koji0705/items/fa683484a1a15517d45b"
author:
  - "[[koji0705]]"
published: 2025-05-17
created: 2026-05-09
description: "はじめに カレンダーの開発を実施する上で、インターネットの標準仕様に合わせて作るのが良いですね。 カレンダーの標準仕様はRFC5545で定義されています。開発する上で必ず目を通す必要はありますが、RFC5545は抽象的な部分があり、いまいちピンとこない部分があります。RF..."
tags:
  - "clippings"
---
## 詳しい要約

**テーマ：Google Calendar API の用語・リソース構造を理解する（シリーズ Step1）**

カレンダーの標準仕様 RFC5545 は抽象的で実装に落とし込みにくいため、それを実装した Google Calendar API を題材に学ぶ 4 回シリーズの第 1 回。ユーザー・カレンダーリスト・カレンダー・イベント・設定・ACL の意味と関係を整理し、各リソースの JSON とプロパティを表で解説したうえで、イベントの拡張フィールド 6 つを詳しく説明する。次回は TBL 設計に進む。

---

### 用語と関係性

| 要素 | 説明 |
|---|---|
| **ユーザー** | カレンダーを使う主体（1 アカウントに 1 つ） |
| **カレンダーリスト** | ユーザーが左ペインに登録しているカレンダーの一覧。表示・色・通知などユーザー固有の設定を持つ |
| **カレンダー** | イベントを入れるコンテナ。タイムゾーン・説明・既定の通知設定などを持つ |
| **イベント** | 単発または繰り返しの予定。開始・終了・参加者・リマインダーなど |
| **設定** | ユーザー全体の環境設定（週の開始曜日など）。ユーザーと 1:1 |
| **ACL** | カレンダーへのアクセス権ルール（owner / writer / reader） |

- ユーザー → カレンダーリスト（1:N）、カレンダーリストの 1 エントリ → 1 カレンダー、カレンダー → イベント（1:N）
- ACL はユーザー／グループに紐づき、対象カレンダーへの権限を定める（「所有」ではなく「権限付与」の関係＝点線）

### 各リソースの主なプロパティ

- 共通して **kind**（リソース種別の固定文字列）、**etag**（バージョンタグ。変更検出・**楽観的排他制御** 用）、**id** を持つ
- **カレンダー**: summary（名前）、description、location、**timeZone**（IANA 名）、conferenceProperties（許可する会議ソリューション: Google Meet など）
- **カレンダーリスト**: summaryOverride（ユーザーが上書きした名前）、colorId・背景色・文字色、hidden・selected、**accessRole**（自分の権限）、defaultReminders、notificationSettings、primary、deleted
- **設定**: id（設定キー: timeZone・weekStart など）と value の組
- **ACL**: scope.type（`user` / `group` / `domain` / `default`）、scope.value、role
  - user・group は実在するメールアドレス、domain は `example.com` のようなドメイン全体、default は未認証を含む全員への公開（value は返らない）
- **イベント**: status（confirmed / tentative / cancelled）、htmlLink、created・updated、summary・description・location、creator・organizer、**start・end**（日時＋タイムゾーン）、sequence（更新番号）、attendees（応答状態など）、reminders（既定利用フラグ＋個別設定）

### イベントの拡張フィールド 6 つ

1. **recurrence**: iCalendar 形式の繰り返しルール配列。`RRULE:` で頻度や曜日、`EXDATE:` で除外日、`RDATE:` で追加日。個々の回は `events.instances` で取得
2. **recurringEventId**: 繰り返しシリーズのマスターイベントの id。これがあると時間変更やキャンセルされた **例外インスタンス** であることを示す
3. **originalStartTime**: 例外インスタンスの元の開始時刻。変更前の日時の表示や履歴に使う
4. **iCalUID**: iCalendar 標準の UID。Outlook や Apple カレンダーとの同期で一貫性を保つ
5. **transparency**: Free/Busy 上の扱い（`opaque`＝予定あり、`transparent`＝空き扱い）。会議候補の時間探しに使う
6. **visibility**: 公開レベル（default / public / private / confidential）

### まとめ

- 「ユーザー → カレンダーリスト → カレンダー → イベント」と、設定・ACL の関係をまず押さえる
- etag による楽観的排他制御、ACL の scope と role が設計上のポイント
- 繰り返し予定は recurrence・recurringEventId・originalStartTime の組み合わせで例外まで表現する

## はじめに

カレンダーの開発を実施する上で、インターネットの標準仕様に合わせて作るのが良いですね。  
カレンダーの標準仕様はRFC5545で定義されています。開発する上で必ず目を通す必要はありますが、RFC5545は抽象的な部分があり、いまいちピンとこない部分があります。RFC5545→実装はなかなか難しいので、今回はRFC5545を実装に落とし込んだGoogleCalendarを元に学んでいきます！

[![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/599049/da130535-2c95-41bb-973d-4b77bfb7cf90.png)](https://qiita-user-contents.imgix.net/https%3A%2F%2Fqiita-image-store.s3.ap-northeast-1.amazonaws.com%2F0%2F599049%2Fda130535-2c95-41bb-973d-4b77bfb7cf90.png?ixlib=rb-4.0.0&auto=format&gif-q=60&q=75&s=f38b337463f3645347e2bb172bfd53bb)

<iframe src="https://qiita.com/embed-contents/link-card#qiita-embed-content__0edd4b2e689bb4acf90c8b30ba0c8fbc" frameborder="0" height="80"></iframe>

## Google Calendarシリーズ

[Google CalendarAPIを学ぶ(Step1:APIの仕様、リソースを理解する)](https://qiita.com/koji0705/items/fa683484a1a15517d45b)  
[GoogleCalendar APIを学ぶ(Step2:TBL作成、データ挿入)](https://qiita.com/koji0705/items/f5e59490a093a536c020)  
[GoogleCalendar APIを学ぶ(Step3:カレンダーの取得APIを実装する)](https://qiita.com/koji0705/items/c9301529bbe6fc28bad5)  
[GoogleCalendar APIを学ぶ(Step4:カレンダーに紐づくイベントの一覧取得APIを実装する)](https://qiita.com/koji0705/items/7ed44caecb15e367ee11)

## Google Calendar API

Google Calendar APIの概要をつかみましょう。<iframe src="https://qiita.com/embed-contents/link-card#qiita-embed-content__9dca84ebd45ec3f397999e5dbf8d1a5a" frameborder="0" height="112"></iframe>

→こんだけ書かれていてもよくわからないですね😅 1つづつ理解していきましょう。  
まずは用語の意味と関係性を示していきます

### 用語の理解

| 要素 | 説明 |
| --- | --- |
| **ユーザー** | Google カレンダーを利用する主体。１アカウントにつき１つ。 |
| **カレンダーリスト** | ユーザーが左側ペインに登録しているカレンダーの一覧。表示・非表示や色・通知設定などユーザー固有のメタデータを管理。 |
| **カレンダー** | イベント（予定）を格納するコンテナ。タイムゾーン、説明文、デフォルトの通知設定などを保持。 |
| **イベント** | 単発予定または繰り返し予定の個別インスタンス。開始・終了時刻、参加者、リマインダーなどを含む。 |
| **設定** | ユーザー全体の環境設定（週の開始曜日、既定リマインダー方法など）。１ユーザーにつき１件。 |
| **ACL** | カレンダーへのアクセス権を表すルール（owner／writer／reader）。ユーザーやグループ単位で付与。 |

### 関係性

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__c7283b3d206b50dc9cea5e66cdc9d5b2" frameborder="0" height="322"></iframe>

| 関係 | 意味 |
| --- | --- |
| `ユーザー → カレンダーリスト` | 1 ユーザーが複数のカレンダーリストエントリを持つ |
| `カレンダーリスト → カレンダー` | 1 エントリは 1 つのカレンダーを参照 |
| `カレンダー → イベント` | 1 カレンダーに複数のイベントが属する |
| `ユーザー → 設定` | ユーザーごとに 1 件の設定情報が紐づく（1:1） |
| `ユーザー -.-> ACL` | ユーザーやグループに ACL ルールが複数紐づく（点線） |
| `ACL -.-> カレンダー` | 各 ACL ルールが対象カレンダーへのアクセス権を定義（点線） |

- 実線 (`-->`) は **所有** や **1:N** の構造的な関係を示します。
- 点線 (`-.->`) は **アクセス権付与** のような「強制ではないが関連する」関係を示します。

ふわっとした理解ができましたね。次はリソースごとに理解していこうと思います。

## リソースの理解

<iframe src="https://qiita.com/embed-contents/link-card#qiita-embed-content__4408f2a012a6dc81a0674c5ad0872f43" frameborder="0" height="112"></iframe>

### カレンダーのリソース```json
{
  "kind": "calendar#calendar",               // リソース種別: カレンダーリソースを表す固定文字列
  "etag": "\"XpAbC1234yz\"",                // バージョン管理用タグ（例: 変更ごとに自動生成される ETag）
  "id": "primary",                          // カレンダーID（"primary" はメインカレンダー、セカンダリなら "xxx@group.calendar.google.com"）
  "summary": "Team Project Calendar",       // カレンダー名（例: チーム用プロジェクトカレンダー）
  "description": "カンファレンスや締め切りを共有するためのチーム用カレンダーです。",  
                                            // 説明文（例: 用途や対象を記載）
  "location": "Tokyo Headquarters",         // 所在地（フリーフォーム、例: 本社所在地）
  "timeZone": "Asia/Tokyo",                 // IANA タイムゾーン名（例: Asia/Tokyo）
  "conferenceProperties": {
    "allowedConferenceSolutionTypes": [
      "hangoutsMeet",   // Google Meet を有効化
      "eventHangout"    // イベントハングアウト（旧 Hangouts）を有効化
    ]
  }
}
```

| プロパティ | 型／値例 | 説明 |
| --- | --- | --- |
| **kind** | `string`   `"calendar#calendar"` | リソース種別を示す固定文字列 |
| **etag** | `string`   `"\"XpAbC1234yz\""` | 現バージョンを示すエンティティタグ（変更検出・楽観的排他制御用） |
| **id** | `string`   `"primary"` | カレンダーの一意識別子（主に API 呼び出し時のキー） |
| **summary** | `string`   `"Team Project Calendar"` | カレンダー名（タイトル） |
| **description** | `string`   `"カンファレンスや締め切りを共有するチーム用カレンダー"` | カレンダーの詳細説明 |
| **location** | `string`   `"Tokyo Headquarters"` | カレンダーの所在地情報（フリーフォーム） |
| **timeZone** | `string`   `"Asia/Tokyo"` | カレンダーのデフォルトタイムゾーン（IANA 名） |
| **conferenceProperties** | `object` | 会議リンク機能に関する設定オブジェクト |
| └─ **allowedConferenceSolutionTypes** | `string[]`   `["hangoutsMeet","eventHangout"]` | 使用を許可する会議ソリューションの種類リスト |

<iframe src="https://qiita.com/embed-contents/link-card#qiita-embed-content__1c9da26a8615147791e1860f19580297" frameborder="0" height="112"></iframe>

### カレンダーリストのリソース```json
{
  "kind": "calendar#calendarListEntry",                // リソース種別：カレンダーリストエントリ
  "etag": "\"LmNoP5678qrs\"",                         // バージョン管理用タグ
  "id": "team-shifts@example.com",                     // カレンダーID（グループカレンダーなど）
  "summary": "Team Shifts",                            // カレンダーリスト上の表示名
  "description": "部署の勤務シフトを管理するカレンダー",   // カレンダーの詳細説明
  "location": "Tokyo Office",                          // 場所
  "timeZone": "Asia/Tokyo",                            // タイムゾーン
  "summaryOverride": "My Shifts",                      // ユーザーが上書きしたカレンダー名
  "colorId": "7",                                      // 色ID（colorsリソース参照）
  "backgroundColor": "#9ae2f1",                        // 背景色
  "foregroundColor": "#000000",                        // 文字色
  "hidden": false,                                     // 非表示フラグ
  "selected": true,                                    // 左ペインで選択中かどうか
  "accessRole": "writer",                              // 自分に付与された権限（owner/writer/reader/...）
  "defaultReminders": [
    {
      "method": "popup",                               // リマインダー方法
      "minutes": 30                                    // イベント開始30分前
    }
  ],
  "notificationSettings": {
    "notifications": [
      {
        "type": "eventCreation",                       // イベント作成通知
        "method": "email"                              // 通知方法
      },
      {
        "type": "eventChange",                         // イベント変更通知
        "method": "popup"                              // 通知方法
      }
    ]
  },
  "primary": false,                                    // プライマリカレンダーかどうか
  "deleted": false,                                    // リストエントリが削除済みかどうか
  "conferenceProperties": {
    "allowedConferenceSolutionTypes": [
      "hangoutsMeet",                                  // Google Meet
      "eventHangout"                                   // イベントハングアウト
    ]
  }
}
```

<iframe src="https://qiita.com/embed-contents/link-card#qiita-embed-content__85d7fc70e497f2001a53f23f97907578" frameborder="0" height="112"></iframe>

### 設定```json
{
  "kind": "calendar#setting",               // リソース種別: 設定リソースを表す固定文字列  [oai_citation:0‡Google for Developers](https://developers.google.com/workspace/calendar/api/v3/reference/settings)
  "etag": "\"ZmNoEnEtAg0123\"",             // バージョン管理用タグ（例: 設定変更ごとに変わる ETag）  [oai_citation:1‡Google for Developers](https://developers.google.com/workspace/calendar/api/v3/reference/settings)
  "id": "timeZone",                         // 設定キー: ユーザーのタイムゾーンを示す設定 ID
  "value": "Asia/Tokyo"                     // 設定値: IANA タイムゾーン名  [oai_citation:2‡Google for Developers](https://developers.google.com/workspace/calendar/api/v3/reference/settings?utm_source=chatgpt.com)
}
```

| プロパティ | 型／値例 | 説明 |
| --- | --- | --- |
| **kind** | `string`   `"calendar#setting"` | リソース種別を示す固定文字列 |
| **etag** | `string`   `"\"ZmNoEnEtAg0123\""` | リソースのバージョンを表す ETag。変更検出や楽観的排他制御に利用 |
| **id** | `string`   `"timeZone"` | 設定項目を識別するキー（例： `autoAddHangouts` 、 `weekStart` 、 `timeZone` ） |
| **value** | `string`   `"Asia/Tokyo"` | 設定値。設定 ID によって文字列／数値／JSON 形式などが異なる |

### ACL```json
{
  "kind": "calendar#aclRule",             // リソース種別: ACLルール
  "etag": "\"AbCdEf123456\"",             // バージョン管理用ETag（変更ごとに変わるタグ）
  "id": "rule_123abc",                    // このACLエントリの一意ID
  "scope": {
    "type": "user",                       // 対象タイプ: user (特定ユーザー)
    "value": "alice@example.com"          // 対象ユーザーのメールアドレス
  },
  "role": "writer"                        // 付与する権限: writer (読み書き可)
}
```

| プロパティ | 型／値例 | 説明 |
| --- | --- | --- |
| **kind** | `string`   `"calendar#aclRule"` | リソース種別を示す固定文字列 |
| **etag** | `string`   `"\"AbCdEf123456\""` | リソースのバージョンを示す ETag |
| **id** | `string`   `"rule_123abc"` | この ACL ルールの一意識別子 |
| **scope.type** | `string`   `"user"` | ルール適用対象のタイプ（ `user` / `group` / `domain` / `default` ） |
| **scope.value** | `string`   `"alice@example.com"` | `user` / `group` / `domain` の場合の識別子 |
| **role** | `string`   `"writer"` | 付与する権限レベル（ `owner` / `writer` / `reader` /…） |

#### ACL Rule の scope.value 詳細

`scope.value` は `scope.type` に応じて以下のような形式・意味を持ちます。

| scope.type | value の形式 | 意味 | 例 |
| --- | --- | --- | --- |
| **user** | メールアドレス文字列 | 特定ユーザーを対象 | `alice@example.com` |
| **group** | Google グループのメール | 特定グループ（Google グループ）を対象 | `dev-team@example.com` |
| **domain** | ドメイン名（ホスト部のみ） | ドメイン内のすべてのユーザーを対象 | `example.com` |
| **default** | ―（省略または空文字） | 未認証ユーザーを含む全員に公開（公開権） | ※フィールド自体が返却されない |

- **user** / **group**
	- 値は実際に存在するユーザー／グループのメールアドレスである必要があります。
		- グループは G Suite／Google Workspace のグループを指します。
- **domain**
	- 自社ドメイン全体にアクセスを許可したいときに使います。
		- たとえば `example.com` とすると `@example.com` ユーザー全員が対象です。
- **default**
	- 認証不要でカレンダーを公開したい（全世界に公開）場合に利用。
		- `value` フィールドは返却されず、 `scope` オブジェクトは `{ "type": "default" }` だけになります。

### イベント```json
{
  "kind": "calendar#event",                     // リソース種別
  "etag": "\"abcd12345\"",                      // バージョン管理用 ETag
  "id": "evt_12345",                            // イベント ID
  "status": "confirmed",                        // 確定／仮予約／キャンセル
  "htmlLink": "https://www.google.com/calendar/event?eid=evt_12345",  
  "created": "2025-05-17T10:00:00Z",             // 作成日時
  "updated": "2025-05-17T12:00:00Z",             // 更新日時
  "summary": "Project Kickoff",                 // タイトル
  "description": "初回キックオフミーティング",  // 詳細
  "location": "オンライン",                     // 場所
  "colorId": "6",                               // 色 ID
  "creator": {                                  // 作成者情報
    "id": "user_123",
    "email": "alice@example.com",
    "displayName": "Alice",
    "self": false
  },
  "organizer": {                                // 主催者情報
    "email": "alice@example.com",
    "displayName": "Alice",
    "self": true
  },
  "start": {                                    // 開始時刻
    "dateTime": "2025-05-20T09:00:00Z",
    "timeZone": "UTC"
  },
  "end": {                                      // 終了時刻
    "dateTime": "2025-05-20T10:00:00Z",
    "timeZone": "UTC"
  },
  "recurrence": [                               // 繰り返しルール
    "RRULE:FREQ=WEEKLY;BYDAY=MO"
  ],
  "recurringEventId": "evt_master_678",         // シリーズイベントのマスター ID
  "originalStartTime": {                        // 例外インスタンスの元開始時刻
    "dateTime": "2025-05-20T09:00:00Z"
  },
  "transparency": "opaque",                     // ブロック状態
  "visibility": "default",                      // 公開範囲
  "iCalUID": "abcd12345@google.com",            // iCal UID
  "sequence": 2,                                // 更新シーケンス番号
  "attendees": [                                // 出席者一覧
    {
      "email": "bob@example.com",
      "displayName": "Bob",
      "responseStatus": "accepted",
      "optional": false
    }
  ],
  "reminders": {                                // リマインダー設定
    "useDefault": false,
    "overrides": [
      {
        "method": "popup",
        "minutes": 10
      }
    ]
  }
}
```

| プロパティ | 型／値例 | 説明 |
| --- | --- | --- |
| **kind** | `string`   `"calendar#event"` | リソース種別を示す固定文字列 |
| **etag** | `string`   `"\"abcd12345\""` | リソースのバージョンを示す ETag（変更検出・楽観的排他制御用） |
| **id** | `string`   `"evt_12345"` | イベントの一意識別子 |
| **status** | `string`   `"confirmed"` | イベントの状態（ `confirmed` / `tentative` / `cancelled` ） |
| **htmlLink** | `string`   `"https://www.google.com/calendar/event?eid=evt_12345"` | ブラウザで開くイベント詳細ページの URL |
| **created** | `string`   `"2025-05-17T10:00:00Z"` | イベント作成日時 |
| **updated** | `string`   `"2025-05-17T12:00:00Z"` | 最終更新日時 |
| **summary** | `string`   `"Project Kickoff"` | イベントタイトル |
| **description** | `string`   `"初回キックオフミーティング"` | イベント詳細 |
| **location** | `string`   `"オンライン"` | イベント開催場所 |
| **colorId** | `string`   `"6"` | イベント色の識別子（colors リソース参照） |
| **creator** | `object`   `{email, displayName, self}` | 作成者情報（メール・表示名・自己フラグなど） |
| **organizer** | `object`   `{email, displayName, self}` | 主催者情報（メール・表示名・自己フラグなど） |
| **start** | `object`   `{dateTime:"2025-05-20T09:00:00Z", timeZone:"UTC"}` | 開始時刻情報（日時＋タイムゾーン） |
| **end** | `object`   `{dateTime:"2025-05-20T10:00:00Z", timeZone:"UTC"}` | 終了時刻情報（日時＋タイムゾーン） |
| **recurrence** | `string[]`   `["RRULE:FREQ=WEEKLY;BYDAY=MO"]` | 繰り返しルールの配列 |
| **recurringEventId** | `string`   `"evt_master_678"` | 繰り返しマスターイベントの ID |
| **originalStartTime** | `object`   `{dateTime:"2025-05-20T09:00:00Z"}` | 例外インスタンスの元の開始時刻 |
| **transparency** | `string`   `"opaque"` | ブロック状態（ `opaque` =予定ブロック、 `transparent` =空き扱い） |
| **visibility** | `string`   `"default"` | 公開範囲（ `default` / `public` / `private` / `confidential` ） |
| **iCalUID** | `string`   `"abcd12345@google.com"` | iCalendar 標準の UID |
| **sequence** | `integer`   `2` | 更新ごとのシーケンス番号 |
| **attendees** | `object[]`   `[{email,displayName,responseStatus,optional}]` | 出席者リスト（メール・表示名・応答状態・オプション参加など） |
| **reminders** | `object`   `{useDefault:false,overrides:[{method:"popup",minutes:10}]}` | リマインダー設定（既定利用フラグ＋個別オーバーライド設定） |

## イベントリソースの拡張フィールド解説

以下では、 `recurrence` 、 `recurringEventId` 、 `originalStartTime` 、 `iCalUID` 、 `transparency` 、 `visibility` の6つのフィールドについて詳しく説明します。

---

### 1\. recurrence

- **型**: `string[]`
- **例**:`["RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR"]`
- **説明**:  
	iCalendar 標準の繰り返しルールを表す文字列の配列。
	- `RRULE:`（必須）で繰り返しの頻度や曜日を指定
		- `EXDATE:` で除外日、 `RDATE:` で追加日を指定可能
- **用途**:  
	毎週○曜日や毎月○日などの繰り返し予定を定義し、 `events.instances` メソッドで個々のインスタンスを取得する

---

### 2\. recurringEventId

- **型**: `string`
- **例**:`"evt_master_678"`
- **説明**:  
	繰り返しシリーズのマスターイベント（元のイベント）の `id` 。  
	このフィールドが存在する場合、そのイベントは例外インスタンス（時間変更やキャンセルされた回）であることを示します。
- **用途**:  
	例外インスタンスをマスターイベントと紐づけて管理するために使用します。

---

### 3\. originalStartTime

- **型**: `object`

```json
{
  "dateTime": "2025-05-20T09:00:00Z",
  "timeZone": "UTC"
}
```

- **説明**:  
	例外インスタンスの「元々の開始時刻」を保持するオブジェクトです。
- **用途**:  
	変更前の予定日時を把握したいときに使用されます。UI での表示や履歴の記録にも有用です。

---

### 4\. iCalUID

- **型**: `string`

```js
"abcd12345@google.com"
```

- **説明**:  
	iCalendar 標準仕様に基づく UID。Google Calendar がイベントを外部カレンダーと同期する際に使用されます。
- **用途**:  
	Outlook や Apple カレンダーなどとのイベント同期の際に一貫性を保つために活用されます。

---

### 5\. transparency

- **型**: `string`

```js
"opaque"       // 予定あり（ブロック）
"transparent"  // 空き時間扱い
```

- **説明**:  
	Free/Busy 情報におけるブロック状態の制御設定です。
- **用途**:  
	会議のスケジュール候補を表示する際に、他の予定と重ならない時間帯を探すロジックに使用されます。

---

### 6\. visibility

- **型**: `string`

```js
"default"      // カレンダー既定に従う
"public"       // 誰でも詳細を閲覧可
"private"      // 詳細を隠して「予定あり」のみ表示
"confidential" // より制限された公開レベル
```

- **説明**:  
	イベントの公開レベルを制御するための設定です。
- **用途**:  
	他ユーザーにどこまで情報を見せるか（または見せないか）を制御し、機密性を保ちつつ共有できます。

## 最後に

ここまででGoogle Calendarの仕様がわかってきました。次のStepでは、実際にTBLの設計をしていこうと思います

[0](#comments)

コメント一覧へ移動

X（Twitter）でシェアする

Facebookでシェアする

はてなブックマークに追加する

新規登録して、もっと便利にQiitaを使ってみよう

1. あなたにマッチした記事をお届けします
2. 便利な情報をあとで効率的に読み返せます
3. ダークテーマを利用できます
[ログインすると使える機能について](https://help.qiita.com/ja/articles/qiita-login-user)