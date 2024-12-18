export function formatTimeAgo(date: Date | string): string {
    const now = new Date();
    const timeStamp = date instanceof Date ? date : new Date(date);
    const diff = now.getTime() - timeStamp.getTime();
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) {
        return 'just now';
    } else if (minutes < 60) {
        return `${minutes}m ago`;
    } else if (hours < 24) {
        return `${hours}h ago`;
    } else if (days < 7) {
        return `${days}d ago`;
    } else {
        return timeStamp.toLocaleDateString();
    }
}
