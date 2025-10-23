// ============================================
// CHRONOS - Machine à Voyager dans le Temps
// Système de jeu interactif pour l'histoire du Web
// ============================================

class TimeMachine {
  constructor() {
    this.state = {
      score: 0,
      energy: 100,
      artifacts: 0,
      currentEra: null,
      unlockedEras: [0],
      completedEras: [],
      achievements: [],
      eraProgress: [0, 0, 0, 0] // Progression pour chaque époque (0-4 défis)
    };

    this.eras = [
      {
        id: 0,
        period: '1900 - 1945',
        name: 'Vannevar Bush',
        icon: '📻',
        color: '#6ecfff',
        story: `Visionnaire du traitement de l'information, Bush imagine des machines capables 
                d'augmenter la mémoire humaine et d'ouvrir la voie à une circulation mondiale du savoir.`,
        timeline: [
          { year: '1901', event: 'Première transmission radio transatlantique reliant l\'Angleterre au Canada' },
          { year: 'Années 30', event: 'Développe le concept du Memex, ancêtre des hyperliens' },
          { year: '1945', event: 'Publie "As We May Think", article visionnaire sur l\'avenir de l\'information' }
        ],
        quiz: {
          question: 'Quel concept révolutionnaire Vannevar Bush a-t-il développé ?',
          options: ['L\'Internet', 'Le Memex', 'L\'email', 'Le Web'],
          correct: 1
        },
        puzzle: [
          { id: 1, text: '1901: Transmission radio transatlantique', order: 1 },
          { id: 2, text: 'Années 30: Concept du Memex', order: 2 },
          { id: 3, text: '1945: Article "As We May Think"', order: 3 }
        ],
        artifacts: ['radio', 'memex', 'article'],
        connections: [
          { concept: 'Memex', definition: 'Système de gestion de l\'information personnelle' },
          { concept: 'Hyperlinks', definition: 'Liens entre documents' },
          { concept: 'Radio', definition: 'Transmission sans fil' }
        ]
      },
      {
        id: 1,
        period: '1958 - 1990',
        name: 'Ray Tomlinson',
        icon: '📧',
        color: '#ff9565',
        story: `Ingénieur et pionnier d'ARPANET, Tomlinson ouvre la voie aux communications 
                numériques interconnectées et invente l'email moderne.`,
        timeline: [
          { year: '1965', event: 'Première connexion entre deux ordinateurs distants' },
          { year: '1971', event: 'Invente l\'e-mail et choisit le symbole @' },
          { year: '1972', event: 'Démonstration publique d\'ARPANET' }
        ],
        quiz: {
          question: 'Quel symbole Ray Tomlinson a-t-il choisi pour l\'email ?',
          options: ['#', '@', '&', '*'],
          correct: 1
        },
        puzzle: [
          { id: 1, text: '1965: Connexion entre ordinateurs distants', order: 1 },
          { id: 2, text: '1971: Invention de l\'email avec @', order: 2 },
          { id: 3, text: '1972: Démonstration publique d\'ARPANET', order: 3 }
        ],
        artifacts: ['computer', 'email', 'arpanet'],
        connections: [
          { concept: 'ARPANET', definition: 'Ancêtre d\'Internet' },
          { concept: '@', definition: 'Séparateur utilisateur/machine' },
          { concept: 'Email', definition: 'Courrier électronique' }
        ]
      },
      {
        id: 2,
        period: '1990 - 2020',
        name: 'Tim Berners-Lee',
        icon: '🌐',
        color: '#a080ff',
        story: `Inventeur du World Wide Web, Berners-Lee démocratise l'accès à l'information 
                via les hyperliens et les pages HTML.`,
        timeline: [
          { year: '1989', event: 'Propose le projet World Wide Web au CERN' },
          { year: '1991', event: 'Premier site web mis en ligne' },
          { year: '1993', event: 'Mosaic rend le Web accessible au grand public' }
        ],
        quiz: {
          question: 'Qu\'a inventé Tim Berners-Lee ?',
          options: ['Internet', 'Le World Wide Web', 'L\'ordinateur', 'Le smartphone'],
          correct: 1
        },
        puzzle: [
          { id: 1, text: '1989: Proposition du projet WWW', order: 1 },
          { id: 2, text: '1991: Premier site web', order: 2 },
          { id: 3, text: '1993: Navigateur Mosaic', order: 3 }
        ],
        artifacts: ['www', 'html', 'http'],
        connections: [
          { concept: 'HTML', definition: 'Langage de balisage' },
          { concept: 'HTTP', definition: 'Protocole de transfert' },
          { concept: 'WWW', definition: 'Toile mondiale' }
        ]
      },
      {
        id: 3,
        period: '2020 - Aujourd\'hui',
        name: 'Gavin Wood',
        icon: '⛓️',
        color: '#58f9c6',
        story: `Co-fondateur d'Ethereum et de la Web3 Foundation, Wood imagine un web décentralisé 
                reposant sur la blockchain et le contrôle utilisateur.`,
        timeline: [
          { year: '2014', event: 'Co-fonde Ethereum' },
          { year: '2016', event: 'Crée Polkadot pour l\'interopérabilité blockchain' },
          { year: '2020', event: 'Formalise la vision du Web 3.0' }
        ],
        quiz: {
          question: 'Qu\'est-ce que le Web 3.0 selon Gavin Wood ?',
          options: ['Web rapide', 'Web décentralisé', 'Web mobile', 'Web social'],
          correct: 1
        },
        puzzle: [
          { id: 1, text: '2014: Co-fondation d\'Ethereum', order: 1 },
          { id: 2, text: '2016: Création de Polkadot', order: 2 },
          { id: 3, text: '2020: Vision du Web 3.0', order: 3 }
        ],
        artifacts: ['ethereum', 'polkadot', 'web3'],
        connections: [
          { concept: 'Blockchain', definition: 'Registre distribué' },
          { concept: 'Web3', definition: 'Internet décentralisé' },
          { concept: 'Smart Contracts', definition: 'Contrats programmables' }
        ]
      }
    ];

    this.init();
  }

  init() {
    this.setupIntroScreen();
    this.setupParticles();
    this.setupTimeWheel();
    this.setupExplorer();
    this.setupCustomCursor();
    this.setupMagneticElements();
    this.loadProgress();
    this.updateHUD();
  }

  // ============================================
  // CURSEUR PERSONNALISÉ
  // ============================================
  setupCustomCursor() {
    const cursorEl = document.querySelector('.custom-cursor');
    if (!cursorEl) return;

    const cursor = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let targetX = cursor.x;
    let targetY = cursor.y;

    // Utilise un event passif pour optimisation
    document.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    }, { passive: true });

    const animateCursor = () => {
      // Interpolation plus rapide (0.25 au lieu de 0.15)
      cursor.x += (targetX - cursor.x) * 0.25;
      cursor.y += (targetY - cursor.y) * 0.25;

      // Utilise transform au lieu de left/top pour performance GPU
      cursorEl.style.transform = `translate(${cursor.x}px, ${cursor.y}px) translate(-50%, -50%)`;

      requestAnimationFrame(animateCursor);
    };

    animateCursor();

    // Changer l'apparence sur hover
    const interactiveElements = document.querySelectorAll('button, a, .hunt-card, .era-segment, .challenge-header');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorEl.classList.add('hover');
      });
      el.addEventListener('mouseleave', () => {
        cursorEl.classList.remove('hover');
      });
    });
  }

  // ============================================
  // EFFETS MAGNÉTIQUES SUR LES BOUTONS
  // ============================================
  setupMagneticElements() {
    const magneticElements = document.querySelectorAll('.intro-start-btn, .btn-primary, .btn-secondary, .explorer-close');
    
    magneticElements.forEach(el => {
      let isHovering = false;
      
      el.addEventListener('mouseenter', () => {
        isHovering = true;
      });
      
      el.addEventListener('mousemove', (e) => {
        if (!isHovering) return;
        
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        // Réduit l'effet magnétique de 0.3 à 0.15 pour moins de calculs
        const moveX = x * 0.15;
        const moveY = y * 0.15;
        
        // Utilise transform pour accélération GPU
        el.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) rotate(-1deg)`;
      });

      el.addEventListener('mouseleave', () => {
        isHovering = false;
        el.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
      });
    });
  }

  // ============================================
  // ÉCRAN D'INTRODUCTION
  // ============================================
  setupIntroScreen() {
    const introScreen = document.querySelector('[data-intro]');
    const startBtn = document.querySelector('[data-start-journey]');

    if (startBtn) {
      startBtn.addEventListener('click', () => {
        introScreen.classList.add('fade-out');
        setTimeout(() => {
          introScreen.style.display = 'none';
          this.playSound('start');
          this.showAchievement('🚀 Voyage commencé !', 'Bienvenue dans CHRONOS');
        }, 800);
      });
    }
  }

  // ============================================
  // SYSTÈME DE PARTICULES AMÉLIORÉ
  // ============================================
  setupParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    // Détecte si l'appareil est puissant
    const isLowPerformance = navigator.hardwareConcurrency <= 4 || 
                              /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    const ctx = canvas.getContext('2d', { 
      alpha: true, 
      desynchronized: true,
      willReadFrequently: false 
    });
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = isLowPerformance ? 20 : 35; // Encore réduit
    const mouse = { x: null, y: null, radius: 80, lastUpdate: 0 }; // Réduit à 80

    const colors = ['#00F0FF', '#FF006E', '#FFD60A', '#9D4EDD', '#00FF66'];

    class Particle {
      constructor() {
        this.reset();
      }
      
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.4 + 0.2;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.density = Math.random() * 15 + 5;
      }

      update(now) {
        this.x += this.speedX;
        this.y += this.speedY;

        // Rebond optimisé
        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;

        // Interaction souris avec throttling temporel
        if (mouse.x != null && mouse.y != null && now - mouse.lastUpdate < 100) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distSq = dx * dx + dy * dy;
          const radiusSq = mouse.radius * mouse.radius;

          if (distSq < radiusSq && distSq > 1) {
            const dist = Math.sqrt(distSq);
            const force = (mouse.radius - dist) / mouse.radius;
            const moveX = (dx / dist) * force * this.density * 0.2;
            const moveY = (dy / dist) * force * this.density * 0.2;
            this.x -= moveX;
            this.y -= moveY;
          }
        }
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Throttle mouse tracking encore plus
    let mouseThrottle;
    window.addEventListener('mousemove', (e) => {
      if (!mouseThrottle) {
        mouse.x = e.x;
        mouse.y = e.y;
        mouse.lastUpdate = Date.now();
        
        mouseThrottle = setTimeout(() => {
          mouseThrottle = null;
        }, 50); // 50ms throttle
      }
    }, { passive: true });

    window.addEventListener('mouseout', () => {
      mouse.x = null;
      mouse.y = null;
    }, { passive: true });

    // Connexions simplifiées - pas de gradients
    const connect = () => {
      const maxDist = 80; // Réduit de 100 à 80
      const maxDistSq = maxDist * maxDist;
      let connections = 0;
      const maxConnections = isLowPerformance ? 30 : 50;
      
      for (let a = 0; a < particles.length && connections < maxConnections; a++) {
        for (let b = a + 1; b < particles.length && connections < maxConnections; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDistSq) {
            const opacity = (1 - Math.sqrt(distSq) / maxDist) * 0.15;
            ctx.strokeStyle = particles[a].color;
            ctx.globalAlpha = opacity;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
            connections++;
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    let frameCount = 0;
    let lastFrameTime = performance.now();
    let fps = 60;

    const animate = (currentTime) => {
      // Calcul FPS
      const delta = currentTime - lastFrameTime;
      fps = 1000 / delta;
      lastFrameTime = currentTime;

      // Skip frames si performance faible
      if (fps < 30 && frameCount % 2 === 0) {
        frameCount++;
        requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update(currentTime);
        particle.draw();
      });

      // Connexions toutes les 3 frames pour économiser
      if (frameCount % 3 === 0) {
        connect();
      }
      
      frameCount++;
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);

    // Debounce resize avec pause d'animation
    let resizeTimeout;
    let isResizing = false;
    window.addEventListener('resize', () => {
      isResizing = true;
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        particles.forEach(p => p.reset());
        isResizing = false;
      }, 300);
    });

    // Pause quand l'onglet n'est pas visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        mouse.x = null;
        mouse.y = null;
      }
    });
  }

  // ============================================
  // ROUE TEMPORELLE
  // ============================================
  setupTimeWheel() {
    const segments = document.querySelectorAll('.era-segment');
    
    segments.forEach(segment => {
      const eraId = parseInt(segment.dataset.era);
      const isLocked = segment.dataset.locked === 'true';

      segment.style.cursor = isLocked ? 'not-allowed' : 'pointer';

      segment.addEventListener('click', () => {
        if (!isLocked && this.state.unlockedEras.includes(eraId)) {
          this.travelToEra(eraId);
        } else if (isLocked) {
          this.showNotification('❌ Époque verrouillée', 'Complétez l\'époque précédente');
        }
      });

      segment.addEventListener('mouseenter', () => {
        if (!isLocked) {
          segment.querySelector('.segment-path').style.opacity = '0.6';
        }
      });

      segment.addEventListener('mouseleave', () => {
        segment.querySelector('.segment-path').style.opacity = '0.3';
      });
    });
  }

  travelToEra(eraId) {
    const era = this.eras[eraId];
    this.state.currentEra = eraId;

    // Animation de transition
    this.createTemporalDistortion();
    
    // Consommer de l'énergie
    this.consumeEnergy(10);

    // Afficher l'explorateur
    setTimeout(() => {
      this.openExplorer(era);
      this.updateConsole(`> VOYAGE VERS ${era.period}`);
      this.updateCurrentEra(era);
    }, 500);
  }

  createTemporalDistortion() {
    const body = document.body;
    body.style.animation = 'temporal-warp 0.5s ease';
    setTimeout(() => {
      body.style.animation = '';
    }, 500);
  }

  // ============================================
  // EXPLORATEUR D'ÉPOQUE
  // ============================================
  setupExplorer() {
    const closeBtns = document.querySelectorAll('[data-close-explorer]');
    
    closeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeExplorer();
      });
    });
  }

  openExplorer(era) {
    const explorer = document.querySelector('[data-era-explorer]');
    if (!explorer) return;

    // Mettre à jour les informations
    document.querySelector('[data-era-icon]').textContent = era.icon;
    document.querySelector('[data-era-period]').textContent = era.period;
    document.querySelector('[data-era-pioneer]').textContent = era.name;

    // Histoire
    const storyContent = document.querySelector('[data-story-content]');
    storyContent.innerHTML = `
      <p class="story-lead">${era.story}</p>
      <div class="story-timeline">
        ${era.timeline.map(item => `
          <div class="timeline-event">
            <strong>${item.year}</strong> — ${item.event}
          </div>
        `).join('')}
      </div>
    `;

    // Progression
    const progress = this.state.eraProgress[era.id];
    document.querySelector('[data-era-progress]').style.width = `${(progress / 4) * 100}%`;
    document.querySelector('[data-progress-text]').textContent = `${progress}/4 complétés`;

    // Initialiser les défis
    this.initializeChallenges(era);

    explorer.style.display = 'flex';
    setTimeout(() => explorer.classList.add('active'), 10);
  }

  closeExplorer() {
    const explorer = document.querySelector('[data-era-explorer]');
    if (explorer) {
      explorer.classList.remove('active');
      setTimeout(() => {
        explorer.style.display = 'none';
      }, 300);
    }
  }

  initializeChallenges(era) {
    const challenges = document.querySelectorAll('.challenge-card');
    const progress = this.state.eraProgress[era.id];

    challenges.forEach((card, index) => {
      const header = card.querySelector('.challenge-header');
      const body = card.querySelector('.challenge-body');
      const status = card.querySelector('[data-status]');
      
      // Déterminer le statut
      let challengeStatus = 'locked';
      if (index === 0) challengeStatus = 'available';
      else if (index <= progress) challengeStatus = 'available';
      if (index < progress) challengeStatus = 'completed';

      status.dataset.status = challengeStatus;
      
      if (challengeStatus === 'completed') {
        status.innerHTML = '<span class="status-icon">✅</span>';
      } else if (challengeStatus === 'locked') {
        status.innerHTML = '<span class="status-icon">🔒</span>';
      } else {
        status.innerHTML = '<span class="status-icon">▶</span>';
      }

      // Remove old listeners by cloning
      const newHeader = header.cloneNode(true);
      header.replaceWith(newHeader);

      // Toggle challenge
      newHeader.addEventListener('click', () => {
        if (challengeStatus === 'locked') {
          this.showNotification('🔒 Défi verrouillé', 'Complétez le défi précédent');
          return;
        }

        const isOpen = body.style.display === 'block';
        
        // Fermer tous les autres
        document.querySelectorAll('.challenge-body').forEach(b => b.style.display = 'none');
        
        if (!isOpen) {
          body.style.display = 'block';
          const challengeType = card.dataset.challenge;
          this.loadChallenge(challengeType, era, card);
        } else {
          body.style.display = 'none';
        }
      });
    });
  }

  loadChallenge(type, era, card) {
    switch (type) {
      case 'quiz':
        this.loadQuiz(era, card);
        break;
      case 'puzzle':
        this.loadPuzzle(era, card);
        break;
      case 'artifacts':
        this.loadArtifacts(era, card);
        break;
      case 'connect':
        this.loadConnections(era, card);
        break;
    }
  }

  // ============================================
  // QUIZ
  // ============================================
  loadQuiz(era, card) {
    const container = card.querySelector('[data-quiz]');
    const quiz = era.quiz;

    container.innerHTML = `
      <div class="quiz-question">${quiz.question}</div>
      <div class="quiz-options">
        ${quiz.options.map((option, index) => `
          <button class="quiz-option" data-answer="${index === quiz.correct}">
            ${option}
          </button>
        `).join('')}
      </div>
      <div class="quiz-feedback" style="display: none;"></div>
    `;

    const options = container.querySelectorAll('.quiz-option');
    const feedback = container.querySelector('.quiz-feedback');

    options.forEach(btn => {
      btn.addEventListener('click', () => {
        const isCorrect = btn.dataset.answer === 'true';
        
        options.forEach(o => o.disabled = true);

        if (isCorrect) {
          btn.classList.add('correct');
          feedback.innerHTML = '✅ Excellent ! +50 points';
          feedback.className = 'quiz-feedback success';
          this.addScore(50);
          this.completeChallenge(era.id, 0);
          this.showAchievement('🎯 Quiz réussi !', '+50 points');
        } else {
          btn.classList.add('incorrect');
          const correctBtn = Array.from(options).find(o => o.dataset.answer === 'true');
          correctBtn.classList.add('correct');
          feedback.innerHTML = '❌ Pas tout à fait... Réessayez !';
          feedback.className = 'quiz-feedback error';
          this.consumeEnergy(5);
        }

        feedback.style.display = 'block';
      });
    });
  }

  // ============================================
  // PUZZLE CHRONOLOGIQUE
  // ============================================
  loadPuzzle(era, card) {
    const container = card.querySelector('[data-puzzle]');
    const puzzle = [...era.puzzle].sort(() => Math.random() - 0.5);

    container.innerHTML = `
      <div class="puzzle-hint">Glissez-déposez pour réorganiser</div>
      <div class="puzzle-items" data-puzzle-items>
        ${puzzle.map(item => `
          <div class="puzzle-item" draggable="true" data-id="${item.id}" data-order="${item.order}">
            <span class="drag-handle">⋮⋮</span>
            <span class="puzzle-text">${item.text}</span>
          </div>
        `).join('')}
      </div>
      <button class="puzzle-check-btn" data-check-puzzle>Vérifier l'ordre</button>
      <div class="puzzle-feedback" style="display: none;"></div>
    `;

    this.setupDragAndDrop(container);

    const checkBtn = container.querySelector('[data-check-puzzle]');
    const feedback = container.querySelector('.puzzle-feedback');

    checkBtn.addEventListener('click', () => {
      const items = container.querySelectorAll('.puzzle-item');
      let isCorrect = true;

      items.forEach((item, index) => {
        const expectedOrder = index + 1;
        const actualOrder = parseInt(item.dataset.order);
        
        if (actualOrder !== expectedOrder) {
          isCorrect = false;
          item.classList.add('incorrect');
        } else {
          item.classList.add('correct');
        }
      });

      if (isCorrect) {
        feedback.innerHTML = '✅ Parfait ! L\'ordre est correct ! +75 points';
        feedback.className = 'puzzle-feedback success';
        this.addScore(75);
        this.completeChallenge(era.id, 1);
        this.showAchievement('🧩 Puzzle résolu !', '+75 points');
        checkBtn.disabled = true;
      } else {
        feedback.innerHTML = '❌ Pas tout à fait... Réessayez !';
        feedback.className = 'puzzle-feedback error';
        setTimeout(() => {
          items.forEach(item => {
            item.classList.remove('incorrect', 'correct');
          });
          feedback.style.display = 'none';
        }, 2000);
      }

      feedback.style.display = 'block';
    });
  }

  setupDragAndDrop(container) {
    const items = container.querySelectorAll('.puzzle-item');
    let draggedItem = null;

    items.forEach(item => {
      item.addEventListener('dragstart', () => {
        draggedItem = item;
        item.classList.add('dragging');
      });

      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
      });

      item.addEventListener('dragover', (e) => {
        e.preventDefault();
      });

      item.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedItem !== item) {
          const puzzleItems = container.querySelector('[data-puzzle-items]');
          const items = [...puzzleItems.children];
          const draggedIndex = items.indexOf(draggedItem);
          const targetIndex = items.indexOf(item);

          if (draggedIndex < targetIndex) {
            item.after(draggedItem);
          } else {
            item.before(draggedItem);
          }
        }
      });
    });
  }

  // ============================================
  // CHASSE AUX ARTEFACTS
  // ============================================
  loadArtifacts(era, card) {
    const container = card.querySelector('[data-artifacts-hunt]');
    const artifacts = era.artifacts;
    const decoys = ['decoy1', 'decoy2', 'decoy3'];
    const allItems = [...artifacts, ...decoys].sort(() => Math.random() - 0.5);

    let found = 0;

    container.innerHTML = `
      <div class="hunt-hint">Cliquez sur les cartes pour révéler leur contenu</div>
      <div class="hunt-grid">
        ${allItems.map((item, index) => `
          <div class="hunt-card" data-artifact="${item}" data-index="${index}">
            <div class="hunt-card-inner">
              <div class="hunt-card-front">?</div>
              <div class="hunt-card-back">${artifacts.includes(item) ? '💎' : '❌'}</div>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="artifacts-found">Artefacts trouvés: <span data-found-count>0</span>/${artifacts.length}</div>
    `;

    const cards = container.querySelectorAll('.hunt-card');
    const foundCount = container.querySelector('[data-found-count]');

    cards.forEach(card => {
      card.addEventListener('click', () => {
        if (card.classList.contains('flipped')) return;

        card.classList.add('flipped');
        const isArtifact = artifacts.includes(card.dataset.artifact);

        setTimeout(() => {
          if (isArtifact) {
            found++;
            foundCount.textContent = found;
            card.classList.add('found');
            this.state.artifacts++;
            this.updateHUD();

            if (found === artifacts.length) {
              this.addScore(100);
              this.completeChallenge(era.id, 2);
              this.showAchievement('💎 Artefacts collectés !', '+100 points');
            }
          } else {
            card.classList.add('wrong');
            this.consumeEnergy(3);
          }
        }, 300);
      });
    });
  }

  // ============================================
  // JEU DE CONNEXIONS
  // ============================================
  loadConnections(era, card) {
    const container = card.querySelector('[data-connect-game]');
    const connections = era.connections;
    const shuffledDefs = [...connections.map(c => c.definition)].sort(() => Math.random() - 0.5);

    container.innerHTML = `
      <div class="connect-hint">Associez chaque concept à sa définition</div>
      <div class="connect-grid">
        <div class="connect-concepts">
          ${connections.map((conn, i) => `
            <div class="connect-item concept" data-concept="${i}">
              ${conn.concept}
            </div>
          `).join('')}
        </div>
        <div class="connect-definitions">
          ${shuffledDefs.map((def, i) => `
            <div class="connect-item definition" data-definition="${def}">
              ${def}
            </div>
          `).join('')}
        </div>
      </div>
      <button class="connect-check-btn" data-check-connections style="display: none;">
        Vérifier les connexions
      </button>
      <div class="connect-feedback" style="display: none;"></div>
    `;

    let selectedConcept = null;
    let selectedDefinition = null;
    const userConnections = {};

    const concepts = container.querySelectorAll('.concept');
    const definitions = container.querySelectorAll('.definition');
    const checkBtn = container.querySelector('[data-check-connections]');
    const feedback = container.querySelector('.connect-feedback');

    concepts.forEach(concept => {
      concept.addEventListener('click', () => {
        concepts.forEach(c => c.classList.remove('selected'));
        concept.classList.add('selected');
        selectedConcept = concept.dataset.concept;
      });
    });

    definitions.forEach(definition => {
      definition.addEventListener('click', () => {
        if (!selectedConcept) {
          this.showNotification('ℹ️ Info', 'Sélectionnez d\'abord un concept');
          return;
        }

        definitions.forEach(d => d.classList.remove('selected'));
        definition.classList.add('selected');
        selectedDefinition = definition.dataset.definition;

        // Créer la connexion
        userConnections[selectedConcept] = selectedDefinition;
        
        // Marquer comme connecté
        concepts.forEach(c => {
          if (c.dataset.concept === selectedConcept) {
            c.classList.add('connected');
            c.classList.remove('selected');
          }
        });
        definition.classList.add('connected');
        definition.classList.remove('selected');

        selectedConcept = null;
        selectedDefinition = null;

        if (Object.keys(userConnections).length === connections.length) {
          checkBtn.style.display = 'block';
        }
      });
    });

    checkBtn.addEventListener('click', () => {
      let correct = 0;

      connections.forEach((conn, i) => {
        if (userConnections[i] === conn.definition) {
          correct++;
        }
      });

      if (correct === connections.length) {
        feedback.innerHTML = '✅ Toutes les connexions sont correctes ! +125 points';
        feedback.className = 'connect-feedback success';
        this.addScore(125);
        this.completeChallenge(era.id, 3);
        this.showAchievement('🔗 Connexions établies !', '+125 points');
        checkBtn.disabled = true;
      } else {
        feedback.innerHTML = `❌ ${correct}/${connections.length} correct(es). Réessayez !`;
        feedback.className = 'connect-feedback error';
      }

      feedback.style.display = 'block';
    });
  }

  // ============================================
  // SYSTÈME DE PROGRESSION
  // ============================================
  completeChallenge(eraId, challengeId) {
    if (this.state.eraProgress[eraId] === challengeId) {
      this.state.eraProgress[eraId]++;
      
      // Vérifier si l'époque est complétée
      if (this.state.eraProgress[eraId] === 4) {
        this.completeEra(eraId);
      }

      this.saveProgress();
      
      // Mettre à jour l'affichage
      const progress = this.state.eraProgress[eraId];
      document.querySelector('[data-era-progress]').style.width = `${(progress / 4) * 100}%`;
      document.querySelector('[data-progress-text]').textContent = `${progress}/4 complétés`;

      // Déverrouiller le prochain défi
      const challenges = document.querySelectorAll('.challenge-card');
      if (challenges[challengeId + 1]) {
        const nextStatus = challenges[challengeId + 1].querySelector('[data-status]');
        nextStatus.dataset.status = 'available';
        nextStatus.innerHTML = '<span class="status-icon">▶</span>';
      }

      // Recharger les défis pour mettre à jour les listeners
      setTimeout(() => {
        const era = this.eras[eraId];
        this.initializeChallenges(era);
      }, 500);
    }
  }

  completeEra(eraId) {
    if (!this.state.completedEras.includes(eraId)) {
      this.state.completedEras.push(eraId);
      this.addScore(200); // Bonus de complétion
      
      // Déverrouiller l'époque suivante
      if (eraId < 3) {
        this.state.unlockedEras.push(eraId + 1);
        const nextSegment = document.querySelector(`[data-era="${eraId + 1}"]`);
        if (nextSegment) {
          nextSegment.dataset.locked = 'false';
          nextSegment.style.cursor = 'pointer';
          const lock = nextSegment.querySelector('.lock-icon');
          if (lock) lock.style.display = 'none';
        }
      }

      this.showAchievement('🏆 Époque complétée !', `+200 points bonus`);
      
      // Afficher le bouton de complétion
      const completeBtn = document.querySelector('[data-complete-era]');
      if (completeBtn) {
        completeBtn.style.display = 'block';
        completeBtn.addEventListener('click', () => {
          this.closeExplorer();
          this.showAchievement('✨ Félicitations !', 'Époque maîtrisée');
        });
      }

      this.saveProgress();
    }
  }

  // ============================================
  // SYSTÈME DE POINTS ET ÉNERGIE
  // ============================================
  addScore(points) {
    this.state.score += points;
    this.updateHUD();
    this.animateScoreChange(points);
  }

  consumeEnergy(amount) {
    this.state.energy = Math.max(0, this.state.energy - amount);
    this.updateHUD();

    if (this.state.energy === 0) {
      this.showNotification('⚡ Énergie épuisée !', 'Rechargez pour continuer');
      this.rechargeEnergy();
    }
  }

  rechargeEnergy() {
    const interval = setInterval(() => {
      this.state.energy = Math.min(100, this.state.energy + 5);
      this.updateHUD();

      if (this.state.energy === 100) {
        clearInterval(interval);
        this.showNotification('⚡ Énergie rechargée !', 'Prêt à continuer');
      }
    }, 1000);
  }

  updateHUD() {
    const energyFill = document.querySelector('[data-energy]');
    const scoreValue = document.querySelector('[data-score]');
    const artifactsValue = document.querySelector('[data-artifacts]');

    if (energyFill) {
      energyFill.style.width = `${this.state.energy}%`;
      energyFill.dataset.energy = this.state.energy;
    }

    if (scoreValue) {
      scoreValue.textContent = this.state.score;
    }

    if (artifactsValue) {
      artifactsValue.textContent = `${this.state.artifacts}/12`;
    }
  }

  animateScoreChange(points) {
    const scoreEl = document.querySelector('[data-score]');
    if (!scoreEl) return;

    scoreEl.classList.add('score-pulse');
    setTimeout(() => scoreEl.classList.remove('score-pulse'), 500);
  }

  // ============================================
  // NOTIFICATIONS ET ACHIEVEMENTS
  // ============================================
  showAchievement(title, description) {
    const notification = document.querySelector('[data-notification]');
    if (!notification) return;

    const text = notification.querySelector('.achievement-text');
    text.innerHTML = `<strong>${title}</strong><br>${description}`;

    notification.style.display = 'flex';
    notification.classList.add('show');

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.style.display = 'none';
      }, 300);
    }, 3000);
  }

  showNotification(title, message) {
    this.showAchievement(title, message);
  }

  // ============================================
  // CONSOLE ET AFFICHAGE
  // ============================================
  updateConsole(message) {
    const screen = document.querySelector('[data-console-screen]');
    if (!screen) return;

    const terminal = screen.querySelector('.terminal-text');
    const line = document.createElement('p');
    line.className = 'terminal-line';
    line.textContent = message;
    terminal.appendChild(line);

    // Garder seulement les 5 dernières lignes
    const lines = terminal.querySelectorAll('.terminal-line');
    if (lines.length > 5) {
      lines[0].remove();
    }

    // Scroll auto
    screen.scrollTop = screen.scrollHeight;
  }

  updateCurrentEra(era) {
    const display = document.querySelector('[data-current-era]');
    if (!display) return;

    display.querySelector('.era-year').textContent = era.period;
    display.querySelector('.era-name').textContent = era.name;
  }

  // ============================================
  // SAUVEGARDE
  // ============================================
  saveProgress() {
    localStorage.setItem('chronos-progress', JSON.stringify(this.state));
  }

  loadProgress() {
    const saved = localStorage.getItem('chronos-progress');
    if (saved) {
      const data = JSON.parse(saved);
      this.state = { ...this.state, ...data };
      this.updateHUD();
    }
  }

  // ============================================
  // SONS (optionnel)
  // ============================================
  playSound(type) {
    // Placeholder pour les effets sonores
    console.log(`Playing sound: ${type}`);
  }
}

// ============================================
// INITIALISATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  window.timeMachine = new TimeMachine();
});
