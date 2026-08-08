document.addEventListener('DOMContentLoaded', () => {

  // ─── DOM Elements ───
  const ambientCanvas = document.getElementById('ambient-canvas');
  const book = document.getElementById('book');
  const leaves = Array.from(document.querySelectorAll('.leaf')).reverse();
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const navIndicator = document.getElementById('nav-indicator');
  const resetBtn = document.getElementById('reset-btn');
  const bookContainer = document.getElementById('book-container');
  const backCover = document.querySelector('.back-cover-panel');

  const ctx = ambientCanvas.getContext('2d');

  const totalLeaves = leaves.length; // 3
  let currentFlip = 0;

  const pageLabels = [
    'Cover',
    'Pages 1 – 2',
    'Pages 3 – 4',
    'Pages 4 – 5',
  ];



  function updateZIndexes() {
    leaves.forEach((leaf, i) => {
      const isFlipped = leaf.classList.contains('flipped');
      if (isFlipped) {

        leaf.style.zIndex = totalLeaves + i + 1;
      } else {

        leaf.style.zIndex = totalLeaves - i;
      }
    });


    if (backCover) {
      if (currentFlip === totalLeaves) {
        backCover.style.zIndex = 20;
        backCover.style.pointerEvents = 'auto';
      } else {
        backCover.style.zIndex = 0;
        backCover.style.pointerEvents = 'none';
      }
    }
  }


  updateZIndexes();



  function flipForward() {
    if (currentFlip >= totalLeaves) return;

    const leaf = leaves[currentFlip];
    leaf.classList.add('flipped');
    currentFlip++;

    updateZIndexes();
    updateNavState();
  }

  function flipBackward() {
    if (currentFlip <= 0) return;

    currentFlip--;
    const leaf = leaves[currentFlip];
    leaf.classList.remove('flipped');

    updateZIndexes();
    updateNavState();
  }

  function resetBook() {
    leaves.forEach(leaf => leaf.classList.remove('flipped'));
    currentFlip = 0;
    updateZIndexes();
    updateNavState();
  }

  function updateNavState() {
    prevBtn.disabled = currentFlip === 0;
    nextBtn.disabled = currentFlip >= totalLeaves;
    navIndicator.textContent = pageLabels[currentFlip] || 'Back Cover';


    if (currentFlip > 0) {
      bookContainer.classList.add('open');
      document.body.classList.add('book-open');
    } else {
      bookContainer.classList.remove('open');
      document.body.classList.remove('book-open');
    }
  }



  nextBtn.addEventListener('click', flipForward);
  prevBtn.addEventListener('click', flipBackward);
  resetBtn.addEventListener('click', resetBook);


  leaves.forEach((leaf, index) => {
    leaf.addEventListener('click', (e) => {

      if (e.target.closest('.page-content')) {
        return;
      }

      const isFlipped = leaf.classList.contains('flipped');

      if (!isFlipped) {

        if (index === currentFlip) {
          flipForward();
        }
      } else {

        if (index === currentFlip - 1) {
          flipBackward();
        }
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      flipForward();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      flipBackward();
    } else if (e.key === 'r' || e.key === 'R') {
      resetBook();
    }
  });



  let tiltX = 0, tiltY = 0;

  document.addEventListener('mousemove', (e) => {
    const px = (e.clientX / window.innerWidth) - 0.5;
    const py = (e.clientY / window.innerHeight) - 0.5;

    tiltX = py * -8;
    tiltY = px * 8;

    book.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  });

  document.addEventListener('mouseleave', () => {
    book.style.transition = 'transform 0.6s ease';
    book.style.transform = 'rotateX(0deg) rotateY(0deg)';
    setTimeout(() => {
      book.style.transition = '';
    }, 600);
  });



  let dustParticles = [];
  const maxDust = 40;

  function resizeCanvas() {
    ambientCanvas.width = window.innerWidth;
    ambientCanvas.height = window.innerHeight;
    initDust();
  }

  function initDust() {
    dustParticles = [];
    for (let i = 0; i < maxDust; i++) {
      dustParticles.push(createDust(true));
    }
  }

  function createDust(randomY = true) {
    return {
      x: Math.random() * ambientCanvas.width,
      y: randomY ? Math.random() * ambientCanvas.height : ambientCanvas.height + 5,
      size: Math.random() * 2 + 0.5,
      speedY: -(0.15 + Math.random() * 0.3), // Slowly drifting upward
      speedX: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.4 + 0.1,
      wobbleAngle: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.005 + Math.random() * 0.01,
      wobbleAmp: 0.3 + Math.random() * 0.5
    };
  }

  function drawDust() {
    ctx.clearRect(0, 0, ambientCanvas.width, ambientCanvas.height);

    dustParticles.forEach((d, i) => {
      d.wobbleAngle += d.wobbleSpeed;
      d.x += d.speedX + Math.sin(d.wobbleAngle) * d.wobbleAmp;
      d.y += d.speedY;

      // Recycle
      if (d.y < -10 || d.x < -10 || d.x > ambientCanvas.width + 10) {
        dustParticles[i] = createDust(false);
        dustParticles[i].y = ambientCanvas.height + 5;
        return;
      }

      ctx.globalAlpha = d.opacity;
      ctx.fillStyle = '#e8d8b4'; // Warm golden dust
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(drawDust);
  }


  function scaleBook() {
    const bookScaler = document.getElementById('book-scaler');
    if (!bookScaler) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const navSpace = 60;
    const availableH = vh - navSpace;


    const bookW = 700;
    const bookH = 480;
    const padX = 40;
    const padY = 40;

    const scaleX = (vw - padX) / bookW;
    const scaleY = (availableH - padY) / bookH;

    let scale = Math.min(scaleX, scaleY);


    if (scale > 1.05) scale = 1.05;
    if (scale < 0.2) scale = 0.2;

    bookScaler.style.transform = `scale(${scale})`;


    const deskDecors = document.querySelectorAll('.desk-decor, .desk-polaroid, .leaf-shadow-overlay');
    deskDecors.forEach(el => {
      el.style.display = vw < 550 ? 'none' : '';
    });
  }

  window.addEventListener('resize', () => {
    resizeCanvas();
    scaleBook();
  });
  resizeCanvas();
  scaleBook();
  requestAnimationFrame(drawDust);


  const contactForm = document.getElementById('contact-form');
  const contactName = document.getElementById('contact-name');
  const contactEmail = document.getElementById('contact-email');
  const contactMessage = document.getElementById('contact-message');
  const contactSubmit = document.getElementById('contact-submit');
  const formSuccess = document.getElementById('form-success');
  const successUserName = document.getElementById('success-user-name');
  const successUserEmail = document.getElementById('success-user-email');
  const formResetBtn = document.getElementById('form-reset-btn');
  const formNoteFooter = document.getElementById('form-note-footer');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();


      contactName.classList.remove('invalid-field');
      contactEmail.classList.remove('invalid-field');
      contactMessage.classList.remove('invalid-field');

      const nameVal = contactName.value.trim();
      const emailVal = contactEmail.value.trim();
      const messageVal = contactMessage.value.trim();

      let hasError = false;

      if (!nameVal) {
        contactName.classList.add('invalid-field');
        hasError = true;
      }
      if (!emailVal || !emailVal.includes('@')) {
        contactEmail.classList.add('invalid-field');
        hasError = true;
      }
      if (!messageVal) {
        contactMessage.classList.add('invalid-field');
        hasError = true;
      }

      if (hasError) {
        return;
      }


      contactSubmit.disabled = true;
      contactSubmit.innerHTML = 'Sending... ✉️';


      setTimeout(() => {

        contactForm.style.display = 'none';
        if (formNoteFooter) formNoteFooter.style.display = 'none';


        successUserName.textContent = nameVal;
        successUserEmail.textContent = emailVal;
        formSuccess.style.display = 'flex';


        contactSubmit.disabled = false;
        contactSubmit.innerHTML = 'Send It 📨';
      }, 1200);
    });

    formResetBtn.addEventListener('click', () => {
      contactForm.reset();
      formSuccess.style.display = 'none';
      contactForm.style.display = 'flex';
      if (formNoteFooter) formNoteFooter.style.display = 'block';
    });

    [contactName, contactEmail, contactMessage].forEach(input => {
      input.addEventListener('input', () => {
        input.classList.remove('invalid-field');
      });
    });
  }


  updateNavState();
});
