import React, { useEffect, useState } from 'react';

interface Track {
    id: number;
    trackName: string;
}

interface TrackSelectProps {
    updateSelectedTrackId: (trackId: number) => void;
}

const TrackSelect: React.FC<TrackSelectProps> = ({ updateSelectedTrackId }) => {
    // State to store the items fetched from API
    const [trackChoices, setTrackChoices] = useState<Track[]>([]);
    // State to store the selected item ID
    const [selectedTrackId, setSelectedTrackId] = useState<number | undefined>(undefined);

    // Fetch the items from the API
    useEffect(() => {
        fetch('http://localhost:4000/tracks').then(res => res.json()).then(setTrackChoices)
    }, []);

    // Handle dropdown change
    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const trackId = Number(event.target.value);
        setSelectedTrackId(trackId);
        updateSelectedTrackId(trackId);
    };

    return (
        <div>
            <select value={selectedTrackId} onChange={handleSelectChange}>
                <option value="" disabled>Select a track</option>
                {trackChoices.map((item) => (
                    <option key={item.id} value={item.id}>
                        {item.trackName}
                    </option>
                ))}
            </select>

            <div>
                Selected Track ID: {selectedTrackId}
            </div>
        </div>
    );
};

export default TrackSelect;