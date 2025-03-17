import React, { useEffect, useState } from 'react';

interface Track {
    id: string;
    trackName: string;
}

interface TrackSelectProps {
    updateSelectedTrackId: (trackId: string) => void;
}

const TrackSelect: React.FC<TrackSelectProps> = ({ updateSelectedTrackId }) => {
    // State to store the items fetched from API
    const [trackChoices, setTrackChoices] = useState<Track[]>([]);
    // State to store the selected item ID
    const [selectedTrackId, setSelectedTrackId] = useState<string | undefined>(undefined);

    // Fetch the items from the API
    useEffect(() => {
        fetch('http://localhost:4000/tracks').then(res => res.json()).then(setTrackChoices)
    }, []);

    // Handle dropdown change
    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const trackId = event.target.value;
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