document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.getElementById("navbar");
    
    // Sticky Navbar on Scroll
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });

    // Reveal elements on scroll
    const reveals = document.querySelectorAll(".reveal");

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 100; // Trigger slightly earlier for smoother effect

        reveals.forEach((reveal) => {
            const elementTop = reveal.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add("active");
            }
        });
    };

    // Listen to scroll events
    window.addEventListener("scroll", revealOnScroll);
    
    // Trigger once on load to reveal elements already in viewport
    revealOnScroll();
});
