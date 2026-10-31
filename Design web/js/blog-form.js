document.addEventListener('DOMContentLoaded', function() {

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userName = localStorage.getItem('userName');

    if (!isLoggedIn) {

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
                <button id="login-redirect" style="background: var(--primary-color, #4e54c8); color: white; border: none; padding: 0.7rem 1.5rem; border-radius: 5px; cursor: pointer;">Log In</button>
                <button id="cancel-redirect" style="background: #e0e0e0; color: #333; border: none; padding: 0.7rem 1.5rem; border-radius: 5px; cursor: pointer;">Cancel</button>
            </div>
        `;

        alertContainer.appendChild(alertContent);
        document.body.appendChild(alertContainer);

        document.getElementById('login-redirect').addEventListener('click', function() {
            window.location.href = 'login.html?redirect=create-blog.html';
        });

        document.getElementById('cancel-redirect').addEventListener('click', function() {
            window.location.href = 'blog.html';
        });

        return;
    }

    if (userName) {
        const authorInput = document.getElementById('author-name');
        if (authorInput) {
            authorInput.value = userName;
        }
    }

    const blogForm = document.getElementById('blogForm');
    const imageInput = document.getElementById('blog-image');
    const imagePreview = document.getElementById('imagePreview');

    blogForm.style.position = 'relative';
    blogForm.style.zIndex = '1';

    const testFocus = () => {
        const inputs = blogForm.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                console.log('Input focused:', this.id);
            });
        });
    };
    testFocus();

    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.style.cssText = `
        background-color: #f8d7da;
        color: #721c24;
        padding: 1rem;
        margin-bottom: 1.5rem;
        border-radius: 10px;
        display: none;
        border-left: 5px solid #f5c6cb;
        position: relative;
        z-index: 5;
    `;
    blogForm.insertBefore(errorMessage, blogForm.firstChild);

    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 300px; margin-top: 10px;">`;
            }
            reader.readAsDataURL(file);
        }
    });

    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
        backdrop-filter: blur(5px);
    `;

    const successContent = document.createElement('div');
    successContent.style.cssText = `
        background: var(--bg-color);
        color: var(--text-color);
        padding: 2.5rem;
        border-radius: 20px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        max-width: 450px;
        width: 90%;
        transform: translateY(20px);
        transition: transform 0.5s ease;
        border-top: 5px solid var(--primary-color);
    `;
    successMessage.appendChild(successContent);
    document.body.appendChild(successMessage);

    blogForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const author = document.getElementById('author-name').value.trim();
        const title = document.getElementById('blog-title').value.trim();
        const category = document.getElementById('category').value;
        const content = document.getElementById('blog-content').value.trim();

        const errorMessage = document.getElementById('errorMessage') || createErrorMessage();
        const successMessage = document.getElementById('successMessage') || createSuccessMessage();

        if (!author || !title || !category || !content) {
            errorMessage.innerHTML = `
                <i class="fas fa-exclamation-circle" style="margin-right: 10px;"></i>
                <strong>Please fill in all required fields:</strong> 
                ${!author ? '<span style="display: block; margin-top: 5px;">• Author Name is required</span>' : ''}
                ${!title ? '<span style="display: block; margin-top: 5px;">• Title is required</span>' : ''}
                ${!category ? '<span style="display: block; margin-top: 5px;">• Category is required</span>' : ''}
                ${!content ? '<span style="display: block; margin-top: 5px;">• Content is required</span>' : ''}
            `;
            errorMessage.style.display = 'block';

            errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        } else {
            errorMessage.style.display = 'none';
        }

        const postId = Date.now().toString(); 
        const formData = {
            author: author,
            title: title,
            category: category,
            content: content,
            tags: document.getElementById('blog-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
            image: imagePreview.querySelector('img')?.src || '',
            date: new Date().toISOString(),
            id: postId,
            userId: firebase.auth().currentUser ? firebase.auth().currentUser.uid : 'anonymous',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        console.log('Saving blog post with category:', category);
        console.log('Category standardized format:', category.toLowerCase().replace(/\s+/g, '-'));

        const submitButton = document.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing...';
        submitButton.disabled = true;

        if (typeof firebase === 'undefined' || !firebase.firestore) {
            console.error('Firebase or Firestore is not available');
            errorMessage.innerHTML = `
                <i class="fas fa-exclamation-circle" style="margin-right: 10px;"></i>
                <strong>Firebase Error:</strong> 
                <span style="display: block; margin-top: 5px;">Firebase is not available. Your blog post will only be saved locally.</span>
            `;
            errorMessage.style.display = 'block';

            saveBlogToLocalStorage(formData, author, title);
            return;
        }

        if (!firebase.auth().currentUser) {
            console.error('User not logged in');
            errorMessage.innerHTML = `
                <i class="fas fa-exclamation-circle" style="margin-right: 10px;"></i>
                <strong>Authentication Error:</strong> 
                <span style="display: block; margin-top: 5px;">You must be logged in to save blog posts to the cloud database.</span>
            `;
            errorMessage.style.display = 'block';

            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;

            saveBlogToLocalStorage(formData, author, title);
            return;
        }

        try {
            console.log("Attempting to save blog post to Firestore collection 'blogPosts'");

            const firebaseData = {...formData};
            if (firebaseData.image && firebaseData.image.length > 500000) { 
                console.warn('Image is too large for Firestore, removing from Firebase data');
                firebaseData.image = '';
                firebaseData.hasLargeImage = true;
            }

            firebase.firestore().collection('blogPosts').doc(postId)
                .set(firebaseData)
                .then(() => {
                    console.log('Blog post saved to Firestore successfully!');

                    try {

                        let blogPosts = JSON.parse(localStorage.getItem('blogPosts')) || [];

                        blogPosts.unshift(formData);

                        localStorage.setItem('blogPosts', JSON.stringify(blogPosts));
                        console.log('Blog post also cached to localStorage');
                    } catch (storageError) {
                        console.error('Error saving to localStorage:', storageError);
                    }

                    submitButton.innerHTML = originalButtonText;
                    submitButton.disabled = false;

                    localStorage.setItem('lastPublishedPost', formData.id);

                    showSuccessMessage(author, title);
                })
                .catch((error) => {
                    console.error('Error saving blog post to Firestore:', error);

                    if (error.code === 'permission-denied') {
                        console.warn('Firebase permission denied. This is likely due to Firestore security rules.');
                        errorMessage.innerHTML = `
                            <i class="fas fa-exclamation-circle" style="margin-right: 10px;"></i>
                            <strong>Firebase Permission Error:</strong> 
                            <span style="display: block; margin-top: 5px;">Your blog was saved locally but couldn't be saved to the cloud database due to permission restrictions.</span>
                            <span style="display: block; margin-top: 5px;">Error details: ${error.message}</span>
                        `;
                    } else {
                        errorMessage.innerHTML = `
                            <i class="fas fa-exclamation-circle" style="margin-right: 10px;"></i>
                            <strong>Firebase Error:</strong>
                            <span style="display: block; margin-top: 5px;">There was an error saving to the cloud database. Your blog post was saved locally.</span>
                            <span style="display: block; margin-top: 5px;">Error details: ${error.message}</span>
                        `;
                    }
                    errorMessage.style.display = 'block';

                    saveBlogToLocalStorage(formData, author, title);
                });
        } catch (error) {
            console.error('Exception while trying to save to Firestore:', error);
            errorMessage.innerHTML = `
                <i class="fas fa-exclamation-circle" style="margin-right: 10px;"></i>
                <strong>Unexpected Error:</strong>
                <span style="display: block; margin-top: 5px;">There was an unexpected error when trying to save your blog. It has been saved locally.</span>
                <span style="display: block; margin-top: 5px;">Error details: ${error.message}</span>
            `;
            errorMessage.style.display = 'block';
            saveBlogToLocalStorage(formData, author, title);
        }
    });

    function saveBlogToLocalStorage(formData, author, title, showSuccess = true) {

        let blogPosts = JSON.parse(localStorage.getItem('blogPosts')) || [];

        blogPosts.unshift(formData);

        localStorage.setItem('blogPosts', JSON.stringify(blogPosts));
        console.log('Blog post saved to localStorage');

        if (showSuccess) {
            const submitButton = document.querySelector('button[type="submit"]');
            if (submitButton.disabled) {
                submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Publish Post';
                submitButton.disabled = false;
            }

            localStorage.setItem('lastPublishedPost', formData.id);

            showSuccessMessage(author, title);
        }
    }

    function showSuccessMessage(author, title) {

        successContent.innerHTML = `
            <div class="success-icon" style="margin-bottom: 1.5rem; animation: pulse 2s infinite;">
                <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
            </div>
            <h3 style="margin-bottom: 1rem; font-size: 1.8rem; color: var(--primary-color);">Blog Published Successfully!</h3>
            <p style="margin-bottom: 1.5rem; line-height: 1.6;">Great job, <strong>${author}</strong>! Your blog post <strong>"${title}"</strong> has been published to the website.</p>
            <div class="progress-bar" style="height: 4px; background: #e0e0e0; border-radius: 4px; margin: 1.5rem 0;">
                <div class="progress" style="height: 100%; width: 0; background: var(--primary-color); border-radius: 4px; transition: width 2s linear;"></div>
            </div>
            <p style="color: var(--text-color-light); font-size: 0.9rem;">Redirecting to your published blog...</p>
        `;

        successMessage.style.display = 'flex';
        setTimeout(() => {
            successMessage.style.opacity = '1';
            successContent.style.transform = 'translateY(0)';
        }, 10);

        setTimeout(() => {
            const progressBar = successContent.querySelector('.progress');
            progressBar.style.width = '100%';
        }, 200);

        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);

        setTimeout(() => {
            window.location.href = 'blog.html';
        }, 3000); 
    }

    function createErrorMessage() {
        const errorDiv = document.createElement('div');
        errorDiv.id = 'errorMessage';
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            display: none;
            background-color: #ffeeee;
            border-left: 4px solid #e74c3c;
            color: #333;
            padding: 1rem;
            margin-bottom: 1.5rem;
            border-radius: 5px;
        `;

        blogForm.parentNode.insertBefore(errorDiv, blogForm);
        return errorDiv;
    }

    function createSuccessMessage() {
        const successDiv = document.createElement('div');
        successDiv.id = 'successMessage';
        successDiv.className = 'success-message';
        successDiv.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 9999;
            justify-content: center;
            align-items: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        const successContentDiv = document.createElement('div');
        successContentDiv.className = 'success-content';
        successContentDiv.style.cssText = `
            background: var(--bg-color, white);
            width: 90%;
            max-width: 500px;
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            text-align: center;
            transform: translateY(20px);
            transition: transform 0.5s ease;
            border-top: 5px solid var(--primary-color, #4e54c8);
        `;

        successDiv.appendChild(successContentDiv);
        document.body.appendChild(successDiv);

        return successDiv;
    }
});