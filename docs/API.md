# 本机数据接口

默认服务器 `http://127.0.0.1:9860`，端口以控制台设置页为准。程序运行期间可访问。只允许本机请求，不允许跨源网页控制。

## 认证

每次启动生成随机令牌。打开「输出与设置」→「显示本次启动的接口令牌」。所有写请求使用 `X-Apex-Token` 请求头、`Content-Type: application/json`。本机程序也可通过 `GET /api/bootstrap` 读取本次令牌；不要把令牌放在直播画面或发给不受信任的页面。

## 推送计时

`POST /api/timing`

```json
{
  "source": "官方计时适配器",
  "rows": [
    {"number":"7","position":1,"laps":19,"bestMs":104326,"lastMs":105104,"gap":"LEADER","interval":"—","status":"RUN","tyre":"MEDIUM","s1":32010,"s2":38701,"s3":34393},
    {"number":"22","position":2,"laps":19,"gap":"+2.471","interval":"+2.471","status":"PIT","pitEnteredAt":1790000000000,"pitCount":1}
  ]
}
```

- `number` 匹配预先导入的车号，也可用内部 `id`。车号按字符串精确匹配。
- 数据写入当前场次，最多 200 行；字段均可局部更新。没有传入的字段保持原值。
- 排名与圈数为非负数；所有圈速、分段、维修区经过时间为毫秒。`pitEnteredAt` 与 `stintStartedAt` 为 Unix 毫秒时间戳；停止计时把其设为 0。
- `status` 支持 RUN、PIT、OUT、DNF、DNS、DSQ；`tyre` 支持 SOFT、MEDIUM、HARD、INTER、WET、UNKNOWN。
- 其他可写字段：`pitCount`、`pitElapsed`、`penalty`。
- 不自动计算 GAP / INTERVAL / position / laps。供应商的领先者排名、套圈格式、退赛判定由适配器映射。
- 写入后停止模拟，更新来源与最后接收时间。验证失败 HTTP 400，整批不提交；令牌错误 HTTP 403。

PowerShell 示例：

```powershell
$origin = 'http://127.0.0.1:9860'
$boot = Invoke-RestMethod "$origin/api/bootstrap"
$body = @{ source='计时适配器'; rows=@(@{number='7';position=1;laps=20;bestMs=104000;gap='LEADER';status='RUN'}) } | ConvertTo-Json -Depth 5
Invoke-RestMethod "$origin/api/timing" -Method Post -ContentType 'application/json' -Headers @{'X-Apex-Token'=$boot.token} -Body ([System.Text.Encoding]::UTF8.GetBytes($body))
```

## 读取与订阅

| 地址 | 用途 |
|---|---|
| `GET /api/state` | 当前完整状态、版本、服务端时间，不含控制令牌 |
| `GET /events?channel=program` | SSE 状态快照流，包含 `serverNow`，断线可重新连接 |
| `GET /api/project` | 工程快照，比赛时钟折算为当前值并暂停 |

客户端应把 `serverNow - Date.now()` 作为时钟偏移量；不应通过反复递减本地计数模拟真实时钟。SSE 每次操作发完整状态，适合本机字幕，未针对大规模远程订阅优化。

## 控制动作

`POST /api/action`，同样要求令牌。常用请求：

```json
{"type":"layer","id":"tower","patch":{"enabled":true,"category":"PRO","rows":12}}
```
```json
{"type":"take"}
```
```json
{"type":"takeLayer","id":"fastest"}
```
```json
{"type":"clear"}
```
```json
{"type":"session","patch":{"laps":20,"flag":"SC"}}
```
```json
{"type":"timer","command":"set","mode":"down","seconds":3600}
```
```json
{"type":"timer","command":"start"}
```

可选 `expectedRevision` 用于乐观并发控制，版本不匹配返回 409。多请求按服务端接受顺序执行。

## CSV 格式

UTF-8，支持 BOM、带引号字段、逗号、换行和双引号转义。推荐从软件导出后编辑再导入。没有 CSV 数据行、重复名单车号、字段数量错误都会拒绝。

名单：

```csv
number,name,english,short,nation,team,category,car,color,grid,points
99,示例车手,EXAMPLE DRIVER,EXA,CHN,Example Racing,PRO,GT3,#46e2ce,1,0
```

计时：

```csv
number,position,laps,bestMs,lastMs,gap,interval,status,tyre,s1,s2,s3,penalty
7,1,19,104326,105104,LEADER,—,RUN,MEDIUM,32010,38701,34393,
22,2,19,104650,105770,+2.471,+2.471,RUN,HARD,32310,38901,34559,
```

模板 ID：tower, driver, battle, pit, grid, results, top3, fastest, flag, penalty, track, weather, entries, team, clock, topbar, logo, corner, replay, startReplay, formation, highlights, subtitle, ticker, sectors, stint, championship, schedule。
