// إعداد Supabase
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_KEY';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// زيادة عداد الزوار
async function incrementVisitorCount() {
    let count = localStorage.getItem('visitorCount') || 0;
    count++;
    localStorage.setItem('visitorCount', count);
    document.getElementById('visitorCount').textContent = count;
    
    // حفظ في Supabase
    await supabase.from('visitors').insert([{ count }]);
}

// تحميل المنشورات حسب القسم
async function loadPosts(category) {
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading posts:', error);
        return [];
    }
    return data;
}

// عرض المنشورات
async function displayPosts() {
    const categories = ['releases', 'mods', 'skins', 'maps', 'premium'];
    
    for (const category of categories) {
        const posts = await loadPosts(category);
        const container = document.getElementById(`${category}-posts`);
        
        if (container) {
            container.innerHTML = posts.map(post => `
                <div class="post-card">
                    ${post.image_url ? `<img src="${post.image_url}" class="post-image" alt="${post.title}">` : ''}
                    <div class="post-content">
                        <h3 class="post-title">${post.title}</h3>
                        <p class="post-description">${post.description}</p>
                        ${category === 'premium' 
                            ? `<button class="download-btn premium-btn" onclick="showSmartLink('${post.download_url}')">
                                  <i class="fas fa-gem"></i> عرض عبر Smart Link
                               </button>`
                            : `<a href="${post.download_url}" class="download-btn" target="_blank">
                                  <i class="fas fa-download"></i> تحميل
                               </a>`
                        }
                        <div class="post-meta">
                            <small>${new Date(post.created_at).toLocaleDateString('ar-SA')}</small>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }
}

// خاص بالمودات المدفوعة
function showSmartLink(url) {
    const overlay = document.createElement('div');
    overlay.className = 'smart-link-overlay';
    overlay.style.display = 'flex';
    overlay.innerHTML = `
        <div class="smart-link-content">
            <h2><i class="fas fa-gem"></i> محتوى مميز</h2>
            <p>يرجى مشاهدة الإعلان لمدة 10 ثوانٍ للحصول على رابط التحميل</p>
            <div id="adTimer" style="font-size: 2rem; margin: 1rem 0; color: var(--mc-gold);">10</div>
            <button onclick="startAdTimer('${url}')" class="download-btn premium-btn">
                <i class="fas fa-play"></i> بدء المشاهدة
            </button>
        </div>
    `;
    document.body.appendChild(overlay);
}

function startAdTimer(url) {
    let time = 10;
    const timerElement = document.getElementById('adTimer');
    const timer = setInterval(() => {
        time--;
        timerElement.textContent = time;
        
        if (time <= 0) {
            clearInterval(timer);
            window.open(url, '_blank');
            document.querySelector('.smart-link-overlay').remove();
        }
    }, 1000);
}

// البحث
document.getElementById('searchBtn').addEventListener('click', searchPosts);
document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchPosts();
});

async function searchPosts() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    if (!query) return;

    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.ilike.%${query}%`);

    if (!error && data.length > 0) {
        // عرض نتائج البحث
        const searchResults = document.createElement('div');
        searchResults.className = 'search-results';
        searchResults.innerHTML = `
            <h3>نتائج البحث: ${data.length}</h3>
            ${data.map(post => `
                <div class="post-card">
                    <h4>${post.title}</h4>
                    <p>${post.description.substring(0, 100)}...</p>
                    <a href="#${post.category}" class="download-btn">الانتقال للقسم</a>
                </div>
            `).join('')}
        `;
        document.querySelector('main').prepend(searchResults);
    }
}

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', () => {
    incrementVisitorCount();
    displayPosts();
    
    // تحميل الإعلانات
    fetch('banner-ads.html')
        .then(res => res.text())
        .then(html => {
            document.getElementById('adBanner').innerHTML = html;
        });
});
