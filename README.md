# Office Hours

**An adaptive AI learning assistant that explains any article at your reading level.**

Office Hours is a sidebar that sits next to the page you're reading. Highlight a confusing sentence, pick who you want it explained for (a 5th grader, a high schooler, a college student, or an expert), and get a clear, structured explanation powered by Claude.

This repo is a working prototype. It shows Office Hours running alongside a real article, IBM Think's ["What is blockchain?"](https://www.ibm.com/think/topics/blockchain).

**[Try the live demo →](https://office-hours-site.vercel.app/))**

<!-- Add a screenshot or GIF here: drag an image into a GitHub issue or edit window to get a link, then paste it below -->
<!-- ![Office Hours in action](docs/screenshot.png) -->

---

## Why I built this

Dense information is everywhere: tax forms, benefits portals, technical articles, policy documents. Most people don't need *less* information. They need the same information explained in a way that fits where they are.

Office Hours takes inspiration from the contextual help panels in tools like TurboTax and FreeTaxUSA, and asks: what if that kind of help existed on every page, and adapted to the reader?

---

## Features

### Four reading levels
Switch levels at any time. Office Hours automatically re-explains its last answer at the new level.

| Level | Audience | Style |
|---|---|---|
| **Child** | Grades 1–5 | Very simple language, everyday analogies (toys, food, sports, animals) |
| **Teen** | Grades 9–12 | Simplified, with technical words introduced and explained |
| **College** | Undergraduate | Academic but accessible, keeps the nuance |
| **Default** | General / expert | Full complexity and domain terminology |

### Highlight to ask
Select any text in the article. It appears in the sidebar, and your next question is about that passage.

### Quick actions
One-tap prompts above the chat box: **Simplify**, **Analogy**, **Step-by-step**, and **Define**. They work on your highlighted text, or on the whole article if nothing is highlighted.

### Structured answers
Every response is broken into short headed sections, so it's easy to skim.

### Notes
- Save any highlight as a numbered note
- Add your own thoughts, or save an Office Hours answer straight into a note
- Notes are marked in the article with a numbered tag; click one to jump to it
- Download all your notes as a PDF

### Explain differently
Didn't click? Ask for a fresh take with a different approach or example.

---

## Design

The interface is styled like a stack of typewritten notecards: calm, editorial, and easy to read.

**Typography**
- Captions: PT Sans Caption, uppercase, 8% letter spacing
- Headings: Inter
- Body: PT Mono

**Color by reading level**

| Level | Background | Text |
|---|---|---|
| Child | `#F5B5AC` | `#1E1E1E` |
| Teen | `#F9D75B` | `#1E1E1E` |
| College | `#F29009` | `#1E1E1E` |
| Default | `#1C2E22` | `#F7EEE5` |

**Other details**
- Panel surfaces use a warm paper tone, `#F7EEE5`, with a 4px accent stroke in the current level's color
- The chat feed sits on a subtle grid, like graph paper
- Each answer is a notepad page, with three punch holes and dashed ruler lines
- Active highlights use `#FFEE00`; saved notes use `#A1D8FF`
- Icons in user messages come from Google's Material Symbols

---

## How it works

```
Browser (React app)  ──►  /api/chat (Vercel serverless function)  ──►  Claude API
                               holds the API key safely
```

The website never sees your Anthropic API key. Questions go to a small server function on Vercel, which adds the key and forwards the request to Claude. The key is stored as a Vercel environment variable, never in the code.

---

## Tech stack

- [React](https://react.dev) + [Vite](https://vitejs.dev)
- [Lucide](https://lucide.dev) and [Material Symbols](https://fonts.google.com/icons) for icons
- [Vercel](https://vercel.com) for hosting and the serverless API function
- [Claude](https://www.anthropic.com/api) by Anthropic for explanations

---

## Project structure

```
office-hours-site/
├── api/
│   └── chat.js        # Serverless function that talks to Claude
├── src/
│   ├── App.jsx        # The Office Hours app (article + sidebar)
│   └── main.jsx       # Starts the app
├── index.html
├── package.json
├── vite.config.js
└── .gitignore
```

---

## Run it yourself

### What you'll need
- [Node.js](https://nodejs.org) (LTS version)
- An [Anthropic API key](https://console.anthropic.com)
- A free [Vercel](https://vercel.com) account

### Preview locally

```bash
git clone https://github.com/YOUR-USERNAME/office-hours-site.git
cd office-hours-site
npm install
npm run dev
```

Then open the `localhost` link shown in the terminal.

> **Note:** `npm run dev` shows the full interface, but chat replies won't work, because the `/api/chat` function only runs on Vercel. To test chat locally, install the [Vercel CLI](https://vercel.com/docs/cli), run `vercel link`, add your key with `vercel env add ANTHROPIC_API_KEY`, and start the app with `vercel dev`.

### Deploy your own copy

1. Fork this repo to your GitHub account
2. In Vercel, click **Add New → Project** and import your fork
3. Under **Environment Variables**, add:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your Anthropic API key
4. Click **Deploy**

Every push to `main` redeploys the site automatically.

### A note on cost

Each question costs a small amount of Anthropic API credit, since the article and recent chat history are sent with every request. Before sharing your deployment publicly, set a monthly spend limit in the Anthropic Console and keep auto-reload turned off.

---

## Known limitations

- **One article only.** The prototype is built around a single sample page. The goal is a Chrome extension that works on any website.
- **Notes aren't saved.** Notes live in the browser session and disappear on refresh. Download them as a PDF to keep them.
- **No rate limiting yet.** The API function doesn't limit how many requests a visitor can make, and it accepts instructions from the browser. Locking the instructions to the server and adding rate limits is next on the list.

---

## Roadmap

- [ ] Chrome extension that works on any webpage
- [ ] Server-side prompts and rate limiting
- [ ] Notes that persist between visits
- [ ] Quiz mode to check understanding
- [ ] Voice explanations
- [ ] Multi-language support
- [ ] Teacher / parent mode

---

## Credits

Designed and built by **Anjali**.

Sample article: ["What is blockchain?"](https://www.ibm.com/think/topics/blockchain) by Stephanie Susnjara and Ian Smalley, IBM Think. Used here for demonstration only; all article content belongs to IBM.

Explanations powered by [Claude](https://www.anthropic.com).
