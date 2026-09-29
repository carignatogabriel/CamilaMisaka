document.addEventListener('DOMContentLoaded', () => {
    // 1. LÓGICA DE SCROLL (Ativa o link conforme a página rola)
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.menu a');

    window.addEventListener('scroll', () => {
        let currentSection = '';
        const scrollPosition = window.pageYOffset + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    });

    // 2. LÓGICA DO MENU HAMBÚRGUER (Abrir e fechar em telemóveis/celulares)
    const menuToggle = document.getElementById("menu-toggle");
    const navMenu = document.getElementById("nav-menu");

    if (menuToggle && navMenu) {
        // Alterna a classe 'active' ao clicar no botão hambúrguer
        menuToggle.addEventListener("click", function () {
            menuToggle.classList.toggle("active");
            navMenu.classList.toggle("active");
        });

        // Fecha o menu ao clicar em qualquer um dos links
        navLinks.forEach(link => {
            link.addEventListener("click", function () {
                menuToggle.classList.remove("active");
                navMenu.classList.remove("active");
            });
        });
    }
});