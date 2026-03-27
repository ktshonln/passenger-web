export function camelCaseToTitle(text: string, reverse = false): string {
    if (reverse) {
        // Convert Title Case to camelCase
        return text
            .split(' ') // Split into words
            .filter(word => word.length > 0) // Remove empty strings from multiple spaces
            .map((word, index) => {
                if (index === 0) {
                    // Lowercase entire first word
                    return word.toLowerCase();
                }
                // Capitalize first letter, lowercase rest for subsequent words
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join('');
    }

    // Original camelCase to Title Case conversion
    return text
        .replace(/([A-Z])/g, ' $1') // Add space before capitals
        .trim()
        .replace(/\w\S*/g, (word) =>
            word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
        );
}