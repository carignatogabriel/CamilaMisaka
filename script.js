document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const WHATSAPP = '5511970710204';
    // Mensagem automática: usada quando a pessoa não escreve nada e em todos os botões diretos de WhatsApp
    const MENSAGEM_PADRAO = 'Olá, eu vim do site. Gostaria de saber mais sobre os procedimentos.';
    const whatsappUrl = texto => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;

    // Botões diretos (WhatsApp flutuante, "Vamos conversar", telefone do rodapé):
    // já abrem a conversa com a mensagem pronta, é só apertar enviar.
    $$('a[href^="https://wa.me/"]').forEach(a => { a.href = whatsappUrl(MENSAGEM_PADRAO); });

    // ==========================================
    // HEADER, PROGRESSO, PARALLAX E BOTÃO "TOPO"
    // (um único handler de scroll, throttled por requestAnimationFrame)
    // ==========================================
    const header = $('#header');
    const progress = $('#scroll-progress');
    const heroMedia = $('#hero-media');
    const hero = $('#inicio');
    const fabTop = $('#fab-top');
    const menuToggle = $('#menu-toggle');
    const navMenu = $('#nav-menu');
    const backdrop = $('#menu-backdrop');

    let lastY = window.scrollY;
    let ticking = false;

    function onScroll() {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;

        progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;

        header.classList.toggle('is-top', y < 60);

        const menuOpen = navMenu.classList.contains('active');
        if (!menuOpen) {
            if (y > 160 && y > lastY + 4) header.classList.add('menu-hidden');
            else if (y < lastY - 4 || y <= 160) header.classList.remove('menu-hidden');
        }

        // Parallax suave do hero (só enquanto ele está visível)
        if (!reduceMotion && heroMedia && y < hero.offsetHeight + 100) {
            heroMedia.style.transform = `translate3d(0, ${y * 0.22}px, 0)`;
        }

        fabTop.classList.toggle('show', y > 700);
        lastY = y;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(onScroll);
        }
    }, { passive: true });
    onScroll();

    fabTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

    // ==========================================
    // MENU HAMBÚRGUER (mobile)
    // ==========================================
    function setMenu(open) {
        menuToggle.classList.toggle('active', open);
        navMenu.classList.toggle('active', open);
        backdrop.classList.toggle('show', open);
        menuToggle.setAttribute('aria-expanded', String(open));
        menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
        document.body.classList.toggle('no-scroll', open);
        if (open) header.classList.remove('menu-hidden');
    }

    menuToggle.addEventListener('click', () => setMenu(!navMenu.classList.contains('active')));
    backdrop.addEventListener('click', () => setMenu(false));
    $$('a', navMenu).forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
    window.matchMedia('(min-width: 901px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

    // ==========================================
    // LINK ATIVO CONFORME A SEÇÃO
    // ==========================================
    const navLinks = $$('.menu a[href^="#"]:not(.btn)');
    const sectionMap = new Map();
    navLinks.forEach(l => {
        const sec = $(l.getAttribute('href'));
        if (sec) sectionMap.set(sec, l);
    });

    const spy = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            navLinks.forEach(l => l.classList.remove('active'));
            const link = sectionMap.get(entry.target);
            if (link) link.classList.add('active');
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sectionMap.forEach((_, sec) => spy.observe(sec));

    // ==========================================
    // REVELAR ELEMENTOS AO ENTRAR NA TELA
    // ==========================================
    const reveals = $$('.reveal');
    if ('IntersectionObserver' in window && !reduceMotion) {
        const io = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
        reveals.forEach(el => io.observe(el));
    } else {
        reveals.forEach(el => el.classList.add('show'));
    }

    // ==========================================
    // "ABERTO AGORA" (horário de São Paulo)
    // Dom=0 ... Sáb=6 → [abre, fecha]
    // ==========================================
    const SCHEDULE = { 2: [9, 19], 3: [9, 19], 4: [9, 19], 5: [9, 19], 6: [9, 15] };
    const DAY_NAMES = ['dom.', 'seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.'];

    function saoPauloNow() {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/Sao_Paulo', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false
        }).formatToParts(new Date());
        const get = t => parts.find(p => p.type === t).value;
        const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
        return { day, minutes: (parseInt(get('hour'), 10) % 24) * 60 + parseInt(get('minute'), 10) };
    }

    function updateOpenStatus() {
        const { day, minutes } = saoPauloNow();
        const today = SCHEDULE[day];
        let text;
        let open = false;

        if (today && minutes >= today[0] * 60 && minutes < today[1] * 60) {
            open = true;
            text = `Aberto agora · fecha às ${today[1]}h`;
        } else {
            for (let d = 0; d <= 7; d++) {
                const nextDay = (day + d) % 7;
                const sch = SCHEDULE[nextDay];
                if (!sch) continue;
                if (d === 0 && minutes >= sch[0] * 60) continue;   // hoje, mas já passou do horário
                const when = d === 0 ? 'hoje' : d === 1 ? 'amanhã' : DAY_NAMES[nextDay];
                text = `Fechado · abre ${when} às ${sch[0]}h`;
                break;
            }
        }

        $$('[data-open-status]').forEach(el => {
            el.classList.toggle('is-open', open);
            const t = $('[data-open-status-text]', el);
            if (t && text) t.textContent = text;
        });
    }
    updateOpenStatus();
    setInterval(updateOpenStatus, 60000);

    // ==========================================
    // BRILHO + PARALLAX INTERNO NOS CARDS DE TRATAMENTO
    // ==========================================
    if (finePointer && !reduceMotion) {
        $$('.treat').forEach(card => {
            card.addEventListener('pointermove', e => {
                const r = card.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width;
                const y = (e.clientY - r.top) / r.height;
                card.style.setProperty('--mx', `${x * 100}%`);
                card.style.setProperty('--my', `${y * 100}%`);
                card.style.setProperty('--px', `${(0.5 - x) * 22}px`);
                card.style.setProperty('--py', `${(0.5 - y) * 22}px`);
            });
            card.addEventListener('pointerleave', () => {
                card.style.setProperty('--px', '0px');
                card.style.setProperty('--py', '0px');
            });
        });
    }

    // ==========================================
    // "SAIBA MAIS" → leva ao agendamento já com o tratamento escolhido
    // ==========================================
    const booking = $('#agendar');
    const selectTrat = $('#f-trat');

    $$('[data-book]').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.closest('[data-treatment]').dataset.treatment;
            [...selectTrat.options].forEach(o => { if (o.text === name) selectTrat.value = o.value || o.text; });
            booking.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
            booking.classList.remove('flash');
            void booking.offsetWidth;
            booking.classList.add('flash');
            setTimeout(() => $('#f-nome').focus({ preventScroll: true }), 700);
        });
    });

    // ==========================================
    // FORMULÁRIO → WHATSAPP
    // ==========================================
    booking.addEventListener('submit', e => {
        e.preventDefault();
        const nomeInput = $('#f-nome');
        const nome = nomeInput.value.trim();
        const field = nomeInput.closest('.field');
        const erro = $('#f-nome-erro');

        if (nome.length < 2) {
            field.classList.add('invalid');
            erro.textContent = 'Por favor, informe seu nome.';
            nomeInput.focus();
            return;
        }
        field.classList.remove('invalid');
        erro.textContent = '';

        const trat = selectTrat.value;
        const periodo = $('input[name="periodo"]:checked').value;
        const msg = $('#f-msg').value.trim();

        // Sem mensagem própria, vai a mensagem automática. Com mensagem, ela vem logo após a identificação do site.
        const abertura = msg ? `Olá, eu vim do site. ${msg}` : MENSAGEM_PADRAO;

        const detalhes = [
            `Meu nome é ${nome}.`,
            trat !== 'Quero uma avaliação' ? `Tenho interesse em ${trat}.` : '',
            `Melhor período para o atendimento: ${periodo}.`
        ].filter(Boolean).join('\n');

        window.open(whatsappUrl(`${abertura}\n\n${detalhes}`), '_blank', 'noopener');
    });
    $('#f-nome').addEventListener('input', e => {
        if (e.target.value.trim().length >= 2) {
            e.target.closest('.field').classList.remove('invalid');
            $('#f-nome-erro').textContent = '';
        }
    });

    // ==========================================
    // CARROSSEL DE DEPOIMENTOS
    // ==========================================
    const track = $('#carousel-track');
    const slides = $$('.slide', track);
    const dotsBox = $('#car-dots');
    const prev = $('#car-prev');
    const next = $('#car-next');
    let current = 0;
    let autoplay = null;

    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Depoimento ${i + 1}`);
        dot.addEventListener('click', () => goTo(i, true));
        dotsBox.appendChild(dot);
    });
    const dots = $$('.dot', dotsBox);

    function setActive(i) {
        current = i;
        slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
        dots.forEach((d, k) => {
            d.classList.toggle('active', k === i);
            d.setAttribute('aria-selected', String(k === i));
        });
        prev.disabled = i === 0;
        next.disabled = i === slides.length - 1;
    }

    function goTo(i, user = false) {
        i = Math.max(0, Math.min(slides.length - 1, i));
        track.scrollTo({ left: slides[i].offsetLeft - slides[0].offsetLeft, behavior: reduceMotion ? 'auto' : 'smooth' });
        setActive(i);
        if (user) stopAutoplay();
    }

    let scrollTimer;
    track.addEventListener('scroll', () => {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
            const base = slides[0].offsetLeft;
            let best = 0, bestDist = Infinity;
            slides.forEach((s, k) => {
                const d = Math.abs(s.offsetLeft - base - track.scrollLeft);
                if (d < bestDist) { bestDist = d; best = k; }
            });
            if (best !== current) setActive(best);
        }, 60);
    }, { passive: true });

    prev.addEventListener('click', () => goTo(current - 1, true));
    next.addEventListener('click', () => goTo(current + 1, true));
    track.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1, true); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current - 1, true); }
    });

    function startAutoplay() {
        if (reduceMotion || autoplay) return;
        autoplay = setInterval(() => goTo(current === slides.length - 1 ? 0 : current + 1), 8000);
    }
    function stopAutoplay() { clearInterval(autoplay); autoplay = null; }

    const carousel = $('#carousel');
    carousel.addEventListener('pointerenter', stopAutoplay);
    carousel.addEventListener('focusin', stopAutoplay);
    carousel.addEventListener('touchstart', stopAutoplay, { passive: true });
    new IntersectionObserver(([en]) => en.isIntersecting ? startAutoplay() : stopAutoplay(), { threshold: 0.4 }).observe(carousel);
    setActive(0);

    // "Ler mais" nos depoimentos longos
    $$('[data-clamp]').forEach(text => {
        requestAnimationFrame(() => {
            if (text.scrollHeight <= text.clientHeight + 2) return;
            const btn = document.createElement('button');
            btn.className = 'read-more';
            btn.type = 'button';
            btn.textContent = 'Ler mais';
            btn.setAttribute('aria-expanded', 'false');
            btn.addEventListener('click', () => {
                const open = text.classList.toggle('expanded');
                btn.textContent = open ? 'Ler menos' : 'Ler mais';
                btn.setAttribute('aria-expanded', String(open));
                stopAutoplay();
            });
            text.after(btn);
        });
    });

    // ==========================================
    // GALERIA: setas + arrastar com o mouse
    // ==========================================
    const gallery = $('#gallery');
    const step = () => Math.max(gallery.clientWidth * 0.6, 240);
    $('#gal-prev').addEventListener('click', () => gallery.scrollBy({ left: -step(), behavior: 'smooth' }));
    $('#gal-next').addEventListener('click', () => gallery.scrollBy({ left: step(), behavior: 'smooth' }));

    let dragStartX = 0, dragStartLeft = 0, dragging = false, moved = false;
    gallery.addEventListener('pointerdown', e => {
        if (e.pointerType !== 'mouse') return;
        dragging = true; moved = false;
        dragStartX = e.clientX; dragStartLeft = gallery.scrollLeft;
    });
    window.addEventListener('pointermove', e => {
        if (!dragging) return;
        const dx = e.clientX - dragStartX;
        if (Math.abs(dx) > 5) { moved = true; gallery.classList.add('dragging'); }
        if (moved) gallery.scrollLeft = dragStartLeft - dx;
    });
    window.addEventListener('pointerup', () => {
        if (!dragging) return;
        dragging = false;
        setTimeout(() => gallery.classList.remove('dragging'), 0);
    });

    // ==========================================
    // LIGHTBOX (galeria + antes/depois)
    // ==========================================
    const lb = $('#lightbox');
    const lbImg = $('#lb-img');
    const lbCap = $('#lb-cap');
    const lbPrev = $('#lb-prev');
    const lbNext = $('#lb-next');
    let group = [], idx = 0, lastFocus = null;

    function showImage(i) {
        idx = (i + group.length) % group.length;
        const item = group[idx];
        lbImg.classList.remove('ready');
        const tmp = new Image();
        tmp.onload = () => {
            lbImg.src = tmp.src;
            lbImg.alt = item.dataset.caption || '';
            lbCap.textContent = item.dataset.caption || '';
            requestAnimationFrame(() => lbImg.classList.add('ready'));
        };
        tmp.src = item.dataset.full;
        const single = group.length < 2;
        lbPrev.hidden = single; lbNext.hidden = single;
    }

    function openLightbox(trigger) {
        const name = trigger.dataset.lightbox;
        group = $$(`[data-lightbox="${name}"]`);
        lastFocus = trigger;
        lb.hidden = false;
        document.body.classList.add('no-scroll');
        requestAnimationFrame(() => lb.classList.add('open'));
        showImage(group.indexOf(trigger));
        $('#lb-close').focus();
    }

    function closeLightbox() {
        lb.classList.remove('open');
        document.body.classList.remove('no-scroll');
        setTimeout(() => { lb.hidden = true; lbImg.removeAttribute('src'); }, 350);
        if (lastFocus) lastFocus.focus({ preventScroll: true });
    }

    $$('[data-lightbox]').forEach(el => el.addEventListener('click', () => openLightbox(el)));
    $('#lb-close').addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', () => showImage(idx - 1));
    lbNext.addEventListener('click', () => showImage(idx + 1));
    lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lb-stage')) closeLightbox(); });
    document.addEventListener('keydown', e => {
        if (lb.hidden) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showImage(idx - 1);
        if (e.key === 'ArrowRight') showImage(idx + 1);
        if (e.key === 'Tab') {                       // mantém o foco dentro do lightbox
            const f = $$('button:not([hidden])', lb);
            const first = f[0], last = f[f.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    });

    // gesto de arrastar no celular
    let touchX = null;
    lb.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => {
        if (touchX === null || group.length < 2) return;
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 50) showImage(dx > 0 ? idx - 1 : idx + 1);
        touchX = null;
    });

    // ==========================================
    // VÍDEO: play sob demanda, som e progresso
    // ==========================================
    const video = $('#video');
    const videoBox = $('#video-box');
    const playBtn = $('#play-btn');
    const muteBtn = $('#mute-btn');
    const bar = $('#video-progress span');

    function syncMuteIcon() {
        muteBtn.firstElementChild.className = video.muted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
    }
    function playVideo() {
        const started = () => {
            videoBox.classList.add('playing');
            muteBtn.hidden = false;
            syncMuteIcon();
        };
        video.play().then(started).catch(() => {
            // Se o navegador recusar o som, toca mudo (o botão de som permite ativar depois)
            video.muted = true;
            video.play().then(started).catch(() => { /* sem permissão: o usuário pode tentar de novo */ });
        });
    }
    playBtn.addEventListener('click', playVideo);
    video.addEventListener('click', () => {
        if (video.paused) playVideo();
        else { video.pause(); videoBox.classList.remove('playing'); }
    });
    video.addEventListener('ended', () => { videoBox.classList.remove('playing'); bar.style.width = '0'; });
    video.addEventListener('timeupdate', () => {
        if (video.duration) bar.style.width = `${(video.currentTime / video.duration) * 100}%`;
    });
    muteBtn.addEventListener('click', () => {
        video.muted = !video.muted;
        syncMuteIcon();
    });
    // pausa o vídeo quando sai da tela
    new IntersectionObserver(([en]) => {
        if (!en.isIntersecting && !video.paused) { video.pause(); videoBox.classList.remove('playing'); }
    }, { threshold: 0.2 }).observe(videoBox);
});
