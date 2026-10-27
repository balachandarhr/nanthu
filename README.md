# Nanthu – your AI friend (mobile app)

Nanthu is a portrait phone app. She talks to you, answers your questions and chats like a close friend from Kochi, with video actions: wave, namaste, dance, laugh, clap, think, sad and surprised. It is a static Progressive Web App (PWA): just HTML, CSS and JS plus ten short videos (about 10 MB). It has no server of its own.

## Files
index.html, style.css, app.js, manifest.json, sw.js (offline cache), icons/, videos/

## Try it on a computer
    cd nanthu-mobile && python3 -m http.server 8000
Then open http://localhost:8000 (in Chrome DevTools, turn on device mode for a phone view).

## Put it online (needed to install it on a phone)
The service worker, the install prompt and the microphone all need **HTTPS**. Pick either option:
- **Netlify (easiest):** open https://app.netlify.com/drop and drag this folder onto it. You get an https://….netlify.app link.
- **GitHub Pages:** create a repo, upload these files to the root, then go to Settings → Pages → "Deploy from a branch" (main, / root). Your URL is https://USER.github.io/REPO/.
All paths are relative, so the app works from a sub-folder.
Note: anyone who has the URL can open the app, but each person needs their own AI key.

## Install on your phone
- **Android (Chrome):** open the link, then tap menu ⋮ → "Install app" (or "Add to Home screen").
- **iPhone (Safari only):** open the link, then tap Share → "Add to Home Screen".
Open it and tap **"Tap to start talking to Nanthu"**. This tap turns on her voice and video.

## Give her a brain (free)
1. Go to https://aistudio.google.com/apikey and sign in with Google.
2. Tap **Create API key** and copy it.
3. Paste it into the setup card and tap **Save & start**.
In ⚙ Settings you can also choose any OpenAI-compatible provider, a free keyless option (Pollinations), or Chrome's built-in AI (desktop Chrome only).
Without a key she still does simple things: dance, wave, tell a joke, the time, and remembering your name.

## Privacy
- Your key is stored only in this browser's localStorage. It is sent only to the AI provider you choose.
- Chat history and a short list of facts about you (name, likes) are kept on the phone so she remembers you. To delete them, use "Clear chat" in the chat drawer, or Settings → "Forget me".

## Limitations
- **Voice input on iPhone:** Safari's speech recognition is limited and often doesn't work in home-screen apps. Use the 🎤 dictation key on the iPhone keyboard instead. On Android Chrome the mic and hands-free mode work, but there is a short beep each time the mic reopens, and voice needs internet.
- **Voice output:** she uses the phone's built-in text-to-speech voice, so quality varies by device (Settings → voice).
- **Screen lock:** iOS may ignore the portrait lock. iOS may also clear the app's storage if you don't use it for a few weeks.
- **Free AI keys** have rate limits. If she says "too many questions", wait a minute.
- She can't browse the web, so very recent news may be out of date.
- Her videos are AI-generated.
