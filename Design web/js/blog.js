document.addEventListener('DOMContentLoaded', function() {
    console.log('Blog.js: DOM loaded');

    const blogGrid = document.getElementById('blogGrid');
    const categoryTabs = document.querySelectorAll('.category-tab');

    const writeNewPostBtn = document.querySelector('.blog-actions .btn');
    if (writeNewPostBtn) {

        const originalHref = writeNewPostBtn.getAttribute('href');
        writeNewPostBtn.setAttribute('data-href', originalHref);
        writeNewPostBtn.removeAttribute('href');
        writeNewPostBtn.style.cursor = 'pointer';

        writeNewPostBtn.addEventListener('click', function(e) {
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

            if (isLoggedIn) {

                window.location.href = originalHref;
            } else {

                const alertContainer = document.createElement('div');
                alertContainer.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                    backdrop-filter: blur(3px);
                `;

                const alertContent = document.createElement('div');
                alertContent.style.cssText = `
                    background: var(--bg-color, white);
                    padding: 2rem;
                    border-radius: 10px;
                    max-width: 400px;
                    width: 90%;
                    text-align: center;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                    border-top: 4px solid var(--primary-color, #4e54c8);
                `;

                alertContent.innerHTML = `
                    <h3 style="margin-bottom: 1rem; color: var(--primary-color, #4e54c8);">Login Required</h3>
                    <p style="margin-bottom: 1.5rem;">Please log in to create a blog post</p>
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button id="login-redirect" style="background: var(--primary-color, #4e54c8); color: white; border: none; padding: 0.7rem 1.5rem; border-radius: 5px; cursor: pointer; font-family: var(--font-family, 'Poppins', sans-serif);">Log In</button>
                        <button id="close-alert" style="background: #e0e0e0; color: #333; border: none; padding: 0.7rem 1.5rem; border-radius: 5px; cursor: pointer; font-family: var(--font-family, 'Poppins', sans-serif);">Cancel</button>
                    </div>
                `;

                alertContainer.appendChild(alertContent);
                document.body.appendChild(alertContainer);

                document.getElementById('login-redirect').addEventListener('click', function() {
                    window.location.href = 'login.html?redirect=create-blog.html';
                });

                document.getElementById('close-alert').addEventListener('click', function() {
                    document.body.removeChild(alertContainer);
                });

                alertContainer.addEventListener('click', function(e) {
                    if (e.target === alertContainer) {
                        document.body.removeChild(alertContainer);
                    }
                });
            }
        });
    }

    blogGrid.innerHTML = `
        <div class="loading-posts" style="text-align: center; padding: 3rem; width: 100%;">
            <div class="spinner" style="display: inline-block; width: 40px; height: 40px; border: 4px solid rgba(78, 84, 200, 0.2); border-radius: 50%; border-top-color: var(--primary-color); animation: spin 1s linear infinite;"></div>
            <p style="margin-top: 1rem; color: var(--text-color-light);">Loading blog posts...</p>
        </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    try {
        localStorage.setItem('test', 'test value');
        console.log('localStorage test:', localStorage.getItem('test'));
        localStorage.removeItem('test');
        console.log('localStorage works!');
    } catch (e) {
        console.error('localStorage error:', e);
    }

    let blogPosts = [];
    const lastPublishedPostId = localStorage.getItem('lastPublishedPost');
    console.log('Last published post ID:', lastPublishedPostId);

    localStorage.removeItem('lastPublishedPost');

    function loadBlogPosts() {

        if (typeof firebase === 'undefined') {
            console.error('Firebase SDK not available - using localStorage only');
            loadFromLocalStorage();
            return;
        }

        try {
            const firestore = firebase.firestore && firebase.firestore();
            if (!firestore) {
                console.error('Firestore not available - using localStorage only');
                loadFromLocalStorage();
                return;
            }

            console.log('Attempting to load blog posts from Firestore');

            blogGrid.innerHTML = `
                <div class="loading-posts" style="text-align: center; padding: 3rem; width: 100%;">
                    <div class="spinner" style="display: inline-block; width: 40px; height: 40px; border: 4px solid rgba(78, 84, 200, 0.2); border-radius: 50%; border-top-color: var(--primary-color); animation: spin 1s linear infinite;"></div>
                    <p style="margin-top: 1rem; color: var(--text-color-light);">Loading blog posts...</p>
                </div>
            `;

            console.log('Forcing server fetch to bypass cache and get fresh data');

            const blogCollection = firestore.collection('blogPosts');

            function attemptLoad(retryCount = 0) {
                if (retryCount > 2) {
                    console.error('Maximum retry attempts reached');

                    blogGrid.innerHTML = `
                        <div class="error-message" style="text-align: center; padding: 3rem; width: 100%;">
                            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; color: #e74c3c;"></i>
                            <h3 style="margin-bottom: 1rem; color: var(--text-color);">Unable to Load Posts from Cloud</h3>
                            <p style="margin-bottom: 1.5rem; color: var(--text-color-light);">We're showing locally stored posts instead.</p>
                            <div>
                                <button id="reloadButton" style="margin-right: 1rem; background: var(--primary-color); color: white; border: none; padding: 0.7rem 1.5rem; border-radius: 5px; cursor: pointer;">
                                    Try Cloud Again
                                </button>
                                <button id="localButton" style="background: #e0e0e0; color: #333; border: none; padding: 0.7rem 1.5rem; border-radius: 5px; cursor: pointer;">
                                    Load Local Data
                                </button>
                            </div>
                        </div>
                    `;

                    document.getElementById('reloadButton').addEventListener('click', function() {
                        loadBlogPosts();
                    });

                    document.getElementById('localButton').addEventListener('click', function() {
                        loadFromLocalStorage();
                    });

                    loadFromLocalStorage();
                    return;
                }

                console.log(`Attempt ${retryCount + 1} to load posts from Firestore`);

                blogCollection
                    .orderBy('createdAt', 'desc')
                    .get({ source: 'server' })
                    .then((querySnapshot) => {
                        blogPosts = [];

                        if (querySnapshot.empty) {
                            console.log('No blog posts found in Firestore');
                        } else {
                            console.log(`Found ${querySnapshot.size} blog posts in Firestore`);
                        }

                        querySnapshot.forEach((doc) => {
                            const postData = doc.data();
                            console.log(`Loading post from Firestore: ${postData.title} (ID: ${postData.id || doc.id})`);

                            if (!postData.id) {
                                postData.id = doc.id;
                            }

                            blogPosts.push(postData);
                        });

                        console.log('Successfully loaded', blogPosts.length, 'blog posts from Firestore');

                        try {
                            localStorage.setItem('blogPosts', JSON.stringify(blogPosts));
                            console.log('Blog posts cached to localStorage');
                        } catch (e) {
                            console.error('Error caching blog posts to localStorage:', e);
                        }

                        const activeTab = document.querySelector('.category-tab.active');
                        let category = 'all';

                        if (activeTab) {
                            const categoryText = activeTab.textContent.trim();
                            if (categoryText !== 'All Posts') {
                                category = categoryText.toLowerCase().replace(/\s+/g, '-');
                            }
                        }

                        renderBlogPosts(category);
                    })
                    .catch((error) => {
                        console.error(`Attempt ${retryCount + 1} failed:`, error);

                        blogGrid.innerHTML = `
                            <div class="loading-posts" style="text-align: center; padding: 3rem; width: 100%;">
                                <div class="spinner" style="display: inline-block; width: 40px; height: 40px; border: 4px solid rgba(78, 84, 200, 0.2); border-radius: 50%; border-top-color: var(--primary-color); animation: spin 1s linear infinite;"></div>
                                <p style="margin-top: 1rem; color: var(--text-color-light);">Retrying connection ${retryCount + 2}/3...</p>
                                <p style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--text-color-light);">${error.message}</p>
                            </div>
                        `;

                        setTimeout(() => {
                            attemptLoad(retryCount + 1);
                        }, 1500);
                    });
            }

            attemptLoad();
        } catch (error) {
            console.error('Error with Firestore:', error);
            loadFromLocalStorage();
        }
    }

    function loadFromLocalStorage() {
        try {
            const storedPosts = localStorage.getItem('blogPosts');
            console.log('Stored posts string:', storedPosts);
            blogPosts = storedPosts ? JSON.parse(storedPosts) : [];
            console.log('Retrieved blog posts from localStorage:', blogPosts);

            renderBlogPosts('all');
        } catch (e) {
            console.error('Error retrieving blog posts from localStorage:', e);
            blogPosts = [];
            renderBlogPosts('all');
        }
    }

    loadBlogPosts();

    function renderBlogPosts(category = 'all') {
        blogGrid.innerHTML = ''; 

    if (!blogPosts || blogPosts.length === 0) {
        console.log('No blog posts found');
        blogGrid.innerHTML = `
            <div class="no-posts-message" style="text-align: center; padding: 3rem; color: var(--text-color-light);">
                <i class="fas fa-pen-fancy" style="font-size: 3rem; margin-bottom: 1rem; color: var(--primary-color);"></i>
                <h3>No Blog Posts Yet</h3>
                <p>Be the first one to share your story!</p>
            </div>
        `;
        return;
    }

        console.log('Rendering', blogPosts.length, 'blog posts', category !== 'all' ? `filtered by ${category}` : '');

        const filteredPosts = category === 'all' 
            ? blogPosts 
            : blogPosts.filter(post => {

                console.log('Post category:', post.category, 'Looking for category:', category);

                const postCategoryFormatted = post.category?.toLowerCase().replace(/\s+/g, '-') || '';
                const searchCategoryFormatted = category.toLowerCase();

                const isMatch = postCategoryFormatted === searchCategoryFormatted;
                console.log('Comparing:', postCategoryFormatted, 'with', searchCategoryFormatted, 'Match:', isMatch);

                return isMatch;
            });

        if (filteredPosts.length === 0) {
            blogGrid.innerHTML = `
                <div class="no-posts-message" style="text-align: center; padding: 3rem; color: var(--text-color-light);">
                    <i class="fas fa-filter" style="font-size: 3rem; margin-bottom: 1rem; color: var(--primary-color);"></i>
                    <h3>No Posts in ${category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
                    <p>Try another category or be the first to write about this topic!</p>
                </div>
            `;
            return;
        }

        filteredPosts.forEach((post, index) => {
            console.log(`Rendering post ${index}:`, post.title);

            const isNewPost = lastPublishedPostId && (post.id && post.id.toString() === lastPublishedPostId.toString());
        console.log('Is new post:', isNewPost);

        const postElement = document.createElement('div');
        postElement.className = 'blog-card';

        if (isNewPost) {
            postElement.classList.add('highlight-post');
            postElement.style.animation = 'highlightFade 2s ease-out';

            const style = document.createElement('style');
            style.textContent = `
                @keyframes highlightFade {
                    0% { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(78, 84, 200, 0.3); }
                    100% { transform: translateY(0); box-shadow: var(--shadow-md); }
                }
            `;
            document.head.appendChild(style);
        }

        let date = 'Unknown date';
        try {
            date = new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            console.error('Error formatting date:', e);
        }

        postElement.innerHTML = `
            ${post.image ? `<img src="${post.image}" alt="${post.title}">` : ''}
            <div class="blog-card-content">
                <div class="blog-card-meta">
                    <span><i class="fas fa-user"></i> ${post.author || 'Anonymous'}</span>
                    <span><i class="fas fa-calendar"></i> ${date}</span>
                    <span><i class="fas fa-folder"></i> ${post.category || 'Uncategorized'}</span>
                            <span style="display: none;" class="debug-category" data-original-category="${post.category}" data-formatted-category="${post.category?.toLowerCase().replace(/\s+/g, '-')}"></span>
                </div>
                <h3>${post.title || 'Untitled Post'}</h3>
                <p>${post.content ? (post.content.substring(0, 150) + (post.content.length > 150 ? '...' : '')) : 'No content'}</p>
                ${post.tags && post.tags.length > 0 ? `
                    <div class="blog-card-tags">
                        ${post.tags.map(tag => `<span class="blog-card-tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
                        <a href="#" class="read-more" data-post-id="${post.id}">Read More <i class="fas fa-arrow-right"></i></a>
            </div>
        `;

        blogGrid.appendChild(postElement);
        console.log('Post element added to grid');

        if (isNewPost) {
            setTimeout(() => {
                console.log('Scrolling to new post');
                postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    });

    console.log('Blog rendering complete');

        document.querySelectorAll('.read-more').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const postId = this.getAttribute('data-post-id');
                if (postId) {
                    openBlogPostModal(postId);
                }
            });
        });
    }

    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {

            categoryTabs.forEach(t => t.classList.remove('active'));

            this.classList.add('active');

            const categoryText = this.textContent.trim();
            console.log('Selected category tab:', categoryText);

            let category;
            if(categoryText === 'All Posts') {
                category = 'all';
            } else {
                category = categoryText.toLowerCase().replace(/\s+/g, '-');
            }

            console.log('Formatted category for filtering:', category);

            if (typeof firebase !== 'undefined' && firebase.firestore && category !== 'all') {
                blogGrid.innerHTML = `
                    <div class="loading-posts" style="text-align: center; padding: 3rem; width: 100%;">
                        <div class="spinner" style="display: inline-block; width: 40px; height: 40px; border: 4px solid rgba(78, 84, 200, 0.2); border-radius: 50%; border-top-color: var(--primary-color); animation: spin 1s linear infinite;"></div>
                        <p style="margin-top: 1rem; color: var(--text-color-light);">Loading ${category.replace(/-/g, ' ')} posts...</p>
                    </div>
                `;

                firebase.firestore().collection('blogPosts')
                    .where('category', '==', categoryText.trim())
                    .orderBy('createdAt', 'desc')
                    .get()
                    .then((querySnapshot) => {
                        const categoryPosts = [];
                        querySnapshot.forEach((doc) => {
                            categoryPosts.push(doc.data());
                        });
                        console.log('Loaded', categoryPosts.length, `${category} posts from Firestore`);

                        loadBlogPosts();

                        renderBlogPosts(category);
                    })
                    .catch((error) => {
                        console.error('Error loading category posts from Firestore:', error);

                        renderBlogPosts(category);
                    });
            } else {

                renderBlogPosts(category);
            }
        });
    });

    const blogModal = document.createElement('div');
    blogModal.className = 'blog-modal';
    blogModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(5px);
        z-index: 1000;
        display: none;
        overflow-y: auto;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    const blogModalContent = document.createElement('div');
    blogModalContent.className = 'blog-modal-content';
    blogModalContent.style.cssText = `
        background: var(--bg-color);
        color: var(--text-color);
        width: 90%;
        max-width: 800px;
        margin: 50px auto;
        padding: 2rem;
        border-radius: 20px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        transform: translateY(20px);
        transition: transform 0.5s ease;
        position: relative;
        border-top: 5px solid var(--primary-color);
    `;

    blogModal.appendChild(blogModalContent);
    document.body.appendChild(blogModal);

    const closeButton = document.createElement('button');
    closeButton.className = 'close-modal';
    closeButton.innerHTML = '<i class="fas fa-times"></i>';
    closeButton.style.cssText = `
        position: absolute;
        top: 15px;
        right: 15px;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        font-size: 1.5rem;
        color: var(--text-color);
        cursor: pointer;
        transition: all 0.3s ease;
        z-index: 1001;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    `;
    closeButton.addEventListener('mouseover', function() {
        this.style.background = 'var(--primary-color)';
        this.style.color = 'white';
        this.style.transform = 'scale(1.1)';
    });
    closeButton.addEventListener('mouseout', function() {
        this.style.background = 'rgba(255, 255, 255, 0.2)';
        this.style.color = 'var(--text-color)';
        this.style.transform = 'scale(1)';
    });
    blogModalContent.appendChild(closeButton);

    function openBlogPostModal(postId) {
        console.log('Opening post with ID:', postId);

        const post = blogPosts.find(post => {

            const postIdStr = postId && postId.toString();
            const currentPostIdStr = post.id && post.id.toString();
            console.log('Comparing:', currentPostIdStr, 'with:', postIdStr, 'Match:', currentPostIdStr === postIdStr);
            return currentPostIdStr === postIdStr;
        });

        if (!post) {
            console.error('Post not found with ID:', postId);

            blogModalContent.innerHTML = `
                <button class="close-modal" style="position: absolute; top: 15px; right: 15px; background: rgba(255, 255, 255, 0.2); border: none; font-size: 1.5rem; color: var(--text-color); cursor: pointer; transition: all 0.3s ease; z-index: 1001; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);"><i class="fas fa-times"></i></button>
                <div style="text-align: center; padding: 2rem;">
                    <i class="fas fa-exclamation-circle" style="font-size: 3rem; margin-bottom: 1rem; color: #e74c3c;"></i>
                    <h3 style="margin-bottom: 1rem; color: var(--text-color);">Post Not Found</h3>
                    <p style="margin-bottom: 1.5rem; color: var(--text-color-light);">The blog post you're looking for couldn't be found. It may have been deleted or isn't available in your current session.</p>
                    <p style="font-size: 0.8rem; color: var(--text-color-light);">Post ID: ${postId}</p>
                </div>
            `;

            blogModal.style.display = 'block';
            setTimeout(() => {
                blogModal.style.opacity = '1';
                blogModalContent.style.transform = 'translateY(0)';
            }, 10);

            const closeBtn = blogModalContent.querySelector('.close-modal');
            closeBtn.addEventListener('click', closeBlogPostModal);

            return;
        }

        let date = 'Unknown date';
        try {
            date = new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            console.error('Error formatting date:', e);
        }

        blogModalContent.innerHTML = `
            <button class="close-modal" style="position: absolute; top: 15px; right: 15px; background: rgba(255, 255, 255, 0.2); border: none; font-size: 1.5rem; color: var(--text-color); cursor: pointer; transition: all 0.3s ease; z-index: 1001; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);"><i class="fas fa-times"></i></button>
            ${post.image ? `<div class="blog-post-image"><img src="${post.image}" alt="${post.title}" style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 15px; margin-bottom: 1.5rem;"></div>` : ''}
            <div class="blog-post-header" style="margin-bottom: 1.5rem;">
                <h2 style="font-size: 2rem; margin-bottom: 1rem; color: var(--primary-color);">${post.title || 'Untitled Post'}</h2>
                <div class="blog-post-meta" style="display: flex; gap: 1rem; color: var(--text-color-light); font-size: 0.9rem; flex-wrap: wrap;">
                    <span><i class="fas fa-user"></i> ${post.author || 'Anonymous'}</span>
                    <span><i class="fas fa-calendar"></i> ${date}</span>
                    <span><i class="fas fa-folder"></i> ${post.category || 'Uncategorized'}</span>
                </div>
            </div>

            <div class="blog-post-content" style="line-height: 1.8; margin-bottom: 2rem;">
                ${post.content.split('\n').map(paragraph => `<p style="margin-bottom: 1rem;">${paragraph}</p>`).join('')}
            </div>

            ${post.tags && post.tags.length > 0 ? `
                <div class="blog-post-tags" style="display: flex; gap: 0.5rem; margin-top: 2rem; flex-wrap: wrap;">
                    ${post.tags.map(tag => `<span style="background: var(--bg-color-light); color: var(--primary-color); padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem;">${tag}</span>`).join('')}
                </div>
            ` : ''}

            <div class="blog-post-actions" style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between;">
                <a href="#" class="back-to-blogs" style="display: inline-flex; align-items: center; gap: 0.5rem; color: var(--primary-color); font-weight: 500;">
                    <i class="fas fa-arrow-left"></i> Back to all blogs
                </a>
            </div>
        `;

        blogModal.style.display = 'block';
        setTimeout(() => {
            blogModal.style.opacity = '1';
            blogModalContent.style.transform = 'translateY(0)';
        }, 10);

        const closeBtn = blogModalContent.querySelector('.close-modal');
        closeBtn.addEventListener('click', closeBlogPostModal);

        closeBtn.addEventListener('mouseover', function() {
            this.style.background = 'var(--primary-color)';
            this.style.color = 'white';
            this.style.transform = 'scale(1.1)';
        });
        closeBtn.addEventListener('mouseout', function() {
            this.style.background = 'rgba(255, 255, 255, 0.2)';
            this.style.color = 'var(--text-color)';
            this.style.transform = 'scale(1)';
        });

        const backButton = blogModalContent.querySelector('.back-to-blogs');
        backButton.addEventListener('click', function(e) {
            e.preventDefault();
            closeBlogPostModal();
        });

        blogModal.addEventListener('click', function(e) {
            if (e.target === blogModal) {
                closeBlogPostModal();
            }
        });
    }

    function closeBlogPostModal() {
        blogModal.style.opacity = '0';
        blogModalContent.style.transform = 'translateY(20px)';
        setTimeout(() => {
            blogModal.style.display = 'none';
        }, 300);
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && blogModal.style.display === 'block') {
            closeBlogPostModal();
        }
    });
});