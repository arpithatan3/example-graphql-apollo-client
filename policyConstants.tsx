export enum FetchPolicy {
    CACHE_ONLY= 'cache-only',
    CACHE_FIRST='cache-first',
    CACHE_AND_NETWORK='cache-and-network',
    STANDBY='standby',
    NETWORK_ONLY='network-only',
    NO_CACHE='no-cache'
}

export enum ErrorPolicy {
    ALL= 'all',
    IGNORE= 'ignore',
    NONE= 'none'
}