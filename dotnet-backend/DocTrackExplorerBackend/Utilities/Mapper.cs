using DocTrackExplorer.Models;

namespace DocTrackExplorer.Utilities
{
    public static class DocTrackMapper
    {
        public static string MapStatus(string? status)
        {
            return status switch
            {
                null => "Unknown",
                "OPEN" => "Open",
                "CLSD" => "Closed",
                _ => status
            };
        }

        public static Track MapDocTrackToTrack(DocJSON track)
        {
            return new Track
            {
                Id = track.AssetId,
                TrackName = track.Name,
                Region = track.Region,
                Status = MapStatus(track.Status.ToString())
            };
        }

        public static GeoJson MapDocTrackToGeoJson(DocJSON track)
        {
            return new GeoJson
            {
                Features = new List<IGeoJsonFeature>
                {
                    new GeoJsonFeature
                    {
                        Type = "Feature",
                        Geometry = new GeoJsonGeometry
                        {
                            Coordinates = track.Line
                        },
                        Properties = new
                        {
                            track.Name,
                            track.Region,
                            Status = track.Status.ToString()
                        },
                        Id = track.AssetId
                    }
                }
            };
        }
    }

    public class GeoJsonFeature : IGeoJsonFeature
    {
        public string Type { get; set; } = "Feature";
        public GeoJsonGeometry Geometry { get; set; } = new GeoJsonGeometry();
        public object Properties { get; set; } = new { };
        public string? Id { get; set; }
    }
}
