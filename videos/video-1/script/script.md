# BrainOutside — long-form script

**Target:** ~17:45 · **Spine:** one repo, two heads · **Voice:** `identity/voice.md` YouTube block
**Register rules honored:** no em dashes, exact numbers only, short sentences, fragments as beats,
concession-then-pivot, honest caveat volunteered early, casual imperfect outro.

> ⚠️ **Two things to verify before recording** (both marked inline):
> 1. **B7** — time a real fresh install. "Under 10 minutes" is a design target in `SETUP-DESIGN.md`,
>    not a measurement. Your own accuracy rule bans vague or unverified numbers.
> 2. **B14** — the ladder assets need generating (voice, cloned voice, still avatar, lipsync, humanoid).

---

## ACT 1 — WHY

### B1 · Cold open: the A/B + the cable gag (0:00–0:50)

`[ON SCREEN]` Talking head, direct to camera. No overlay on "look at this."

> Look at this.
>
> Let's say I want to build an AI that auto replies to my X posts. Or my emails.
>
> Here we have the same post, and the same AI model, Claude, writing both of them.

`[ON SCREEN]` Two replies side by side. Neither labeled yet.

> Read the first one. It's generic. And this is what makes AI slop.
>
> Now the second one. Sixteen seconds of downtime, twice a year. Seven hundred dollars a month.
>
> That's my voice. My data. My number, from my server. Something I actually measured and wrote down.
>
> Same model. Same prompt. One difference.
>
> The second one is connected to my brain. Yes!

`[GENERATED VIDEO — 2s]` Hasan runs a cable from the computer into his head. Gets shocked.

> No. Not this way.
>
> Let me show you how, so you can connect your brain to AI. And I think this is the thing that
> changes how you work with AI, completely.
>
> And what you just saw is one basic example of using the brain. What you'll see in this video is
> going to shock you.

`[GENERATED VIDEO — 0.5s]` Same shock clip, hard recut, faster.

> No. Not this way.
>
> So if you're ready to get shocked. emmm. sorry, I mean, if you're ready, let's get started.

> 🎬 **Generated media needed:** the shock clip. Same pipeline as the B14 ladder, so generate them
> together. One clip, cut twice (2s, then 0.5s).

---

### B1.5 · The leash (0:50–1:15)

`[ON SCREEN]` The real `gaps` field from the context pack, highlighted.

> Ok! here's the part I didn't expect.
>
> When I asked for that reply, my brain sent back a warning with it. It said: do not invent a number
> for how much time maintenance takes. That number is not in here.
>
> Read that again. It told the AI what it is not allowed to make up.
>
> Everyone worries that AI will hallucinate in their voice. This does the opposite. 

---

### B2 · The mirror (1:15–1:40)

`[ON SCREEN]` Talking head. No overlay. Let it be a human moment.

> So what is this thing.
>
> Honestly, it's a copy of me. A small one. Text only, for now.
>
> It knows how I write. It knows what I believe. It knows I moved off managed cloud and exactly why.
> I ask it something and it answers like me, which is useful most days and strange on the others.
>
> Two weeks in I disagreed with one of its answers. With myself. haha.. that was a weird morning.

---

### B3 · What it actually is (1:40–3:15)

`[ON SCREEN]` Full-screen TSX. The folder tree, then the two-heads diagram. **This is the shot
everything else in the video calls back to.**

> Here's the whole thing, and it's simpler than you're expecting.
>
> Your brain is a folder. Markdown files. In a git repo.
>
> Who you are. How you write. What you believe. Your projects. Your takes, your stories, the lessons
> you paid for.

> And that folder has two heads.
>
> The first head is local. on your computer.
>
> The second head is online. Afree open source private app you host that puts the same folder behind MCP and a REST
> API. So every AI agent you run, anywhere, can read your mind.
>
> So it is the Same repo. Same files. Same Brain. But Two doors into it.


## ACT 2 — HOW

### B5 · Path A: the local brain (3:35–6:05)

`[ON SCREEN]` VS Code mockup (`remotion/src/lib/vscode`). Real file tree from the template.

> Let's build the local one first. and it is easier than you think!
>
> You go to the template repo, click Use this template, and make it private. That's your brain.
>
> Open it in VS Code. That's the interface. There is no app or UI for now.
>
> Inside there are two skills, and that's the whole thing.
>
> mind-feeder writes. mind-reader reads.

`[ON SCREEN]` Feed flow. Show the proposal, not the write.

> Watch what feeding looks like. I paste in something I said. A video transcript, a post, a doc, or
> just a thought I had in the car.
>
> And here's the part that matters. It does not save it.
>
> It reads it. It decides what is worth keeping. Then it shows me a proposal. with the exact quote it wants to preserve, in my words.
>
> Then it stops. And waits for me.
>
> I approve. Now it writes. and it is One commit.

`[ON SCREEN]` Callout card: **agents propose · you approve**

> Why so strict? Because a brain you don't trust is a brain you stop opening. Let it fill itself with
> junk and you stop reading it. Then it's just a folder.
>
> Reading is the other half. mind-reader pulls what's relevant to the task, not everything it has.
> Ask it for a reply about self hosting, it brings the cost story, the downtime number, and my voice
> rules. It leaves the other thirty notes alone.

---

### B6 · Rehook (6:05–6:15)

> That's the local version. It's finished. You could stop right there and get most of the value.
>
> But it only works on this machine, in this one tool. Let's give it a door and allow it to connect with any app you want, and here where the real magic begins! 
remember the shock [quick fun video again], here it starts! 

---

### B7 · Path B: the online brain (6:15–8:30)

`[ON SCREEN]` Speed-ramped screencast montage. **The whole install is under 60 seconds of screen
time.** Progress bars and waiting get compressed hard. A small `sped up` tag stays in the corner
during every ramp, so nobody thinks it runs this fast in real life.

> First, you need a VPS. Any provider works. I'm picking Contabo.
>
> I will pick the cheapest, it is more than enough.

`[ON SCREEN]` Terminal. Real SSH.

>
> Now you install Coolify. It's one command. connect to the server with SSH, Paste it, and let it run for few seconds.

`[ON SCREEN]` Install output ramping past. Then the Coolify login.

> That's Coolify running on your own server. now you can self host anything you want! and this is how I save more than $700 per month - hoting my projects on my own servers, if you want to learn more how I do this, check the link in decription, but for now it i out of scope, lets contine!

> Click New Project. Then New resource. Public repository. Paste the repo URL.
>
> Set the build pack to Docker Compose. It picks up the compose file by itself.
>
> Go to environment variables. And here you write exactly two things. A Postgres password. And your
> domain.
>
> That's the whole thing.
>
> Click Deploy.

> ⚠️ **ANSWER: public repository, not "Docker Compose empty" — today.**
> `docker-compose.yml:22` is `build: .`, so there is no image to pull. Coolify has to clone the repo
> and build it on the VPS. "Docker Compose empty" (paste the YAML, no repo) only works once an image
> exists to reference.
>
> ⚠️ **So "wait for few seconds" is wrong here.** A Django image building on the cheapest Contabo box
> is minutes, not seconds. Either say the real number over a speed ramp, or see below.
>
> 💡 **This gets better if you ship the GHCR image first.** `SETUP-DESIGN.md` already plans prebuilt
> multi-arch images ("users pull, they don't build"), and it's item 6 in your own build order, marked
> *before any public link exists*. There is no `.github/workflows/` yet, so it is not built. If it
> ships before you record, this beat changes to: **New resource → Docker Compose → paste the compose
> → Deploy**, no repo, no build, and the wait drops from a build to a pull. Shorter on camera, fewer
> steps, and a genuinely faster number to quote. Your call whether that is worth doing before the
> launch.

`[ON SCREEN]` Build log ramping. Then a browser opening the domain.

> Now open your domain in the browser.
>
> And you don't get a login box. You get a wizard.

`[ON SCREEN]` Six steps, one card each, fast.

> One. Create your account.
>
> Two. Create your brain. The button opens the template repo, give it a name, private, create.
>
> Three. Let the server read it. It generated an SSH key on boot. You paste the public half into
> GitHub. Then hit Verify, and it does a real clone.

>
> Four. Now let it write back.
>
> The key you just added is read only. But when you approve something, the server has to push it to
> GitHub. So it needs permission to write.

`[ON SCREEN]` GitHub, screencast. The deep link the wizard gives you lands here.

> The app gives you a link straight to the token page. Click it.
>
> Go to fine grained tokens. Generate new token.
>
> Repository access. Only select repositories. And you pick your brain. Just that one, nothing else.
>
> Then permissions. Contents. Read and write. That's the only one you need.
>
> Generate. Copy it now, because GitHub shows it to you once.

`[ON SCREEN]` Back in the wizard. Paste. Green check.

> Paste it back here, and you're done.
>
> And you can skip this if you want. Without it, approvals still work, they just stay on the server
> and the dashboard tells you your brain is ahead of GitHub.
>
> Five. Connect Claude. An API key, or your subscription token.
>
> Six. Build. Thats it!

`[ON SCREEN]` The dashboard, rings drawing themselves.

> And that's it. Your brain is online.

> ⚠️ **VERIFY BEFORE RECORDING:** time the real run and say the real number.
> Placeholder line: *"Start to finish, that was [N] minutes."*
>
> ⚠️ **Killed the old line "No terminal. Not once."** It was true of the wizard-only flow in
> `SETUP-DESIGN.md`, but this version SSHes into a VPS and installs Coolify on camera. Saying it now
> would contradict what the viewer watched 40 seconds earlier.

> I went fast here I know, becuase I want to focus on what is coming next, the shocking part! fotr that! I published a full step by 
> step guide for the installation. It's free, and the link is in the description.
>
> If you want to follow along and build it, use that. If you just want to see what it does, stay
> with me, because the next part is the reason I built it.

---

### B8 · They compose (9:05–9:55) ← the money shot

`[ON SCREEN]` The best diagram in the video. Laptop and server, the folder between them, arrows
firing in sequence as narrated.

> Now the part I actually love.
>
> Watch what happens when I add something from the laptop.
>
> I feed a note locally. I approve it. It commits. I push.
>
> GitHub fires a webhook. The server pulls. It reindexes. The note is live on the online brain


> Now the other direction.
>
> lets say I feededmy online brain  a thought from claude web using the MCP [I will record a 5 second me talking to claude on my phone a thought]. It lands here, in the queue. I approve it in the
> browser. The server commits it.

> Then I pull from the local, and it's on my computer!.
>
> Same repo, both directions. Nothing is syncing, because there's nothing to sync. It's one folder
> with two doors.

---

### B9 · Dashboard, fast (9:55–11:35)

`[ON SCREEN]` `/fake-screencast`, 6 pages, ~15s each. Cursor moves, hard cuts between pages.

> Now lets go throught a Quick tour, then we get to the exciting part.
>
> The dashboard. The rings are your brain by kind. Identity, projects, knowledge.
>
> The browser. Every note, filterable. This is just the markdown, rendered.
>
> The graph. What links to what. My cost story and my downtime take both point at self hosting, so
> when I ask about self hosting, both show up.
>
> The queue. Everything an agent wants to write, waiting on me. Nothing gets in behind my back.
>
> Consumers. Who is reading my brain, and at which tier.
>
> And chat. This is me, talking to me! and here things become to be strange!

---

### B10 · MCP from Claude (11:35–13:05)

`[ON SCREEN]` Terminal / Claude mockup with the real transcript from this session.

>Now the main reason behind building this project.
>
> I connect it once, as an MCP server. And now Claude can read my mind. Literally, that's the
> feature.
>
> Watch. get-index. That's everything my brain holds, one line each.
>
> assemble-context. This is the good one. I hand it a task, and it goes and builds a pack for that
> exact task. The right notes, the real quotes, and the gaps.
>
> That reply from the beginning of the video? That's the call that made it.

`[ON SCREEN]` Split: same question, private tier vs public tier, different answers.

> And here's the part that matters if you're going to put this online.
>
> Same question. Different tier.
>
> I get everything. A public chatbot gets this much. My voice file is marked agents only, so it never
> leaves the server.
>
> That isn't filtered in the prompt. It's filtered on the server, before the text exists.

---

## ACT 3 — SO WHAT

### B11 · Content creation (13:05–14:35)

`[ON SCREEN]` Callback to the cold open, now explained. Then a fresh X post, live.

> Okay. Back to where we started.
>
> This is what I actually use it for, every day.
>
> A reply. A post. A newsletter. A video description. Anything I have to write as me.
>
> And when it doesn't know something, it says so instead of filling the gap.
>
> I still edit. It's a draft, not a ghostwriter. But it starts from me instead of from nothing.

---

### B12 · Writers, courses, anyone building (14:35–15:20)

> But! This is not only for content.
>
> If you're writing a book, your brain holds your positions and your examples across four hundred
> pages, so chapter nine doesn't contradict chapter two.
>
> If you're building a course, it holds how you explain things. The analogies that work.
>
> If you're building anything with AI, it holds the decisions you already made, so you stop
> re-explaining your own project every single session.

---

### B13 · The rule (15:20–15:50)

`[ON SCREEN]` Full-screen card. **Read always. Feed always.**

> So here's the rule, and it's the whole point of this video.
>
> Attach it to everything.
>
> Every agent, every session, every tool you work in. Read always, feed always.
>
> Read before it writes, so it has you. Feed after you learn something, so it keeps you.
>
> That's the loop. Run it for a year and you have something nobody can copy, because nobody else
> has your last year.

---

### B14 · The ladder (15:50–17:05)

`[ON SCREEN]` Persistent corner tag for the whole segment: **SIMULATED · roadmap, not shipped**

> Last thing. and here, take a breath or drink some water! 
>
> Today this brain, it's text. It writes like me.

`[L1 · generic TTS]`
> Add a voice. Any voice.
>
> Great. My brain can now talk! 

`[L2 · cloned voice]`
> Now my AI voice clone
>
> ...ok. and you can call my brain by phone and voice chat with it with my own voice!

`[L3 · still avatar]`
> Add a photo my face! with audio waves! and here we are!

`[L4 · lipsynced real avatar]`
> Now my face. Moving. Saying things I never said, that I would have said.

`[L5 · humanoid]`
> And then, eventually, this.
>
> Same voice. Same takes. Same opinions, same beliefs!
>
 that me with no soal! looks scary ha! 

`[ON SCREEN]` Tag enlarges, then the folder diagram from B3 returns underneath all five levels.

> None of that is built. Levels one to five are simulated. I generated all of it for this video, and
> I put it on the screen so nobody quotes me wrong.
>
> But the folder underneath is real, and it's the same folder in all five. That's the whole point.
> You build the brain once. Everything after that is just a new face on it.

---

### B15 · Close (17:05–17:45)

> Both repos are free. Links below, with the full written guide.
>
> I think everyone should have one of these. Not because it's clever.
>
> Because the models are the same for all of us now. The tools are free and the models are cheap.
> The only thing left that isn't commodity is you.
>
> And right now that's sitting in your head, where nothing can read it.
>
> Put it outside. and maybe in the near future create your Humanoid Clone! 
>
> hit like if this was useful, and dont forget to star on Github! and if you have any suggestions, i read every comment! see you in the upcoming videos
