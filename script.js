document.addEventListener('DOMContentLoaded', () => {
    // 1. Rolagem suave ao clicar nos links do menu (Smooth Scroll)
    const linksMenu = document.querySelectorAll('a[href^="#"]');

    linksMenu.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Verifica se o href é válido e diferente de '#'
            if (href && href !== '#') {
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    e.preventDefault();
                    
                    // Calcula a distância considerando a altura fixa do header
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // 2. Destacar o link ativo no menu durante a rolagem (ScrollSpy)
    const sections = document.querySelectorAll('section, footer');
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
});