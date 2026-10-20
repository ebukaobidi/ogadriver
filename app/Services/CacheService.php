<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class CacheService
{
    protected int $defaultTtl = 3600; // 1 hour default

    /**
     * Get cached data or execute callback
     */
    public function remember(string $key, callable $callback, ?int $ttl = null): mixed
    {
        $ttl = $ttl ?? $this->defaultTtl;
        return Cache::remember($key, $ttl, $callback);
    }

    /**
     * Get cached data or execute callback with tags.
     *
     * Accepts either (tags, key, callback, ttl?) or (tags, key, ttl, callback)
     * so callers can use either argument order.
     */
    public function rememberTags(array $tags, string $key, callable|int $callbackOrTtl, callable|int|null $ttlOrCallback = null): mixed
    {
        [$callback, $ttl] = $this->resolveRememberArgs($callbackOrTtl, $ttlOrCallback);
        $ttl = $ttl ?? $this->defaultTtl;

        if ($this->supportsTagging()) {
            return Cache::tags($tags)->remember($key, $ttl, $callback);
        }

        $prefixedKey = $this->prefixedKey($tags, $key);
        $this->trackTaggedKey($tags, $prefixedKey);

        return Cache::remember($prefixedKey, $ttl, $callback);
    }

    /**
     * Clear cache by key
     */
    public function forget(string $key): bool
    {
        return Cache::forget($key);
    }

    /**
     * Clear cache by tags
     */
    public function forgetTags(array $tags): bool
    {
        if ($this->supportsTagging()) {
            return Cache::tags($tags)->flush();
        }

        foreach ($tags as $tag) {
            $indexKey = $this->tagIndexKey($tag);
            $keys = Cache::get($indexKey, []);

            foreach ($keys as $key) {
                Cache::forget($key);
            }

            Cache::forget($indexKey);
        }

        return true;
    }

    /**
     * Get states with caching
     */
    public function getStates(int $countryId = 1): mixed
    {
        return $this->remember("states_{$countryId}", function () use ($countryId) {
            return DB::table('states')->where('country_id', $countryId)->get();
        }, 86400);
    }

    /**
     * Get cities by state with caching
     */
    public function getCitiesByState(int $stateId): mixed
    {
        return $this->remember("cities_state_{$stateId}", function () use ($stateId) {
            return DB::table('cities')->where('state_id', $stateId)->get();
        }, 3600);
    }

    /**
     * Clear location cache
     */
    public function clearLocationCache(): void
    {
        $this->forgetTags(['states', 'cities']);
    }

    /**
     * Get driver profile with caching
     */
    public function getDriverProfile(int $driverId): mixed
    {
        return $this->rememberTags(['drivers', "driver_{$driverId}"], "driver_profile_{$driverId}", 1800, function () use ($driverId) {
            return \App\Models\Driver::with(['user', 'documents', 'wallet', 'state', 'city'])
                ->withCount('bookings', 'reviews')
                ->find($driverId);
        });
    }

    /**
     * Clear driver cache
     */
    public function clearDriverCache(int $driverId): void
    {
        $this->forgetTags(['drivers', "driver_{$driverId}"]);
    }

    /**
     * Get driver availability with caching
     */
    public function getDriverAvailability(int $driverId, string $date): mixed
    {
        return $this->rememberTags(['availability', "driver_{$driverId}"], "availability_{$driverId}_{$date}", 300, function () use ($driverId, $date) {
            return \App\Models\DriverAvailability::where('driver_id', $driverId)
                ->where('date', $date)
                ->first();
        });
    }

    /**
     * Clear availability cache for driver
     */
    public function clearAvailabilityCache(int $driverId): void
    {
        $this->forgetTags(['availability', "driver_{$driverId}"]);
    }

    /**
     * Get driver pricing with caching
     */
    public function getDriverPricing(int $driverId): mixed
    {
        return $this->rememberTags(['pricing', "driver_{$driverId}"], "driver_pricing_{$driverId}", 1800, function () use ($driverId) {
            return \App\Models\DriverPricing::where('driver_id', $driverId)
                ->where('is_active', true)
                ->get();
        });
    }

    /**
     * Clear pricing cache for driver
     */
    public function clearPricingCache(int $driverId): void
    {
        $this->forgetTags(['pricing', "driver_{$driverId}"]);
    }

    /**
     * @return array{0: callable, 1: int|null}
     */
    protected function resolveRememberArgs(callable|int $callbackOrTtl, callable|int|null $ttlOrCallback): array
    {
        if (is_callable($callbackOrTtl)) {
            return [$callbackOrTtl, is_int($ttlOrCallback) ? $ttlOrCallback : null];
        }

        if (! is_callable($ttlOrCallback)) {
            throw new \InvalidArgumentException('rememberTags requires a callable callback.');
        }

        return [$ttlOrCallback, $callbackOrTtl];
    }

    protected function supportsTagging(): bool
    {
        // Redis/Memcached support tags; database/file/array do not.
        return Cache::supportsTags();
    }

    protected function prefixedKey(array $tags, string $key): string
    {
        $sorted = $tags;
        sort($sorted);

        return 'tagged:' . implode('|', $sorted) . ':' . $key;
    }

    protected function tagIndexKey(string $tag): string
    {
        return "cache_tag_index:{$tag}";
    }

    protected function trackTaggedKey(array $tags, string $prefixedKey): void
    {
        foreach ($tags as $tag) {
            $indexKey = $this->tagIndexKey($tag);
            $keys = Cache::get($indexKey, []);

            if (! in_array($prefixedKey, $keys, true)) {
                $keys[] = $prefixedKey;
                Cache::forever($indexKey, $keys);
            }
        }
    }
}
