import { test, expect } from '@playwright/test';

const SITE = '1234';
const PAGE_URL = '/?site=' + SITE + '&name=TEST';
const companies = [
  { ptnco_cd: 'A001', ptnco_nm: '가상건설', category: '건축' },
  { ptnco_cd: 'B002', ptnco_nm: '샘플산업', category: '설비' },
];
const pending = {
  id: 'fake-id-1', status: 'pending',
  worker_name: '테스트근로자', requester_name: '테스트담당',
  request_type: 'company_change', phone4: '4321',
  current_company_cd: 'A001', target_company_cd: 'B002',
  current_company_nm: '가상건설', target_company_nm: '샘플산업',
  reason: '가상 데이터', created_at: '2026-01-01T00:00:00Z',
};

async function mockBackend(page, handler = () => ({ status: 200, body: {} })) {
  const calls = [];
  await page.route('https://zobflntvegpunktphauf.supabase.co/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname === '/rest/v1/worker_change_companies') {
      return route.fulfill({ status: 200, contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*' },
        body: JSON.stringify(companies) });
    }
    if (url.pathname !== '/functions/v1/worker-change-site') {
      return route.abort('blockedbyclient');
    }
    const api = url.searchParams.get('api');
    let payload = {};
    try { payload = JSON.parse(request.postData() || '{}'); } catch {}
    calls.push({ api, payload });
    const response = handler(api, payload);
    return route.fulfill({
      status: response.status ?? 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify(response.body ?? {}),
    });
  });
  return calls;
}

async function chooseCompany(page, textbox, list, name) {
  await page.locator(textbox).fill(name);
  await page.locator(list).locator('.combo-item', { hasText: name }).first().click();
}

async function completeForm(page) {
  await page.locator('#requesterName').fill('테스트담당');
  await page.locator('#workerName').fill('테스트근로자');
  await page.locator('#phone4').fill('4321');
  await page.locator('#password').fill('5678');
  await chooseCompany(page, '#currentCompanyText', '#currentCompanyList', '가상건설');
  await chooseCompany(page, '#targetCompanyText', '#targetCompanyList', '샘플산업');
  await page.locator('#reason').fill('가상 데이터');
}

test('missing site prevents request form access and network calls', async ({ page }) => {
  const calls = await mockBackend(page);
  await page.goto('/');
  await expect(page.locator('#siteError')).toBeVisible();
  await expect(page.locator('#formArea')).toBeHidden();
  expect(calls).toHaveLength(0);
});

test('site selection and request-type UI work', async ({ page }) => {
  await mockBackend(page);
  await page.goto(PAGE_URL);
  await expect(page.locator('#sitePill')).toContainText(SITE);
  await chooseCompany(page, '#currentCompanyText', '#currentCompanyList', '가상건설');
  await expect(page.locator('#currentCompany')).toHaveValue('A001');
  await page.locator('#requestType').selectOption('retired_to_active');
  await expect(page.locator('#targetCompanyField')).toBeHidden();
  await page.locator('#requestType').selectOption('company_change');
  await expect(page.locator('#targetCompanyField')).toBeVisible();
});

test('create sends expected payload, stores receipt and shows history', async ({ page }) => {
  const calls = await mockBackend(page, (api) => api === 'create'
    ? { body: { request: { id: 'fake-id-1' }, receiptToken: 'fake-receipt' } }
    : { body: { requests: [pending] } });
  await page.goto(PAGE_URL);
  await completeForm(page);
  await page.locator('#submitBtn').click();
  await expect(page.locator('#historyView')).toBeVisible();
  await expect(page.locator('#historyList')).toContainText('테스트근로자');
  const create = calls.find(x => x.api === 'create');
  expect(create).toBeTruthy();
  expect(create.payload).toMatchObject({
    siteCode: SITE, requestType: 'company_change', workerName: '테스트근로자',
    currentCompanyCode: 'A001', targetCompanyCode: 'B002', password: '5678',
  });
  const receipts = await page.evaluate(() => localStorage.getItem('gspmx_receipts_1234'));
  expect(JSON.parse(receipts)[0]).toMatchObject({ id: 'fake-id-1', token: 'fake-receipt' });
});

test('duplicate response shows warning without storing a receipt', async ({ page }) => {
  const calls = await mockBackend(page, (api) => api === 'create'
    ? { status: 409, body: { code: 'DUPLICATE_24H', error: 'Duplicate request' } }
    : { body: { requests: [] } });
  page.on('dialog', dialog => dialog.accept());
  await page.goto(PAGE_URL);
  await completeForm(page);
  await page.locator('#submitBtn').click();
  await expect(page.locator('#historyView')).toBeVisible();
  expect(calls.some(x => x.api === 'create')).toBe(true);
  expect(await page.evaluate(() => localStorage.getItem('gspmx_receipts_1234'))).toBeNull();
});

test('pending request can be edited and deleted with receipt and password', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('gspmx_receipts_1234',
    JSON.stringify([{ id: 'fake-id-1', token: 'fake-receipt' }])));
  const calls = await mockBackend(page, (api) => api === 'history'
    ? { body: { requests: [pending] } }
    : { body: { ok: true } });
  page.on('dialog', async dialog => {
    if (dialog.type() === 'prompt') await dialog.accept('5678');
    else await dialog.accept();
  });
  await page.goto(PAGE_URL);
  await page.locator('#tabHistory').click();
  await expect(page.locator('[data-edit="fake-id-1"]')).toBeVisible();
  await page.locator('[data-edit="fake-id-1"]').click();
  await page.locator('#editPassword').fill('5678');
  await page.locator('#editReason').fill('수정된 가상 데이터');
  await page.locator('#editForm button[type="submit"]').click();
  await expect.poll(() => calls.some(x => x.api === 'update')).toBe(true);
  expect(calls.find(x => x.api === 'update').payload).toMatchObject({
    requestId: 'fake-id-1', receiptToken: 'fake-receipt', password: '5678',
    reason: '수정된 가상 데이터',
  });
  await page.locator('[data-delete="fake-id-1"]').click();
  await expect.poll(() => calls.some(x => x.api === 'delete')).toBe(true);
  expect(calls.find(x => x.api === 'delete').payload).toMatchObject({
    requestId: 'fake-id-1', receiptToken: 'fake-receipt', password: '5678',
  });
});

test('mobile viewport shows readable single-column form', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockBackend(page);
  await page.goto(PAGE_URL);
  await expect(page.locator('#requestForm')).toBeVisible();
  await expect(page.locator('#submitBtn')).toBeVisible();
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflow).toBe(false);
});
