// Global değişkenler
let currentHighlights = [];

// Vurgulamaları temizle
function clearHighlights() {
    currentHighlights.forEach(el => {
        el.outerHTML = el.textContent;
    });
    currentHighlights = [];
}

// Metni vurgula
function highlightTextInContent(element, searchTerm) {
    if (!searchTerm.trim()) return;

    clearHighlights();
    
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    let node;
    let matches = [];

    while (node = walker.nextNode()) {
        if (node.nodeValue.match(regex)) {
            const span = document.createElement('span');
            span.innerHTML = node.nodeValue.replace(regex, '<span class="search-highlight">$1</span>');
            node.replaceWith(span);
            const highlights = span.querySelectorAll('.search-highlight');
            currentHighlights.push(...highlights);
            matches.push(...highlights);
        }
    }

    if (matches.length > 0) {
        matches[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Tüm sayfa işlevselliği
document.addEventListener('DOMContentLoaded', function() {
    // Arama işlevselliği
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const searchClear = document.getElementById('searchClear');
    let searchTimeout;
    let searchableContent = [];

    // Sayfa yüklendiğinde çarpı işaretini gizle
    searchClear.style.display = 'none';
    searchInput.value = '';

    // Arama temizleme butonunu göster/gizle
    function toggleClearButton() {
        searchClear.style.display = searchInput.value.length > 0 ? 'block' : 'none';
    }

    // Aramayı temizle
    function clearSearch() {
        searchInput.value = '';
        searchResults.style.display = 'none';
        clearHighlights();
        toggleClearButton();
        searchInput.focus();
    }

    // Event listeners
    searchClear.addEventListener('click', clearSearch);

    searchInput.addEventListener('input', function() {
        toggleClearButton();
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const searchTerm = this.value;
            if (isBlogPage) {
                performBlogSearch(searchTerm);
            } else {
                performSearch(searchTerm);
            }
        }, 300);
    });

    // ESC tuşu ile aramayı temizle
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            clearSearch();
        }
    });

    // Sayfa tıklamalarını dinle
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });

    // İçeriği indeksle
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        // Sadece section-title'ı ekle
        const sectionTitle = section.querySelector('.section-title');
        if (sectionTitle) {
            searchableContent.push({
                title: sectionTitle.textContent,
                content: section.querySelector('p')?.textContent || '',
                section: section.id
            });
        }

        // Blog yazılarını ekle
        const blogPosts = section.querySelectorAll('.blog-post');
        blogPosts.forEach(post => {
            const postTitle = post.querySelector('h2');
            const postContent = post.querySelector('p');
            if (postTitle && !searchableContent.some(item => item.title === postTitle.textContent)) {
                searchableContent.push({
                    title: postTitle.textContent,
                    content: postContent?.textContent || '',
                    section: section.id
                });
            }
        });

        // Hakkımda ve İletişim bölümlerinin içeriğini ekle
        if (section.id === 'hakkimda' || section.id === 'iletisim') {
            const content = Array.from(section.querySelectorAll('p'))
                .filter(p => !p.closest('.search-results') && !p.closest('.search-result-item'))
                .map(p => p.textContent)
                .join(' ');
            
            if (content && !searchableContent.some(item => item.section === section.id)) {
                searchableContent.push({
                    title: sectionTitle?.textContent || section.id,
                    content: content,
                    section: section.id
                });
            }
        }
    });

    // Sayfanın blog sayfası olup olmadığını kontrol et
    const isBlogPage = document.querySelector('.blog-post') !== null;

    if (isBlogPage) {
        // Blog sayfası için arama fonksiyonu
        function performBlogSearch(searchTerm) {
            const content = document.querySelector('.blog-post').textContent.toLowerCase();
            const headings = document.querySelectorAll('h2, h3, h4, h5');
            searchResults.innerHTML = '';

            if (!searchTerm.trim()) {
                searchResults.style.display = 'none';
                clearHighlights();
                return;
            }

            searchTerm = searchTerm.toLowerCase();
            let found = false;

            // Başlıklarda ve içerikte arama yap
            headings.forEach(heading => {
                const headingText = heading.textContent.toLowerCase();
                const nextContent = heading.nextElementSibling ? 
                    heading.nextElementSibling.textContent.toLowerCase() : '';

                if (headingText.includes(searchTerm) || nextContent.includes(searchTerm)) {
                    const div = document.createElement('div');
                    div.className = 'search-result-item';
                    div.innerHTML = `
                        <h3>${highlightText(heading.textContent, searchTerm)}</h3>
                        <p>${highlightText(nextContent.substring(0, 150), searchTerm)}...</p>
                    `;

                    // Click event listener'ı ayrı ekleyelim
                    div.addEventListener('click', () => {
                        const section = heading.closest('article') || heading.closest('section');
                        if (section) {
                            highlightTextInContent(section, searchTerm);
                            searchResults.style.display = 'none';
                        }
                    });

                    searchResults.appendChild(div);
                    found = true;
                }
            });

            if (!found) {
                searchResults.innerHTML = '<div class="search-result-item"><p>Sonuç bulunamadı.</p></div>';
            }
            searchResults.style.display = 'block';
        }
    } else {
        // Ana sayfa için arama fonksiyonu artık input listener'a gerek yok
        // çünkü yukarıda genel input listener ekledik
    }

    // Textarea otomatik yükseklik ayarı
    const textarea = document.querySelector('#feedback');
    if (textarea) {
        textarea.addEventListener('input', function() {
            this.style.height = '100px';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }

    // Snake animasyonu
    const canvas = document.getElementById('snakeCanvas');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Snake {
        constructor() {
            this.x = 100;
            this.y = 200;
            this.direction = { x: 1, y: 0 };
            this.speed = 1.875;
            this.trail = [];
            this.trailLength = 75;
            this.size = 12;
            this.margin = 20;
            this.directionChangeTimer = 0;
            this.directionChangeDuration = 100;
            this.angle = 0;
            this.targetAngle = 0;
            this.turnSpeed = 0.05; // Dönüş hızı
            this.sinOffset = 0; // Dalgalı hareket için offset
        }

        changeDirection() {
            // Hedef açıyı rastgele belirle ama mevcut açıdan çok uzak olmasın
            const maxTurn = Math.PI / 2; // Maximum 90 derece dönüş
            const randomTurn = (Math.random() * 2 - 1) * maxTurn;
            this.targetAngle = this.angle + randomTurn;
        }

        update() {
            this.directionChangeTimer++;
            if (this.directionChangeTimer >= this.directionChangeDuration) {
                this.changeDirection();
                this.directionChangeTimer = 0;
            }

            // Mevcut açıyı hedef açıya doğru yumuşak bir şekilde değiştir
            const angleDiff = this.targetAngle - this.angle;
            if (Math.abs(angleDiff) > 0.01) {
                this.angle += angleDiff * this.turnSpeed;
            }

            // Dalgalı hareket için sinüs dalgası ekle
            this.sinOffset += 0.1;
            const waveAmplitude = 0.2; // Dalganın genişliği
            const waveAngle = Math.sin(this.sinOffset) * waveAmplitude;
            
            // Yönü güncelle
            this.direction = {
                x: Math.cos(this.angle + waveAngle),
                y: Math.sin(this.angle + waveAngle)
            };

            let newX = this.x + this.direction.x * this.speed;
            let newY = this.y + this.direction.y * this.speed;

            // Ekran sınırlarına çarptığında yön değiştir
            if (newX < this.margin || newX > window.innerWidth - this.margin) {
                this.direction.x *= -1;
                this.targetAngle = Math.atan2(this.direction.y, this.direction.x);
                this.angle = this.targetAngle;
                newX = this.x + this.direction.x * this.speed;
            }
            if (newY < this.margin || newY > window.innerHeight - this.margin) {
                this.direction.y *= -1;
                this.targetAngle = Math.atan2(this.direction.y, this.direction.x);
                this.angle = this.targetAngle;
                newY = this.y + this.direction.y * this.speed;
            }

            this.x = newX;
            this.y = newY;

            // Trail güncelleme
            if (this.trail.length === 0 || 
                Math.abs(this.x - this.trail[0].x) > 0.1 || 
                Math.abs(this.y - this.trail[0].y) > 0.1) {
                this.trail.unshift({ 
                    x: this.x, 
                    y: this.y,
                    angle: this.angle + waveAngle // Trail parçalarının açısını da sakla
                });
                if (this.trail.length > this.trailLength) {
                    this.trail.pop();
                }
            }
        }

        draw() {
            const scrollY = window.scrollY || window.pageYOffset;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // İzi çiz
            if (this.trail.length > 1) {
                for (let i = this.trail.length - 1; i >= 0; i--) {
                    const alpha = 1 - (i / this.trailLength);
                    ctx.fillStyle = `rgba(74, 158, 255, ${alpha * 0.8})`;
                    const size = this.size * (1 - i / this.trailLength * 0.3);
                    
                    ctx.save();
                    ctx.translate(
                        this.trail[i].x,
                        this.trail[i].y - scrollY
                    );
                    ctx.rotate(this.trail[i].angle);
                    ctx.fillRect(-size/2, -size/2, size, size);
                    ctx.restore();
                }
            }

            // Ana yılanı çiz
            ctx.save();
            ctx.translate(this.x, this.y - scrollY);
            ctx.rotate(this.angle + Math.sin(this.sinOffset) * 0.2);
            
            // Ana şekil - ekstra yumuşak başlı şekil
            ctx.fillStyle = '#4a9eff';
            ctx.beginPath();
            
            // Başlangıç noktası (arka orta nokta)
            ctx.moveTo(-this.size/2, 0);
            
            // Üst yarım daire
            ctx.bezierCurveTo(
                -this.size/2, -this.size/2,  // Kontrol noktası 1
                0, -this.size/2,             // Kontrol noktası 2
                this.size/2, 0               // Bitiş noktası
            );
            
            // Alt yarım daire
            ctx.bezierCurveTo(
                0, this.size/2,              // Kontrol noktası 1
                -this.size/2, this.size/2,   // Kontrol noktası 2
                -this.size/2, 0              // Bitiş noktası (başlangıç noktasına geri dön)
            );
            
            ctx.closePath();
            ctx.fill();
            
            // Gözler
            // Sol göz - beyaz kısım
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.size/4, -this.size/6, this.size/6, 0, Math.PI * 2);
            ctx.fill();
            // Sol göz - siyah göz bebeği
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(this.size/4, -this.size/6, this.size/12, 0, Math.PI * 2);
            ctx.fill();

            // Sağ göz - beyaz kısım
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.size/4, this.size/6, this.size/6, 0, Math.PI * 2);
            ctx.fill();
            // Sağ göz - siyah göz bebeği
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(this.size/4, this.size/6, this.size/12, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
    }

    // Global değişken olarak sakla
    if (!window.snake) {
        window.snake = new Snake();
        
        function animate() {
            window.snake.update();
            window.snake.draw();
            requestAnimationFrame(animate);
        }

        animate();
    }

    // Mermaid diagram initialization
    if (typeof mermaid !== 'undefined') {
        mermaid.initialize({ 
            startOnLoad: true,
            theme: 'dark',
            flowchart: {
                curve: 'basis',
                nodeSpacing: 50,
                rankSpacing: 50,
                useMaxWidth: true
            },
            themeVariables: {
                darkMode: true,
                background: '#2d2d2d',
                primaryColor: '#4a9eff',
                primaryTextColor: '#ffffff',
                secondaryColor: '#1a1a1a',
                tertiaryColor: '#2d2d2d'
            }
        });
    }
});

// Metin vurgulama fonksiyonu
function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
}

// Metni vurgula
function highlightTextInContent(element, searchTerm) {
    if (!searchTerm.trim()) return;

    clearHighlights();
    
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    let node;
    let matches = [];

    while (node = walker.nextNode()) {
        if (node.nodeValue.match(regex)) {
            const span = document.createElement('span');
            span.innerHTML = node.nodeValue.replace(regex, '<span class="search-highlight">$1</span>');
            node.replaceWith(span);
            const highlights = span.querySelectorAll('.search-highlight');
            currentHighlights.push(...highlights);
            matches.push(...highlights);
        }
    }

    if (matches.length > 0) {
        matches[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Arama işlevselliği
const initializeSearch = () => {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const searchClear = document.getElementById('searchClear');
    let searchTimeout;
    let searchableContent = [];

    // Arama temizleme butonunu göster/gizle
    function toggleClearButton() {
        if (searchInput.value && searchInput.value.length > 0) {
            searchClear.classList.add('visible');
        } else {
            searchClear.classList.remove('visible');
        }
    }

    // Aramayı temizle
    function clearSearch() {
        searchInput.value = '';
        searchResults.style.display = 'none';
        clearHighlights();
        toggleClearButton();
        searchInput.focus();
    }

    // Event listeners
    searchClear.addEventListener('click', clearSearch);
    searchInput.addEventListener('input', function() {
        toggleClearButton();
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            if (isBlogPage) {
                performBlogSearch(this.value);
            } else {
                performSearch(this.value);
            }
        }, 300);
    });

    // ESC tuşu ile aramayı temizle
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            clearSearch();
        }
    });

    // Sayfa tıklamalarını dinle
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });

    // Başlangıçta input'u temizle ve çarpıyı gizle
    searchInput.value = '';
    toggleClearButton();

    // Tüm içeriği indeksle
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        // Sadece section-title'ı ekle
        const sectionTitle = section.querySelector('.section-title');
        if (sectionTitle) {
            searchableContent.push({
                title: sectionTitle.textContent,
                content: section.querySelector('p')?.textContent || '',
                section: section.id
            });
        }

        // Blog yazılarını ekle
        const blogPosts = section.querySelectorAll('.blog-post');
        blogPosts.forEach(post => {
            const postTitle = post.querySelector('h2');
            const postContent = post.querySelector('p');
            if (postTitle && !searchableContent.some(item => item.title === postTitle.textContent)) {
                searchableContent.push({
                    title: postTitle.textContent,
                    content: postContent?.textContent || '',
                    section: section.id
                });
            }
        });

        // Hakkımda ve İletişim bölümlerinin içeriğini ekle
        if (section.id === 'hakkimda' || section.id === 'iletisim') {
            const content = Array.from(section.querySelectorAll('p'))
                .filter(p => !p.closest('.search-results') && !p.closest('.search-result-item'))
                .map(p => p.textContent)
                .join(' ');
            
            if (content && !searchableContent.some(item => item.section === section.id)) {
                searchableContent.push({
                    title: sectionTitle?.textContent || section.id,
                    content: content,
                    section: section.id
                });
            }
        }
    });

    // Sayfa yüklendiğinde ve input boşaldığında çarpıyı gizle
    searchInput.addEventListener('change', toggleClearButton);
    searchInput.addEventListener('blur', toggleClearButton);

    // Sayfanın blog sayfası olup olmadığını kontrol et
    const isBlogPage = document.querySelector('.blog-post') !== null;

    if (isBlogPage) {
        // Blog sayfası için arama fonksiyonu
        function performBlogSearch(searchTerm) {
            const content = document.querySelector('.blog-post').textContent.toLowerCase();
            const headings = document.querySelectorAll('h2, h3, h4, h5');
            searchResults.innerHTML = '';

            if (!searchTerm.trim()) {
                searchResults.style.display = 'none';
                clearHighlights();
                return;
            }

            searchTerm = searchTerm.toLowerCase();
            let found = false;

            // Başlıklarda ve içerikte arama yap
            headings.forEach(heading => {
                const headingText = heading.textContent.toLowerCase();
                const nextContent = heading.nextElementSibling ? 
                    heading.nextElementSibling.textContent.toLowerCase() : '';

                if (headingText.includes(searchTerm) || nextContent.includes(searchTerm)) {
                    const div = document.createElement('div');
                    div.className = 'search-result-item';
                    div.innerHTML = `
                        <h3>${highlightText(heading.textContent, searchTerm)}</h3>
                        <p>${highlightText(nextContent.substring(0, 150), searchTerm)}...</p>
                    `;

                    // Click event listener'ı ayrı ekleyelim
                    div.addEventListener('click', () => {
                        const section = heading.closest('article') || heading.closest('section');
                        if (section) {
                            highlightTextInContent(section, searchTerm);
                            searchResults.style.display = 'none';
                        }
                    });

                    searchResults.appendChild(div);
                    found = true;
                }
            });

            if (!found) {
                searchResults.innerHTML = '<div class="search-result-item"><p>Sonuç bulunamadı.</p></div>';
            }
            searchResults.style.display = 'block';
        }
    } else {
        // Ana sayfa için arama fonksiyonu artık input listener'a gerek yok
        // çünkü yukarıda genel input listener ekledik
    }

    // Textarea otomatik yükseklik ayarı
    const textarea = document.querySelector('#feedback');
    if (textarea) {
        textarea.addEventListener('input', function() {
            this.style.height = '100px';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }
};

// Sayfa yüklendiğinde arama işlevselliğini başlat
document.addEventListener('DOMContentLoaded', initializeSearch); 