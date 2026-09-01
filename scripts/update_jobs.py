#!/usr/bin/env python3
"""Fetch this week's USA university/college job openings and refresh README.md.

Data source: Adzuna Jobs API (https://developer.adzuna.com/), free tier.
Requires the ADZUNA_APP_ID and ADZUNA_APP_KEY environment variables
(set as GitHub repository secrets). If they are missing or the API call
fails, the script leaves README.md untouched and exits successfully so
the scheduled workflow doesn't show as failing.
"""

import datetime
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

README_PATH = os.path.join(os.path.dirname(__file__), "..", "README.md")
START_MARKER = "<!-- UNIVERSITY-JOBS:START -->"
END_MARKER = "<!-- UNIVERSITY-JOBS:END -->"

API_URL = "https://api.adzuna.com/v1/api/jobs/us/search/1"
MAX_RESULTS = 15
MAX_DAYS_OLD = 7
SEARCH_TERMS = "university college faculty professor"


def fetch_jobs(app_id: str, app_key: str) -> list:
    params = {
        "app_id": app_id,
        "app_key": app_key,
        "results_per_page": str(MAX_RESULTS),
        "what_or": SEARCH_TERMS,
        "max_days_old": str(MAX_DAYS_OLD),
        "sort_by": "date",
        "content-type": "application/json",
    }
    url = f"{API_URL}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"User-Agent": "usa-university-openings-bot"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.load(resp)
    return data.get("results", [])


def format_jobs_table(jobs: list) -> str:
    if not jobs:
        return "_No new university openings found in the last 7 days. Check back tomorrow!_"

    rows = [
        "| Position | Institution | Location | Posted |",
        "| --- | --- | --- | --- |",
    ]
    for job in jobs:
        title = (job.get("title") or "Untitled position").strip()
        title = re.sub(r"\s+", " ", title)
        link = job.get("redirect_url", "#")
        company = (job.get("company", {}) or {}).get("display_name", "Unknown institution")
        location = (job.get("location", {}) or {}).get("display_name", "USA")
        created = job.get("created", "")[:10]
        rows.append(f"| [{title}]({link}) | {company} | {location} | {created} |")

    return "\n".join(rows)


def build_section(jobs: list) -> str:
    today = datetime.date.today().isoformat()
    table = format_jobs_table(jobs)
    return (
        f"{START_MARKER}\n"
        f"_Last updated: {today} · Source: [Adzuna](https://www.adzuna.com/) · "
        f"showing openings posted in the last {MAX_DAYS_OLD} days_\n\n"
        f"{table}\n"
        f"{END_MARKER}"
    )


def update_readme(section: str) -> bool:
    with open(README_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    pattern = re.compile(
        re.escape(START_MARKER) + r".*?" + re.escape(END_MARKER), re.DOTALL
    )
    if not pattern.search(content):
        print("Marker block not found in README.md; skipping update.", file=sys.stderr)
        return False

    new_content = pattern.sub(section, content, count=1)
    if new_content == content:
        return False

    with open(README_PATH, "w", encoding="utf-8") as f:
        f.write(new_content)
    return True


def main() -> int:
    app_id = os.environ.get("ADZUNA_APP_ID")
    app_key = os.environ.get("ADZUNA_APP_KEY")

    if not app_id or not app_key:
        print(
            "ADZUNA_APP_ID / ADZUNA_APP_KEY not set — skipping job update. "
            "Get free credentials at https://developer.adzuna.com/ and add them "
            "as repository secrets to enable daily updates.",
            file=sys.stderr,
        )
        return 0

    try:
        jobs = fetch_jobs(app_id, app_key)
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, json.JSONDecodeError) as exc:
        print(f"Failed to fetch jobs from Adzuna: {exc}", file=sys.stderr)
        return 0

    section = build_section(jobs)
    changed = update_readme(section)
    print("README.md updated." if changed else "No changes to README.md.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
