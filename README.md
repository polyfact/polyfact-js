<h1 align="center">🔥 polyfire</h1>

<h4 align="center">
    <a href="https://docs.polyfire.com">Documentation</a> |
    <a href="https://www.polyfire.com/discord">Discord</a> |  <a href="https://beta.polyfire.com">Dashboard</a>
</h4>

<p align="center">⚡ An all-in-one managed backend for AI apps. Build AI apps from the frontend, very fast. 🪶</p>

Why use Polyfire?
* Just code from the frontend, no backend needed
* If you already have backend, less code to write
* Most backend services you'd need in a couple lines of code

We **manage your AI backend** so you don't have to.

![Demo Gif](https://files.readme.io/7442014-demo.gif)

## 🧰 Examples

We have several examples in our [documentation](https://docs.polyfire.com/). But here are two simple ones to get you started

### React

```js
import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { PolyfireProvider, usePolyfire } from "polyfire-js/hooks";

function App() {
  const { auth: { login, status }, models: { generate } } = usePolyfire();
  const [haiku, setHaiku] = useState();

  useEffect(() => {
    if (status === "authenticated") generate("haiku").then(setHaiku);
  }, [status]);

  if (status === "unauthenticated")
    return <button onClick={() => login("github")}>Login with Github</button>;
  else if (status === "loading" || !haiku) return <h1>Loading...</h1>;
  return <h1>{haiku}</h1>;
}

document.body.innerHTML = '<div id="app"></div>';
const root = createRoot(document.getElementById("app"));
root.render(<PolyfireProvider project="your_project_id"><App /></PolyfireProvider>);
```
> Don't forget to change the **your_project_id** by your project ID you will have got on https://beta.polyfire.com

### Vanilla JS

```html
<script src="https://github.com/polyfire-ai/polyfire-js/releases/download/0.2.7/polyfire-min-0.2.7.js"></script>
<script>
	(async () => {
		const polyfire = window.PolyfireClientBuilder({ project: "your_project_id" })
		
		const isAuthenticated = await polyfire.auth.init();
		if (!isAuthenticated) {
		  await polyfire.auth.login("github")
		}
		
		const helloWorld = await polyfire.models.generate("Write me a hello world haiku");
		console.log(helloWorld);
	})()
</script>
```
> Don't forget to change the **your_project_id** by your project ID you will have got on https://beta.polyfire.com

## 🆕 Getting Started

To get an overview of Polyfire follow this **[Basic Usage](https://docs.polyfire.com/docs/basic-usage)** tutorial.

## ✨ Starter Guides

We also made a couple of tutorials you can use to get started with Polyfire:

- **[How to make a clone of ChatGPT](https://docs.polyfire.com/docs/chatgpt-clone)**
- **[New Project & Rate Limits](https://docs.polyfire.com/docs/new-project-rate-limit)**
- **[Adding stripe subscriptions](https://docs.polyfire.com/docs/react-stripe-subscriptions)**
- **[Call Polyfire from React](https://docs.polyfire.com/docs/usepolyfire)**: The usePolyfire hooks lets you use Polyfire and handle authentification without having to deploy any backend
- **[Call Polyfire from other browser environments](https://docs.polyfire.com/docs/javascript)**: The Polyfire Client Object allows you to use Polyfire and handle authentification without having to deploy any backend in any environment

## 📚 Useful References

- **[Generate Simple Text](https://docs.polyfire.com/reference/generate)**: Answer to simple requests as text
- **[Create Chatbots](https://docs.polyfire.com/reference/chats)**: Easily create chatbots
- **[Transcribe](https://docs.polyfire.com/reference/transcribe)**: Transcribe audio files to text
- **[Memory](https://docs.polyfire.com/reference/embeddings)**: Easily create a long-term memory and simplify the use of large amounts of information
- **[GenerateImage](https://docs.polyfire.com/reference/generate-image)**: Generate images with Dall-E

## 🔗 Links

* Website: [polyfire.com](https://www.polyfire.com)
* Documentation: [docs.polyfire.com](https://docs.polyfire.com)
* Dashboard: [beta.polyfire.com](https://beta.polyfire.com)
* Discord: [polyfire.com/discord](https://www.polyfire.com/discord)
* Javascript SDK: [github.com/polyfire-ai/polyfire-js](https://www.github.com/polyfire-ai/polyfire-js)
* Open Source API (your managed backend!): [github.com/polyfire-ai/polyfire-api](https://github.com/polyfire-ai/polyfire-api)

We're open source! Make a good PR to the JS SDK or the API and we'll merge it.
