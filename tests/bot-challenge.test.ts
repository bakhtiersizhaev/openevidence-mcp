import test from "node:test";
import assert from "node:assert/strict";

import { BOT_CHALLENGE_MESSAGE, isBotChallengePage } from "../src/browser-session.js";

test("isBotChallengePage detects DataDome interstitial markers", () => {
  const interstitial =
    "<html><head><title>openevidence.com</title></head><body>" +
    "<script data-cfasync=\"false\">var dd={'rt':'c','cid':'SYNTHETIC','hsh':'SYNTHETIC','t':'fe','s':59943,'host':'geo.captcha-delivery.com'}</script>" +
    "</body></html>";

  assert.equal(isBotChallengePage(interstitial), true);
});

test("isBotChallengePage detects captcha-delivery host alone", () => {
  const html = '<iframe src="https://geo.captcha-delivery.com/captcha/?initialCid=x"></iframe>';
  assert.equal(isBotChallengePage(html), true);
});

test("isBotChallengePage ignores the normal OpenEvidence app page", () => {
  const appHtml =
    '<html><body><main><textarea aria-label="Ask a medical question"></textarea>' +
    "<p>Latest additions to our library</p></main></body></html>";

  assert.equal(isBotChallengePage(appHtml), false);
});

test("bot challenge message tells both user and agent what to do", () => {
  assert.match(BOT_CHALLENGE_MESSAGE, /anti-bot verification/i);
  assert.match(BOT_CHALLENGE_MESSAGE, /npm run login:session/);
  assert.match(BOT_CHALLENGE_MESSAGE, /not a login problem/i);
});
