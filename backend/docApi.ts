import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export interface DocJSON {
    "assetId": string;
    name: string;
    status: "OPEN" | "CLSD";
    region: string[];
    y: number;
    x: number;
    line: [number, number][][]; // Array of numeric (X, Y) coordinates
}

// Function to fetch JSON from external API
export const fetchDocJsonData = async (): Promise<DocJSON[]> => {
    const apiKey = process.env.DOC_API_KEY;
    const response = await axios.get('https://api.doc.govt.nz/v1/tracks', {
        headers: {
            'accept': 'application/json',
            'x-api-key': apiKey
        },
        params: {
            coordinates: 'wgs84'
        }
    });
    return response.data;
};
