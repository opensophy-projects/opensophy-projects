<script lang="ts">
	import ArrowRight from 'carbon-icons-svelte/lib/ArrowRight.svelte';
	import Badge from '$lib/components/ui-registry/Badge.svelte';
	import FirewallIllustration from './FirewallIllustration.svelte';
	import { flagshipProducts, nginxionsLinks } from '$lib/config/products';

	const product = flagshipProducts.nginxions;
</script>

<section class="ngx" id="nginxions" aria-labelledby="nginxions-title">
	<p class="ngx-overline"><Badge variant="default">Флагманский продукт</Badge></p>

	<header class="ngx-head">
		<div class="ngx-head-title">
			<p class="ngx-name">{product.name}</p>
			<h2 id="nginxions-title" class="ngx-title">
				Прокси и платформа защиты приложений нового поколения с&nbsp;открытым исходным кодом
			</h2>
		</div>
		<div class="ngx-head-copy">
			<p class="ngx-desc">
				<span class="ngx-desc-strong">Обратный прокси на nginx со встроенной защитой:</span>
				WAF на машинном обучении, CrowdSec, свой центр сертификации и mTLS, аналитика трафика и роли.
				<span class="ngx-desc-strong">Всё настраивается в одном интерфейсе и работает без облака.</span>
			</p>
			<a class="ngx-more" href={nginxionsLinks.github} target="_blank" rel="noopener noreferrer">
				Подробнее <ArrowRight size={16} />
			</a>
		</div>
	</header>

	<div class="ngx-visual">
		<FirewallIllustration />
	</div>

</section>

<style>
	.ngx {
		width: 100%;
		max-width: 82rem;
		margin: 0 auto;
		padding: clamp(2.5rem, 6vw, 5rem) 1.5rem;
		box-sizing: border-box;
		scroll-margin-top: 6rem;
	}

	/* Метка раздела — как «Продукты»: по центру секции */
	.ngx-overline {
		display: flex;
		justify-content: center;
		margin: 0 0 clamp(1.5rem, 3vw, 2.5rem);
		font-size: 1rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	/* ─── Шапка: заголовок слева, описание справа ─── */
	.ngx-head {
		display: grid;
		grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
		gap: 2rem clamp(2rem, 6vw, 6rem);
		align-items: start;
	}

	.ngx-name {
		margin: 0 0 0.75rem;
		font-size: clamp(1.1rem, 1.4vw, 1.4rem);
		font-weight: 600;
		letter-spacing: -0.025em;
		color: var(--accent);
	}

	.ngx-title {
		margin: 0;
		font-size: clamp(1.75rem, 3.4vw, 2.75rem);
		font-weight: 500;
		line-height: 1.12;
		letter-spacing: -0.035em;
		text-wrap: balance;
		color: var(--foreground);
	}

	.ngx-head-copy {
		padding-top: clamp(0rem, 2.2vw, 1.9rem);
	}

	/* Как тексты услуг на главной: светлые акценты на сером тексте */
	.ngx-desc {
		margin: 0;
		font-size: clamp(1.1rem, 1.5vw, 1.45rem);
		font-weight: 500;
		line-height: 1.45;
		letter-spacing: -0.02em;
		color: var(--foreground-muted);
	}

	.ngx-desc-strong {
		color: var(--foreground);
	}

	.ngx-more {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		margin-top: 1.5rem;
		font-size: 0.95rem;
		font-weight: 600;
		text-decoration: none;
		color: var(--accent);
		transition: color 150ms ease-out;
	}

	.ngx-more :global(svg) {
		transition: transform 150ms ease-out;
	}

	.ngx-more:hover {
		color: var(--foreground);
	}

	.ngx-more:hover :global(svg) {
		transform: translateX(3px);
	}

	/* ─── Иллюстрация ─── */
	.ngx-visual {
		width: 100%;
		max-width: 62rem;
		margin: clamp(1.5rem, 4vw, 3.5rem) auto 0;
	}

	@media (max-width: 899px) {
		.ngx-head {
			grid-template-columns: 1fr;
		}

		.ngx-head-copy {
			padding-top: 0;
		}
	}

	@media (max-width: 559px) {
		.ngx {
			padding-left: 1rem;
			padding-right: 1rem;
		}
	}
</style>
