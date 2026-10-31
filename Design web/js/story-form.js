document.addEventListener('DOMContentLoaded', function() {

    const writeStoryBtn = document.getElementById('write-story-btn');
    if (writeStoryBtn) {
        const targetUrl = writeStoryBtn.getAttribute('data-target');
        writeStoryBtn.addEventListener('click', function(e) {
            e.preventDefault();

            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

            if (isLoggedIn) {

                window.location.href = targetUrl;
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
                    <p style="margin-bottom: 1.5rem;">Please log in to create a success story</p>
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button id="login-redirect" style="background: var(--primary-color, #4e54c8); color: white; border: none; padding: 0.7rem 1.5rem; border-radius: 5px; cursor: pointer; font-family: var(--font-family, 'Poppins', sans-serif);">Log In</button>
                        <button id="close-alert" style="background: #e0e0e0; color: #333; border: none; padding: 0.7rem 1.5rem; border-radius: 5px; cursor: pointer; font-family: var(--font-family, 'Poppins', sans-serif);">Cancel</button>
                    </div>
                `;

                alertContainer.appendChild(alertContent);
                document.body.appendChild(alertContainer);

                document.getElementById('login-redirect').addEventListener('click', function() {
                    window.location.href = 'login.html?redirect=write-story.html';
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

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const loginRequired = document.getElementById('loginRequired');
    const storyForm = document.getElementById('storyForm');

    if (loginRequired && storyForm) {
        if (!isLoggedIn) {

            if (loginRequired) {
                const loginLink = loginRequired.querySelector('.primary-btn');
                if (loginLink) {
                    loginLink.setAttribute('href', 'login.html?redirect=write-story.html');
                }

                const heading = loginRequired.querySelector('h2');
                if (heading) {
                    heading.textContent = 'Login Required';
                }

                const paragraph = loginRequired.querySelector('p');
                if (paragraph) {
                    paragraph.textContent = 'Please log in to create a success story';
                }
            }

            loginRequired.style.display = 'block';
            storyForm.style.display = 'none';
            return; 
        } else {
            loginRequired.style.display = 'none';
            storyForm.style.display = 'block';
        }
    }

    const categorySelect = document.getElementById('category');
    if (categorySelect) {

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a category';
        defaultOption.selected = true;
        categorySelect.appendChild(defaultOption);

        const categories = [
            { value: 'physical-health', text: 'Physical Health' },
            { value: 'mental-wellbeing', text: 'Mental Well-being' },
            { value: 'screen-time', text: 'Screen Time' },
            { value: 'nutrition', text: 'Nutrition' },
            { value: 'sleep', text: 'Sleep' },
            { value: 'exercise', text: 'Exercise' },
            { value: 'others', text: 'Others' }
        ];

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.value;
            option.textContent = category.text;
            categorySelect.appendChild(option);
        });
    }

    if (storyForm) {
        storyForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(storyForm);

            let profilePic = 'images/default-avatar.png';
            const gender = formData.get('gender');

            if (gender === 'male') {
                profilePic = 'images/male-avatar.png';
            } else if (gender === 'female') {
                profilePic = 'images/female-avatar.png';
            } else {
                profilePic = 'images/default-avatar.png';
            }

            const storyId = Date.now().toString();

            const newStory = {
                id: storyId,
                name: formData.get('name'),
                age: formData.get('age'),
                gender: gender,
                storyText: formData.get('story'),
                category: formData.get('category'),
                duration: formData.get('duration'),
                photo: profilePic,
                userId: firebase.auth().currentUser ? firebase.auth().currentUser.uid : 'anonymous',
                createdAt: firebase.firestore ? firebase.firestore.FieldValue.serverTimestamp() : new Date().toISOString(),
                date: new Date().toISOString()
            };

            const submitButton = storyForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            submitButton.disabled = true;

            if (typeof firebase !== 'undefined' && firebase.firestore) {
                console.log('Attempting to save success story to Firebase');

                firebase.firestore().collection('successStories').doc(storyId)
                    .set(newStory)
                    .then(() => {
                        console.log('Success story saved to Firestore');

                        saveToLocalStorage(newStory);

                        showSuccessNotification();
                    })
                    .catch((error) => {
                        console.error('Error saving to Firestore:', error);

                        saveToLocalStorage(newStory);

                        showSuccessNotification();
                    });
            } else {
                console.log('Firebase not available, saving to localStorage only');

                saveToLocalStorage(newStory);

                showSuccessNotification();
            }
        });
    }

    function saveToLocalStorage(story) {

        let successStories = JSON.parse(localStorage.getItem('successStories')) || [];

        successStories.push(story);

        localStorage.setItem('successStories', JSON.stringify(successStories));
        console.log('Success story saved to localStorage');
    }

    function showSuccessNotification() {
        const successNotification = document.getElementById('successNotification');

        if (successNotification && storyForm) {
            storyForm.style.display = 'none';
            successNotification.style.display = 'flex';
        }
    }

    function loadSuccessStories() {

        const testimonialSlider = document.querySelector('.testimonial-slider');
        const sliderDots = document.querySelector('.slider-dots');

        if (!testimonialSlider) {
            return; 
        }

        function showNoStoriesMessage() {

            testimonialSlider.innerHTML = '';
            sliderDots.innerHTML = '';

            const noStoriesMessage = document.createElement('div');
            noStoriesMessage.className = 'no-stories-message';
            noStoriesMessage.innerHTML = `
                <div class="testimonial-content">
                    <p>No success stories available yet.</p>
                </div>
            `;

            testimonialSlider.appendChild(noStoriesMessage);

            const sliderControls = document.querySelector('.slider-controls');
            if (sliderControls) {
                sliderControls.style.display = 'none';
            }
        }

        if (typeof firebase !== 'undefined' && firebase.firestore) {
            console.log('Attempting to load success stories from Firestore');

            firebase.firestore().collection('successStories')
                .orderBy('createdAt', 'desc')
                .get({ source: 'server' })
                .then((querySnapshot) => {
                    const stories = [];

                    if (querySnapshot.empty) {
                        console.log('No success stories found in Firestore, showing no stories message');
                        showNoStoriesMessage();
                    } else {
                        console.log(`Found ${querySnapshot.size} success stories in Firestore`);

                        querySnapshot.forEach((doc) => {
                            const storyData = doc.data();
                            stories.push(storyData);
                        });

                        console.log('Success stories loaded from Firestore');

                        localStorage.setItem('successStories', JSON.stringify(stories));

                        addStoriesToSlider(stories);
                    }
                })
                .catch((error) => {
                    console.error('Error loading success stories from Firestore:', error);

                    const localStories = JSON.parse(localStorage.getItem('successStories')) || [];

                    if (localStories.length > 0) {
                        console.log('Using success stories from localStorage');
                        addStoriesToSlider(localStories);
                    } else {
                        console.log('No stories in localStorage, showing no stories message');
                        showNoStoriesMessage();
                    }
                });
        } else {
            console.log('Firebase not available, using localStorage or showing no stories message');

            const userStories = JSON.parse(localStorage.getItem('successStories')) || [];

            if (userStories.length === 0) {
                showNoStoriesMessage();
            } else {
                addStoriesToSlider(userStories);
            }
        }
    }

    function addStoriesToSlider(stories) {
        const testimonialSlider = document.querySelector('.testimonial-slider');
        const sliderDots = document.querySelector('.slider-dots');

        if (!testimonialSlider || !sliderDots) return;

        testimonialSlider.innerHTML = '';
        sliderDots.innerHTML = '';

        stories.forEach((story, index) => {

            const newTestimonial = document.createElement('div');
            newTestimonial.className = 'testimonial';
            newTestimonial.style.display = index === 0 ? 'block' : 'none';

            newTestimonial.innerHTML = `
                <div class="testimonial-content">
                    <p>"${story.storyText}"</p>
                    <div class="testimonial-author">
                        <img src="${story.photo}" alt="${story.name}">
                        <div>
                            <h4>${story.name}, ${story.age}</h4>
                            <span>${story.duration} on program</span>
                        </div>
                    </div>
                </div>
            `;

            testimonialSlider.appendChild(newTestimonial);

            const newDot = document.createElement('span');
            newDot.className = 'dot';
            if (index === 0) newDot.classList.add('active');
            sliderDots.appendChild(newDot);
        });

        initSliderControls();
    }

    function initSliderControls() {

        const testimonials = document.querySelectorAll('.testimonial');
        const dots = document.querySelectorAll('.dot');
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        let currentSlide = 0;

        if (testimonials.length === 0) return;

        function showSlide(index) {

            testimonials.forEach(testimonial => {
                testimonial.style.display = 'none';
                testimonial.classList.remove('slide-in');
            });

            dots.forEach(dot => {
                dot.classList.remove('active');
            });

            if (index < 0) {
                index = testimonials.length - 1;
            } else if (index >= testimonials.length) {
                index = 0;
            }

            testimonials[index].style.display = 'block';

            setTimeout(() => {
                testimonials[index].classList.add('slide-in');
            }, 10);
            dots[index].classList.add('active');
            currentSlide = index;
        }

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showSlide(index);
            });
        });

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                showSlide(currentSlide - 1);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                showSlide(currentSlide + 1);
            });
        }
    }

    loadSuccessStories();
});