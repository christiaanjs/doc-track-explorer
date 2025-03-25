using System.Text.Json.Serialization;

namespace DocTrackExplorer.Models
{
    public class DocJSON
    {
        [JsonPropertyName("assetId")]
        public string AssetId { get; set; } = string.Empty;

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("status")]
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public DocStatus Status { get; set; }

        [JsonPropertyName("region")]
        public List<string> Region { get; set; } = new List<string>();

        [JsonPropertyName("y")]
        public double Y { get; set; }

        [JsonPropertyName("x")]
        public double X { get; set; }

        [JsonPropertyName("line")]
        public List<List<List<double>>> Line { get; set; } = new List<List<List<double>>>();
    }

    public enum DocStatus
    {
        OPEN,
        CLSD
    }

    public class Track
    {
        public string Id { get; set; } = string.Empty;
        public string TrackName { get; set; } = string.Empty;
        public List<string> Region { get; set; } = new List<string>();
        public string Status { get; set; } = string.Empty;
    }
}
