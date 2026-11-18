# WMI Website Progress

Public, no-sign-in progress page for the World Mission Initiative website rebuild.

**Live URL (no login):** https://raw.githack.com/firesnatchers316/wmi-progress/main/index.html

The source of truth is `index.html` in this repository.

## Update the page

1. Edit the `STATUS` object at the top of the script in `index.html` (updated time, percentages, preview date, page statuses, finished and waiting lists).
2. Push `index.html` to the `main` branch of `firesnatchers316/wmi-progress`.
3. Wait about one minute, then refresh the live URL. raw.githack caches the page for 60 seconds.

## GitHub Pages

A GitHub Pages workflow is already in `.github/workflows/pages.yml`, but Pages cannot be turned on by the Actions token (`Resource not accessible by integration`). Enable it once in the repo:

**Settings → Pages → Build and deployment → Source: GitHub Actions**

Then re-run the **Deploy GitHub Pages** workflow, or push any commit. After that, the nicer URL will be:

https://firesnatchers316.github.io/wmi-progress/
