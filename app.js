document.addEventListener("DOMContentLoaded", function () {
    const links = document.querySelectorAll('.link');
    const sections = document.querySelectorAll('section');
    const menuIcon = document.querySelector('.menu-icon');
    const linkGroup = document.querySelector('.link-group');
    const navbar = document.querySelector('.navbar');

    let activeLink = 0;

    links.forEach((link, i) => {
        link.addEventListener('click', () => {
            navbar.classList.toggle('active');
        });
    });

    // Toggle mobile menu
    menuIcon.addEventListener('click', () => {
        navbar.classList.toggle('active');
    });
});
