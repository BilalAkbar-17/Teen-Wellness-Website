document.addEventListener('DOMContentLoaded', function() {

    const filterButtons = document.querySelectorAll('.filter-btn');
    const resourceSections = document.querySelectorAll('.resource-section');
    const resourceItems = document.querySelectorAll('[data-category]');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {

            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const filter = this.dataset.filter;

            resourceSections.forEach(section => {
                if (filter === 'all' || section.id === `${filter}-section`) {
                    section.style.display = 'block';
                } else {
                    section.style.display = 'none';
                }
            });

            resourceItems.forEach(item => {
                if (filter === 'all' || item.dataset.category === filter) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    const searchInput = document.getElementById('resourceSearch');
    const searchResults = document.createElement('div');
    searchResults.className = 'search-results';
    searchInput.parentNode.appendChild(searchResults);

    searchInput.addEventListener('input', debounce(function() {
        const searchTerm = this.value.toLowerCase();
        if (searchTerm.length < 2) {
            searchResults.style.display = 'none';
            return;
        }

        const results = [];
        resourceItems.forEach(item => {
            const title = item.querySelector('h3')?.textContent.toLowerCase() || '';
            const description = item.querySelector('p')?.textContent.toLowerCase() || '';

            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                results.push({
                    title: item.querySelector('h3')?.textContent || '',
                    description: item.querySelector('p')?.textContent || '',
                    category: item.dataset.category,
                    id: item.dataset.resourceId
                });
            }
        });

        displaySearchResults(results);
    }, 300));

    function displaySearchResults(results) {
        if (results.length === 0) {
            searchResults.style.display = 'none';
            return;
        }

        searchResults.innerHTML = results.map(result => `
            <div class="search-result-item" data-category="${result.category}" data-resource-id="${result.id}">
                <h4>${result.title}</h4>
                <p>${result.description}</p>
                <span class="category-tag">${result.category}</span>
            </div>
        `).join('');

        searchResults.style.display = 'block';
    }

    document.addEventListener('click', function(e) {
        const resourceItem = e.target.closest('[data-resource-id]');
        if (resourceItem) {
            const resourceId = resourceItem.dataset.resourceId;
            handleResourceClick(resourceId);
        }
    });

    function handleResourceClick(resourceId) {

        console.log(`Resource clicked: ${resourceId}`);

    }

    const viewMoreBtn = document.querySelector('.view-more');
    if (viewMoreBtn) {
        viewMoreBtn.addEventListener('click', function() {

            alert('Loading more articles...');
        });
    }

    const collectionItems = document.querySelectorAll('.collection-item');
    collectionItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const collection = this.dataset.collection;

            filterResourcesByCollection(collection);
        });
    });

    function filterResourcesByCollection(collection) {

        collectionItems.forEach(item => {
            item.classList.toggle('active', item.dataset.collection === collection);
        });

        resourceItems.forEach(item => {
            const shouldShow = item.dataset.collection === collection;
            item.style.display = shouldShow ? 'block' : 'none';
        });
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
});