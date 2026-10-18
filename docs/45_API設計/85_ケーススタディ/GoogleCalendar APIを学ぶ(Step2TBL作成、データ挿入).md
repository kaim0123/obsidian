---
title: "GoogleCalendar APIを学ぶ(Step2:TBL作成、データ挿入)"
source: "https://qiita.com/koji0705/items/f5e59490a093a536c020"
author:
  - "[[koji0705]]"
published: 2025-05-17
created: 2026-05-09
description: "はじめに 前回までにGoogleCalendarのAPIの仕様を学びました。今回は実際にTBLの作成、データ挿入して理解を深めていきたいと思います。 Google Calendarシリーズ Google CalendarAPIを学ぶ(Step1:APIの仕様、リソースを..."
tags:
  - "clippings"
---
## 詳しい要約

**テーマ：Google Calendar を模したテーブル設計と、ユースケース別 SQL（シリーズ Step2）**

Step1 で学んだ Google Calendar API の仕様をもとに、Docker 上の PostgreSQL 16 にカレンダー用のテーブルを作り、サンプルデータを入れて、カレンダー・イベント・アクセス制御のユースケースごとに SQL を実行してみる記事。時間範囲は `tstzrange` で持ち、範囲は **[start, end)（右端排他）** で扱うべきという注意がポイント。

---

### テーブル設計（dbdiagram で作図）

| テーブル | 役割 |
|---|---|
| `users` | ユーザー（email は一意、locale の既定は Asia/Tokyo） |
| `user_settings` | 既定リマインダー・勤務時間・カラーテーマ・通知設定（jsonb） |
| `calendars` | カレンダー（owner_id・summary・color・visibility） |
| `calendar_memberships` | カレンダーの参加者と権限（owner・reader など） |
| `events` | イベント。ical_uid・status・sequence、**time_range（tstzrange）**、終日フラグ、recurrence_rule・recurrence・recurrence_exceptions（tsmultirange）・recurring_event_id（自己参照）・original_start_time、transparency・visibility、拡張情報（jsonb） |
| `event_attendees` | 出席者（応答状態・任意参加・同伴者数など） |
| `event_reminders` | 通知方法と何分前か |
| `calendar_acl` | scope_type・scope_value・role によるアクセス制御 |

- `docker-compose` で `postgres:16` を起動し、`/docker-entrypoint-initdb.d` に置いた SQL で CREATE TABLE と外部キーを作成
- Alice・Bob の 2 ユーザーでサンプルデータ（設定・カレンダー・メンバー・イベント・出席者・リマインダー・ACL）を INSERT

### カレンダー関連の SQL

1. カレンダーを作成する（INSERT）
2. ユーザーが所属するカレンダー一覧（`calendar_memberships` と JOIN）
3. 特定カレンダーの詳細（id 指定）
4. カレンダーの参加メンバー一覧（users と JOIN して表示名と role）

### イベント関連の SQL

1. イベント登録: `tstzrange('開始', '終了')` で時間範囲を入れる
   - 範囲指定は一般的に **[start, end)（右端排他）**。記事中では誤った区間で入れており、最初は気づかないが後で痛い目を見ると注意
2. 指定期間のイベント一覧: 範囲の重なり演算子 `&&` で絞り込む
3. 繰り返しイベント: `RRULE:FREQ=WEEKLY;BYDAY=MO` を recurrence_rule に入れる（RRULE は難しいので別途記事にしたいとのこと）
4. リマインダー設定: `event_reminders` に方法と分数を INSERT

### アクセス制御関連の SQL

- 他ユーザーへの権限付与: `calendar_acl` に scope_type=user・scope_value=メール・role=writer を INSERT
- ACL 取得: calendar_id で絞って一覧表示

### まとめ

- API のリソース構造（ユーザー・カレンダー・イベント・ACL）をほぼそのままテーブルに落とし込んでいる
- 時間は `tstzrange`、重なり判定は `&&`、範囲は右端排他で統一するのが大事
- 繰り返しは RRULE ＋自己参照（recurring_event_id）で表現する

## はじめに

[前回](https://qiita.com/koji0705/items/fa683484a1a15517d45b) までにGoogleCalendarのAPIの仕様を学びました。今回は実際にTBLの作成、データ挿入して理解を深めていきたいと思います。

## Google Calendarシリーズ

[Google CalendarAPIを学ぶ(Step1:APIの仕様、リソースを理解する)](https://qiita.com/koji0705/items/fa683484a1a15517d45b)  
[GoogleCalendar APIを学ぶ(Step2:TBL作成、データ挿入)](https://qiita.com/koji0705/items/f5e59490a093a536c020)  
[GoogleCalendar APIを学ぶ(Step3:カレンダーの取得APIを実装する)](https://qiita.com/koji0705/items/c9301529bbe6fc28bad5)  
[GoogleCalendar APIを学ぶ(Step4:カレンダーに紐づくイベントの一覧取得APIを実装する)](https://qiita.com/koji0705/items/7ed44caecb15e367ee11)

## TBL設計

[![カレンダー機能.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/599049/98fb8ef7-eec0-419d-86ab-544709158723.png)](https://qiita-user-contents.imgix.net/https%3A%2F%2Fqiita-image-store.s3.ap-northeast-1.amazonaws.com%2F0%2F599049%2F98fb8ef7-eec0-419d-86ab-544709158723.png?ixlib=rb-4.0.0&auto=format&gif-q=60&q=75&s=09316d494c6b606271583cc01e8f9a6c)

dbdiagram dbdiagramのコードです。興味のある方は自分で編集して遊んでみてください

```sql
Table users {
  id            bigint [pk, increment]
  email         varchar [unique, not null]
  display_name  varchar
  locale        varchar [default: 'Asia/Tokyo']
  created_at    timestamptz
}

Table user_settings {
  id            bigint [pk, increment]
  user_id               bigint [pk, ref: > users.id]
  default_reminders     jsonb
  working_hours         jsonb
  color_theme           varchar
  notification_settings jsonb
  updated_at            timestamptz
}

Table calendars {
  id            bigint [pk, increment]
  owner_id     bigint [not null, ref: > users.id]
  summary      varchar
  description  text
  color        varchar
  visibility   varchar
  created_at   timestamptz
  updated_at   timestamptz
}

Table calendar_memberships {
  id            bigint [pk, increment]
  calendar_id uuid [ref: > calendars.id]
  user_id     bigint [ref: > users.id]
  role        varchar
  Primary Key (calendar_id, user_id)
}

Table events {
  id            bigint [pk, increment]
  calendar_id           uuid [not null, ref: > calendars.id]
  ical_uid              varchar [unique]
  status                varchar
  sequence              int
  title                 varchar
  description           text
  location              text
  color                 varchar
  organizer_id          bigint [ref: > users.id]

  all_day               boolean
  end_time_unspecified  boolean
  time_range            tstzrange

  recurrence_rule       text
  recurrence            text[]
  recurrence_exceptions tsmultirange
  recurring_event_id    uuid [ref: > events.id]
  original_start_time   timestamptz

  transparency          varchar
  visibility            varchar

  extended_private      jsonb
  extended_shared       jsonb

  created_at            timestamptz
  updated_at            timestamptz
}

Table event_attendees {
  id            bigint [pk, increment]
  event_id         uuid [ref: > events.id]
  email            varchar
  user_id          bigint [ref: > users.id]
  display_name     varchar
  organizer        boolean
  optional         boolean
  response_status  varchar
  comment          text
  additional_guests int
  Primary Key (event_id, email)
}

Table event_reminders {
  id            bigint [pk, increment]
  event_id       uuid [ref: > events.id]
  method         varchar
  minutes_before int
  Primary Key (event_id, method, minutes_before)
}

Table calendar_acl {
  id           varchar [pk]
  calendar_id  uuid [ref: > calendars.id]
  scope_type   varchar
  scope_value  varchar
  role         varchar
}
```

## TBLの作成

今回はdocker上にPostgreSQL16を立て、TBLを作成します。

```yml
version: "3.9"

services:
  db:
    image: postgres:16
    container_name: calendar_db
    restart: always
    environment:
      POSTGRES_DB: calendar
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5436:5432"
    volumes:
      - ./pgdata:/var/lib/postgresql/data
      - ./init:/docker-entrypoint-initdb.d
```

```sql
-- ユーザー情報
CREATE TABLE "users" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, -- ユーザーID
  "email" varchar UNIQUE NOT NULL,                          -- メールアドレス
  "display_name" varchar,                                   -- 表示名
  "locale" varchar DEFAULT 'Asia/Tokyo',                    -- ロケール（デフォルト：Asia/Tokyo）
  "created_at" timestamptz                                  -- 登録日時
);

-- ユーザーの個別設定
CREATE TABLE "user_settings" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, -- 設定ID
  "user_id" bigint,                                         -- ユーザーID
  "default_reminders" jsonb,                                -- デフォルトリマインダー
  "working_hours" jsonb,                                    -- 勤務時間
  "color_theme" varchar,                                    -- カラーテーマ
  "notification_settings" jsonb,                            -- 通知設定
  "updated_at" timestamptz                                  -- 更新日時
);

-- カレンダー
CREATE TABLE "calendars" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, -- カレンダーID
  "owner_id" bigint NOT NULL,                               -- 所有者ユーザーID
  "summary" varchar,                                        -- カレンダー名
  "description" text,                                       -- 説明
  "color" varchar,                                          -- カラー
  "visibility" varchar,                                     -- 公開設定
  "created_at" timestamptz,                                 -- 作成日時
  "updated_at" timestamptz                                  -- 更新日時
);

-- カレンダーの参加者情報
CREATE TABLE "calendar_memberships" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, -- レコードID
  "calendar_id" bigint,                                     -- カレンダーID
  "user_id" bigint,                                         -- ユーザーID
  "role" varchar                                            -- 権限（owner, readerなど）
);

-- イベント
CREATE TABLE "events" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, -- イベントID
  "calendar_id" bigint NOT NULL,                            -- カレンダーID
  "ical_uid" varchar UNIQUE,                                -- iCal UID
  "status" varchar,                                         -- ステータス
  "sequence" int,                                           -- バージョン番号
  "title" varchar,                                          -- タイトル
  "description" text,                                       -- 内容
  "location" text,                                          -- 場所
  "color" varchar,                                          -- 色
  "organizer_id" bigint,                                    -- 主催ユーザーID
  "all_day" boolean,                                        -- 終日かどうか
  "end_time_unspecified" boolean,                           -- 終了時間が不明か
  "time_range" tstzrange,                                   -- 時間範囲
  "recurrence_rule" text,                                   -- 繰り返しルール
  "recurrence" text[],                                      -- 繰り返しの詳細
  "recurrence_exceptions" tsmultirange,                     -- 繰り返し例外
  "recurring_event_id" bigint,                              -- 繰り返し元イベントID
  "original_start_time" timestamptz,                        -- オリジナル開始時間
  "transparency" varchar,                                   -- 予定の透明性
  "visibility" varchar,                                     -- 公開設定
  "extended_private" jsonb,                                 -- 拡張（非公開）
  "extended_shared" jsonb,                                  -- 拡張（共有）
  "created_at" timestamptz,
  "updated_at" timestamptz
);

-- イベント出席者
CREATE TABLE "event_attendees" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, -- 出席者ID
  "event_id" bigint,                                        -- イベントID
  "email" varchar,                                          -- メール
  "user_id" bigint,                                         -- ユーザーID
  "display_name" varchar,                                   -- 表示名
  "organizer" boolean,                                      -- 主催者フラグ
  "optional" boolean,                                       -- 任意か
  "response_status" varchar,                                -- 出席ステータス
  "comment" text,                                           -- コメント
  "additional_guests" int                                   -- 同伴者数
);

-- リマインダー
CREATE TABLE "event_reminders" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, -- リマインダーID
  "event_id" bigint,                                        -- イベントID
  "method" varchar,                                         -- 通知方法
  "minutes_before" int                                      -- 何分前に通知するか
);

-- カレンダーのアクセス制御
CREATE TABLE "calendar_acl" (
  "id" varchar PRIMARY KEY,                                 -- ACL ID（文字列型）
  "calendar_id" bigint,                                     -- カレンダーID
  "scope_type" varchar,                                     -- スコープ種別（user等）
  "scope_value" varchar,                                    -- 対象値（emailなど）
  "role" varchar                                             -- 権限（reader, writer, owner）
);

-- 外部キー制約
ALTER TABLE "user_settings" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");
ALTER TABLE "calendars" ADD FOREIGN KEY ("owner_id") REFERENCES "users" ("id");
ALTER TABLE "calendar_memberships" ADD FOREIGN KEY ("calendar_id") REFERENCES "calendars" ("id");
ALTER TABLE "calendar_memberships" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");
ALTER TABLE "events" ADD FOREIGN KEY ("calendar_id") REFERENCES "calendars" ("id");
ALTER TABLE "events" ADD FOREIGN KEY ("organizer_id") REFERENCES "users" ("id");
ALTER TABLE "events" ADD FOREIGN KEY ("recurring_event_id") REFERENCES "events" ("id");
ALTER TABLE "event_attendees" ADD FOREIGN KEY ("event_id") REFERENCES "events" ("id");
ALTER TABLE "event_attendees" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");
ALTER TABLE "event_reminders" ADD FOREIGN KEY ("event_id") REFERENCES "events" ("id");
ALTER TABLE "calendar_acl" ADD FOREIGN KEY ("calendar_id") REFERENCES "calendars" ("id");
```

## データのinsert

```sql
-- users
INSERT INTO users (email, display_name, created_at)
VALUES
  ('alice@example.com', 'Alice', now()),
  ('bob@example.com', 'Bob', now());

-- user_settings
INSERT INTO user_settings (user_id, default_reminders, working_hours, color_theme, notification_settings, updated_at)
VALUES
  (1, '{"popup": 10}', '{"start": "09:00", "end": "18:00"}', 'blue', '{"email": true}', now()),
  (2, '{"popup": 15}', '{"start": "10:00", "end": "17:00"}', 'green', '{"email": false}', now());

-- calendars
INSERT INTO calendars (owner_id, summary, description, color, visibility, created_at, updated_at)
VALUES
  (1, 'Alice Work', 'Work calendar for Alice', 'blue', 'default', now(), now()),
  (2, 'Bob Personal', 'Personal calendar for Bob', 'green', 'private', now(), now());

-- calendar_memberships
INSERT INTO calendar_memberships (calendar_id, user_id, role)
VALUES
  (1, 1, 'owner'),
  (1, 2, 'reader'),
  (2, 2, 'owner');

-- events
INSERT INTO events (calendar_id, ical_uid, status, sequence, title, description, location, color, organizer_id,
                    all_day, end_time_unspecified, time_range, created_at, updated_at)
VALUES
  (1, 'evt-1@google.com', 'confirmed', 0, 'Project Kickoff', 'Initial project meeting', 'Zoom', 'blue', 1,
   false, false, tstzrange(now(), now() + interval '1 hour'), now(), now()),
  (2, 'evt-2@google.com', 'tentative', 0, 'Dentist Appointment', 'Routine check-up', 'Clinic', 'green', 2,
   false, false, tstzrange(now() + interval '1 day', now() + interval '1 day 1 hour'), now(), now());

-- event_attendees
INSERT INTO event_attendees (event_id, email, user_id, display_name, organizer, optional, response_status, comment, additional_guests)
VALUES
  (1, 'bob@example.com', 2, 'Bob', false, false, 'accepted', 'Looking forward to it!', 0),
  (2, 'alice@example.com', 1, 'Alice', false, false, 'tentative', '', 0);

-- event_reminders
INSERT INTO event_reminders (event_id, method, minutes_before)
VALUES
  (1, 'popup', 10),
  (2, 'email', 30);

-- calendar_acl
INSERT INTO calendar_acl (id, calendar_id, scope_type, scope_value, role)
VALUES
  ('acl-1', 1, 'user', 'bob@example.com', 'reader'),
  ('acl-2', 2, 'user', 'alice@example.com', 'writer');
```

## ユースケースに応じたSQLの実行

### カレンダー関連のSQL

#### 1\. カレンダーを作成する

ログインユーザーが新しいカレンダーを作成する（例：「チームプロジェクト用」など）

```sql
calendar=# INSERT INTO "calendars" (owner_id, summary, description, color, visibility, created_at, updated_at)
VALUES (1, 'Team Project', 'カンファレンスや締切用', 'blue', 'default', now(), now());
INSERT 0 1
```

#### 2\. ユーザーが所属するカレンダー一覧を取得する

```sql
calendar=# SELECT c.*
FROM calendars c
JOIN calendar_memberships cm ON c.id = cm.calendar_id
WHERE cm.user_id = 1;
 id | owner_id |  summary   |       description       | color | visibility |          created_at           |          updated_at           
----+----------+------------+-------------------------+-------+------------+-------------------------------+-------------------------------
  1 |        1 | Alice Work | Work calendar for Alice | blue  | default    | 2025-05-17 05:57:04.619288+00 | 2025-05-17 05:57:04.619288+00
(1 row)
```

#### 3\. 特定のカレンダーの詳細を取得する

```sql
calendar=# SELECT * FROM calendars WHERE id = 1;
 id | owner_id |  summary   |       description       | color | visibility |          created_at           |          updated_at           
----+----------+------------+-------------------------+-------+------------+-------------------------------+-------------------------------
  1 |        1 | Alice Work | Work calendar for Alice | blue  | default    | 2025-05-17 05:57:04.619288+00 | 2025-05-17 05:57:04.619288+00
(1 row)
```

#### 4.カレンダーへの参加メンバー一覧を取得する

```sql
calendar=# SELECT u.id, u.display_name, cm.role
FROM users u
JOIN calendar_memberships cm ON u.id = cm.user_id
WHERE cm.calendar_id = 1;
 id | display_name |  role  
----+--------------+--------
  1 | Alice        | owner
  2 | Bob          | reader
(2 rows)
```

### イベント関連

#### 1\. カレンダーにイベントを登録する

```sql
calendar=# INSERT INTO events (
  calendar_id, ical_uid, status, sequence, title, description, location, color, organizer_id,
  all_day, end_time_unspecified, time_range, created_at, updated_at
)
VALUES (
  1, 'evt-3@google.com', 'confirmed', 0, 'Team Sync', 'Weekly sync meeting', 'Google Meet', 'blue', 1,
  false, false, tstzrange('2025-05-20 10:00:00+09', '2025-05-20 11:00:00+09'), now(), now()
);
INSERT 0 1
```

開区間、閉区間のお話が大事です！一般的に範囲の指定の場合は、 **\[start, end)（右端排他）** です。今回、間違って開区間で入れています。最初は気づかないんですが、後々痛い目を見るので、気をつけましょう！

[開区間、閉区間](https://qiita.com/koji0705/items/2e7af1b289ee7b7508dc#%E9%96%8B%E5%8C%BA%E9%96%93%E9%96%89%E5%8C%BA%E9%96%93%E3%82%92%E5%AD%A6%E3%81%B6) の話はここで記事にしています。

#### 2\. 指定期間中のイベントを一覧取得する

```sql
calendar=# SELECT * FROM events
WHERE calendar_id = 1
  AND time_range && tstzrange('2025-05-01 00:00:00+09', '2025-05-31 23:59:59+09');
 id | calendar_id |     ical_uid     |  status   | sequence |      title      |       description       |  location   | color | organizer_id | all_day | end_time_unspecified |                            time_range                             | recurrence_rule | recurrence | recurrence_exceptions | recurring_event_id | original_start_time | transparency | visibility | extended_private | extended_shared |          created_at           |          updated_at           
----+-------------+------------------+-----------+----------+-----------------+-------------------------+-------------+-------+--------------+---------+----------------------+-------------------------------------------------------------------+-----------------+------------+-----------------------+--------------------+---------------------+--------------+------------+------------------+-----------------+-------------------------------+-------------------------------
  1 |           1 | evt-1@google.com | confirmed |        0 | Project Kickoff | Initial project meeting | Zoom        | blue  |            1 | f       | f                    | ["2025-05-17 05:57:09.915029+00","2025-05-17 06:57:09.915029+00") |                 |            |                       |                    |                     |              |            |                  |                 | 2025-05-17 05:57:09.915029+00 | 2025-05-17 05:57:09.915029+00
  3 |           1 | evt-3@google.com | confirmed |        0 | Team Sync       | Weekly sync meeting     | Google Meet | blue  |            1 | f       | f                    | ["2025-05-20 01:00:00+00","2025-05-20 02:00:00+00")               |                 |            |                       |                    |                     |              |            |                  |                 | 2025-05-17 06:09:05.172634+00 | 2025-05-17 06:09:05.172634+00
(2 rows)
```

これは開区間/開区間の絞り込みですね。一般的に、開区間/閉区間

#### 3.繰り返しイベントを登録する（毎週・毎月など）

```sql
calendar=# INSERT INTO events (
  calendar_id, ical_uid, status, sequence, title, recurrence_rule, time_range, created_at, updated_at
)
VALUES (
  1, 'evt-4@google.com', 'confirmed', 0, 'Weekly Check-In',
  'RRULE:FREQ=WEEKLY;BYDAY=MO',
  tstzrange('2025-05-05 10:00:00+09', '2025-05-05 10:30:00+09'),
  now(), now()
);
INSERT 0 1
```

繰り返しはRRuleの話ですね。ちょっと難しいです。また、どこかで記事にして理解を深めたいと思います。

#### 4.イベントに通知リマインダーを設定する

```sql
calendar=# INSERT INTO event_reminders (event_id, method, minutes_before)
VALUES (3, 'email', 30);
INSERT 0 1
```

### アクセス制御関連

#### 1.他ユーザーにカレンダーの「閲覧・編集」権限を付与する

```sql
calendar=# INSERT INTO calendar_acl (id, calendar_id, scope_type, scope_value, role)
VALUES ('acl-3', 1, 'user', 'bob@example.com', 'writer');
INSERT 0 1
```

#### 2.カレンダーへのアクセス制御リスト（ACL）を取得する

```sql
calendar=# SELECT * FROM calendar_acl WHERE calendar_id = 1;
  id   | calendar_id | scope_type |   scope_value   |  role  
-------+-------------+------------+-----------------+--------
 acl-1 |           1 | user       | bob@example.com | reader
 acl-3 |           1 | user       | bob@example.com | writer
(2 rows)
```

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