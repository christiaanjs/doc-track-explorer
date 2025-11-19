import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const DOC_BASE_URL = "https://api.doc.govt.nz";

export interface DocJSON {
  assetId: string;
  name: string;
  status: "OPEN" | "CLSD";
  region: string[];
  y: number;
  x: number;
  line: [number, number][][]; // Array of numeric (X, Y) coordinates
}

export interface DocHut {
  assetId: string;
  name: string;
  status: "OPEN" | "CLSD";
  region: string;
  y: number;
  x: number;
}

export interface DocHutDetail extends DocHut {
  locationString: string;
  numberOfBunks: number;
  facilities: string[];
  hutCategory: string;
  bookingRequired: boolean;
  proximityToRoadEnd: string | null;
  bookable: boolean;
  introduction: string;
  introductionThumbnail: string;
  staticLink: string;
  place: string;
}

const fetchDocData = async <TResult, TParams>(
  endpoint: string,
  params: TParams
): Promise<TResult> => {
  const apiKey = process.env.DOC_API_KEY;
  if (!apiKey) {
    throw new Error("DOC_API_KEY is not defined in environment variables");
  }
  const response = await axios.get(`${DOC_BASE_URL}/${endpoint}`, {
    headers: {
      accept: "application/json",
      "x-api-key": apiKey,
    },
    params: params,
  });
  return response.data;
};

// Function to fetch JSON from external API
export const fetchDocTrackData = async (): Promise<DocJSON[]> => {
  return fetchDocData<DocJSON[], { coordinates: string }>("v1/tracks", {
    coordinates: "wgs84",
  });
};

export const fetchDocHutData = async (): Promise<DocHut[]> => {
  return fetchDocData<DocHut[], { coordinates: string }>("v2/huts", {
    coordinates: "wgs84",
  });
};

export const fetchDocHutDetail = async (
  hutId: string
): Promise<DocHutDetail> => {
  return fetchDocData<DocHutDetail, { coordinates: string }>(
    `v2/huts/${hutId}/detail`,
    {
      coordinates: "wgs84",
    }
  );
};