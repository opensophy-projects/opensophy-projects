<svelte:head>
  <link rel="preload" as="image" href="/logo-ascii-wide.webp" media="(min-width: 1024px)" fetchpriority="high" />
  <link rel="preload" as="image" href="/logo-ascii-narrow.webp" media="(max-width: 1023px)" fetchpriority="high" />
  <!-- AsciiObject грузит исходник через fetch(), поэтому as="fetch" + crossorigin -->
  <link rel="preload" as="fetch" href="/logo-1024.png" crossorigin="anonymous" />
</svelte:head>

<script lang="ts">
  import { onMount } from "svelte";
  import AsciiObject from "$lib/components/ui-registry/AsciiObject.svelte";
  import ArcFlame from "$lib/components/ui-registry/ArcFlame.svelte";
  import SiteMenu from "$lib/components/ui-registry/SiteMenu.svelte";
  import LogoCarousel from "$lib/components/ui-registry/logo-carousel.svelte";
  import Badge from "$lib/components/ui-registry/Badge.svelte";
  import ShieldInfinity from "$lib/components/ui-registry/ShieldInfinity.svelte";
  import Phosphor from "$lib/components/ui-registry/Phosphor.svelte";
  import Terminal from "$lib/components/ui-registry/Terminal.svelte";
  import Radar from "$lib/components/ui-registry/Radar.svelte";
  import GhostCursor from "$lib/components/ui-registry/GhostCursor.svelte";
  import { contactsState } from "$lib/stores/contacts.svelte";

  // ─── Нам доверяют ─────────────────────────────────────────────
  type Sponsor = { name: string; description: string; logo?: string };

  const sponsors: Sponsor[] = [
    {
      name: "RUVDS",
      description: "Российский хостинг-провайдер и международный облачный сервис",
      logo: "/ruvds-logo.png",
    },
    {
      name: "Кондор",
      description:
        "Проектировщик и интегратор комплексных систем безопасности и связи",
    },
    {
      name: "Ziree Medical",
      description:
        "Китайский производитель высокотехнологичного медицинского оборудования и устройств фототерапии",
      logo: "/zireelogo.png",
    },
  ];

  // Мобильный режим: крупнее ASCII-лого и всегда карусель партнёров
  let isMobile = $state(false);
  // Телефон (< 768px): без GhostCursor, без текста и кнопок в hero
  let isPhone = $state(false);
  // Помещаются ли все логотипы в одну строку (проверяется по скрытой копии)
  let fits = $state(true);
  let sponsorsEl = $state<HTMLElement | undefined>();
  let measureEl = $state<HTMLElement | undefined>();

  // Hero: ASCII-логотип. GhostCursor плавно гаснет, когда курсор приближается к нему
  // (без маски-«дырки», поэтому никакого круга под логотипом нет).
  let logoEl = $state<HTMLElement | undefined>();
  let ghostOpacity = $state(1);

  // Дуга hero: ArcFlame берёт из неё эллипс, по которому горит огонь
  let arcEl = $state<HTMLElement | undefined>();

  // Карусель: всегда на мобильном, на ПК — только если логотипы не помещаются
  const useCarousel = $derived(isMobile || !fits);
  const groupSize = $derived(isMobile ? 1 : 2);

  function measureSponsors() {
    if (!sponsorsEl || !measureEl) return;
    fits = measureEl.offsetWidth <= sponsorsEl.clientWidth;
  }

  function smoothstep(edge0: number, edge1: number, x: number) {
    const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  let rafId = 0;
  function onPointerMove(e: PointerEvent) {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      if (!logoEl) return;
      const l = logoEl.getBoundingClientRect();
      if (!l.width || !l.height) return;
      const cx = l.left + l.width / 2;
      const cy = l.top + l.height / 2;
      // Нормированное эллиптическое расстояние: 1 = край логотипа
      const dx = (e.clientX - cx) / (l.width / 2);
      const dy = (e.clientY - cy) / (l.height / 2);
      const d = Math.hypot(dx, dy);
      // Внутри логотипа (d < 0.6) — полностью погашен, к d = 1.5 плавно возвращается
      ghostOpacity = smoothstep(0.6, 1.5, d);
    });
  }

  onMount(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    isMobile = mq.matches;
    const onChange = (e: MediaQueryListEvent) => {
      isMobile = e.matches;
    };
    mq.addEventListener("change", onChange);

    const phoneMq = window.matchMedia("(max-width: 767px)");
    isPhone = phoneMq.matches;
    const onPhoneChange = (e: MediaQueryListEvent) => {
      isPhone = e.matches;
    };
    phoneMq.addEventListener("change", onPhoneChange);

    const ro = new ResizeObserver(measureSponsors);
    if (sponsorsEl) ro.observe(sponsorsEl);
    if (measureEl) ro.observe(measureEl);
    measureSponsors();

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      mq.removeEventListener("change", onChange);
      phoneMq.removeEventListener("change", onPhoneChange);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  });

  // Цвет пламени совпадает с акцентом сайта (#f43f5e)
  const flameColor: [number, number, number] = [0.956, 0.247, 0.369];

</script>

<a
  href="#main-content"
  class="sr-only fixed top-3 left-3 z-100 bg-foreground px-4 py-2 text-sm text-background-inset focus:not-sr-only"
>
  Skip to main content
</a>

<main
  id="main-content"
  tabindex="-1"
  class="relative flex flex-col w-full min-h-dvh items-center bg-background"
>
  <SiteMenu />

  <!-- Hero Section -->
  <section
    class="hero-section relative flex w-full items-center justify-center"
    style="--ghost-opacity: {ghostOpacity};"
  >
    <!-- Изогнутое свечение (горизонт) -->
    <div class="hero-card" aria-hidden="true">
      <div class="hero-halo"></div>
      <div class="hero-arc" bind:this={arcEl}></div>
      <!-- Огонь по дуге: эллипс берётся из .hero-arc -->
      <ArcFlame
        arc={arcEl}
        color={flameColor}
        height={isMobile ? 110 : 170}
        intensity={0.85}
        turbulence={0.6}
        melt={6}
        sparks={1.8}
        smoke={1.3}
        rim={3}
      />
    </div>

    <!-- GhostCursor: ПК и планшет, не на телефоне. Маска вырезает область под дугой,
         а прозрачность плавно падает до нуля, когда курсор рядом с ASCII-логотипом. -->
    {#if !isPhone}
      <GhostCursor color="#f43f5e" zIndex={1} class="hero-ghost" />
    {/if}

    <div class="hero-inner">
      <h1 class="hero-lead">
        <span class="text-foreground">opensophy</span>
        <span class="hero-lead-line text-accent">Мастерская DevSecOps</span>
      </h1>

      <div class="hero-logo" aria-label="Opensophy ASCII logo" bind:this={logoEl}>
        <AsciiObject
          src="/logo-1024.png"
          poster="/logo-ascii-wide.webp"
          posterNarrow="/logo-ascii-narrow.webp"
          ascii={true}
          colored={false}
          color="#f43f5e"
          highlight="#f43f5e"
          background=""
          cellSize={isMobile ? 8 : 9}
          contrast={1.5}
          exposure={1}
          scale={isMobile ? 5 : 4}
          orbit={false}
          autoRotate={false}
          rotationIntensity={0.5}
          floatIntensity={isMobile ? 1.5 : 2.5}
          floatSpeed={1.6}
          class="hero-logo-canvas"
        />
      </div>

      <div class="services-actions hero-actions">
        <button
          type="button"
          class="services-action services-action-primary"
          onclick={() => contactsState.open()}>Контакты</button
        >
        <a class="services-action" href="/solutions">Услуги</a>
      </div>
    </div>
  </section>

  <!-- Sponsors Section -->
  <section class="sponsors-section w-full max-w-5xl mx-auto px-4">
    <p class="section-overline"><Badge variant="default">Нам доверяют</Badge></p>
    <div class="sponsors-wrap" bind:this={sponsorsEl}>
      <div class="sponsors-measure" bind:this={measureEl} aria-hidden="true" inert>
        {#each sponsors as s (s.name)}
          <span class="sponsor">{@render sponsorFace(s)}</span>
        {/each}
      </div>

      {#if useCarousel}
        <LogoCarousel items={sponsors} count={groupSize}>
          {#snippet children(item: Sponsor)}
            {@render sponsor(item)}
          {/snippet}
        </LogoCarousel>
      {:else}
        <div class="sponsors-row">
          {#each sponsors as s (s.name)}
            {@render sponsor(s)}
          {/each}
        </div>
      {/if}
    </div>
  </section>

  <!-- About us -->
  <section class="section-block about-us-section w-full max-w-6xl mx-auto px-4" aria-label="О нас">
    <p class="section-overline"><Badge variant="accent">О нас</Badge></p>
    <p class="about-us-copy">
      <span class="text-foreground">Opensophy — это команда специалистов в области информационной безопасности и разработки.</span>
      Мы оказываем услуги по внедрению
      <span class="text-accent">DevSecOps, автоматизации процессов и настройке инфраструктуры</span>, а также разрабатываем программное обеспечение и создаем образовательный контент.
    </p>
  </section>

  <!-- Services showcase -->
  <section class="component-showcase" aria-label="Наши направления">
    <div class="component-grid">
      <article class="component-cell">
        <div class="component-visual component-visual-shield">
          <ShieldInfinity accent="#f43f5e" width="100%" />
        </div>
        <div class="component-copy">
          <h2>Автоматическая защита бизнеса</h2>
          <p>
            <span class="text-strong">Настраиваем систему так, чтобы она сама проверяла код и настройки</span>
            <span class="text-accent">на каждом этапе.</span> Наш WAF на базе ИИ учится распознавать новые атаки и блокирует их автоматически.
          </p>
        </div>
      </article>
      <article class="component-cell">
        <div class="component-visual component-visual-phosphor">
          <Phosphor accent="#f43f5e" width="100%" showControls={false} />
        </div>
        <div class="component-copy">
          <h2>Автоматизируем повторяющиеся задачи</h2>
          <p>
            <span class="text-strong">Автоматизируем выгрузку отчетов, рассылку уведомлений и проверку данных:</span>
            <span class="text-accent">рутина будет выполняться сама по расписанию,</span> а команда займётся реальной работой.
          </p>
        </div>
      </article>
      <article class="component-cell">
        <div class="component-visual component-visual-terminal">
          <Terminal accent="#f43f5e" width="100%" showControls={false} />
        </div>
        <div class="component-copy">
          <h2>Создаем цифровые продукты и чиним техническую часть</h2>
          <p>
            <span class="text-strong">Разрабатываем сайты и внутренние инструменты, настраиваем серверы и устраняем сбои.</span> Если система тормозит или не запускается —
            <span class="text-accent">найдём причину и наладим работу.</span>
          </p>
        </div>
      </article>
      <article class="component-cell">
        <div class="component-visual component-visual-radar">
          <!-- Радар следит за курсором только в пределах своего элемента, а не по всей странице -->
          <Radar scope="self" />
        </div>
        <div class="component-copy">
          <h2>Комплексная проверка безопасности и закрытие рисков</h2>
          <p>
            <span class="text-strong">Проводим полный пассивный и процессный аудит вашей компании,</span>
            <span class="text-accent">выявляя уязвимости до того, как о них узнают хакеры или регуляторы.</span>
          </p>
        </div>
      </article>
    </div>

    <div class="services-actions showcase-actions">
      <a class="services-action services-action-primary" href="/solutions">Посмотреть все услуги</a>
    </div>

    <!-- Featured product: NginxionS -->
    <section class="nginxions-section" aria-labelledby="nginxions-title">
      <article class="nginxions-card">
        <div class="nginxions-heading">
          <p class="nginxions-overline">Встречайте</p>
          <span class="nginxions-label">Open Source · Self-hosted</span>
        </div>
        <h2 id="nginxions-title">Nginxion<span>S</span></h2>
        <p class="nginxions-subtitle">Next-Generation Open Source Proxy &amp; Application Security Platform</p>
        <p class="nginxions-description">
          Обратный прокси на Nginx со встроенной защитой: WAF на машинном обучении, CrowdSec,
          собственный центр сертификации и mTLS, аналитика трафика и гибкая система ролей.
          Управляйте всем из единого интерфейса — без зависимости от облачных сервисов.
        </p>
        <div class="nginxions-features" aria-label="Возможности NginxionS">
          <span>AI-powered WAF</span>
          <span>CrowdSec</span>
          <span>CA &amp; mTLS</span>
          <span>Traffic Analytics</span>
          <span>Role Management</span>
        </div>
        <a
          class="nginxions-link"
          href="https://github.com/opensophy-projects/NginxionS"
          target="_blank"
          rel="noopener noreferrer"
        >Изучить NginxionS <span aria-hidden="true">↗</span></a>
      </article>
    </section>
  </section>

  <!-- Contacts -->
  <section class="section-block contact-section" aria-label="Контакты">
    <p class="section-overline"><Badge variant="accent">Контакты</Badge></p>
    <div class="inset-shadow relative overflow-hidden rounded-xl bg-background-inset p-1.5">
      <div class="contact-card card rounded-lg bg-background">
        <h2 class="contact-title">
          <span class="text-foreground">Остались вопросы?</span>
          <span class="text-accent">Напишите нам</span>
        </h2>
        <p class="contact-text">
          Расскажите о задаче — подскажем, как её решить, и подберём подходящую услугу.
        </p>
        <div class="services-actions contact-actions">
          <button
            type="button"
            class="services-action services-action-primary"
            onclick={() => contactsState.open()}>Написать нам</button
          >
        </div>
      </div>
    </div>
  </section>
</main>

{#snippet sponsorFace(s: Sponsor)}
  {#if s.logo}
    <img src={s.logo} alt={s.name} class="sponsor-logo" loading="lazy" decoding="async" />
  {:else}
    <span class="sponsor-text">{s.name}</span>
  {/if}
{/snippet}

{#snippet sponsor(s: Sponsor)}
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div class="sponsor" tabindex="0" role="group" aria-label="{s.name}: {s.description}">
    {@render sponsorFace(s)}
    <span class="sponsor-tip" role="tooltip">{s.description}</span>
  </div>
{/snippet}

<style>
  /* ─── Hero ─────────────────────────────────────────────────── */
  .hero-section {
    position: relative;
    min-height: 40rem;
    padding: 6rem 0 5rem;
    /* Эллипс дуги (для маски GhostCursor): полуоси и центр */
    --arc-rx: 82.5%;
    --arc-ry: 21rem;
    --arc-cy: calc(100% + 17rem);
    /* Плавность затухания GhostCursor возле логотипа — задаётся из JS */
    --ghost-opacity: 1;
  }

  /* Карточка со свечением: растянута на всю секцию, скруглена снизу */
  .hero-card {
    position: absolute;
    top: 0;
    bottom: -4rem;
    left: 0;
    right: 0;
    width: 100%;
    overflow: hidden;
    box-shadow: none;
    pointer-events: none;
    /* Плавное растворение внизу — никакой резкой границы между секциями */
    -webkit-mask-image: linear-gradient(to bottom, #000 calc(100% - 6rem), transparent 100%);
    mask-image: linear-gradient(to bottom, #000 calc(100% - 6rem), transparent 100%);
  }

  /* Мягкое облако света над горизонтом */
  .hero-halo {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(
        ellipse 75% 55% at 50% 100%,
        rgba(244, 63, 94, 0.5) 0%,
        rgba(244, 63, 94, 0.22) 38%,
        transparent 72%
      ),
      radial-gradient(
        ellipse 100% 70% at 50% 100%,
        rgba(244, 63, 94, 0.12) 0%,
        transparent 75%
      );
  }

  /* Огромный тёмный «шар» — его верхний край даёт изогнутую светящуюся линию */
  /* Эллипс с центром на нижней кромке: дуга идёт от угла до угла */
  .hero-arc {
    position: absolute;
    left: 50%;
    top: calc(100% - 8rem);
    width: 165%;
    height: 42rem;
    transform: translateX(-50%);
    border-radius: 50%;
    background: var(--background);
    border-top: 1px solid rgba(253, 164, 175, 0.85);
    box-shadow:
      0 -2px 14px rgba(253, 164, 175, 0.55),
      0 -10px 40px rgba(244, 63, 94, 0.55),
      0 -28px 90px rgba(244, 63, 94, 0.3),
      inset 0 3px 22px rgba(244, 63, 94, 0.35);
    pointer-events: none;
  }

  :global(.dark) .hero-halo {
    opacity: 0.9;
  }

  .hero-inner {
    position: relative;
    z-index: 10;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
    align-items: center;
    column-gap: clamp(1.5rem, 4vw, 4rem);
    row-gap: 0;
    width: calc(100% - 2rem);
    max-width: 80rem;
    margin: 0 auto;
    padding: 0 1.25rem;
  }

  /* GhostCursor:
     1) маска скрывает всё, что внутри эллипса дуги (параметры --arc-* совпадают с .hero-arc);
     2) opacity плавно уходит в 0 рядом с ASCII-логотипом (значение считается в JS).
     Никаких «дырок» в маске — поэтому круга вокруг логотипа больше нет. */
  :global(.hero-ghost) {
    opacity: var(--ghost-opacity, 1);
    transition: opacity 250ms ease-out;
    -webkit-mask-image: radial-gradient(
      ellipse var(--arc-rx) var(--arc-ry) at 50% var(--arc-cy),
      transparent 99%,
      #000 100%
    );
    mask-image: radial-gradient(
      ellipse var(--arc-rx) var(--arc-ry) at 50% var(--arc-cy),
      transparent 99%,
      #000 100%
    );
  }

  /* Стиль как у блока «Opensophy занимается…» */
  .hero-lead {
    margin: 0;
    font-size: clamp(1.75rem, 3.5vw, 2.6rem);
    font-weight: 500;
    line-height: 1.4;
    color: var(--foreground-muted);
    grid-column: 1;
    grid-row: 1;
    align-self: end;
  }

  .hero-lead-line {
    display: block;
  }

  .services-actions.hero-actions {
    grid-column: 1;
    grid-row: 2;
    align-self: start;
    justify-content: flex-start;
    margin-top: 1.5rem;
  }

  .hero-logo {
    position: relative;
    width: 100%;
    justify-self: end;
    grid-column: 2;
    grid-row: 1 / span 2;
    align-self: center;
    height: clamp(22rem, 34vw, 36rem);
    color: var(--accent);
  }

  :global(.hero-logo-canvas) {
    display: block;
    width: 100%;
    height: 100%;
  }

  @media (max-width: 1023px) {
    .hero-section {
      min-height: 0;
      padding-top: 5rem;
      padding-bottom: 5rem;
      --arc-rx: 110%;
      --arc-ry: 13rem;
      --arc-cy: calc(100% + 10rem);
    }

    .hero-arc {
      top: calc(100% - 7rem);
      width: 220%;
      height: 26rem;
    }

    .hero-inner {
      grid-template-columns: 1fr;
      width: 100%;
      padding: 0 1rem;
      row-gap: 0.5rem;
    }

    /* Мобильный порядок: заголовок → логотип → кнопки */
    .hero-lead {
      grid-column: 1;
      grid-row: auto;
      align-self: auto;
      text-align: center;
    }

    .hero-logo {
      grid-column: 1;
      grid-row: auto;
      align-self: auto;
      justify-self: center;
      height: clamp(18rem, 88vw, 26rem);
    }

    .services-actions.hero-actions {
      grid-column: 1;
      grid-row: auto;
      align-self: auto;
      justify-content: center;
      margin-top: 0.5rem;
    }
  }

  /* Телефон: в hero остаётся только логотип (h1 скрыт визуально, но есть для SEO/скринридеров) */
  @media (max-width: 767px) {
    .hero-lead {
      position: absolute;
      width: 1px;
      height: 1px;
      margin: -1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
    }

    .services-actions.hero-actions {
      display: none;
    }
  }

  /* ─── Sponsors ─────────────────────────────────────────────── */
  .sponsors-section {
    padding-top: 1.25rem;
    padding-bottom: 5rem;
  }

  .sponsors-wrap {
    position: relative;
    display: flex;
    justify-content: center;
    min-height: 7.5rem;
  }

  .sponsors-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4rem;
  }

  .sponsors-measure {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    gap: 4rem;
    width: max-content;
    visibility: hidden;
    pointer-events: none;
  }

  .sponsor {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 7.5rem;
    padding: 0 0.5rem;
    outline: none;
    opacity: 0.85;
    transition: opacity 150ms ease-out;
  }

  .sponsor:hover,
  .sponsor:focus-visible,
  .sponsor:focus {
    opacity: 1;
  }

  .sponsor-logo {
    display: block;
    height: 7rem;
    width: auto;
    max-width: none;
    object-fit: contain;
    filter: brightness(0);
  }

  :global(.dark) .sponsor-logo {
    filter: none;
  }

  .sponsor-text {
    font-size: 2.1rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    white-space: nowrap;
    color: var(--foreground);
  }

  @media (max-width: 1023px) {
    .sponsor-logo {
      height: 6rem;
    }
    .sponsor-text {
      font-size: 1.9rem;
    }
  }

  .sponsor-tip {
    position: absolute;
    top: calc(100% + 0.25rem);
    left: 50%;
    z-index: 20;
    width: max-content;
    max-width: min(16rem, 80vw);
    padding: 0.55rem 0.7rem;
    border-radius: 0.5rem;
    background: var(--foreground);
    color: var(--background);
    font-size: 0.8rem;
    line-height: 1.35;
    text-align: center;
    white-space: normal;
    opacity: 0;
    pointer-events: none;
    transform: translate(-50%, -4px);
    transition: opacity 150ms ease-out, transform 150ms ease-out;
  }

  .sponsor:hover .sponsor-tip,
  .sponsor:focus .sponsor-tip,
  .sponsor:focus-visible .sponsor-tip {
    opacity: 1;
    transform: translate(-50%, 0);
  }

  /* ─── About us (между спонсорами и сеткой направлений) ──────── */
  .about-us-section {
    padding-bottom: clamp(2.5rem, 5vw, 4.5rem);
  }

  .about-us-copy {
    margin: 0 auto;
    max-width: 100%;
    text-align: center;
    color: var(--foreground-muted);
    font-size: clamp(1.75rem, 3.5vw, 2.6rem);
    font-weight: 500;
    line-height: 1.45;
    letter-spacing: -0.02em;
  }

  /* ─── Component showcase ─────────────────────────────────── */
  /* Ширина совпадает с границами свечения (hero-card): 92rem */
  .component-showcase {
    width: calc(100% - 2rem);
    max-width: 92rem;
    margin: 0 auto;
    padding: 0.5rem 1.25rem clamp(3rem, 6vw, 6rem);
    box-sizing: border-box;
  }

  /* 4 карточки: 4 колонки на ПК, 2×2 на планшете, 1 колонка на телефоне */
  .component-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    align-items: start;
    gap: clamp(1.5rem, 2.5vw, 3rem);
    width: 100%;
  }

  .component-showcase .showcase-actions {
    margin-top: clamp(2rem, 4vw, 3.5rem);
  }

  /* Мобильный: три кнопки друг под другом, на всю ширину */
  @media (max-width: 767px) {
    .component-showcase .showcase-actions {
      flex-direction: column;
      align-items: stretch;
      flex-wrap: nowrap;
      width: 100%;
      max-width: 24rem;
      margin-left: auto;
      margin-right: auto;
    }
  }

  .component-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    min-width: 0;
    gap: 1.25rem;
    overflow: visible;
  }

  .component-visual {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: clamp(14rem, 20vw, 22rem);
  }

  .component-visual :global(svg) {
    display: block;
    width: 100%;
    max-width: 100%;
    max-height: none;
  }

  /* Тема радара: линии — цвет текста, заливка — фон, акцент — фирменный розовый */
  .component-visual-radar {
    --hl-ink: var(--foreground);
    --hl-surface: var(--background);
    --hl-rim: var(--accent);
    --hl-accent: #f43f5e;
  }

  .component-copy {
    width: 100%;
    text-align: left;
  }

  .component-copy h2 {
    margin: 0 0 0.85rem;
    color: var(--foreground);
    font-size: clamp(1.1rem, 1.4vw, 1.4rem);
    font-weight: 600;
    line-height: 1.25;
    letter-spacing: -0.025em;
  }

  /* Стиль текста как в блоке «Opensophy — это инициатива…» */
  .component-copy p {
    margin: 0;
    color: var(--foreground-muted);
    font-size: clamp(1.1rem, 1.5vw, 1.45rem);
    font-weight: 500;
    line-height: 1.45;
    letter-spacing: -0.02em;
  }

  .component-copy .text-strong {
    color: var(--foreground);
  }

  .component-copy .text-accent {
    color: var(--accent);
  }

  @media (max-width: 1099px) {
    .component-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 3rem clamp(1.5rem, 3.5vw, 3rem);
    }

    .component-visual {
      min-height: clamp(16rem, 32vw, 22rem);
    }

    .component-copy h2 {
      font-size: clamp(1.2rem, 2.2vw, 1.5rem);
    }

    .component-copy p {
      font-size: clamp(1.15rem, 2.4vw, 1.5rem);
    }
  }

  @media (max-width: 767px) {
    .component-showcase {
      width: 100%;
      padding-left: 1rem;
      padding-right: 1rem;
    }

    .component-grid {
      grid-template-columns: 1fr;
      gap: 3rem;
    }

    .component-visual {
      min-height: 0;
      max-width: 28rem;
      margin: 0 auto;
    }

    .component-copy {
      max-width: 38rem;
      margin: 0 auto;
    }
  }

  /* ─── Section Layout ───────────────────────────────────────── */
  .section-block {
    padding-top: clamp(0.75rem, 1.5vw, 1.25rem);
    padding-bottom: clamp(1.5rem, 3vw, 2.5rem);
  }

  .section-overline {
    display: flex;
    justify-content: center;
    text-align: center;
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--foreground-muted);
    margin-bottom: 1rem;
  }

  .section-lead {
    font-size: clamp(1.75rem, 3.5vw, 2.6rem);
    font-weight: 500;
    line-height: 1.55;
    margin: 0;
    max-width: 100%;
  }

  .section-headlines {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    margin-bottom: 2.5rem;
  }

  .section-headline-plain {
    font-size: clamp(1.75rem, 3.5vw, 2.6rem);
    font-weight: 500;
    line-height: 1.55;
    color: var(--foreground);
    margin: 0;
    max-width: 100%;
  }

  .section-headline-muted {
    font-size: clamp(1.75rem, 3.5vw, 2.6rem);
    font-weight: 500;
    line-height: 1.55;
    color: var(--foreground-muted);
    margin: 0;
    max-width: 100%;
  }

  .services-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1.25rem;
    justify-content: center;
  }

  .services-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2.75rem;
    padding: 0.7rem 1rem;
    border-radius: var(--radius-sm, 0.55rem);
    border: 1px solid var(--border);
    background: var(--background-inset);
    color: var(--foreground);
    font-size: 0.9rem;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
  }

  .services-action-primary {
    border-color: transparent;
    background: var(--accent);
    color: #fff;
  }

  /* ─── Contacts ─────────────────────────────────────────────── */
  /* Ширина контактной секции */
  .contact-section {
    width: 92rem;
    max-width: calc(100vw - 2rem);
    margin: 0 auto;
    box-sizing: border-box;
    padding-bottom: clamp(3rem, 6vw, 6rem);
  }

  .contact-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.9rem;
    padding: 2.5rem 1.5rem;
    text-align: center;
    box-sizing: border-box;
  }

  .contact-title {
    margin: 0;
    font-size: clamp(1.75rem, 3.5vw, 2.6rem);
    font-weight: 500;
    line-height: 1.3;
    letter-spacing: -0.02em;
  }

  .contact-title span {
    display: block;
  }

  .contact-text {
    margin: 0;
    max-width: 34rem;
    font-size: clamp(1rem, 1.35vw, 1.2rem);
    font-weight: 500;
    line-height: 1.45;
    letter-spacing: -0.02em;
    color: var(--foreground-muted);
  }

  /* ─── Мобильные поправки для контактов ─────────────────────── */
  @media (max-width: 767px) {
    .contact-card {
      padding: 2rem 1.25rem;
    }

    .contact-actions {
      flex-direction: column;
      align-items: stretch;
      width: 100%;
      max-width: 20rem;
    }
  }

  /* ─── Featured product: NginxionS ─────────────────────────── */
  .nginxions-section {
    width: 100%;
    margin-top: clamp(2.5rem, 5vw, 4rem);
  }

  .nginxions-card {
    width: 100%;
    box-sizing: border-box;
    padding: clamp(1.5rem, 4vw, 3rem);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg, 0.9rem);
    background: var(--background-inset);
  }

  .nginxions-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .nginxions-overline {
    margin: 0;
    color: var(--foreground-muted);
    font-size: 1rem;
    font-weight: 500;
  }

  .nginxions-label {
    color: var(--foreground-muted);
    font-size: 0.78rem;
    font-weight: 600;
  }

  .nginxions-card h2 {
    margin: 0;
    color: var(--foreground);
    font-size: clamp(2.5rem, 6vw, 4.5rem);
    font-weight: 700;
    line-height: 1.05;
    letter-spacing: -0.06em;
  }

  .nginxions-card h2 span {
    color: var(--accent);
  }

  .nginxions-subtitle {
    margin: 0.8rem 0 0;
    color: var(--foreground);
    font-size: clamp(1rem, 1.7vw, 1.25rem);
    font-weight: 600;
    line-height: 1.45;
  }

  .nginxions-description {
    max-width: 70rem;
    margin: 1rem 0 0;
    color: var(--foreground-muted);
    font-size: 1rem;
    line-height: 1.7;
  }

  .nginxions-features {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1.25rem;
  }

  .nginxions-features span {
    padding: 0.4rem 0.65rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm, 0.45rem);
    color: var(--foreground-muted);
    font-size: 0.8rem;
    font-weight: 600;
  }

  .nginxions-link {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    min-height: 2.75rem;
    margin-top: 1.5rem;
    padding: 0.65rem 1rem;
    border-radius: var(--radius-sm, 0.55rem);
    background: var(--accent);
    color: #fff;
    font-size: 0.9rem;
    font-weight: 600;
    text-decoration: none;
  }

  @media (max-width: 767px) {
    .nginxions-heading {
      align-items: flex-start;
      flex-direction: column;
      gap: 0.35rem;
    }

    .nginxions-card {
      padding: 1.35rem;
    }

    .nginxions-link {
      width: 100%;
      justify-content: center;
      box-sizing: border-box;
    }
  }

</style>
