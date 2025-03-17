import React, { useEffect, useState } from 'react';
import { DataTable, DataTableFilterMeta, DataTableSelectionSingleChangeEvent, } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import { FilterMatchMode, FilterService } from 'primereact/api';
// import 'primeicons/primeicons.css';

interface Track {
    id: string;
    trackName: string;
    region: string[];
    status: string;
}

interface TrackSelectProps {
    updateSelectedTrackId: (trackId: string) => void;
}

const TrackSelect: React.FC<TrackSelectProps> = ({ updateSelectedTrackId }) => {
    // State to store the items fetched from API
    const [trackChoices, setTrackChoices] = useState<Track[]>([]);
    // State to store the selected item ID
    const [selectedTrack, setSelectedTrack] = useState<Track | undefined>(undefined);
    // State to store the unique regions for the dropdown filter
    const [regions, setRegions] = useState<string[]>([]);
    // State to store the filters
    const [filters, setFilters] = useState<DataTableFilterMeta>({
        region: { value: null, matchMode: FilterMatchMode.CUSTOM },
        trackName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });

    // Fetch the items from the API
    useEffect(() => {
        fetch('http://localhost:4000/tracks').then(res => res.json()).then((data: Track[]) => {
            setTrackChoices(data);
            const regions = new Set(data.flatMap((track: Track) => track.region));
            setRegions(Array.from(regions));
        });
    }, []);

    // Register the custom filter function
    FilterService.register('custom_region', (value, filter) => {
        if (!filter) return true;
        return value.some((region: string) => region.includes(filter));
    });

    const handleRowSelect = (e: DataTableSelectionSingleChangeEvent<Track[]>) => {
        const trackId = e.value.id;
        updateSelectedTrackId(trackId);
    };

    const handleFilterChange = (e: any) => {
        setFilters(e.filters);
    };

    const regionFilterTemplate = (options: any) => {
        return (
            <Dropdown
                value={options.value}
                options={regions}
                onChange={(e) => options.filterApplyCallback(e.value)}
                placeholder="Select a Region"
                showClear
            />
        );
    };

    const regionBodyTemplate = (rowData: Track) => {
        return rowData.region.join(', ');
    };

    const trackNameFilterTemplate = (options: any) => {
        return (
            <input
                type="text"
                value={options.value}
                onChange={(e) => options.filterApplyCallback(e.target.value)}
                placeholder="Search by Track Name"
                className="p-inputtext p-component"
            />
        );
    };

    return (
        <div>
            <DataTable
                value={trackChoices}
                selectionMode="single"
                selection={selectedTrack}
                onSelectionChange={handleRowSelect}
                scrollable
                scrollHeight="400px"
                filters={filters}
                onFilter={handleFilterChange}
                filterDisplay="row"
                globalFilterFields={['region', 'trackName']}
            >
                <Column field="trackName" header="Track Name" filter filterElement={trackNameFilterTemplate} />
                <Column field="region" header="Region" filter filterElement={regionFilterTemplate} body={regionBodyTemplate} />
                <Column field="status" header="Status" />
            </DataTable>
        </div>
    );
};

export default TrackSelect;