using System.Text.Json.Serialization;

namespace DocTrackExplorer.Models
{
    public interface IGeoJsonFeature
    {
        string Type { get; set; }
        GeoJsonGeometry Geometry { get; set; }
        object Properties { get; set; }
        string? Id { get; set; }
    }

    public class GeoJsonGeometry
    {
        [JsonPropertyName("type")]
        public string Type { get; set; } = "MultiLineString";

        [JsonPropertyName("coordinates")]
        public List<List<List<double>>> Coordinates { get; set; } = new List<List<List<double>>>();
    }

    public class GeoJson
    {
        [JsonPropertyName("type")]
        public string Type { get; set; } = "FeatureCollection";

        [JsonPropertyName("features")]
        public List<IGeoJsonFeature> Features { get; set; } = new List<IGeoJsonFeature>();

        [JsonPropertyName("crs")]
        public CRSObject? Crs { get; set; }
    }

    public class CRSObject
    {
        [JsonPropertyName("type")]
        public string Type { get; set; } = "name";

        [JsonPropertyName("properties")]
        public CRSProperties Properties { get; set; } = new CRSProperties();
    }

    public class CRSProperties
    {
        [JsonPropertyName("name")]
        public string Name { get; set; } = "EPSG:4326";
    }
}
