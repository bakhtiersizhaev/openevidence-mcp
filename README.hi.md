# OpenEvidence MCP (अनौपचारिक)

**पहला open-source OpenEvidence MCP सर्वर (फ़रवरी 2026 में प्रकाशित)।** अपने स्वयं के प्रमाणित ब्राउज़र सत्र (authenticated browser session) के माध्यम से Codex, Claude Code, Claude Desktop, Cursor, Windsurf और किसी भी MCP-संगत क्लाइंट से OpenEvidence को क्वेरी करें। कोई API key नहीं। 7 MCP क्लाइंट्स के लिए वन-कमांड इंस्टॉलर। polling के साथ fire-and-forget प्रश्न। BibTeX export के साथ structured citations।

[![CI](https://github.com/bakhtiersizhaev/openevidence-mcp/actions/workflows/test.yml/badge.svg)](https://github.com/bakhtiersizhaev/openevidence-mcp/actions/workflows/test.yml)
[![npm](https://img.shields.io/npm/v/openevidence-mcp)](https://www.npmjs.com/package/openevidence-mcp)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-2d72d9)](https://www.apache.org/licenses/LICENSE-2.0)
[![Node.js 20+](https://img.shields.io/badge/node-%3E%3D20-339933)](https://nodejs.org/)
[![auth](https://img.shields.io/badge/auth-your%20own%20browser%20session-8250df)](#लॉगिन-प्रवाह-login-flow)
[![citations](https://img.shields.io/badge/citations-BibTeX%20%2B%20Crossref-b60205)](#विशेषताएँ-features)

> [!IMPORTANT]
> यह परियोजना अनौपचारिक है और OpenEvidence से संबद्ध (affiliated) नहीं है। यह चिकित्सा सलाह (medical advice) प्रदान नहीं करती है और इसे केवल लागू शर्तों, गोपनीयता नियमों और नैदानिक प्रशासन (clinical governance) आवश्यकताओं के अनुपालन में आपके अपने OpenEvidence खाते के साथ उपयोग किया जाना चाहिए।

Translations: [English](README.md) | [Русский](README.ru.md) | [Español](README.es.md) | [简体中文](README.zh-Hans.md) | [繁體中文（台灣）](README.zh-Hant-TW.md) | [한국어](README.ko.md)

## यह कैसे काम करता है (How it works)

```
MCP client (Codex / Claude / Cursor / ...)
        │  stdio
        ▼
openevidence-mcp server (local Node process)
        │  Playwright on YOUR system Chrome/Edge
        ▼
dedicated local browser profile (~/.openevidence-mcp)
        │  your own logged-in OpenEvidence session
        ▼
openevidence.com
```

आप एक वास्तविक ब्राउज़र विंडो में एक बार लॉगिन करते हैं (`npm run login:session`)। उसके बाद, MCP सर्वर उस प्रोफ़ाइल पर एक minimized स्थानीय ब्राउज़र चलाता है — कुकीज़ कभी ब्राउज़र से बाहर नहीं जातीं, कुछ भी export नहीं किया जाता, कोई extension इंस्टॉल नहीं होता, कोई पोर्ट नहीं खोला जाता।

## यह क्या करता है (What it does)

- यह जांचता है कि सहेजा गया सत्र (saved session) प्रमाणित है या नहीं;
- आपके OpenEvidence प्रश्नों/लेखों के इतिहास को सूचीबद्ध करता है;
- ID द्वारा संपूर्ण लेख (article payload) प्राप्त करता है;
- OpenEvidence शोध प्रश्न पूछता है — blocking या **fire-and-forget** (`wait_for_completion=false`, फिर poll करें);
- किसी मौजूदा OpenEvidence लेख को पूरा होने तक poll करता है, स्पष्ट `timed_out` फ़्लैग के साथ;
- पूर्ण हो चुके लेख से **structured citations** निकालता है और **BibTeX** export करता है (वैकल्पिक Crossref DOI enrichment)।

कोई आधिकारिक OpenEvidence API टोकन की आवश्यकता नहीं है।

## यह क्या नहीं करता (What it does NOT do)

- यह OpenEvidence से संबद्ध, समर्थित या अनुमोदित नहीं है।
- यह चिकित्सा सलाह प्रदान नहीं करता है या नैदानिक निर्णय (clinical judgment) को प्रतिस्थापित नहीं करता है।
- यह क्रेडेंशियल (credentials) एकत्र नहीं करता है और न ही आपका पासवर्ड मांगता है।
- यह आपके ब्राउज़र सत्र की स्थिति को आपकी मशीन से किए गए स्थानीय अनुरोधों के माध्यम से OpenEvidence के अलावा कहीं और नहीं भेजता है।
- उचित मानव समीक्षा के बिना रोगी-विशिष्ट निदान (patient-specific diagnosis) या उपचार निर्णयों के लिए इसका उपयोग नहीं किया जाना चाहिए।

## यह किसके लिए है (Who it is for)

- चिकित्सक (clinicians) जो अपने स्वयं के OpenEvidence खाते का उपयोग कर रहे हैं;
- चिकित्सा शोधकर्ता (medical researchers) जिन्हें ऐसे citations चाहिए जिन्हें वे किसी reference manager में सीधे डाल सकें;
- साक्ष्य-अनुसंधान वर्कफ़्लो (evidence-research workflows) बनाने वाले AI ऑपरेटर्स;
- local tools को Codex, Claude, Cursor, Cline, Continue, या समान क्लाइंट के साथ एकीकृत करने वाले MCP डेवलपर्स।

## एजेंट ऑनबोर्डिंग और इंस्टॉलेशन (Agent Onboarding & Installation)

क्या आप Codex, Claude Code, Cursor, या किसी अन्य स्थानीय AI कोडिंग एजेंट का उपयोग कर रहे हैं? पूरा सेटअप एजेंट को संभालने दें:

```text
Please install OpenEvidence MCP for me: clone https://github.com/bakhtiersizhaev/openevidence-mcp, install dependencies, run build, auto-configure this MCP server in my local client (Claude Desktop/Codex/Cursor), guide me through the one-time Edge/Chrome login using `npm run login:session`, and run `npm run smoke` to verify. Keep everything strictly local and secure.
```

विस्तृत, चरण-दर-चरण सेटअप playbook और नियमों के लिए **[docs/AGENT_INSTALL_PROMPT.md](docs/AGENT_INSTALL_PROMPT.md)** देखें।

## विशेषताएँ (Features)

| टूल (Tool) | उद्देश्य (Purpose) | प्रमाणीकरण आवश्यक (Auth required) | साइड इफेक्ट्स (Side effects) |
| --- | --- | --- | --- |
| `oe_auth_status` | जांचता है कि सहेजा गया OpenEvidence ब्राउज़र सत्र प्रमाणित है या नहीं। | हाँ, स्थानीय ब्राउज़र प्रोफ़ाइल में लॉगिन होना आवश्यक है। | कोई नहीं। |
| `oe_history_list` | वैकल्पिक पेजिनेशन और खोज के साथ पिछले OpenEvidence लेखों को सूचीबद्ध करता है। जब तक `include_raw=true` स्पष्ट रूप से अनुरोध न किया जाए, गोपनीयता-न्यूनीकृत (privacy-reduced) सूची लौटाता है। | हाँ। | कोई नहीं। |
| `oe_article_get` | ID द्वारा एक लेख प्राप्त करता है और सामान्यीकृत फ़ील्ड्स (`status`, `is_complete`, `question`, `answer_text`, `citations`) लौटाता है। रॉ पेलोड `include_raw=true` के साथ opt-in है। | हाँ। | कोई नहीं। |
| `oe_article_wait` | किसी मौजूदा लेख ID के पूरा होने की प्रतीक्षा करता है; यदि पूरा होने से पहले timeout समाप्त हो जाए तो `timed_out=true` लौटाता है। | हाँ। | कोई नहीं। |
| `oe_ask` | एक OpenEvidence शोध प्रश्न बनाता है और वैकल्पिक रूप से लेख के पूरा होने की प्रतीक्षा करता है। fire-and-forget के लिए `wait_for_completion=false` सेट करें। | हाँ। | आपके OpenEvidence खाते में एक प्रश्न/लेख बनाता है। |
| `oe_citations_get` | पूर्ण हो चुके लेख से structured citations निकालता है और JSON + BibTeX लौटाता है। `validate_crossref=true` DOI प्रविष्टियों को Crossref metadata से समृद्ध करता है। | हाँ। | कोई नहीं। |

## परीक्षित / लक्षित क्लाइंट (Tested / Target Clients)

| क्लाइंट (Client) | स्थिति (Status) | नोट्स (Notes) |
| --- | --- | --- |
| OpenAI Codex / Codex CLI / Codex app | Target | अनुशंसित स्थानीय MCP वर्कफ़्लो। |
| Claude Code | Target | अनुशंसित एजेंट वर्कफ़्लो। |
| Claude Desktop / Claude app with MCP support | Target | स्थानीय MCP सर्वर कॉन्फ़िगरेशन। |
| Cursor | Compatible | MCP-संगत IDE वर्कफ़्लो। |
| Cline | Compatible | VS Code एजेंट वर्कफ़्लो। |
| Continue | Compatible | ओपन-सोर्स IDE सहायक वर्कफ़्लो। |
| VS Code / GitHub Copilot environments with MCP support | Experimental | स्थानीय MCP समर्थन और क्लाइंट कॉन्फ़िगरेशन पर निर्भर करता है। |
| Windsurf / Zed / Replit / Sourcegraph-style MCP hosts | Experimental | Windsurf इंस्टॉलर द्वारा कवर किया गया है। |
| Gemini CLI / Google Antigravity-style agent environments | Experimental | Antigravity इंस्टॉलर द्वारा कवर किया गया है। |

## एजेंट टूल-कॉलिंग नोट्स (Agent Tool-Calling Notes)

इस MCP सर्वर में अंतर्निहित निर्देश (built-in instructions) और `openevidence_research_workflow` नामक एक प्रॉम्प्ट शामिल है, जो उन क्लाइंट्स के लिए है जो MCP प्रॉम्प्ट्स को प्रदर्शित करते हैं।

अनुशंसित एजेंट वर्कफ़्लो (Recommended agent workflow):

1. जब प्रमाणीकरण स्थिति (auth state) अज्ञात हो, तो `oe_auth_status` को कॉल करें।
2. `oe_history_list` का उपयोग केवल तभी करें जब उपयोगकर्ता पिछला OpenEvidence कार्य या कोई लेख ID चाहता हो।
3. जब आपके पास पहले से ही कोई लेख ID हो, तो `oe_article_get` का उपयोग करें।
4. लंबे शोध प्रश्नों के लिए, `wait_for_completion=false` के साथ `oe_ask` को कॉल करें, फिर लौटाए गए `article_id` के साथ `oe_article_wait` को कॉल करें।
5. केवल वास्तविक फ़ॉलो-अप निरंतरता (follow-up continuity) के लिए `original_article_id` का उपयोग करें। पुराने थ्रेड संदर्भ (stale thread context) से बचने के लिए नए प्रश्नों के लिए इसे छोड़ दें।
6. जब उपयोगकर्ता को किसी पूर्ण हो चुके लेख से references या BibTeX चाहिए, तो `oe_citations_get` को कॉल करें।
7. आउटपुट को साक्ष्य-अनुसंधान संदर्भ (evidence-research context) के रूप में मानें, न कि चिकित्सा सलाह (medical advice), निदान (diagnosis) या नैदानिक आदेश (clinical orders) के रूप में।

संबंधित कमांड (Related commands):

| कमांड | उद्देश्य |
| --- | --- |
| `npm run login:session` | एक बार का लॉगिन। स्थानीय OpenEvidence MCP प्रोफ़ाइल के साथ Chrome/Edge खोलता है। |
| `npm run smoke` | प्रमाणीकरण और बुनियादी OpenEvidence कनेक्टिविटी को सत्यापित करता है। |

## आवश्यकताएँ (Requirements)

- Node.js 20+
- npm 10+
- OpenEvidence खाता
- macOS, Windows, या Linux
- सिस्टम पर Chrome, Edge, या Chromium इंस्टॉल होना चाहिए

## उपलब्धता नोट (Availability Note)

OpenEvidence की उपलब्धता क्षेत्र (region), खाता पात्रता (account eligibility) और OpenEvidence की नीति पर निर्भर कर सकती है। मई 2026 की सार्वजनिक सामग्री सत्यापित यू.एस. HCP/NPI-केंद्रित पहुंच और EU/U.K. में अनुपलब्धता का संकेत देती है; यह परियोजना उन प्रतिबंधों को नहीं बदलती है।

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
npm run login:session
npm run smoke
```

### Ubuntu/Linux

```bash
git clone https://github.com/bakhtiersizhaev/openevidence-mcp.git
cd openevidence-mcp
./scripts/setup-ubuntu.sh
npm run login:session
npm run smoke
```

### Windows PowerShell

```powershell
git clone https://github.com/bakhtiersizhaev/openevidence-mcp.git
cd openevidence-mcp
.\scripts\setup-windows.ps1
npm run login:session
npm run smoke
```

## लॉगिन प्रवाह (Login Flow)

एक बार का लॉगिन:

```bash
npm run login:session
```

यह कमांड स्थानीय OpenEvidence MCP ब्राउज़र प्रोफ़ाइल के साथ Chrome या Edge खोलता है। अपने स्वयं के खाते के साथ OpenEvidence में साइन इन करें, पुष्टि करें कि सामान्य OpenEvidence पृष्ठ लोड हो रहा है, उस ब्राउज़र विंडो को बंद करें, टर्मिनल पर वापस आएं और Enter दबाएं।

डिफ़ॉल्ट स्थानीय प्रोफ़ाइल पथ (Default local profile path):

- macOS/Linux: `~/.openevidence-mcp/browser-profile`
- Windows: `%USERPROFILE%\.openevidence-mcp\browser-profile`

MCP सर्वर अपनी प्रोसेस के जीवनकाल के दौरान इसी स्थानीय प्रोफ़ाइल का पुन: उपयोग करता है। यह OpenEvidence कॉल्स के लिए एक minimized स्थानीय ब्राउज़र प्रोसेस शुरू कर सकता है, लेकिन यह कोई extension इंस्टॉल नहीं करता, कोई सार्वजनिक नेटवर्क सेवा expose नहीं करता, कुकीज़ export नहीं करता, और न ही आपका पासवर्ड मांगता है।

ब्राउज़र प्रोफ़ाइल फ़ाइलें, कुकीज़, निजी खाता डेटा वाले स्क्रीनशॉट, या रोगी-पहचान योग्य जानकारी (patient-identifiable information) साझा न करें।

## MCP क्लाइंट सेटअप (MCP Client Setup)

सर्वर पंजीकृत करने से पहले बिल्ड करें:

```bash
npm run build
```

### स्वचालित सेटअप (Automatic Setup — अनुशंसित)

अंतर्निहित इंस्टॉलर का उपयोग करके OpenEvidence MCP सर्वर को अपने क्लाइंट के साथ पंजीकृत करें:

| क्लाइंट (Client) | कमांड (Command) |
| --- | --- |
| Claude Desktop | `npx openevidence-mcp install --client claude-app` |
| Codex Desktop | `npx openevidence-mcp install --client codex-app` |
| Claude Code | `npx openevidence-mcp install --client claude-code` |
| Codex CLI | `npx openevidence-mcp install --client codex-cli` |
| Google Antigravity | `npx openevidence-mcp install --client antigravity` |
| Cursor | `npx openevidence-mcp install --client cursor` |
| Windsurf | `npx openevidence-mcp install --client windsurf` |

प्रत्येक क्लाइंट के लिए एक npm शॉर्टकट भी है, जैसे `npm run install:cursor`। अनइंस्टॉल करने के लिए:

```bash
npx openevidence-mcp uninstall --client <client-id>
```

### मैनुअल सेटअप (Manual Setup)

#### Codex

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

#### Claude Desktop

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

#### Cursor, Cline, Continue

यदि आपका क्लाइंट MCP सर्वर command/args कॉन्फ़िगरेशन का समर्थन करता है, तो उसी stdio सर्वर आकार का उपयोग करें:

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

यदि smoke प्रमाणीकरण त्रुटि (auth error) के साथ विफल हो जाता है, तो फिर से `npm run login:session` चलाएं। Smoke को एक वास्तविक OpenEvidence खाता सत्र की आवश्यकता होती है और यह एक स्वच्छ CI वातावरण में तब तक पास नहीं होगा जब तक कि स्थानीय सत्र प्रोफ़ाइल उपलब्ध न हो।

डिफ़ॉल्ट रूप से, smoke आउटपुट खाता और इतिहास सामग्री को छुपाता (redacts) है। यदि डिबगिंग के लिए कच्चे खाता/इतिहास पेलोड की आवश्यकता हो, तो केवल एक निजी टर्मिनल में `npm run smoke -- --verbose` का उपयोग करें।

डेवलपर जाँच (Developer checks):

```bash
npm test
npm run build
npm run check
```

## सुरक्षा नोट (Security Notes)

- ब्राउज़र प्रोफाइल और कुकीज़ को रहस्य (secrets) के रूप में मानें।
- `.env`, सत्र स्थिति, खाता डेटा वाले स्क्रीनशॉट, या रोगी-पहचान योग्य जानकारी को कमिट न करें।
- केवल अपने स्वयं के OpenEvidence खाते का उपयोग करें।
- MCP क्लाइंट कॉन्फ़िगरेशन को आपके द्वारा नियंत्रित बिल्ट स्थानीय सर्वर पथ पर रखें।
- नैदानिक (clinical) या परिचालन (operational) वर्कफ़्लो में आउटपुट का उपयोग करने से पहले स्वायत्त एजेंटों (autonomous agents) से टूल कॉल की समीक्षा करें।
- भेद्यता रिपोर्टिंग (vulnerability reporting) और समर्थित दायरे के लिए `SECURITY.md` देखें।

## समस्या निवारण (Troubleshooting)

विस्तृत पुनर्प्राप्ति चरणों (recovery steps) के लिए `docs/TROUBLESHOOTING.md` देखें।

सामान्य समाधान:

- `authenticated: false`: फिर से `npm run login:session` चलाएं।
- MCP क्लाइंट सर्वर शुरू नहीं कर सकता: पुष्टि करें कि `npm run build` सफल रहा और `dist/server.js` के पूर्ण निरपेक्ष पथ (absolute path) का उपयोग करें।
- विंडोज पथ समस्याएं: JSON/TOML में बैकस्लैश को escape करें या पूर्ण निरपेक्ष पथों का उपयोग करें।
- Node त्रुटियां: पुष्टि करें कि `node --version` 20 या नया है।
- OpenEvidence UI/API बदल गया: बिना किसी निजी खाते या रोगी डेटा के, स्वच्छ (sanitized) लॉग के साथ एक issue खोलें।
- `oe_ask` प्रश्न इनपुट या submit बटन नहीं ढूंढ पाता: OpenEvidence UI बदल गया हो सकता है; बिना किसी निजी खाते या रोगी डेटा के, स्वच्छ लॉग के साथ एक issue खोलें।

## रोडमैप (Roadmap)

- आधिकारिक MCP Registry पर प्रकाशन (`server.json` manifest तैयार है)।
- Crossref-सत्यापित citation metadata caching।
- डिस्क पर वैकल्पिक article artifacts (answer.md, citations.bib)।
- जैसे-जैसे क्लाइंट कॉन्फ़िगरेशन प्रारूप विकसित होते हैं, MCP क्लाइंट सेटअप उदाहरणों को ट्रैक करें।

## लाइसेंस और श्रेय (License & Attribution)

Apache-2.0 (`LICENSE`) + `NOTICE`।

यह मूल OpenEvidence MCP रिपॉजिटरी है, जो फ़रवरी 2026 में प्रकाशित हुई। यदि आप पुनर्वितरित (redistribute), फ़ोर्क (fork) या व्युत्पन्न संस्करण (derivative versions) बनाते हैं, तो श्रेय निम्नलिखित को दें:

- मूल लेखक: Bakhtier Sizhaev
- मूल रिपॉजिटरी: `https://github.com/bakhtiersizhaev/openevidence-mcp`

सुझाई गई श्रेय पंक्ति (Suggested attribution line):

```text
Based on OpenEvidence MCP by Bakhtier Sizhaev - https://github.com/bakhtiersizhaev/openevidence-mcp
```

## Star History

<a href="https://star-history.com/#bakhtiersizhaev/openevidence-mcp&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=bakhtiersizhaev/openevidence-mcp&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=bakhtiersizhaev/openevidence-mcp&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=bakhtiersizhaev/openevidence-mcp&type=Date" />
  </picture>
</a>
