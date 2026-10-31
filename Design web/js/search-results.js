document.addEventListener('DOMContentLoaded', function() {

    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q') || '';

    const searchQueryDisplay = document.getElementById('search-query-display');
    if (searchQueryDisplay) {
        searchQueryDisplay.textContent = searchQuery;
    }

    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.value = searchQuery;
    }

    if (searchQuery) {
        displaySearchResults(searchQuery);
    } else {
        showNoResults('Please enter a search term');
    }

    function displaySearchResults(query) {

        const normalizedQuery = query.toLowerCase().trim();

        if (normalizedQuery.length === 0) {
            showNoResults('Please enter a search term');
            return;
        }

        const searchableContent = [
            {
                title: 'Physical Health',
                description: 'Learn about maintaining a healthy lifestyle through proper nutrition, exercise, and sleep habits.',
                category: 'Physical Health',
                url: 'physical-health.html'
            },
            {
                title: 'Mental Well-being',
                description: 'Discover strategies to maintain good mental health, manage stress, and build emotional resilience.',
                category: 'Mental Health',
                url: 'mental-wellbeing.html'
            },
            {
                title: 'Screen Time Impact',
                description: 'Learn how digital device usage affects your physical and mental health, and discover strategies for healthier technology habits.',
                category: 'Digital Wellness',
                url: 'screen-time.html'
            },
            {
                title: 'Modern Nutrition',
                description: 'Explore balanced nutrition strategies for growing teens in today\'s fast-food culture.',
                category: 'Nutrition',
                url: 'nutrition.html'
            },
            {
                title: 'Sleep Patterns',
                description: 'Understand how technology disrupts sleep and discover techniques for better rest.',
                category: 'Sleep',
                url: 'sleep.html'
            },
            {
                title: 'Exercise',
                description: 'Find fun ways to stay active despite the sedentary pull of digital entertainment.',
                category: 'Fitness',
                url: 'exercise.html'
            },
            {
                title: 'Wellness Quiz',
                description: 'Take our interactive quiz to assess your current wellness level and get personalized recommendations.',
                category: 'Assessment',
                url: 'quiz.html'
            },
            {
                title: 'Success Stories',
                description: 'Read stories from teens who have improved their well-being through positive lifestyle changes.',
                category: 'Community',
                url: 'write-story.html'
            },
            {
                title: 'Teen Blog',
                description: 'Explore articles written by and for teens about wellness topics.',
                category: 'Blog',
                url: 'blog.html'
            }
        ];

        const results = searchableContent.filter(item => {
            return item.title.toLowerCase().includes(normalizedQuery) || 
                   item.description.toLowerCase().includes(normalizedQuery) ||
                   item.category.toLowerCase().includes(normalizedQuery);
        });

        const resultsContainer = document.getElementById('search-results');

        if (results.length === 0) {
            showNoResults();
            return;
        }

        resultsContainer.innerHTML = results.map(result => `
            <div class="result-item">
                <h3 class="result-title">${result.title}</h3>
                <p class="result-description">${result.description}</p>
                <span class="result-category">${result.category}</span>
                <div>
                    <a href="${result.url}" class="result-link">View Details <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
        `).join('');
    }

    function showNoResults(message = 'No results found for your search') {
        const resultsContainer = document.getElementById('search-results');
        resultsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>${message}</h3>
                <p>Try different keywords or browse our wellness topics</p>
            </div>
        `;
    }

    window.displaySearchResults = displaySearchResults;
});