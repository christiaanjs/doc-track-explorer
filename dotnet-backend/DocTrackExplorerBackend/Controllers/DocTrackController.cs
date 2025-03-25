using Microsoft.AspNetCore.Mvc;
using DocTrackExplorer.Services;
using DocTrackExplorer.Utilities;
using DocTrackExplorer.Models;
using System.Xml;
using System.Text;

namespace DocTrackExplorer.Controllers
{
    [ApiController]
    [Route("api")]
    public class DocTrackController : ControllerBase
    {
        private readonly Cache<List<DocJSON>> _docJsonCache;
        private readonly DocTrackService _docTrackService;

        public DocTrackController(DocTrackService docTrackService)
        {
            _docTrackService = docTrackService;
            _docJsonCache = new Cache<List<DocJSON>>(
                TimeSpan.FromDays(1), 
                () => _docTrackService.FetchDocJsonDataAsync()
            );
        }

        [HttpGet("tracks")]
        public async Task<IActionResult> GetTracks()
        {
            var docJsonData = await _docJsonCache.GetDataAsync();
            var tracks = docJsonData.Select(DocTrackMapper.MapDocTrackToTrack).ToList();
            return Ok(tracks);
        }

        [HttpGet("trackData/{trackIdString}")]
        public async Task<IActionResult> GetTrackData(string trackIdString)
        {
            var docJsonData = await _docJsonCache.GetDataAsync();
            var track = docJsonData.FirstOrDefault(t => t.AssetId == trackIdString);

            if (track == null)
                return NotFound(new { error = "Track not found" });

            var geojson = DocTrackMapper.MapDocTrackToGeoJson(track);
            return Ok(geojson);
        }

        [HttpGet("downloadGpx/{trackIdString}")]
        public async Task<IActionResult> DownloadGpx(string trackIdString)
        {
            var docJsonData = await _docJsonCache.GetDataAsync();
            var track = docJsonData.FirstOrDefault(t => t.AssetId == trackIdString);

            if (track == null)
                return NotFound(new { error = "Track not found" });

            var gpx = ConvertToGpx(track);
            return File(Encoding.UTF8.GetBytes(gpx), "application/gpx+xml", $"{track.Name}.gpx");
        }

        private string ConvertToGpx(DocJSON track)
        {
            var gpxDoc = new XmlDocument();
            var gpx = gpxDoc.CreateElement("gpx");
            gpx.SetAttribute("version", "1.1");
            gpx.SetAttribute("creator", "DocTrackExplorer");

            var metadata = gpxDoc.CreateElement("metadata");
            var metadataName = gpxDoc.CreateElement("name");
            metadataName.InnerText = track.Name;
            metadata.AppendChild(metadataName);
            gpx.AppendChild(metadata);

            var trk = gpxDoc.CreateElement("trk");
            var trkName = gpxDoc.CreateElement("name");
            trkName.InnerText = track.Name;
            trk.AppendChild(trkName);

            var trkseg = gpxDoc.CreateElement("trkseg");
            foreach (var line in track.Line)
            {
                foreach (var coord in line)
                {
                    var trkpt = gpxDoc.CreateElement("trkpt");
                    trkpt.SetAttribute("lat", coord[1].ToString());
                    trkpt.SetAttribute("lon", coord[0].ToString());
                    trkseg.AppendChild(trkpt);
                }
            }
            trk.AppendChild(trkseg);
            gpx.AppendChild(trk);

            gpxDoc.AppendChild(gpx);

            using var stringWriter = new StringWriter();
            using var xmlTextWriter = XmlWriter.Create(stringWriter, new XmlWriterSettings { Indent = true });
            gpxDoc.Save(xmlTextWriter);
            return stringWriter.ToString();
        }
    }
}
