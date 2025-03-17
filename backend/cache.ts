export class Cache<T> {
    private data: T | null = null;
    private lastFetchTime: number = 0;
    private readonly cacheDuration: number;
    private readonly fetchFunction: () => Promise<T>;

    constructor(cacheDuration: number, fetchFunction: () => Promise<T>) {
        this.cacheDuration = cacheDuration;
        this.fetchFunction = fetchFunction;
    }

    async getData(): Promise<T> {
        const currentTime = Date.now();
        if (!this.data || (currentTime - this.lastFetchTime) > this.cacheDuration) {
            this.data = await this.fetchFunction();
            this.lastFetchTime = currentTime;
        }
        return this.data;
    }
}
