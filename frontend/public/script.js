const modal = document.querySelector('.login-modal');

document.getElementById('login-btn').addEventListener('click', () => {
    modal.classList.add('active');
    document.body.classList.add('no-scroll');
});

document.querySelector('.login-modal .close-btn').addEventListener('click', () => {
    modal.classList.remove('active');
    document.body.classList.remove('no-scroll');
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }
});