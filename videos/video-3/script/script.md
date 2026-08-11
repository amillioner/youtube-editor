# video-3 — Visual animated X posts at scale

**Target:** ~15:00 · **Spine:** the bottleneck moved · **Voice:** `identity/voice.md` YouTube block
**Register rules honored:** no em dashes in body, exact numbers only, short sentences, fragments as
beats, concession-then-pivot, honest caveat volunteered early, casual imperfect outro, no hype words.

> ⚠️ **Three things to verify before recording** (all marked inline):
> 1. **B3 / B11** — time a real run. There is no timing on file for how long one post takes now.
>    Say the measured number or cut the comparison.
> 2. **B7** — re-run `build_in_public --json`. The 188 tool count is from 2026-07-27 and is stale.
> 3. **B14** — the generic repo has to exist and be public before this goes out.

---

## ACT 1 — THE BOTTLENECK MOVED

### B1 · Cold open: the wall (0:00–0:50)

`[ON SCREEN]` One real rendered diagram, playing full-screen. Let it loop once before he speaks.

> Look at this.
>
> This is one of my X posts. Not the text. This part. The moving picture under it.

`[ON SCREEN]` The same diagram, now inside a real X post card. Text above, video below.

> Every post I publish has one. A custom animation, built for that one idea, in my colors.
>
> And I don't open a design tool. Ever. I don't own one.

`[ON SCREEN]` Grid fills in, tile by tile, until 28 diagrams are on screen, all looping at once.

> Here's every one I've made so far. Twenty eight of them.
>
> Different shapes. Different motion. Same brand.
>
> Nobody has time to make twenty eight animations by hand. I didn't make them by hand.

`[ON SCREEN]` Hold the grid. Cut to talking head.

> So let me show you the whole system. And I want to be honest about which part of it actually
> mattered, because it's not the part you think.

---

### B2 · Writing was never the hard part (0:50–1:35)

`[ON SCREEN]` Talking head. No overlay for the first two lines.

> Everyone says AI writes their posts now. They're right. That part is solved.
>
> But go open X right now.

`[ON SCREEN]` Simulated feed. Six text-only post cards scrolling past, all grey, all the same shape.

> Text. Text. Text. Everyone has the same tool writing the same paragraphs.
>
> Your writing is not competing with bad writing anymore. It's competing with a thousand posts that
> are exactly as good as yours.

`[ON SCREEN]` Same feed, same scroll speed. One card in the middle has a moving diagram in it.

> Now watch where your eye goes.
>
> It goes there. Every time. That's not a trick, that's just how a feed works.
>
> So the picture is the lever. And the picture is the thing almost nobody can do daily.

---

### B3 · The kill: the picture is code (1:35–2:35)

`[ON SCREEN]` Talking head, direct.

> Here's why nobody does it daily. To make one of these by hand you open After Effects, or you
> pay someone, and either way you get one animation. Then tomorrow you need another one.
>
> That math never works. So people give up and post text.

`[ON SCREEN]` Split screen. Left: a real `.tsx` file, scrolling. Right: the animation it produces,
looping. They stay locked together.

> This is what changed for me. The animation is not a video file I made. It's code.
>
> That's a React component on the left. It's the video on the right. Same thing.

`[ON SCREEN]` The word `render` types into a terminal. The mp4 appears.

> Claude writes the code. My machine renders it. It runs locally, on my computer.
>
> Which means the second one costs the same as the first one. And the tenth. And the twenty eighth.

`[ON SCREEN]` Talking head.

> I'll show you exactly how that works later in the video, including the one step that saves me
> the most time. `⚠️ VERIFY — if a measured before/after number exists by record day, it goes here.`

---

### B4 · The turn (2:35–3:20)

`[ON SCREEN]` Talking head. Slow down here. This is the thesis.

> So the animation stopped costing me anything. Great.
>
> And then I hit a wall I did not expect.

`[ON SCREEN]` Full-screen statement. Big type, nothing else.
> **The bottleneck moved.**

> I could produce the picture in minutes. I could produce the words in minutes.
>
> And I would sit there and have nothing to say.

`[ON SCREEN]` Talking head.

> Think about what that means. Once the making is free, the only thing left that limits you is
> knowing what to make.
>
> That's the real problem. That's what the rest of this video is about. The tools are the easy part.

> 🎬 **Retention rehook.** This is the promise for Act 2. Do not soften it.

---

## ACT 2 — THE PATTERN

### B5 · The question that kills you (3:20–3:50)

`[ON SCREEN]` Full-screen statement, in a slightly off style so it reads as the *wrong* idea.
> **"what should I post today?"**

> This is the question. And you have to answer it every single day, forever.
>
> Some days you have a good answer. Most days you don't. So you skip a day. Then two.
>
> That's how every content plan I ever made died. Not from bad posts. From no posts.

`[ON SCREEN]` The statement crosses out. A second line replaces it.
> **"what is today's unit?"**

> I stopped asking the first question. I never ask it now.
>
> Because I have a pattern. Let me show you two of them.

---

### B6 · Pattern one: the book (3:50–5:30)

`[ON SCREEN]` Talking head.

> The first one I call Vibe Engineering Blocks. One post, one block. A block is one small idea
> that makes an app real. Retries. Backups. Idempotency. The stuff nobody teaches you.

`[ON SCREEN]` A book cover / title page, then chapter files listing down the screen.

> And here is where they come from. I wrote a book of them.
>
> Eleven chapters. Three hundred and seventy three blocks.

`[ON SCREEN]` Zoom into one real block entry. Show its three fields: What · Use when · Ask AI.

> Every entry has the same three things. What it is. When you need it. And what to ask AI for.
>
> So the post basically writes its own brief. I don't invent the topic. I pick the next one.

`[ON SCREEN]` The pipeline table from `blocks/PIPELINE.md` — the queue with statuses.

> This is my queue. Planned, ready, scheduled, posted.
>
> And there's a rule in there I like. No two posts in the same week from the same chapter. So it
> never feels like I'm dumping one subject on you for nine days.

`[ON SCREEN]` Talking head.

> I'm on block twenty seven right now. Out of three hundred and seventy three.
>
> I am not going to run out. That's the whole point.

> 📌 **Lead magnet 2 lands here**, inside the teach, not as a bolt-on:
> "The book is free, link is below. Take it for the blocks. But watch what I'm doing with it,
> because that's the part you can copy even if you never read a page of it."

---

### B7 · Pattern two: the commits (5:30–7:00)

`[ON SCREEN]` Talking head.

> Second pattern. Completely different source, same machine.
>
> I'm building a product called ToolerBox, in public. And I post about it as I build it.

`[ON SCREEN]` Terminal. The command types itself and the JSON scrolls back.
```
python manage.py build_in_public --json
```

> This reads my actual repo. What shipped. What broke. What I decided and why.
>
> `⚠️ VERIFY — re-run this before recording. The tool count on file is from 2026-07-27.`

`[ON SCREEN]` A real commit message, then the post that came out of it, side by side.

> So yesterday I fixed a bug where an API key was landing in my logs. That's not a chore. That's
> Tuesday's post.
>
> I didn't think of that topic. I did the work, and the work handed me the topic.

`[ON SCREEN]` Full-screen, two columns filling at once.

> Look at these two side by side. One source is a book I already wrote. The other source is code I
> was going to write anyway.
>
> Neither one of them is me sitting in a chair trying to be interesting.

`[ON SCREEN]` Talking head.

> And that's the thing I actually want you to take from this video.

---

### B8 · What a pattern actually is (7:00–8:35)

`[ON SCREEN]` Full-screen diagram. Three parts appear one at a time as he names them. **This is the
most important shot in the video.** It is what a viewer with none of my code walks away with.

> A content pattern has three parts. That's it.

`[ON SCREEN]` Part 1 lights up.
> **1 · a source that refills itself**

> Something that produces new material without you deciding to produce it. A book. Your commits.
> Your support inbox. Your customer calls. The questions people actually ask you.
>
> If the source needs you to be inspired, it's not a source.

`[ON SCREEN]` Part 2 lights up.
> **2 · a fixed unit**

> One block. One day. One bug. One lesson.
>
> The unit is what makes "what do I post today" a lookup instead of a decision.

`[ON SCREEN]` Part 3 lights up.
> **3 · a locked shape**

> The post always opens the same way and always closes the same way. Mine has a fixed opener and
> a fixed closing paragraph. Same words, every time.
>
> People think that's lazy. It's the opposite. When the shape is locked, all your effort goes into
> the idea instead of into the packaging.

`[ON SCREEN]` All three, connected.

> Source, unit, shape. Get those three and you don't need motivation anymore. You need a queue.
>
> Now go find yours. It's probably something you already do every day and don't think of as content.

`[ON SCREEN]` Talking head.

> Ok. The pattern tells me what to post. It does not tell me how it should sound.

---

### B9 · Your voice, and optionally your brain (8:35–9:30)

`[ON SCREEN]` A `voice.md` file, real, scrolling slowly. Highlight two or three actual rules.

> This is a file. It's my voice, written down as rules.
>
> No em dashes. Never invent a number. Short sentences. Lowercase is fine.
>
> Boring file. But every post goes through it, so nothing comes out sounding like a press release.

`[ON SCREEN]` Two drafts of the same post, before and after the voice file.

> Same idea, before and after. The second one sounds like me because somebody wrote down what "me"
> means.

`[ON SCREEN]` Callback frame to video-1. Small, in a corner. The brain repo.

> And you can go one level further. In my last video I showed my brain, which is my whole knowledge
> base sitting in markdown, connected to AI over MCP.
>
> I wire this to it. So when a post needs a real number or a real story, it pulls it from there
> instead of making it up. That's optional. The voice file alone gets you most of the way.
>
> If you want the brain part, that video is linked below.

---

## ACT 3 — THE MACHINE AT SCALE

### B10 · The two-step that saves the most time (9:30–11:10)

`[ON SCREEN]` Talking head.

> Back to the animation, because there's one decision in here that saves me more time than
> everything else combined.

`[ON SCREEN]` Full-screen. The four axes, named, appearing one by one.

> Every diagram gets designed on four axes first. The metaphor. The shape it lives in. How it moves.
> And the colors.

`[ON SCREEN]` The registry file, with the last three rows highlighted.

> And there's a no-repeat rule. A new diagram can't reuse the shape or the motion of the last three.
>
> That rule is why twenty eight diagrams don't look like one diagram with new labels.

`[ON SCREEN]` A Mermaid sketch. Rough. Grey boxes and arrows. Clearly not finished.

> Now here's the step. Before any code gets written, I get this.
>
> A sketch. Ugly on purpose. Just the boxes, the flow, and a note saying where the motion goes.

`[ON SCREEN]` Talking head.

> I look at it for ten seconds and I say yes or no.
>
> Because if the shape is wrong, I want to know now. Not after it built the whole thing and
> rendered it and I'm watching a finished animation of the wrong idea.

`[ON SCREEN]` The approved sketch, then a hard cut to the same diagram fully rendered.

> Sketch, verify, then build.
>
> That one gate is the difference between this being a toy and this being something I use every day.
> It costs me ten seconds and it saves me the whole build.

---

### B11 · Seven at once (11:10–13:00)

`[ON SCREEN]` Talking head.

> Ok. Once the system is verified, you stop doing one at a time.

`[ON SCREEN]` Simulated Claude Code session. The prompt types in.
```
> plan blocks 21 through 27 as one batch
```

> Watch this. I'm asking for seven posts. Not one.

`[ON SCREEN]` The axis table fills in, row by row. Seven rows. Each with a different shape and motion.

> First it reserves the design for all seven, upfront.
>
> Here's why that matters. The no-repeat rule normally reads the last three posts. But if seven are
> being built at the same time, none of them can see each other. So they'd collide.
>
> Reserve the lanes first, then nothing can crash.

`[ON SCREEN]` Seven build lines tick to done, staggered.

> Then they build.

`[ON SCREEN]` **Hard cut to the real thing.** A grid of the 7 actual post previews, each an X card
with its real rendered animation looping inside it.

> And this is real output. Seven posts. Seven animations. Each one a different shape.
>
> These are not mockups, these are the files sitting in my repo right now.

`[ON SCREEN]` Hasan scrolling through them, checking. Slow this down, do not rush it.

> And I read every one. All seven. That part is not automated and I don't want it automated.
>
> The machine gets me to a draft I can judge in a minute instead of a morning. It does not get to
> publish. That's still me.

> ⚠️ **VERIFY** — if a measured batch time exists by record day, one exact number goes here.
> If not, say nothing about time. The grid is the argument.

---

### B12 · The scheduler (13:00–14:10)

`[ON SCREEN]` Talking head.

> Last piece. Seven posts is only useful if they go out on seven different days.

`[ON SCREEN]` Two lines in a `.env` file. Values blurred.
```
X_AUTH_TOKEN=
X_CT0=
```

> Two cookies. That's the whole setup.
>
> I grab them from my logged-in browser once, and put them in a file.

`[ON SCREEN]` Fake screencast. A browser opens X, composes a post, attaches the video, sets the
schedule time. The cursor moves through it.

> Then a browser opens by itself, types the post, attaches the video, and sets the time.
>
> It's using X's own scheduler. The one built into the site. So there is no API, no third party
> tool, and no bill.
>
> X's API is paid now. This part is free.

`[ON SCREEN]` The composer, parked, with the Schedule button visible and NOT clicked.

> And it stops right here. On purpose.
>
> It does not press the button. It sets everything up and leaves it open, and I press it.
>
> Yes, I could automate that click. I don't want to. `⚠️ keep this line, it is the honest one.`

`[ON SCREEN]` The ledger file, showing the counts.

> Thirty pieces in the ledger right now. Seventeen already posted, thirteen scheduled and waiting.

---

### B13 · The honest part (14:10–14:40)

`[ON SCREEN]` Talking head. Direct. No overlay for the first line.

> Three things before you go build this, because I'd rather tell you now.

`[ON SCREEN]` Simple list, appearing as he says each.

> One. Those two cookies are your login. Anyone who gets that file is you, on X. Keep them out of
> git. Mine are in a file git can't see.
>
> Two. Long posts need X Premium. Normal posts are free, so you can run all of this without paying,
> you just get less room.
>
> Three. Every gate in this thing exists because I got burned skipping it. If you rip out the review
> steps to make it faster, you'll ship something with your name on it that you didn't read.

---

### B14 · Close (14:40–15:20)

`[ON SCREEN]` Talking head.

> So. Bottom line.
>
> The animation is not the hard part anymore. It's code, and the code is free to run again.
>
> The hard part was never writing either.

`[ON SCREEN]` Callback to the B8 three-part diagram, briefly.

> The hard part is having somewhere for the ideas to come from, on a Tuesday, when you don't feel
> like it. That's a pattern. Source, unit, shape.
>
> Mine is a book and my own commits. Yours is something else. Go find it.

`[ON SCREEN]` Two download cards.

> Two things below, both free.
>
> The book. Three hundred and seventy three blocks. Take it as a source for your own pattern, or
> just read it, it's a good book.
>
> And the repo. The whole system, the writer, the animation skill, the scheduler. You put your own
> voice file in it and it becomes yours.
> `⚠️ VERIFY — this repo must be public and the link live before this goes out.`

`[ON SCREEN]` Talking head. Loose. Do not script this tightly.

> That's it. If this was useful hit like, and if you build a pattern out of something weird, tell me
> in the comments, I actually want to see those.
>
> ok bye.

---

## Beat inventory for `/make-tsx`

| Beat | Type | Asset |
|---|---|---|
| B1 | cutaway | real mp4s + 28-tile grid build |
| B2 | cutaway | feed simulation, two passes |
| B3 | overlay | tsx/render split, locked scroll |
| B4 | cutaway | full-screen statement |
| B5 | cutaway | statement swap |
| B6 | cutaway | book → block entry → queue table |
| B7 | overlay | terminal + commit/post pair |
| B8 | cutaway | **the three-part diagram, hero shot** |
| B9 | overlay | voice.md scroll + before/after + video-1 callback |
| B10 | cutaway | four axes + registry + sketch → render |
| B11 | cutaway | simulated session → **real 7-up grid** |
| B12 | cutaway | `/fake-screencast` on X compose |
| B13 | overlay | 3-item list |
| B14 | overlay | callback + two download cards |
