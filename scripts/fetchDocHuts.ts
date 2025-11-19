import dotenv from "dotenv";
import {
  fetchDocHutData,
  fetchDocHutDetail,
  DocHutDetail,
  DocHut,
} from "../backend/docApi";
import fs from "fs";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../backend/.env") });

const csvSafe = (value: string): string => `"${value.replace(/"/g, '""')}"`;

const propertyToString = (value: any): string => {
  if (value === null || value === undefined) {
    return "";
  }
  if (Array.isArray(value)) {
    return value.join("; ");
  }
  return String(value);
};

const hutToRow = (hut: DocHut | DocHutDetail, header: string[]): string[] => {
  return header.map((key) => csvSafe(propertyToString((hut as any)[key])));
};

async function main() {
  const jsonOutPath = path.join(process.cwd(), "doc_huts.json");
  let details: (DocHut | DocHutDetail)[];

  if (fs.existsSync(jsonOutPath)) {
    try {
      const jsonData = fs.readFileSync(jsonOutPath, "utf8");
      details = JSON.parse(jsonData);
      console.log(`Loaded ${details.length} huts from ${jsonOutPath}`);
    } catch (err) {
      console.error("Failed to load huts from JSON file:", err);
      return;
    }
  } else {
    const huts = await fetchDocHutData();
    details = [];

    for (let i = 0; i < huts.length; i++) {
      const hut = huts[i];
      try {
        const detail = await fetchDocHutDetail(hut.assetId);
        details.push(detail);
      } catch (err) {
        // TODO: Handle individual hut fetch errors more gracefully
        // e.g. 404, { data: { message: 'Hut not found' } }
        console.error(`Failed to fetch detail for hut ${hut.assetId}:`, err);
        details.push(hut);
      }
      if ((i + 1) % 5 === 0 || i === huts.length - 1) {
        console.log(`Fetched details for ${i + 1} of ${huts.length} huts`);
      }
    }
    fs.writeFileSync(jsonOutPath, JSON.stringify(details, null, 2), "utf8");
    console.log(`Wrote ${details.length} hut details to ${jsonOutPath}`);
  }

  // Prepare CSV header
  const header = [
    "assetId",
    "name",
    "locationString",
    "numberOfBunks",
    "facilities",
    "hutCategory",
    "bookingRequired",
    "proximityToRoadEnd",
    "bookable",
    "introduction",
    // "introductionThumbnail",
    "staticLink",
    "region",
    "place",
    "status",
    "x",
    "y",
  ];

  // Prepare CSV rows
  const rows = details.map((hut) => hutToRow(hut, header));

  const csvContent =
    header.join(",") + "\n" + rows.map((row) => row.join(",")).join("\n");

  const outPath = path.join(process.cwd(), "doc_huts.csv");
  try {
    fs.writeFileSync(outPath, csvContent, "utf8");
    console.log(`Wrote ${details.length} hut details to ${outPath}`);
  } catch (err) {
    console.error("Failed to write output CSV", err);
  }
}

main().catch((err) => {
  console.error("Error running hut fetch script:", err);
});
