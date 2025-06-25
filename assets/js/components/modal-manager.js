// Modal Management Component
const ModalManager = {
    open: (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            
            // Trigger modal opened event
            if (window.App && window.App.handleModalOpened) {
                window.App.handleModalOpened(modalId);
            }
        }
    },

    close: (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    },

    init: () => {
        // Close modals when clicking on background
        window.onclick = function(event) {
            if (event.target.classList.contains('modal')) {
                event.target.style.display = 'none';
            }
        };

        // Close modals with Escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                const openModals = document.querySelectorAll('.modal[style*="block"]');
                openModals.forEach(modal => {
                    modal.style.display = 'none';
                });
            }
        });
    }
};

// Export for use in other modules
window.ModalManager = ModalManager;