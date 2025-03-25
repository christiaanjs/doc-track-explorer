using System.Collections.Concurrent;

namespace DocTrackExplorer.Services
{
    public class Cache<T>
    {
        private T? _data;
        private DateTime _lastFetchTime = DateTime.MinValue;
        private readonly TimeSpan _cacheDuration;
        private readonly Func<Task<T>> _fetchFunction;

        public Cache(TimeSpan cacheDuration, Func<Task<T>> fetchFunction)
        {
            _cacheDuration = cacheDuration;
            _fetchFunction = fetchFunction;
        }

        public async Task<T> GetDataAsync()
        {
            var now = DateTime.UtcNow;
            if (_data == null || now - _lastFetchTime > _cacheDuration)
            {
                _data = await _fetchFunction();
                _lastFetchTime = now;
            }
            return _data;
        }
    }
}
