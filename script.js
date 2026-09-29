document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // ELEMENTOS
    // ==========================================

    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.menu a, #nav-menu a');

    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    // ==========================================
// EFEITO DE FLUTUAÇÃO DA IMAGEM PROFISSIONAL
// ==========================================

const professionalImage = document.querySelector('.professional-image');

if (professionalImage) {

    let startTime = null;

    function floatingAnimation(timestamp) {

        if (!startTime) startTime = timestamp;

        const elapsed = timestamp - startTime;

        // Movimento vertical suave
        const movement = Math.sin(elapsed / 1200) * 6;

        // Pequena rotação para deixar mais natural
        const rotation = Math.sin(elapsed / 1800) * 0.4;

        professionalImage.style.transform =
            `translateY(${movement}px) rotate(${rotation}deg)`;

        requestAnimationFrame(floatingAnimation);
    }

    requestAnimationFrame(floatingAnimation);
}


    // ==========================================
    // SCROLL SUAVE DOS LINKS
    // ==========================================

    navLinks.forEach(link => {

        link.addEventListener('click', function (event) {

            const targetId = this.getAttribute('href');

            if (targetId && targetId.startsWith('#')) {

                const targetSection = document.querySelector(targetId);

                if (targetSection) {

                    event.preventDefault();

                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });

                    history.pushState(null, '', targetId);
                }
            }

            // Fecha o menu no celular
            if (menuToggle && navMenu) {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }

        });

    });


    // ==========================================
    // LINK ATIVO CONFORME A SEÇÃO
    // ==========================================

    function updateActiveSection() {

        let currentSection = '';

        const scrollPosition = window.scrollY + 150;

        sections.forEach(section => {

            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (
                scrollPosition >= sectionTop &&
                scrollPosition < sectionTop + sectionHeight
            ) {
                currentSection = section.getAttribute('id');
            }

        });

        navLinks.forEach(link => {

            link.classList.remove('active');

            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }

        });

    }

    window.addEventListener('scroll', updateActiveSection);

    updateActiveSection();


    // ==========================================
    // MENU HAMBÚRGUER
    // ==========================================

    if (menuToggle && navMenu) {

        menuToggle.addEventListener('click', function () {

            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');

        });

    }


    // ==========================================
    // ANIMAÇÃO DOS ELEMENTOS AO ENTRAREM NA TELA
    // ==========================================

    const animatedElements = document.querySelectorAll(
        '.section-heading, .card, .professional-image, .professional-text, .testimonial, .cta h2, .cta p, .cta a, .footer > .container'
    );

    // Adiciona a classe inicial
    animatedElements.forEach(element => {
        element.classList.add('scroll-animation');
    });


    // Observa quando os elementos entram na tela
    const observer = new IntersectionObserver((entries, observer) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add('show');

                // Para de observar depois que apareceu
                observer.unobserve(entry.target);
            }

        });

    }, {
        threshold: 0.15
    });


    // Começa a observar os elementos
    animatedElements.forEach(element => {
        observer.observe(element);
    });

    // ==========================================
// ESCONDER MENU AO DESCER / MOSTRAR AO SUBIR
// ==========================================

const header = document.querySelector('header');

let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {

    const currentScrollY = window.scrollY;

    // Evita esconder o menu quando estiver no topo
    if (currentScrollY <= 50) {
        header.classList.remove('menu-hidden');
        lastScrollY = currentScrollY;
        return;
    }

    // Descendo a página
    if (currentScrollY > lastScrollY) {
        header.classList.add('menu-hidden');
    }

    // Subindo a página
    else if (currentScrollY < lastScrollY) {
        header.classList.remove('menu-hidden');
    }

    lastScrollY = currentScrollY;
});

});

