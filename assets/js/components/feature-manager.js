// Feature Management Component
const FeatureManager = {
    render: () => {
        const container = document.getElementById('featuresContainer');
        if (container && window.AppConfig) {
            container.innerHTML = window.AppConfig.features
                .map(feature => window.UIComponents.createFeatureCard(feature))
                .join('');
        }
    },

    addFeature: (feature) => {
        // Future implementation for dynamically adding features
        if (window.AppConfig) {
            window.AppConfig.features.push(feature);
            FeatureManager.render();
        }
    },

    removeFeature: (index) => {
        // Future implementation for removing features
        if (window.AppConfig && window.AppConfig.features[index]) {
            window.AppConfig.features.splice(index, 1);
            FeatureManager.render();
        }
    }
};

// Export for use in other modules
window.FeatureManager = FeatureManager;