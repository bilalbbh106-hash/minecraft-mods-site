const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_KEY';
const ADMIN_PASSWORD = '2009bbh2009';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// تسجيل الدخول
function login() {
    const password = document.getElementById('adminPassword').value;
    if (password === ADMIN_PASSWORD) {
        document.getElementById('loginPanel').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        loadAdminData();
    } else {
        alert('كلمة المرور خاطئة!');
    }
}

// إضافة منشور جديد
async function addPost() {
    const post = {
        title: document.getElementById('postTitle').value,
        description: document.getElementById('postDescription').value,
        image_url: document.getElementById('postImage').value || null,
        download_url: document.getElementById('postDownload').value,
        category: document.getElementById('postCategory').value,
        tags: document.getElementById('postTags').value,
        created_at: new Date().toISOString()
    };

    const { error } = await supabase
        .from('posts')
        .insert([post]);

    if (error) {
        alert('حدث خطأ في الإضافة: ' + error.message);
    } else {
        alert('تمت الإضافة بنجاح!');
        clearForm();
        loadPosts();
    }
}

// حذف منشور
async function deletePost(id) {
    if (confirm('هل أنت متأكد من الحذف؟')) {
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', id);

        if (!error) {
            alert('تم الحذف بنجاح');
            loadPosts();
        }
    }
}

// تحميل البيانات
async function loadAdminData() {
    // الإحصائيات
    const { data: posts } = await supabase.from('posts').select('*');
    const { data: visitors } = await supabase.from('visitors').select('*');
    
    document.getElementById('totalPosts').textContent = posts?.length || 0;
    document.getElementById('premiumPosts').textContent = posts?.filter(p => p.category === 'premium').length || 0;
    document.getElementById('totalVisits').textContent = visitors?.length || 0;
    document.getElementById('lastUpdate').textContent = new Date().toLocaleString('ar-SA');
    
    // تحميل المنشورات
    loadPosts();
}

async function loadPosts() {
    const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

    const container = document.getElementById('allPosts');
    container.innerHTML = posts.map(post => `
        <div class="post-item">
            <h3>${post.title}</h3>
            <p>${post.description.substring(0, 100)}...</p>
            <small>القسم: ${post.category} | التاريخ: ${new Date(post.created_at).toLocaleDateString('ar-SA')}</small>
            <div style="margin-top: 1rem;">
                <button class="btn" onclick="editPost('${post.id}')">
                    <i class="fas fa-edit"></i> تعديل
                </button>
                <button class="btn" onclick="deletePost('${post.id}')" style="background: #ff5555;">
                    <i class="fas fa-trash"></i> حذف
                </button>
            </div>
        </div>
    `).join('');
}

function clearForm() {
    document.getElementById('postTitle').value = '';
    document.getElementById('postDescription').value = '';
    document.getElementById('postImage').value = '';
    document.getElementById('postDownload').value = '';
    document.getElementById('postTags').value = '';
}

// التعديل (يمكنك تطويره)
async function editPost(id) {
    const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

    if (data) {
        document.getElementById('postTitle').value = data.title;
        document.getElementById('postDescription').value = data.description;
        document.getElementById('postImage').value = data.image_url || '';
        document.getElementById('postDownload').value = data.download_url;
        document.getElementById('postCategory').value = data.category;
        document.getElementById('postTags').value = data.tags;
        
        // يمكنك إضافة زر تحديث
        const updateBtn = document.createElement('button');
        updateBtn.className = 'btn';
        updateBtn.innerHTML = '<i class="fas fa-save"></i> تحديث';
        updateBtn.onclick = () => updatePost(id);
        document.querySelector('.add-post-form').appendChild(updateBtn);
    }
}

async function updatePost(id) {
    const post = {
        title: document.getElementById('postTitle').value,
        description: document.getElementById('postDescription').value,
        image_url: document.getElementById('postImage').value || null,
        download_url: document.getElementById('postDownload').value,
        category: document.getElementById('postCategory').value,
        tags: document.getElementById('postTags').value
    };

    const { error } = await supabase
        .from('posts')
        .update(post)
        .eq('id', id);

    if (!error) {
        alert('تم التحديث بنجاح');
        location.reload();
    }
}
