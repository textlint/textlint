window.BENCHMARK_DATA = {
  "lastUpdate": 1675779562104,
  "repoUrl": "https://github.com/textlint/textlint",
  "entries": {
    "Benchmark": [
      {
        "commit": {
          "author": {
            "email": "azu@users.noreply.github.com",
            "name": "azu",
            "username": "azu"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "9cadf62e5fb29d3439ce331527d9d2744431e5bd",
          "message": "CI: add benchmark script (#1065)\n\n* CI: default directory\r\n\r\n* CI: push event filter\r\n\r\n* CI: default directory\r\n\r\n* update lock\r\n\r\n* update lock\r\n\r\n* CI: add benchmark CI using hyperfine\r\n\r\n* fix\r\n\r\n* CI: install hyperfine\r\n\r\n* CI: use bench command\r\n\r\n* CI: use bench\r\n\r\n* CI: light\r\n\r\n* CI: use bench\r\n\r\n* CI: $GITHUB_STEP_SUMMARY\r\n\r\n* CI: $GITHUB_STEP_SUMMARY\r\n\r\n* CI: update\r\n\r\n* fix",
          "timestamp": "2023-02-07T23:14:24+09:00",
          "tree_id": "3febe379d738249f0eee900734aa2262b76c9698",
          "url": "https://github.com/textlint/textlint/commit/9cadf62e5fb29d3439ce331527d9d2744431e5bd"
        },
        "date": 1675779561259,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "npm run bench:self",
            "value": 3.8345775498999997,
            "unit": "s",
            "range": "± 0.12359169699999972"
          },
          {
            "name": "npm run bench:technical-writing",
            "value": 12.0851336477,
            "unit": "s",
            "range": "± 0.4181601650000015"
          },
          {
            "name": "npm run bench:jtf-style",
            "value": 1.8575204721999998,
            "unit": "s",
            "range": "± 0.033057845000000086"
          }
        ]
      }
    ]
  }
}