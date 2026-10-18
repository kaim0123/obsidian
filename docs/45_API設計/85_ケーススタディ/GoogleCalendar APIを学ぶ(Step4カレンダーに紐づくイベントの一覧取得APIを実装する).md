---
title: "GoogleCalendar APIを学ぶ(Step4:カレンダーに紐づくイベントの一覧取得APIを実装する)"
source: "https://qiita.com/koji0705/items/7ed44caecb15e367ee11"
author:
  - "[[koji0705]]"
published: 2025-05-18
created: 2026-05-09
description: "はじめに 前回までの続きです。今回はカレンダーに紐づくイベントの一覧を実装していきます！！！ Google Calendarシリーズ Google CalendarAPIを学ぶ(Step1:APIの仕様、リソースを理解する) GoogleCalendar APIを学ぶ(..."
tags:
  - "clippings"
---
## 詳しい要約

**テーマ：カレンダーに紐づくイベント一覧取得 API を Go（Echo + Bun）で実装する（シリーズ Step4）**

Google Calendar API の events 一覧レスポンス（calendar#events）を確認し、必要な項目だけに削ぎ落としたレスポンスを設計。`GET /calendars/:calendarId/events` を controller → service → repository の構成で実装し、PostgreSQL の `tstzrange` 型の時間範囲を `lower()`／`upper()` で開始・終了時刻に分解して返す。

---

### 本家レスポンスと簡略化

- Google のレスポンスはカレンダー情報（summary・description・updated・timeZone・accessRole・defaultReminders）に加え、**nextPageToken**（ページネーション用）、**nextSyncToken**（差分同期用）、items（イベント配列）を持つ
- 終日イベントは `start.date`／`end.date` を使い、終了日は **排他的** なので翌日になる
- `transparency: transparent` は空き時間扱い
- 重厚すぎるので、カレンダーの id・summary・description・accessRole と、イベントの id・status・summary・description・start・end・location・creator・organizer・transparency に絞る
- イベントの `htmlLink`（詳細ページの URL）は Google Calendar にも実際にあるが、イベントに詳細ページはあまり必要ない気がする、との感想

### 実装の構成

- ディレクトリを `controller/calendars/events`、`service/calendar/service_dto` などに整理し、controller 用と service 用の DTO を分けている
- `main`: Bun にクエリログ（bundebug）を追加し、event リポジトリと EventController を登録、`:8081` で起動
- **controller**: パスパラメータ `calendarId`（と任意の start_date・end_date クエリ）を DTO にバインドし、service 用 DTO に変換して呼ぶ
- **service**: カレンダー情報とイベント一覧を取得し、`ConvertToEventsResponse` でレスポンスに変換
  - 空の値にはデフォルトを入れる（status→confirmed、transparency→opaque、主催者→system@example.com、accessRole→reader）
  - 開始・終了は RFC3339 形式で `dateTime` に入れる
- **repository**: calendars を起点に events・users を LEFT JOIN し、owner かどうかを CASE 式で access_role にして、開始時刻順に並べる

### tstzrange の扱い

- `["2025-05-05 01:00:00+00","2025-05-05 01:30:00+00")` のような範囲データは、`lower(e.time_range) AS start_time`、`upper(e.time_range) AS end_time` で取り出せる（筆者が「ここ重要」とする点）

### 実行結果

- calendar_id=1（Alice Work）に対し、Weekly Check-In・Project Kickoff・Team Sync の 3 件が開始時刻順に返る

### まとめ

- 本家のレスポンスからページネーション・同期トークンなどを外し、必要最低限の形にする
- 範囲型は lower／upper で開始・終了に分解する
- DTO を層ごとに分け、空値のデフォルトは変換処理で補う

## はじめに

[前回](https://qiita.com/koji0705/items/c9301529bbe6fc28bad5) までの続きです。今回はカレンダーに紐づくイベントの一覧を実装していきます！！！

## Google Calendarシリーズ

[Google CalendarAPIを学ぶ(Step1:APIの仕様、リソースを理解する)](https://qiita.com/koji0705/items/fa683484a1a15517d45b)  
[GoogleCalendar APIを学ぶ(Step2:TBL作成、データ挿入)](https://qiita.com/koji0705/items/f5e59490a093a536c020)  
[GoogleCalendar APIを学ぶ(Step3:カレンダーの取得APIを実装する)](https://qiita.com/koji0705/items/c9301529bbe6fc28bad5)  
[GoogleCalendar APIを学ぶ(Step4:カレンダーに紐づくイベントの一覧取得APIを実装する)](https://qiita.com/koji0705/items/7ed44caecb15e367ee11)

## 実装箇所

カレンダーに紐づくイベントの一覧取得です。

[![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/599049/e3a1a087-3f49-4c2b-b6b5-0acdd6d6c8aa.png)](https://qiita-user-contents.imgix.net/https%3A%2F%2Fqiita-image-store.s3.ap-northeast-1.amazonaws.com%2F0%2F599049%2Fe3a1a087-3f49-4c2b-b6b5-0acdd6d6c8aa.png?ixlib=rb-4.0.0&auto=format&gif-q=60&q=75&s=5aeade666a9fd488259a12cc063ed8fc)

## GoogleCalendarAPIの仕様  
→赤枠の部分を実装します。では次にレスポンスを見ていきましょう！

<iframe src="https://qiita.com/embed-contents/link-card#qiita-embed-content__3190f770a56285c44b4df794edf3e1d7" frameborder="0" height="112"></iframe>

```json
{
  "kind": "calendar#events", // イベントリストを表すリソース種別
  "etag": "\"p32kl9ah4f0gk20g\"", // レスポンス全体のバージョン識別用タグ
  "summary": "Alice's Work Calendar", // カレンダー名
  "description": "会議・締切・打ち合わせなどを管理", // カレンダーの説明
  "updated": "2025-05-17T08:00:00.000Z", // 最終更新日時（ISO 8601形式、UTC）
  "timeZone": "Asia/Tokyo", // カレンダーのタイムゾーン
  "accessRole": "owner", // このカレンダーに対するアクセス権（owner, readerなど）
  "defaultReminders": [ // デフォルトのリマインダー設定（全イベント共通）
    {
      "method": "popup", // リマインダーの通知方法（popup, emailなど）
      "minutes": 10 // 開始時間の何分前に通知するか
    }
  ],
  "nextPageToken": "cGFnZVRva2VuMTIz", // 次ページの取得に使うトークン（ページネーション用）
  "nextSyncToken": "CPzj5I3h5fkCEpzj5I3h5fkCGAU=", // 差分取得のための同期トークン
  "items": [ // 実際のイベント一覧（配列）
    {
      "kind": "calendar#event", // イベントリソースであることを示す種別
      "etag": "\"334455aa\"", // イベントのバージョン識別子
      "id": "evt-001", // イベントの一意なID
      "status": "confirmed", // ステータス（confirmed, cancelledなど）
      "htmlLink": "https://www.google.com/calendar/event?eid=ZXZ0LTAwMQ", // Web UI上でイベントを開くリンク
      "summary": "朝会（Daily Stand-up）", // イベントのタイトル
      "description": "開発チームの毎朝の短い打ち合わせ", // イベントの詳細説明
      "start": {
        "dateTime": "2025-05-17T09:00:00+09:00" // 開始日時（タイムゾーン付き）
      },
      "end": {
        "dateTime": "2025-05-17T09:15:00+09:00" // 終了日時（タイムゾーン付き）
      },
      "location": "会議室A", // イベントの場所
      "updated": "2025-05-16T23:00:00.000Z", // このイベントの最終更新日時（UTC）
      "creator": {
        "email": "alice@example.com", // 作成者のメールアドレス
        "displayName": "Alice" // 作成者の表示名
      },
      "organizer": {
        "email": "alice@example.com", // 主催者のメールアドレス
        "displayName": "Alice" // 主催者の表示名
      }
    },
    {
      "kind": "calendar#event",
      "etag": "\"334455bb\"",
      "id": "evt-002",
      "status": "confirmed",
      "summary": "プロジェクト締切", // イベント名（終日イベント）
      "start": {
        "date": "2025-05-17" // 開始日（終日イベントの場合は date）
      },
      "end": {
        "date": "2025-05-18" // 終了日（Google Calendarでは排他的なので翌日）
      },
      "description": "〇〇プロジェクトの納品期限です。",
      "updated": "2025-05-17T00:00:00.000Z",
      "creator": {
        "email": "bob@example.com",
        "displayName": "Bob"
      },
      "organizer": {
        "email": "project-team@example.com",
        "displayName": "プロジェクトチーム"
      },
      "transparency": "transparent" // 空き時間として扱う（デフォルトでは busy）
    }
  ]
}
```

→ちょっと重厚すぎるので、今回必要な分だけに削ぎ落としていきます。

```json
{
  "id":1,
  "summary": "Alice's Work Calendar", // カレンダー名
  "description": "会議・締切・打ち合わせなどを管理", // カレンダーの説明
  "accessRole": "owner", // このカレンダーに対するアクセス権（owner, readerなど）
   "items": [ // 実際のイベント一覧（配列）
    {
      "id": 1, // イベントの一意なID
      "status": "confirmed", // ステータス（confirmed, cancelledなど）
      "summary": "朝会（Daily Stand-up）", // イベントのタイトル
      "description": "開発チームの毎朝の短い打ち合わせ", // イベントの詳細説明
      "start": {
        "dateTime": "2025-05-17T09:00:00+09:00" // 開始日時（タイムゾーン付き）
      },
      "end": {
        "dateTime": "2025-05-17T09:15:00+09:00" // 終了日時（タイムゾーン付き）
      },
      "location": "会議室A", // イベントの場所
      "creator": {
        "email": "alice@example.com", // 作成者のメールアドレス
        "displayName": "Alice" // 作成者の表示名
      },
      "organizer": {
        "email": "alice@example.com", // 主催者のメールアドレス
        "displayName": "Alice" // 主催者の表示名
      }
      "transparency": "busy" // 空き時間として扱う（デフォルトでは busy）
    },
    {
      "id": 2,
      "status": "confirmed",
      "summary": "プロジェクト締切", // イベント名（終日イベント）
      "start": {
        "date": "2025-05-17" // 開始日（終日イベントの場合は date）
      },
      "end": {
        "date": "2025-05-18" // 終了日（Google Calendarでは排他的なので翌日）
      },
      "description": "〇〇プロジェクトの納品期限です。",
      "creator": {
        "email": "bob@example.com",
        "displayName": "Bob"
      },
      "organizer": {
        "email": "project-team@example.com",
        "displayName": "プロジェクトチーム"
      },
      "transparency": "transparent" // 空き時間として扱う（デフォルトでは busy）
    }
  ]
}
```

イベントのURLとは何か？ カレンダーのイベントのURL。一般的に機能として提供されてそうだけど、GoogleCalendarにそんなイベントの詳細を見るページってあったけ？？って思ったので、調べてみました。  
イベントをクリックしてみると、確かにURLらしきものが。  
使った事はないんですが、こんなのがあるんですね。イベントってあまり詳細ページが必要なきはしないですね。

## ソースコード

ディレクトリ構成

```shell
~/develop/google_calendar_sample  (feat/even_get)$ tree -I pgdata/
.
├── docker-compose.yml
├── Dockerfile
├── docs
├── go.mod
├── go.sum
├── init
│   ├── 01_schema.sql
│   ├── 02_seed.sql
│   └── 03_alter_table.sql
├── internal
│   ├── controller
│   │   └── calendars
│   │       ├── calendar.go
│   │       ├── controller_dto
│   │       │   └── calendar.go
│   │       └── events
│   │           ├── controller_dto
│   │           │   └── event.go
│   │           └── event.go
│   ├── model
│   │   ├── calendar.go
│   │   ├── event.go
│   │   └── user_settings.go
│   ├── repository
│   │   ├── calendar_repository.go
│   │   ├── event.go
│   │   └── user_settings_repository.go
│   └── service
│       └── calendar
│           ├── calendar.go
│           └── service_dto
│               ├── calendar.go
│               └── event.go
├── main.go
├── Makefile
└── tmp
    ├── build-errors.log
    └── main

15 directories, 24 files
```

```go
package main

import (
    "database/sql"
    "fmt"
    "log"
    "os"

    controller "calendar/internal/controller/calendars"
    "calendar/internal/controller/calendars/events"
    "calendar/internal/repository"
    service "calendar/internal/service/calendar"

    "github.com/labstack/echo/v4"
    "github.com/uptrace/bun"
    "github.com/uptrace/bun/dialect/pgdialect"
    _ "github.com/uptrace/bun/driver/pgdriver"
    "github.com/uptrace/bun/extra/bundebug"
)

func main() {
    // Initialize Echo
    e := echo.New()

    // Database connection
    dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
        os.Getenv("DB_USER"),
        os.Getenv("DB_PASSWORD"),
        os.Getenv("DB_HOST"),
        os.Getenv("DB_PORT"),
        os.Getenv("DB_NAME"),
    )

    sqldb, err := sql.Open("pg", dsn)
    if err != nil {
        log.Fatal(err)
    }
    // PostgreSQL接続用 bun.DB を作成
    db := bun.NewDB(sqldb, pgdialect.New())

    // クエリログを出力
    db.AddQueryHook(bundebug.NewQueryHook(
        bundebug.WithVerbose(true),
        bundebug.FromEnv("BUNDEBUG"),
    ))

    // Test database connection
    if err := db.Ping(); err != nil {
        log.Fatal(err)
    }

    // Initialize repositories
    calendarRepo := repository.NewCalendarRepository(db)
    settingsRepo := repository.NewUserSettingsRepository(db)
    eventRepo := repository.NewEventRepository(db)

    // Initialize service
    calendarService := service.NewCalendarService(calendarRepo, settingsRepo, eventRepo)

    // Initialize controller
    calendarController := controller.NewCalendarController(calendarService)
    eventController := events.NewEventController(calendarService)

    // Register routes
    calendarController.RegisterRoutes(e)
    eventController.RegisterRoutes(e)

    // Start server
    e.Logger.Fatal(e.Start(":8081"))
}
```

```go
package events

import (
    "calendar/internal/controller/calendars/events/controller_dto"
    service "calendar/internal/service/calendar"
    "net/http"

    "github.com/labstack/echo/v4"
)

type EventController struct {
    service service.CalendarService
}

func NewEventController(service service.CalendarService) *EventController {
    return &EventController{service: service}
}

func (c *EventController) RegisterRoutes(e *echo.Echo) {
    e.GET("/calendars/:calendarId/events", c.GetEvents)
}

// GetEvents は指定されたカレンダーのイベント一覧を返却します
func (c *EventController) GetEvents(ctx echo.Context) error {
    req := new(controller_dto.ListEventsRequest)
    if err := ctx.Bind(req); err != nil {
        return ctx.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request parameters"})
    }

    res, err := c.service.ListEvents(ctx.Request().Context(), req.ToServiceDTO())
    if err != nil {
        return ctx.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }

    return ctx.JSON(http.StatusOK, res)
}
```

```go
package controller_dto

import (
    "calendar/internal/service/calendar/service_dto"
    "time"
)

type ListEventsRequest struct {
    CalendarID int64     \`param:"calendarId" validate:"required"\`
    StartDate  time.Time \`query:"start_date" validate:"omitempty" format:"2006-01-02T15:04:05Z07:00"\`
    EndDate    time.Time \`query:"end_date" validate:"omitempty" format:"2006-01-02T15:04:05Z07:00"\`
}

func (r *ListEventsRequest) ToServiceDTO() service_dto.ListEventsRequest {
    return service_dto.ListEventsRequest{
        CalendarID: r.CalendarID,
    }
}
```

```go
package calendar

import (
    "context"

    "calendar/internal/service/calendar/service_dto"
)

func (s *calendarService) ListEvents(ctx context.Context, req service_dto.ListEventsRequest) (service_dto.ListEventsResponse, error) {
    // カレンダー情報の取得
    calendar, err := s.calendarRepo.Get(ctx, req.CalendarID)
    if err != nil {
        return service_dto.ListEventsResponse{}, err
    }

    // イベントの取得
    events, err := s.eventRepo.List(ctx, req.CalendarID)
    if err != nil {
        return service_dto.ListEventsResponse{}, err
    }

    // レスポンスの変換
    return service_dto.ConvertToEventsResponse(calendar, events), nil
}
```

```go
package service_dto

import (
    "calendar/internal/model"
    "time"
)

type ListEventsRequest struct {
    UserID     int64
    CalendarID int64
}

type ListEventsResponse struct {
    CalendarID  int64           \`json:"calendar_id"\`
    Summary     string          \`json:"summary"\`
    Description string          \`json:"description"\`
    AccessRole  string          \`json:"accessRole"\`
    Items       []EventResponse \`json:"items"\`
}

type EventResponse struct {
    ID           int64    \`json:"id"\`
    Status       string   \`json:"status"\`
    Summary      string   \`json:"summary"\`
    Description  string   \`json:"description"\`
    Start        TimeInfo \`json:"start"\`
    End          TimeInfo \`json:"end"\`
    Location     string   \`json:"location"\`
    Creator      Person   \`json:"creator"\`
    Organizer    Person   \`json:"organizer"\`
    Transparency string   \`json:"transparency"\`
}

type TimeInfo struct {
    DateTime string \`json:"dateTime,omitempty"\`
    Date     string \`json:"date,omitempty"\`
}

type Person struct {
    Email       string \`json:"email"\`
    DisplayName string \`json:"displayName"\`
}

// ConvertToEventsResponse converts a calendar and its events to ListEventsResponse
func ConvertToEventsResponse(calendar *model.Calendar, events []*model.CalendarEvent) ListEventsResponse {
    items := make([]EventResponse, len(events))
    for i, event := range events {
        // デフォルト値を設定
        status := "confirmed"
        if event.Status != "" {
            status = event.Status
        }

        transparency := "opaque"
        if event.Transparency != "" {
            transparency = event.Transparency
        }

        // オーガナイザー情報が空の場合のデフォルト値
        organizerEmail := "system@example.com"
        organizerName := "System"
        if event.OrganizerEmail != "" {
            organizerEmail = event.OrganizerEmail
            organizerName = event.OrganizerName
        }

        items[i] = EventResponse{
            ID:          event.EventID,
            Status:      status,
            Summary:     event.EventSummary,
            Description: event.EventDesc,
            Start: TimeInfo{
                DateTime: event.StartTime.Format(time.RFC3339),
            },
            End: TimeInfo{
                DateTime: event.EndTime.Format(time.RFC3339),
            },
            Location: event.Location,
            Creator: Person{
                Email:       organizerEmail,
                DisplayName: organizerName,
            },
            Organizer: Person{
                Email:       organizerEmail,
                DisplayName: organizerName,
            },
            Transparency: transparency,
        }
    }

    // カレンダーのアクセス権限が空の場合のデフォルト値
    accessRole := "reader"
    if calendar.AccessRole != "" {
        accessRole = calendar.AccessRole
    }

    return ListEventsResponse{
        CalendarID:  calendar.ID,
        Summary:     calendar.Summary,
        Description: calendar.Description,
        AccessRole:  accessRole,
        Items:       items,
    }
}
```

```go
package repository

import (
    "context"
    "fmt"

    "calendar/internal/model"

    "github.com/uptrace/bun"
)

type EventRepository interface {
    List(ctx context.Context, calendarID int64) ([]*model.CalendarEvent, error)
}

type eventRepository struct {
    db *bun.DB
}

func NewEventRepository(db *bun.DB) EventRepository {
    return &eventRepository{db: db}
}

func (r *eventRepository) List(ctx context.Context, calendarID int64) ([]*model.CalendarEvent, error) {
    var events []*model.CalendarEvent
    accessRoleCase := fmt.Sprintf("CASE WHEN c.owner_id = %d THEN 'owner' ELSE 'reader' END AS access_role", calendarID)

    err := r.db.NewSelect().
        TableExpr("calendars AS c").
        ColumnExpr("c.id AS calendar_id").
        ColumnExpr("c.summary").
        ColumnExpr("c.description").
        ColumnExpr(accessRoleCase).
        ColumnExpr("e.id AS event_id").
        ColumnExpr("e.status").
        ColumnExpr("e.title AS summary").
        ColumnExpr("e.description").
        ColumnExpr("e.location").
        ColumnExpr("lower(e.time_range) AS start_time").
        ColumnExpr("upper(e.time_range) AS end_time").
        ColumnExpr("u.email AS organizer_email").
        ColumnExpr("u.display_name AS organizer_name").
        ColumnExpr("e.transparency").
        Join("LEFT JOIN events e ON e.calendar_id = c.id").
        Join("LEFT JOIN users u ON u.id = e.organizer_id").
        Where("c.id = ?", calendarID).
        Order("start_time ASC").
        Scan(ctx, &events)
    return events, err
}
```

```text
ColumnExpr("lower(e.time_range) AS start_time").
ColumnExpr("upper(e.time_range) AS end_time").
```

→ここ重要ですね。 `["2025-05-05 01:00:00+00","2025-05-05 01:30:00+00")` こんなデータをどうやって取り扱うのかなぁと思ったんですが、こんな風にすればいいんですね！

```go
package model

import "time"

type Event struct {
    ID         int64  \`bun:"id,pk"\`
    CalendarID int64  \`bun:"calendar_id"\`
    TimeRange  string \`bun:"time_range"\`
    Title      string \`bun:"title"\`
}

type CalendarEvent struct {
    CalendarID     int64     \`bun:"calendar_id" json:"calendar_id"\`
    Summary        string    \`bun:"summary" json:"summary"\`
    Description    string    \`bun:"description" json:"description"\`
    AccessRole     string    \`bun:"access_role" json:"access_role"\`
    EventID        int64     \`bun:"event_id" json:"event_id"\`
    Status         string    \`bun:"status" json:"status"\`
    EventSummary   string    \`bun:"summary" json:"event_summary"\`
    EventDesc      string    \`bun:"description" json:"event_description"\`
    Location       string    \`bun:"location" json:"location"\`
    StartTime      time.Time \`bun:"start_time" json:"start_time"\`
    EndTime        time.Time \`bun:"end_time" json:"end_time"\`
    OrganizerEmail string    \`bun:"organizer_email" json:"organizer_email"\`
    OrganizerName  string    \`bun:"organizer_name" json:"organizer_name"\`
    Transparency   string    \`bun:"transparency" json:"transparency"\`
}

type Person struct {
    Email       string
    DisplayName string
}
```

## APIの実行結果

```json
{
  "calendar_id": 1,
  "summary": "Alice Work",
  "description": "Work calendar for Alice",
  "accessRole": "reader",
  "items": [
    {
      "id": 4,
      "status": "tentative",
      "summary": "Weekly Check-In",
      "description": "check in",
      "start": {
        "dateTime": "2025-05-05T01:00:00Z"
      },
      "end": {
        "dateTime": "2025-05-05T01:30:00Z"
      },
      "location": "Zoom",
      "creator": {
        "email": "alice@example.com",
        "displayName": "Alice"
      },
      "organizer": {
        "email": "alice@example.com",
        "displayName": "Alice"
      },
      "transparency": "opaque"
    },
    {
      "id": 1,
      "status": "confirmed",
      "summary": "Project Kickoff",
      "description": "Initial project meeting",
      "start": {
        "dateTime": "2025-05-17T05:57:09Z"
      },
      "end": {
        "dateTime": "2025-05-17T06:57:09Z"
      },
      "location": "Zoom",
      "creator": {
        "email": "alice@example.com",
        "displayName": "Alice"
      },
      "organizer": {
        "email": "alice@example.com",
        "displayName": "Alice"
      },
      "transparency": "opaque"
    },
    {
      "id": 3,
      "status": "confirmed",
      "summary": "Team Sync",
      "description": "Weekly sync meeting",
      "start": {
        "dateTime": "2025-05-20T01:00:00Z"
      },
      "end": {
        "dateTime": "2025-05-20T02:00:00Z"
      },
      "location": "Google Meet",
      "creator": {
        "email": "alice@example.com",
        "displayName": "Alice"
      },
      "organizer": {
        "email": "alice@example.com",
        "displayName": "Alice"
      },
      "transparency": "opaque"
    }
  ]
}
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