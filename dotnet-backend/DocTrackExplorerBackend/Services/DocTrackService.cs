using System.Text.Json;
using System.Text.Json.Serialization;
using DocTrackExplorer.Models;

namespace DocTrackExplorer.Services
{
    public class DocTrackService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public DocTrackService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            // TODO: Make this less stateful
            _httpClient.DefaultRequestHeaders.Add("accept", "application/json");
            _httpClient.DefaultRequestHeaders.Add("x-api-key", _configuration["DocApiKey"]);
        }

        public async Task<List<DocJSON>> FetchDocJsonDataAsync()
        {
            var response = await _httpClient.GetAsync(
                "https://api.doc.govt.nz/v1/tracks?coordinates=wgs84"
            );

            response.EnsureSuccessStatusCode();
            var jsonString = await response.Content.ReadAsStringAsync();

            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                Converters = { new JsonStringEnumConverter() }
            };

            return JsonSerializer.Deserialize<List<DocJSON>>(jsonString, options)
                ?? new List<DocJSON>();
        }
    }
}
