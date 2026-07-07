   // LUXE E-Commerce — Main JavaScript

document.addEventListener('DOMContentLoaded', () => {

  // 1. NAVBAR — Scroll effect & Mobile menu
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const mobileOverlay = document.querySelector('.mobile-menu-overlay');

  // Navbar scroll effect (transparent → solid)
  function handleNavScroll() {
    if (!navbar) return;
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll);
  handleNavScroll(); // Run on load

  // Hamburger toggle
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
      if (mobileOverlay) mobileOverlay.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });
  }

  // Close mobile menu on overlay click
  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
      mobileOverlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  // Close mobile menu on nav link click
  if (navLinks) {
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          hamburger.classList.remove('active');
          navLinks.classList.remove('active');
          if (mobileOverlay) mobileOverlay.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    });
  }

  // 2. ACTIVE NAV LINK
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // 3. SCROLL REVEAL ANIMATION
  const revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // 4. PRODUCT IMAGE GALLERY (Single Product Page)
  const galleryMain = document.querySelector('.gallery-main img');
  const galleryThumbs = document.querySelectorAll('.gallery-thumb');

  galleryThumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      // Update main image
      const newSrc = thumb.querySelector('img').src;
      if (galleryMain) {
        galleryMain.style.opacity = '0';
        setTimeout(() => {
          galleryMain.src = newSrc;
          galleryMain.style.opacity = '1';
        }, 200);
      }

      // Update active state
      galleryThumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });

  // ============================================================
  // 5. PRODUCT TABS (Single Product Page)
  // ============================================================
  const tabLinks = document.querySelectorAll('.tab-link');
  const tabContents = document.querySelectorAll('.tab-content');

  tabLinks.forEach(link => {
    link.addEventListener('click', () => {
      const targetTab = link.getAttribute('data-tab');

      tabLinks.forEach(l => l.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      link.classList.add('active');
      const targetContent = document.getElementById(targetTab);
      if (targetContent) targetContent.classList.add('active');
    });
  });

  // 6. QUANTITY CONTROLS
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const control = btn.closest('.quantity-controls');
      const valueEl = control.querySelector('.qty-value');
      let value = parseInt(valueEl.textContent);

      if (btn.classList.contains('qty-minus')) {
        value = Math.max(1, value - 1);
      } else if (btn.classList.contains('qty-plus')) {
        value = Math.min(99, value + 1);
      }

      valueEl.textContent = value;

      // Update cart subtotals if on cart page
      updateCartTotals();
    });
  });

  // 7. SIZE SELECTOR
  document.querySelectorAll('.size-option').forEach(option => {
    option.addEventListener('click', () => {
      const parent = option.closest('.size-options');
      parent.querySelectorAll('.size-option').forEach(o => o.classList.remove('active'));
      option.classList.add('active');
    });
  });

  // 8. CART FUNCTIONALITY
  const cartBadge = document.querySelector('.cart-badge');
  let cartCount = parseInt(cartBadge?.textContent || '0');

  // Add to cart buttons
  document.querySelectorAll('[data-action="add-to-cart"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      cartCount++;
      if (cartBadge) {
        cartBadge.textContent = cartCount;
        cartBadge.style.animation = 'pulse 0.3s ease';
        setTimeout(() => {
          cartBadge.style.animation = '';
        }, 300);
      }

      // Visual feedback
      const originalText = btn.innerHTML;
      if (btn.classList.contains('btn')) {
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Added!';
        btn.style.background = 'var(--color-success)';
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = '';
        }, 1500);
      }

      showToast('Product added to cart!');
    });
  });

  // Remove from cart
  document.querySelectorAll('.cart-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('tr');
      if (row) {
        row.style.opacity = '0';
        row.style.transform = 'translateX(20px)';
        row.style.transition = 'all 0.3s ease';
        setTimeout(() => {
          row.remove();
          cartCount = Math.max(0, cartCount - 1);
          if (cartBadge) cartBadge.textContent = cartCount;
          updateCartTotals();
        }, 300);
      }
    });
  });

  // Update cart totals
  function updateCartTotals() {
    const cartTable = document.querySelector('.cart-table');
    if (!cartTable) return;

    let subtotal = 0;
    cartTable.querySelectorAll('tbody tr').forEach(row => {
      const priceText = row.querySelector('.cart-price')?.textContent || '$0';
      const price = parseFloat(priceText.replace('$', ''));
      const qty = parseInt(row.querySelector('.qty-value')?.textContent || '1');
      const rowSubtotal = price * qty;

      const subtotalCell = row.querySelector('.cart-subtotal');
      if (subtotalCell) subtotalCell.textContent = '$' + rowSubtotal.toFixed(2);

      subtotal += rowSubtotal;
    });

    // Update summary
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    const shipping = subtotal > 100 ? 0 : 15;

    if (subtotalEl) subtotalEl.textContent = '$' + subtotal.toFixed(2);

    const shippingEl = document.getElementById('cart-shipping');
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Free' : '$' + shipping.toFixed(2);

    if (totalEl) totalEl.textContent = '$' + (subtotal + shipping).toFixed(2);
  }

  // 9. COUPON CODE
  const couponForm = document.querySelector('.coupon-form');
  if (couponForm) {
    couponForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = couponForm.querySelector('input');
      const code = input.value.trim().toUpperCase();

      if (code === 'LUXE20') {
        showToast('Coupon applied! 20% discount added.', 'success');
      } else if (code) {
        showToast('Invalid coupon code.', 'error');
      }
    });
  }

  // 10. NEWSLETTER FORM
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input');
      const email = input.value.trim();

      if (email && email.includes('@')) {
        showToast('Thank you for subscribing!', 'success');
        input.value = '';
      } else {
        showToast('Please enter a valid email address.', 'error');
      }
    });
  });

  // 11. CONTACT FORM
  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Message sent successfully! We\'ll get back to you soon.', 'success');
      contactForm.reset();
    });
  }

  // 12. TOAST NOTIFICATIONS
  function showToast(message, type = 'success') {
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
      <span>${message}</span>
    `;

    // Toast styles
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      padding: '16px 24px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '0.85rem',
      fontWeight: '500',
      zIndex: '10000',
      animation: 'fadeUp 0.3s ease both',
      maxWidth: '400px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
      background: type === 'success' ? '#1a3a1a' : type === 'error' ? '#3a1a1a' : '#1a1a3a',
      color: type === 'success' ? '#4CAF50' : type === 'error' ? '#E54D4D' : '#6B9FFF',
      border: `1px solid ${type === 'success' ? '#2d5a2d' : type === 'error' ? '#5a2d2d' : '#2d2d5a'}`,
    });

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // 13. SMOOTH SCROLL FOR ANCHOR LINKS
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      e.preventDefault();
      const target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // 14. BACK TO TOP
  const backToTop = document.createElement('button');
  backToTop.className = 'back-to-top';
  backToTop.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
  Object.assign(backToTop.style, {
    position: 'fixed',
    bottom: '24px',
    left: '24px',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: '999',
    opacity: '0',
    transform: 'translateY(20px)',
    transition: 'all 0.3s ease',
    fontSize: '0.9rem',
  });

  document.body.appendChild(backToTop);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTop.style.opacity = '1';
      backToTop.style.transform = 'translateY(0)';
    } else {
      backToTop.style.opacity = '0';
      backToTop.style.transform = 'translateY(20px)';
    }
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  backToTop.addEventListener('mouseenter', () => {
    backToTop.style.background = 'var(--color-primary)';
    backToTop.style.color = 'var(--color-primary-foreground)';
    backToTop.style.borderColor = 'var(--color-primary)';
  });

  backToTop.addEventListener('mouseleave', () => {
    backToTop.style.background = 'var(--color-surface)';
    backToTop.style.color = 'var(--color-primary)';
    backToTop.style.borderColor = 'var(--color-border)';
  });

  // 15. INITIAL CART TOTALS CALCULATION
  updateCartTotals();

});
