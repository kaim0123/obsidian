---
title: "GoogleCalendar APIを学ぶ(Step3:カレンダーの取得APIを実装する)"
source: "https://qiita.com/koji0705/items/c9301529bbe6fc28bad5"
author:
  - "[[koji0705]]"
published: 2025-05-17
created: 2026-05-09
description: "はじめに 前回までの続きです。 今回はGoogleCalendarAPIを参考に、カレンダーの取得APIを実装します Google Calendarシリーズ Google CalendarAPIを学ぶ(Step1:APIの仕様、リソースを理解する) GoogleCale..."
tags:
  - "clippings"
---
## 詳しい要約

**テーマ：Google Calendar API を参考に「カレンダー一覧取得 API」を Go（Echo + Bun）で実装する（シリーズ Step3）**

Google Calendar API のカレンダーリスト取得のレスポンス（calendarListEntry）を確認し、それを必要最低限に絞ったレスポンスを定義。足りない列をテーブルに追加したうえで、Go の Echo と ORM の Bun を使い、controller → service → repository → model の層構成で `GET /calendars?user_id=1` を実装する。

---

### レスポンスの設計

- Google のレスポンスは kind・etag・id・summary・description・location・timeZone・summaryOverride・colorId・背景色／文字色・hidden・selected・accessRole・defaultReminders・notificationSettings・primary・deleted・conferenceProperties と多機能で、汎用性とパフォーマンスを意識している
- 今回は十分すぎるので最低限に変更: id を数値に、色は `color`（"blue" など）に、kind・etag・location・timeZone などを省略
- 今のテーブルでは対応できない項目があるため、`calendar_memberships` に summary_override・hidden・selected・is_primary・is_deleted を追加する ALTER TABLE を流す

### 成果物

- `GET http://localhost:8081/calendars?user_id=1` で 3 件のカレンダー（Alice Work・Bob Personal・Team Project）が、color・visibility・hidden・selected・accessRole・defaultReminders・notificationSettings・primary・deleted・conferenceProperties 付きで返る

### 実装の構成

| 層 | 内容 |
|---|---|
| `main` | Echo を起動し、環境変数から DSN を組んで Bun で PostgreSQL に接続、repository → service → controller を組み立ててルート登録 |
| controller | `GET /calendars` を登録。クエリの `user_id` を DTO にバインドし、0 なら 400。service の結果を `CalendarResponse` DTO に変換して 200 で返す |
| dto | `CalendarResponse`・`ReminderResponse`・`NotificationResponse` などレスポンス用の構造体と `ListCalendarsRequest` |
| service | カレンダー一覧と、そのユーザーの `user_settings` を取得し、既定リマインダー・通知設定を設定から埋める。会議プロパティや hidden=false・selected=true・accessRole=owner・primary=true・deleted=false は固定のデフォルト値 |
| repository | Bun の `NewSelect()` で calendars 全件、user_settings を user_id で取得 |
| model | `Calendar`（DB にない項目は `bun:"-"`）と `UserSettings`（jsonb 列をマップや構造体で受ける） |

- ディレクトリ: `init/`（01_schema・02_seed・03_alter_table の SQL）、`internal/`（controller・model・repository・service）、docker-compose・Dockerfile

### まとめ

- 本家 API のレスポンスを見て、必要な項目に絞って自前のレスポンスを設計する
- DB にない項目はテーブル追加かサービス層でのデフォルト値で補う
- controller／service／repository／model に分けて責務を整理する

## はじめに

[前回](https://qiita.com/koji0705/items/f5e59490a093a536c020) までの続きです。  
今回はGoogleCalendarAPIを参考に、カレンダーの取得APIを実装します

## Google Calendarシリーズ

[Google CalendarAPIを学ぶ(Step1:APIの仕様、リソースを理解する)](https://qiita.com/koji0705/items/fa683484a1a15517d45b)  
[GoogleCalendar APIを学ぶ(Step2:TBL作成、データ挿入)](https://qiita.com/koji0705/items/f5e59490a093a536c020)  
[GoogleCalendar APIを学ぶ(Step3:カレンダーの取得APIを実装する)](https://qiita.com/koji0705/items/c9301529bbe6fc28bad5)  
[GoogleCalendar APIを学ぶ(Step4:カレンダーに紐づくイベントの一覧取得APIを実装する)](https://qiita.com/koji0705/items/7ed44caecb15e367ee11)

## 実装箇所

GoogleCalendarAPIのカレンダーの取得を実施していきます！

[![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/599049/06d5747f-e82f-4de7-a6f0-4a84ae832fa0.png)](https://qiita-user-contents.imgix.net/https%3A%2F%2Fqiita-image-store.s3.ap-northeast-1.amazonaws.com%2F0%2F599049%2F06d5747f-e82f-4de7-a6f0-4a84ae832fa0.png?ixlib=rb-4.0.0&auto=format&gif-q=60&q=75&s=3de5aed9a40ab923be39afef6c799240)

## GoogleCalendarAPIの仕様  
→赤枠の部分を実装します。では次にレスポンスを見ていきましょう！

```json
{
  "kind": "calendar#calendarListEntry", // このリソースが calendarListEntry であることを示す固定値
  "etag": "\"p1234567890abcdef\"",      // リソースのバージョン識別子（変更検知用）
  "id": "alice@example.com",            // カレンダーのID（主カレンダーの場合はメールアドレス）

  "summary": "Alice's Work Calendar",   // カレンダーの名称（デフォルト名）
  "description": "カンファレンスや締め切りなどの予定を管理するカレンダー", // 説明文
  "location": "Tokyo Headquarters",     // カレンダーの物理的な場所（任意）
  "timeZone": "Asia/Tokyo",             // このカレンダーのタイムゾーン

  "summaryOverride": "Work",            // 特定ユーザーにとっての表示名（上書き名）
  "colorId": "9",                       // カレンダーの色ID（Googleが定義するプリセット）
  "backgroundColor": "#9fc6e7",         // 背景色（hex値）
  "foregroundColor": "#000000",         // 文字色（hex値）

  "hidden": false,                      // このユーザーにとって非表示かどうか
  "selected": true,                     // UIで選択されているか（表示対象か）

  "accessRole": "owner",                // このユーザーのカレンダーに対する権限（owner, writer, reader など）

  "defaultReminders": [                // デフォルトのリマインダー設定（通知方法と何分前か）
    {
      "method": "popup",               // 通知方法（popup, emailなど）
      "minutes": 10                   // イベントの何分前に通知するか
    },
    {
      "method": "email",
      "minutes": 30
    }
  ],

  "notificationSettings": {            // 通知の種類と方法
    "notifications": [
      {
        "type": "eventCreation",       // 通知トリガーの種類（イベント作成など）
        "method": "email"              // 通知方法（email, sms, popupなど）
      },
      {
        "type": "eventChange",
        "method": "popup"
      }
    ]
  },

  "primary": true,                     // このユーザーにとって主カレンダーか（true は削除不可）
  "deleted": false,                    // 削除済みカレンダーか（差分同期時にのみ true が返る）

  "conferenceProperties": {
    "allowedConferenceSolutionTypes": [ // 許可されている会議ツールの種類
      "hangoutsMeet",                   // Google Meet 会議の許可
      "eventHangout"                    // 従来のHangout
    ]
  }
}
```

→こんな感じですね。さすがGoogleですね！！！レスポンスを見るだけでも汎用性高く、尚且つパフォーマンスを高めているんですね！！十分すぎるので、ちょっと最低限にレスポンスを変更していこうと思います。

```json
{
  "id": 1,            // カレンダーのID
  "summary": "Alice's Work Calendar",   // カレンダーの名称（デフォルト名）
  "description": "カンファレンスや締め切りなどの予定を管理するカレンダー", // 説明文

  "summaryOverride": "Work",            // 特定ユーザーにとっての表示名（上書き名）
  "color": "blue",                       // カレンダーの色

  "hidden": false,                      // このユーザーにとって非表示かどうか
  "selected": true,                     // UIで選択されているか（表示対象か）

  "accessRole": "owner",                // このユーザーのカレンダーに対する権限（owner, writer, reader など）

  "defaultReminders": [                // デフォルトのリマインダー設定（通知方法と何分前か）
    {
      "method": "popup",               // 通知方法（popup, emailなど）
      "minutes": 10                   // イベントの何分前に通知するか
    },
    {
      "method": "email",
      "minutes": 30
    }
  ],

  "notificationSettings": {            // 通知の種類と方法
    "notifications": [
      {
        "type": "eventCreation",       // 通知トリガーの種類（イベント作成など）
        "method": "email"              // 通知方法（email, sms, popupなど）
      },
      {
        "type": "eventChange",
        "method": "popup"
      }
    ]
  },

  "primary": true,                     // このユーザーにとって主カレンダーか（true は削除不可）
  "deleted": false,                    // 削除済みカレンダーか（差分同期時にのみ true が返る）

  "conferenceProperties": {
    "allowedConferenceSolutionTypes": [ // 許可されている会議ツールの種類
      "hangoutsMeet",                   // Google Meet 会議の許可
      "eventHangout"                    // 従来のHangout
    ]
  }
}
```

→いまのテーブル構成では対応できない部分があるので、追加でSQLを流します。

```sql
ALTER TABLE calendar_memberships
ADD COLUMN summary_override varchar,
ADD COLUMN hidden boolean DEFAULT false,
ADD COLUMN selected boolean DEFAULT true,
ADD COLUMN is_primary boolean DEFAULT false,
ADD COLUMN is_deleted boolean DEFAULT false;

ALTER TABLE calendar_memberships DROP COLUMN IF EXISTS summary_override;
```

## 成果物

```shell
GET
http://localhost:8081/calendars?user_id=1

・response
[
  {
    "id": 1,
    "summary": "Alice Work",
    "description": "Work calendar for Alice",
    "color": "blue",
    "visibility": "default",
    "hidden": false,
    "selected": true,
    "accessRole": "owner",
    "defaultReminders": [
      {
        "method": "popup",
        "minutes": 10
      }
    ],
    "notificationSettings": {
      "notifications": null
    },
    "primary": true,
    "deleted": false,
    "conferenceProperties": {
      "allowedConferenceSolutionTypes": [
        "hangoutsMeet",
        "eventHangout"
      ]
    }
  },
  {
    "id": 2,
    "summary": "Bob Personal",
    "description": "Personal calendar for Bob",
    "color": "green",
    "visibility": "private",
    "hidden": false,
    "selected": true,
    "accessRole": "owner",
    "defaultReminders": [
      {
        "method": "popup",
        "minutes": 10
      }
    ],
    "notificationSettings": {
      "notifications": null
    },
    "primary": true,
    "deleted": false,
    "conferenceProperties": {
      "allowedConferenceSolutionTypes": [
        "hangoutsMeet",
        "eventHangout"
      ]
    }
  },
  {
    "id": 3,
    "summary": "Team Project",
    "description": "カンファレンスや締切用",
    "color": "blue",
    "visibility": "default",
    "hidden": false,
    "selected": true,
    "accessRole": "owner",
    "defaultReminders": [
      {
        "method": "popup",
        "minutes": 10
      }
    ],
    "notificationSettings": {
      "notifications": null
    },
    "primary": true,
    "deleted": false,
    "conferenceProperties": {
      "allowedConferenceSolutionTypes": [
        "hangoutsMeet",
        "eventHangout"
      ]
    }
  }
]
```

## ソースコード

```shell
~/develop/google_calendar_sample  (feat/echo_bun)$ tree -I pgdata/
.
├── docker-compose.yml
├── Dockerfile
├── go.mod
├── go.sum
├── init
│   ├── 01_schema.sql
│   ├── 02_seed.sql
│   └── 03_alter_table.sql
├── internal
│   ├── controller
│   │   └── calendar_controller.go
│   ├── model
│   │   ├── calendar.go
│   │   └── user_settings.go
│   ├── repository
│   │   ├── calendar_repository.go
│   │   └── user_settings_repository.go
│   └── service
│       └── calendar_service.go
```

```go
package main

import (
    "database/sql"
    "fmt"
    "log"
    "os"

    "calendar/internal/controller"
    "calendar/internal/repository"
    "calendar/internal/service"

    "github.com/labstack/echo/v4"
    "github.com/uptrace/bun"
    "github.com/uptrace/bun/dialect/pgdialect"
    _ "github.com/uptrace/bun/driver/pgdriver"
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
    db := bun.NewDB(sqldb, pgdialect.New())

    // Test database connection
    if err := db.Ping(); err != nil {
        log.Fatal(err)
    }

    // Initialize repositories
    calendarRepo := repository.NewCalendarRepository(db)
    settingsRepo := repository.NewUserSettingsRepository(db)

    // Initialize service
    calendarService := service.NewCalendarService(calendarRepo, settingsRepo)

    // Initialize controller
    calendarController := controller.NewCalendarController(calendarService)

    // Register routes
    calendarController.RegisterRoutes(e)

    // Start server
    e.Logger.Fatal(e.Start(":8080"))
}
```

```go
package controller

import (
    "net/http"

    "calendar/internal/controller/dto"
    "calendar/internal/model"
    "calendar/internal/service"

    "github.com/labstack/echo/v4"
)

type CalendarController struct {
    service service.CalendarService
}

func NewCalendarController(service service.CalendarService) *CalendarController {
    return &CalendarController{service: service}
}

func (c *CalendarController) RegisterRoutes(e *echo.Echo) {
    e.GET("/calendars", c.ListCalendars)
}

func (c *CalendarController) ListCalendars(ctx echo.Context) error {
    // リクエストパラメータのバインディング
    req := new(dto.ListCalendarsRequest)
    if err := ctx.Bind(req); err != nil {
        return ctx.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request parameters"})
    }

    // バリデーション
    if req.UserID == 0 {
        return ctx.JSON(http.StatusBadRequest, map[string]string{"error": "user_id is required"})
    }

    // サービス層の呼び出し
    calendars, err := c.service.ListCalendars(ctx.Request().Context(), req.UserID)
    if err != nil {
        return ctx.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }

    // レスポンスの変換
    response := make([]dto.CalendarResponse, len(calendars))
    for i, calendar := range calendars {
        response[i] = convertToCalendarResponse(calendar)
    }

    return ctx.JSON(http.StatusOK, response)
}

// convertToCalendarResponse converts a model.Calendar to CalendarResponse
func convertToCalendarResponse(calendar *model.Calendar) dto.CalendarResponse {
    reminders := make([]dto.ReminderResponse, len(calendar.DefaultReminders))
    for i, r := range calendar.DefaultReminders {
        reminders[i] = dto.ReminderResponse{
            Method:  r.Method,
            Minutes: r.Minutes,
        }
    }

    notifications := make([]dto.NotificationResponse, len(calendar.NotificationSettings.Notifications))
    for i, n := range calendar.NotificationSettings.Notifications {
        notifications[i] = dto.NotificationResponse{
            Type:    n.Type,
            Method:  n.Method,
            Enabled: n.Enabled,
        }
    }

    return dto.CalendarResponse{
        ID:                   calendar.ID,
        Summary:              calendar.Summary,
        Description:          calendar.Description,
        Color:                calendar.Color,
        Visibility:           calendar.Visibility,
        SummaryOverride:      calendar.SummaryOverride,
        Hidden:               calendar.Hidden,
        Selected:             calendar.Selected,
        AccessRole:           calendar.AccessRole,
        DefaultReminders:     reminders,
        NotificationSettings: dto.NotificationSettingsResponse{Notifications: notifications},
        Primary:              calendar.Primary,
        Deleted:              calendar.Deleted,
        ConferenceProperties: dto.ConferenceResponse{
            AllowedConferenceSolutionTypes: calendar.ConferenceProperties.AllowedConferenceSolutionTypes,
        },
    }
}
```

```go
package dto

// CalendarResponse represents the response structure for calendar data
type CalendarResponse struct {
    ID                   int64                        \`json:"id"\`
    Summary              string                       \`json:"summary"\`
    Description          string                       \`json:"description"\`
    Color                string                       \`json:"color"\`
    Visibility           string                       \`json:"visibility"\`
    SummaryOverride      string                       \`json:"summaryOverride,omitempty"\`
    Hidden               bool                         \`json:"hidden"\`
    Selected             bool                         \`json:"selected"\`
    AccessRole           string                       \`json:"accessRole"\`
    DefaultReminders     []ReminderResponse           \`json:"defaultReminders"\`
    NotificationSettings NotificationSettingsResponse \`json:"notificationSettings"\`
    Primary              bool                         \`json:"primary"\`
    Deleted              bool                         \`json:"deleted"\`
    ConferenceProperties ConferenceResponse           \`json:"conferenceProperties"\`
}

type ReminderResponse struct {
    Method  string \`json:"method"\`
    Minutes int    \`json:"minutes"\`
}

type NotificationResponse struct {
    Type    string \`json:"type"\`
    Method  string \`json:"method"\`
    Enabled bool   \`json:"enabled"\`
}

type NotificationSettingsResponse struct {
    Notifications []NotificationResponse \`json:"notifications"\`
}

type ConferenceResponse struct {
    AllowedConferenceSolutionTypes []string \`json:"allowedConferenceSolutionTypes"\`
}

// ListCalendarsRequest represents the request parameters for listing calendars
type ListCalendarsRequest struct {
    UserID int64 \`query:"user_id" validate:"required"\`
}
```

```go
package service

import (
    "context"

    "calendar/internal/model"
    "calendar/internal/repository"
)

type CalendarService interface {
    ListCalendars(ctx context.Context, userID int64) ([]*model.Calendar, error)
}

type calendarService struct {
    calendarRepo repository.CalendarRepository
    settingsRepo repository.UserSettingsRepository
}

func NewCalendarService(
    calendarRepo repository.CalendarRepository,
    settingsRepo repository.UserSettingsRepository,
) CalendarService {
    return &calendarService{
        calendarRepo: calendarRepo,
        settingsRepo: settingsRepo,
    }
}

func (s *calendarService) ListCalendars(ctx context.Context, userID int64) ([]*model.Calendar, error) {
    calendars, err := s.calendarRepo.List(ctx)
    if err != nil {
        return nil, err
    }

    // ユーザー設定の取得
    settings, err := s.settingsRepo.GetByUserID(ctx, userID)
    if err != nil {
        return nil, err
    }

    // レスポンスデータの整形
    for _, calendar := range calendars {
        // ユーザー設定からデフォルトのリマインダー設定を取得
        reminders := make([]model.Reminder, 0)
        for method, minutes := range settings.DefaultReminders {
            reminders = append(reminders, model.Reminder{
                Method:  method,
                Minutes: minutes,
            })
        }
        calendar.DefaultReminders = reminders

        // ユーザー設定から通知設定を取得
        calendar.NotificationSettings = settings.NotificationSettings

        // 会議プロパティ
        calendar.ConferenceProperties = model.ConferenceProperties{
            AllowedConferenceSolutionTypes: []string{"hangoutsMeet", "eventHangout"},
        }

        // その他のデフォルト値
        calendar.Hidden = false
        calendar.Selected = true
        calendar.AccessRole = "owner"
        calendar.Primary = true
        calendar.Deleted = false
    }

    return calendars, nil
}
```

```go
package repository

import (
    "context"

    "calendar/internal/model"

    "github.com/uptrace/bun"
)

type CalendarRepository interface {
    List(ctx context.Context) ([]*model.Calendar, error)
}

type calendarRepository struct {
    db *bun.DB
}

func NewCalendarRepository(db *bun.DB) CalendarRepository {
    return &calendarRepository{db: db}
}

func (r *calendarRepository) List(ctx context.Context) ([]*model.Calendar, error) {
    var calendars []*model.Calendar
    err := r.db.NewSelect().Model(&calendars).Scan(ctx)
    return calendars, err
}
```

```go
package repository

import (
    "context"

    "calendar/internal/model"

    "github.com/uptrace/bun"
)

type UserSettingsRepository interface {
    GetByUserID(ctx context.Context, userID int64) (*model.UserSettings, error)
}

type userSettingsRepository struct {
    db *bun.DB
}

func NewUserSettingsRepository(db *bun.DB) UserSettingsRepository {
    return &userSettingsRepository{db: db}
}

func (r *userSettingsRepository) GetByUserID(ctx context.Context, userID int64) (*model.UserSettings, error) {
    settings := new(model.UserSettings)
    err := r.db.NewSelect().
        Model(settings).
        Where("user_id = ?", userID).
        Scan(ctx)
    return settings, err
}
```

```go
package model

import (
    "time"

    "github.com/uptrace/bun"
)

type Reminder struct {
    Method  string \`json:"method"\`
    Minutes int    \`json:"minutes"\`
}

type Notification struct {
    Type    string \`json:"type"\`
    Method  string \`json:"method"\`
    Enabled bool   \`json:"enabled"\`
}

type NotificationSettings struct {
    Notifications []Notification \`json:"notifications"\`
}

type ConferenceProperties struct {
    AllowedConferenceSolutionTypes []string \`json:"allowedConferenceSolutionTypes"\`
}

type Calendar struct {
    bun.BaseModel \`bun:"table:calendars"\`

    ID                   int64                \`bun:"id,pk,autoincrement" json:"id"\`
    OwnerID              int64                \`bun:"owner_id,notnull" json:"-"\`
    Summary              string               \`bun:"summary,notnull" json:"summary"\`
    Description          string               \`bun:"description" json:"description"\`
    Color                string               \`bun:"color" json:"color"\`
    Visibility           string               \`bun:"visibility" json:"visibility"\`
    SummaryOverride      string               \`bun:"-" json:"summaryOverride,omitempty"\`
    Hidden               bool                 \`bun:"-" json:"hidden"\`
    Selected             bool                 \`bun:"-" json:"selected"\`
    AccessRole           string               \`bun:"-" json:"accessRole"\`
    DefaultReminders     []Reminder           \`bun:"-" json:"defaultReminders"\`
    NotificationSettings NotificationSettings \`bun:"-" json:"notificationSettings"\`
    Primary              bool                 \`bun:"-" json:"primary"\`
    Deleted              bool                 \`bun:"-" json:"deleted"\`
    ConferenceProperties ConferenceProperties \`bun:"-" json:"conferenceProperties"\`
    CreatedAt            time.Time            \`bun:"created_at,notnull,default:current_timestamp" json:"-"\`
    UpdatedAt            time.Time            \`bun:"updated_at,notnull,default:current_timestamp" json:"-"\`
}
```

```go
package model

import (
    "time"

    "github.com/uptrace/bun"
)

type UserSettings struct {
    bun.BaseModel \`bun:"table:user_settings"\`

    ID                   int64                \`bun:"id,pk,autoincrement" json:"-"\`
    UserID               int64                \`bun:"user_id,notnull" json:"-"\`
    DefaultReminders     map[string]int       \`bun:"default_reminders,type:jsonb" json:"defaultReminders"\`
    WorkingHours         []byte               \`bun:"working_hours,type:jsonb" json:"-"\`
    ColorTheme           string               \`bun:"color_theme" json:"-"\`
    NotificationSettings NotificationSettings \`bun:"notification_settings,type:jsonb" json:"notificationSettings"\`
    UpdatedAt            time.Time            \`bun:"updated_at,notnull,default:current_timestamp" json:"-"\`
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