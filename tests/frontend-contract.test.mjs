import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('essential forms and controls exist', () => {
  for (const id of ['requestForm','editForm','requestType','password','historyList','submitBtn'])
    assert.ok(html.includes('id="'+id+'"'), id);
});
test('three request types remain', () => {
  for (const type of ['company_change','retired_to_active','active_to_retired'])
    assert.ok(html.includes(type), type);
});
test('site code and site-scoped receipts remain', () => {
  assert.ok(html.includes("params.get('site')"));
  assert.ok(html.includes('gspmx_receipts_${SITE_CODE}'));
  assert.ok(html.includes('SITE_CODE'));
});
test('request operations and receipt token are present', () => {
  for (const op of ['create','history','update','delete'])
    assert.ok(html.includes("siteApi('"+op+"'"), op);
  assert.ok(html.includes('receiptToken:receiptFor(editingId)'));
  assert.ok(html.includes('receiptToken:receiptFor(id)'));
});
test('pending-only UI and output escaping remain', () => {
  assert.ok(html.includes("r.status==='pending'?"));
  assert.ok(html.includes('function esc(s)'));
  assert.ok(html.includes('esc(r.worker_name)'));
  assert.ok(html.includes('esc(r.reason)'));
});
