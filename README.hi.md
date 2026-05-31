# OpenEvidence MCP (अनौपचारिक)

OpenEvidence MCP एक अनौपचारिक (unofficial) मॉडल कॉन्टेक्स्ट प्रोटोकॉल (Model Context Protocol) सर्वर है जो आपके स्वयं के प्रमाणित ब्राउज़र सत्र (authenticated browser session) के माध्यम से OpenEvidence को Codex, Claude Code, Claude Desktop, Cursor, Cline, Continue और अन्य MCP-संगत (MCP-compatible) क्लाइंट्स से जोड़ता है।

[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-2d72d9)](https://www.apache.org/licenses/LICENSE-2.0)
[![Node.js 20+](https://img.shields.io/badge/node-%3E%3D20-339933)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178c6)](https://www.typescriptlang.org/)
[![MCP SDK](https://img.shields.io/badge/MCP%20SDK-1.26.0-1d9a5a)](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
[![Playwright](https://img.shields.io/badge/Playwright-1.58.2-4f46e5)](https://playwright.dev/)

> [!IMPORTANT]
> यह परियोजना अनौपचारिक है और OpenEvidence से संबद्ध (affiliated) नहीं है। यह चिकित्सा सलाह (medical advice) प्रदान नहीं करती है, एक्सेस नियंत्रणों (access controls) को बायपास नहीं करती है, और इसे केवल लागू शर्तों, गोपनीयता नियमों और नैदानिक प्रशासन (clinical governance) आवश्यकताओं के अनुपालन में आपके अपने OpenEvidence खाते के साथ उपयोग किया जाना चाहिए।

Translations: [English](README.md) | [Русский](README.ru.md) | [Español](README.es.md) | [简体中文](README.zh-Hans.md) | [繁體中文（台灣）](README.zh-Hant-TW.md) | [한국어](README.ko.md)

## एजेंट ऑनबोर्डिंग और इंस्टॉलेशन (Agent Onboarding & Installation)

क्या आप Codex, Claude Code, या किसी अन्य स्थानीय (local) AI कोडिंग एजेंट का उपयोग कर रहे हैं? इस प्रॉम्प्ट को एजेंट में कॉपी करें और उसे सेटअप, MCP कॉन्फ़िगरेशन, लॉगिन मार्गदर्शन और सत्यापन (verification) संभालने दें।

```text
Look into this repository: https://github.com/bakhtiersizhaev/openevidence-mcp

Install OpenEvidence MCP in my local AI CLI / agentic MCP setup. Add it as an MCP server for the CLI or app I am using. Follow the repository README and the agent install playbook at docs/AGENT_INSTALL_PROMPT.md.

Verify local prerequisites: Node.js 20+, npm, git, and Playwright Chromium. Clone or update the repo, run npm ci, npx playwright install chromium, npm run build, and npm run check.

Configure the MCP server with command "node" and args pointing to the absolute path of dist/server.js. Keep the server local and do not expose it over a public network.

Guide me through OpenEvidence login with my own account. First try npm run login. If Google says "This browser or app may not be secure", stop that flow and run npm run login:browser instead. I will complete login in the opened browser window and then press Enter in the terminal.

Do not ask for or expose my password, cookies, tokens, storage-state files, screenshots with private account data, patient-identifiable information, or account identifiers. Do not bypass OpenEvidence, Google, institutional, regional, or account access controls.

After login, run npm run smoke. If smoke returns ok: true and authenticated: true, show me the final MCP config and tell me to restart my AI agent / MCP client so the OpenEvidence tools become available.
```

विस्तृत एजेंट रनबुक (Longer agent runbook): [`docs/AGENT_INSTALL_PROMPT.md`](docs/AGENT_INSTALL_PROMPT.md)।

## यह क्या करता है (What it does)

OpenEvidence MCP एक स्थानीय (local) stdio MCP server चलाता है जो MCP clients को निम्नलिखित कार्यों के लिए आपके मौजूदा OpenEvidence browser session का उपयोग करने देता है:

- यह जांचना कि सहेजा गया सत्र (saved session) प्रमाणित है या नहीं;
- आपके OpenEvidence प्रश्नों/लेखों के इतिहास को सूचीबद्ध करना;
- ID द्वारा संपूर्ण लेख (article payload) प्राप्त करना;
- OpenEvidence शोध प्रश्न पूछना और वैकल्पिक रूप से पूरा होने की प्रतीक्षा करना;
- किसी मौजूदा OpenEvidence लेख को पूरा होने तक पोल (poll) करना।

कोई आधिकारिक OpenEvidence API टोकन की आवश्यकता नहीं है।

## यह क्या नहीं करता (What it does NOT do)

- यह OpenEvidence से संबद्ध, समर्थित या अनुमोदित नहीं है।
- यह चिकित्सा सलाह प्रदान नहीं करता है या नैदानिक निर्णय (clinical judgment) को प्रतिस्थापित नहीं करता है।
- यह क्रेडेंशियल (credentials) एकत्र नहीं करता है।
- यह प्रमाणीकरण, पेवॉल (paywalls), या एक्सेस नियंत्रणों को बायपास नहीं करता है।
- यह आपके ब्राउज़र सत्र की स्थिति को स्थानीय Playwright अनुरोधों के माध्यम से OpenEvidence के अलावा कहीं और नहीं भेजता है।
- उचित मानव समीक्षा के बिना रोगी-विशिष्ट निदान (patient-specific diagnosis) या उपचार निर्णयों के लिए इसका उपयोग नहीं किया जाना चाहिए।

## यह किसके लिए है (Who it is for)

- चिकित्सक (clinicians) जो अपने स्वयं के OpenEvidence खाते का उपयोग कर रहे हैं;
- चिकित्सा शोधकर्ता (medical researchers);
- साक्ष्य-अनुसंधान वर्कफ़्लो (evidence-research workflows) बनाने वाले AI ऑपरेटर्स;
- local tools को Codex, Claude, Cursor, Cline, Continue, या समान क्लाइंट के साथ एकीकृत करने वाले MCP डेवलपर्स।

## परीक्षित / लक्षित क्लाइंट (Tested / Target Clients)

यह परियोजना MCP-संगत क्लाइंट और स्थानीय एजेंट वर्कफ़्लो के लिए डिज़ाइन की गई है। इस रिपॉजिटरी में केवल Codex और Claude-शैली के स्थानीय कॉन्फ़िगरेशन उदाहरण ही बनाए रखे जाते हैं जब तक कि अन्यथा उल्लेख न किया गया हो।

| क्लाइंट (Client) | स्थिति (Status) | नोट्स (Notes) |
| --- | --- | --- |
| OpenAI Codex / Codex CLI / Codex app | Target | अनुशंसित स्थानीय MCP वर्कफ़्लो। |
| Claude Code | Target | अनुशंसित एजेंट वर्कफ़्लो। |
| Claude Desktop / Claude app with MCP support | Target | स्थानीय MCP सर्वर कॉन्फ़िगरेशन। |
| Cursor | Compatible | MCP-संगत IDE वर्कफ़्लो। |
| Cline | Compatible | VS Code एजेंट वर्कफ़्लो। |
| Continue | Compatible | ओपन-सोर्स IDE सहायक वर्कफ़्लो। |
| VS Code / GitHub Copilot environments with MCP support | Experimental | स्थानीय MCP समर्थन और क्लाइंट कॉन्फ़िगरेशन पर निर्भर करता है। |
| Windsurf / Zed / Replit / Sourcegraph-style MCP hosts | Experimental | परीक्षण के बिना गारंटी नहीं है। |
| Gemini CLI / Google Antigravity-style agent environments | Experimental | वॉचलिस्ट/पारिस्थितिकी तंत्र का लक्ष्य, बनाए रखा गया उदाहरण नहीं। |

अन्य MCP-संगत होस्ट भी काम कर सकते हैं, लेकिन इस रिपॉजिटरी के उदाहरण Codex और Claude-शैली के स्थानीय MCP कॉन्फ़िगरेशन पर केंद्रित हैं।

## विशेषताएँ (Features)

| टूल (Tool) | उद्देश्य (Purpose) | प्रमाणीकरण आवश्यक (Auth required) | साइड इफेक्ट्स (Side effects) |
| --- | --- | --- | --- |
| `oe_auth_status` | जांचता है कि सहेजा गया OpenEvidence ब्राउज़र सत्र प्रमाणित है या नहीं। | हाँ, सहेजी गई सत्र फ़ाइल मौजूद होनी चाहिए। | कोई नहीं। |
| `oe_history_list` | वैकल्पिक पेजिनेशन और खोज के साथ पिछले OpenEvidence लेखों/प्रश्नों को सूचीबद्ध करता है। | हाँ। | कोई नहीं। |
| `oe_article_get` | ID द्वारा एक लेख प्राप्त करता है और सामान्यीकृत फ़ील्ड्स (`status`, `is_complete`, `question`, `answer_text`) के साथ-साथ रॉ पेलोड लौटाता है। | हाँ। | कोई नहीं। |
| `oe_article_wait` | किसी मौजूदा लेख ID के पूरा होने की प्रतीक्षा करता है; नॉन-ब्लॉकिंग `oe_ask` के बाद उपयोगी है। | हाँ। | कोई नहीं। |
| `oe_ask` | एक OpenEvidence शोध प्रश्न बनाता है और वैकल्पिक रूप से लेख के पूरा होने की प्रतीक्षा करता है। | हाँ। | आपके OpenEvidence खाते में एक प्रश्न/लेख बनाता है। |

## एजेंट टूल-कॉलिंग नोट्स (Agent Tool-Calling Notes)

इस MCP सर्वर में अंतर्निहित निर्देश (built-in instructions) और `openevidence_research_workflow` नामक एक प्रॉम्प्ट शामिल है जो उन क्लाइंट्स के लिए है जो MCP प्रॉम्प्ट्स को प्रदर्शित करते हैं।

अनुशंसित एजेंट वर्कफ़्लो (Recommended agent workflow):

1. जब प्रमाणीकरण स्थिति (auth state) अज्ञात हो, तो `oe_auth_status` को कॉल करें।
2. `oe_history_list` का उपयोग केवल तभी करें जब उपयोगकर्ता पिछला OpenEvidence कार्य या कोई लेख ID चाहता हो।
3. जब आपके पास पहले से ही कोई लेख ID हो, तो `oe_article_get` का उपयोग करें।
4. लंबे शोध प्रश्नों के लिए, `wait_for_completion=false` के साथ `oe_ask` को कॉल करें, फिर लौटाए गए `article_id` के साथ `oe_article_wait` को कॉल करें।
5. केवल वास्तविक फ़ॉलो-अप निरंतरता (follow-up continuity) के लिए `original_article_id` का उपयोग करें। पुराने थ्रेड संदर्भ (stale thread context) से बचने के लिए नए प्रश्नों के लिए इसे छोड़ दें।
6. आउटपुट को साक्ष्य-अनुसंधान संदर्भ (evidence-research context) के रूप में मानें, न कि चिकित्सा सलाह (medical advice), निदान (diagnosis) या नैदानिक आदेश (clinical orders) के रूप में।

संबंधित कमांड (Related commands):

| कमांड | उद्देश्य |
| --- | --- |
| `npm run login` | एक स्थानीय ब्राउज़र खोलता है ताकि आप साइन इन कर सकें और पुन: प्रयोज्य सत्र स्थिति सहेज सकें। |
| `npm run login:browser` | Google SSO मामलों के लिए सिस्टम Chrome/Edge खोलता है जहाँ Playwright लॉगिन को असुरक्षित मानकर ब्लॉक कर दिया जाता है। |
| `npm run smoke` | प्रमाणीकरण और बुनियादी OpenEvidence कनेक्टिविटी को सत्यापित करता है। |

## आवश्यकताएँ (Requirements)

- Node.js 20+
- npm 10+
- OpenEvidence खाता
- macOS, Windows, या Linux
- Playwright द्वारा स्थापित Chromium (`npx playwright install chromium`)

## उपलब्धता नोट (Availability Note)

OpenEvidence की उपलब्धता क्षेत्र (region), खाता पात्रता (account eligibility) और OpenEvidence की नीति पर निर्भर कर सकती है। मई 2026 की सार्वजनिक सामग्री सत्यापित यू.एस. HCP/NPI-केंद्रित पहुंच और EU/U.K. में अनुपलब्धता का संकेत देती है; यह परियोजना उन प्रतिबंधों को बायпас नहीं करती है।

उपयोगी संदर्भ:
- [OpenEvidence होमपेज](https://www.openevidence.com/)
- [OpenEvidence API/उत्पाद पृष्ठ](https://www.openevidence.com/product/api)
- [OpenEvidence गोपनीयता नीति](https://www.openevidence.com/policies/privacy)

## त्वरित शुरुआत (Quick Start)

### macOS
```bash
git clone https://github.com/bakhtiersizhaev/openevidence-mcp.git
cd openevidence-mcp
./scripts/setup-macos.sh
npm run login
npm run smoke
```

### Ubuntu/Linux
```bash
git clone https://github.com/bakhtiersizhaev/openevidence-mcp.git
cd openevidence-mcp
./scripts/setup-ubuntu.sh
npm run login
npm run smoke
```

### Windows PowerShell
```powershell
git clone https://github.com/bakhtiersizhaev/openevidence-mcp.git
cd openevidence-mcp
.\scripts\setup-windows.ps1
npm run login
npm run smoke
```

## लॉगिन प्रवाह (Login Flow)

चलाएं:
```bash
npm run login
```

यह कमांड एक ब्राउज़र विंडो खोलेगा। अपने स्वयं के खाते के साथ OpenEvidence में साइन इन करें, टर्मिनल पर वापस आएं और Enter दबाएं। लॉगिन स्क्रिप्ट `/api/auth/me` को सत्यापित करती है और स्थानीय ब्राउज़र सत्र स्थिति (local browser session state) को सहेजती है।

डिफ़ॉल्ट स्थिति पथ (Default state paths):
- macOS/Linux: `~/.openevidence-mcp/auth/storage-state.json`
- Windows: `%USERPROFILE%\.openevidence-mcp\auth\storage-state.json`

आप मौजूदा Playwright स्टोरेज स्थिति फ़ाइल आयात कर सकते हैं:
```bash
npm run login -- --import /absolute/path/storage-state.json
```

यदि Google साइन-इन कहता है कि ब्राउज़र या ऐप सुरक्षित नहीं हो सकता है, तो सिस्टम-ब्राउज़र लॉगिन प्रवाह (system-browser login flow) का उपयोग करें:
```bash
npm run login:browser
```

यह स्थानीय OpenEvidence MCP प्रोफ़ाइल के साथ Chrome या Edge खोलेगा। उस ब्राउज़र में लॉगिन पूरा करें, टर्मिनल पर लौटें और Enter दबाएं। स्क्रिप्ट स्थानीय सत्र स्थिति को सहेजती है और `/api/auth/me` को सत्यापित करती है।

स्टोरेज-स्टेट फ़ाइलों, कुकीज़, निजी खाता डेटा वाले स्क्रीनशॉट, या रोगी-पहचान योग्य जानकारी (patient-identifiable information) को साझा न करें।

## MCP क्लाइंट सेटअप (MCP Client Setup)

सर्वर पंजीकृत करने से पहले बिल्ड करें:
```bash
npm run build
```

### Codex

इसे `~/.codex/config.toml` में जोड़ें:
```toml
[mcp_servers.openevidence]
command = "node"
args = ["/ABSOLUTE/PATH/openevidence-mcp/dist/server.js"]
startup_timeout_sec = 60
```

विंडोज उदाहरण:
```toml
[mcp_servers.openevidence]
command = "node"
args = ["C:\\Users\\<user>\\openevidence-mcp\\dist\\server.js"]
startup_timeout_sec = 60
```

### Claude Desktop

इसे `claude_desktop_config.json` में जोड़ें:
```json
{
  "mcpServers": {
    "openevidence": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/openevidence-mcp/dist/server.js"]
    }
  }
}
```

### Cursor, Cline, Continue

यदि आपका क्लाइंट MCP सर्वर कमांड/तर्क (args) कॉन्फ़िगरेशन का समर्थन करता है, तो उसी stdio सर्वर आकार का उपयोग करें:
```json
{
  "command": "node",
  "args": ["/ABSOLUTE/PATH/openevidence-mcp/dist/server.js"]
}
```

उदाहरण कॉन्फ़िगरेशन `examples/` में हैं।

## सत्यापन (Verify)

```bash
npm run smoke
```

एक वैध सत्र (valid session) के साथ अपेक्षित परिणाम:
- `ok: true`
- `authenticated: true`
- एक छुपाया गया इतिहास पूर्वावलोकन (redacted history preview)

यदि smoke प्रमाणीकरण त्रुटि (auth error) के साथ विफल हो जाता है, तो फिर से `npm run login` चलाएं। Smoke को एक वास्तविक OpenEvidence खाता सत्र की आवश्यकता होती है और यह एक स्वच्छ CI वातावरण में तब तक पास नहीं होगा जब तक कि सत्र स्थिति सुरक्षित रूप से प्रदान न की गई हो।

डिफ़ॉल्ट रूप से, smoke आउटपुट खाता और इतिहास सामग्री को छुपाता (redacts) है। यदि डिबगिंग के लिए कच्चे खाता/इतिहास पेलोड की आवश्यकता हो, तो केवल एक निजी टर्मिनल में `npm run smoke -- --verbose` का उपयोग करें।

डेवलपर जाँच (Developer checks):
```bash
npm test
npm run build
npm run check
```

## सुरक्षा नोट (Security Notes)

- `storage-state.json`, कुकीज़ और ब्राउज़र प्रोफाइल को रहस्य (secrets) के रूप में मानें।
- रहस्य के साथ `.env`, सत्र स्थिति, खाता डेटा के साथ स्क्रीनशॉट, या रोगी-पहचान योग्य जानकारी को कमिट न करें।
- केवल अपने स्वयं के OpenEvidence खाते का उपयोग करें।
- MCP क्लाइंट कॉन्फ़िगरेशन को आपके द्वारा नियंत्रित स्थानीय सर्वर पथ पर रखें।
- नैदानिक (clinical) या परिचालन (operational) वर्कफ़्लो में आउटपुट का उपयोग करने से पहले स्वायत्त एजेंटों (autonomous agents) से टूल कॉल की समीक्षा करें।
- भेद्यता रिपोर्टिंग (vulnerability reporting) और समर्थित दायरे के लिए `SECURITY.md` देखें।

## समस्या निवारण (Troubleshooting)

विस्तृत पुनर्प्राप्ति चरणों (recovery steps) के लिए `docs/TROUBLESHOOTING.md` देखें।

सामान्य समाधान:
- `authenticated: false`: फिर से `npm run login` चलाएं।
- Google कहता है कि ब्राउज़र सुरक्षित नहीं है: `npm run login:browser` चलाएं।
- ब्राउज़र इंस्टॉलेशन त्रुटियां: `npx playwright install chromium` चलाएं।
- MCP क्लाइंट सर्वर शुरू नहीं कर सकता: पुष्टि करें कि `npm run build` सफल रहा और `dist/server.js` के पूर्ण निरपेक्ष पथ (absolute path) का उपयोग करें।
- विंडोज पथ समस्याएं: JSON/TOML में बैकस्लैश से बचें या पूर्ण निरपेक्ष पथों का उपयोग करें।
- Node त्रुटियां: पुष्टि करें कि `node --version` 20 या नया है।
- OpenEvidence UI/API बदल गया: बिना किसी निजी खाते या रोगी डेटा के स्वच्छ लॉग के साथ एक समस्या (issue) खोलें।

## रोडमैप (Roadmap)

- टूल विवरणों को संक्षिप्त और एजेंट-अनुकूल रखें।
- कॉन्फ़िगरेशन और प्रतिक्रिया पार्सिंग के आसपास केंद्रित परीक्षण जोड़ें।
- सत्र विवरण उजागर किए बिना smoke डायग्नोस्टिक्स में सुधार करें।
- जैसे-जैसे क्लाइंट कॉन्फ़िगरेशन प्रारूप विकसित होते हैं, MCP क्लाइंट सेटअप उदाहरणों को ट्रैक करें।

## लाइसेंस और श्रेय (License & Attribution)

Apache-2.0 (`LICENSE`) + `NOTICE`।

यदि आप पुनर्वितरित (redistribute), फ़ोर्क (fork) या व्युत्पन्न संस्करण (derivative versions) बनाते हैं, तो श्रेय निम्नलिखित को दें:
- मूल लेखक: Bakhtier Sizhaev
- मूल रिपॉजिटरी: `https://github.com/bakhtiersizhaev/openevidence-mcp`

सुझाया गया श्रेय पंक्ति (Suggested attribution line):
```text
Based on OpenEvidence MCP by Bakhtier Sizhaev - https://github.com/bakhtiersizhaev/openevidence-mcp
```
