#!/usr/bin/env node
/**
 * Отправляет sitemap.xml в Google Search Console через Search Console API.
 * Запускается в CI после деплоя; без ключа сервисного аккаунта пропускается.
 *
 * Переменные окружения:
 *   GSC_SERVICE_ACCOUNT — JSON-ключ сервисного аккаунта Google (секрет CI);
 *                         аккаунт должен быть добавлен в Search Console как
 *                         владелец ресурса.
 *   GSC_SITE            — ресурс Search Console: `sc-domain:opensophy.com`
 *                         (ресурс-домен, по умолчанию) или `https://opensophy.com/`.
 *   SITE_URL            — адрес сайта, по умолчанию https://opensophy.com.
 */
import { createSign } from 'node:crypto';

const raw = process.env.GSC_SERVICE_ACCOUNT;
if (!raw) {
	console.log('Search Console: ключ сервисного аккаунта не задан, шаг пропущен.');
	process.exit(0);
}

const SITE_URL = (process.env.SITE_URL ?? 'https://opensophy.com').replace(/\/+$/, '');
const GSC_SITE = process.env.GSC_SITE ?? `sc-domain:${new URL(SITE_URL).host}`;
const SITEMAP = `${SITE_URL}/sitemap.xml`;

const key = JSON.parse(raw);
const b64url = (data) => Buffer.from(data).toString('base64url');

// Токен доступа: JWT, подписанный ключом сервисного аккаунта (RS256)
const now = Math.floor(Date.now() / 1000);
const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
const claims = b64url(
	JSON.stringify({
		iss: key.client_email,
		scope: 'https://www.googleapis.com/auth/webmasters',
		aud: 'https://oauth2.googleapis.com/token',
		iat: now,
		exp: now + 600
	})
);
const signature = createSign('RSA-SHA256').update(`${header}.${claims}`).sign(key.private_key, 'base64url');

const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
	method: 'POST',
	headers: { 'content-type': 'application/x-www-form-urlencoded' },
	body: new URLSearchParams({
		grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
		assertion: `${header}.${claims}.${signature}`
	})
});
if (!tokenResponse.ok) {
	throw new Error(`Google OAuth: HTTP ${tokenResponse.status}: ${await tokenResponse.text()}`);
}
const { access_token: token } = await tokenResponse.json();

const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE)}/sitemaps/${encodeURIComponent(SITEMAP)}`;
const response = await fetch(endpoint, { method: 'PUT', headers: { authorization: `Bearer ${token}` } });
if (!response.ok) {
	throw new Error(`Search Console: HTTP ${response.status}: ${await response.text()}`);
}
console.log(`Search Console: ${SITEMAP} отправлен в ресурс ${GSC_SITE}.`);
