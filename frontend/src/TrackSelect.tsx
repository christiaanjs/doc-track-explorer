import React, { useEffect, useState } from 'react';
import { DataTable, DataTableFilterMeta, DataTableSelectionSingleChangeEvent, } from 'primereact/datatable';
import { Column, ColumnFilterElementTemplateOptions } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { FilterMatchMode, FilterService } from 'primereact/api';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';

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
    const [trackChoices, setTrackChoices] = useState<Track[]>([]);
    const [selectedTrack, setSelectedTrack] = useState<Track | undefined>(undefined);
    const [regions, setRegions] = useState<string[]>([]);
    const [filters, setFilters] = useState<DataTableFilterMeta>({
        region: { value: null, matchMode: FilterMatchMode.CUSTOM },
        trackName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });

    // Fetch the items from the API
    useEffect(() => {
        const backendHost = import.meta.env.VITE_BACKEND_HOST;
        fetch(`${backendHost}/tracks`).then(res => res.json()).then((data: Track[]) => {
            setTrackChoices(data);
            const regions = new Set(data.flatMap((track: Track) => track.region));
            setRegions(Array.from(regions));
        });
    }, []);

    // Register the custom filter function
    // Seems to be the only way to get custom filter to work
    FilterService.register('custom_region', (value, filter) => {
        if (!filter) return true;
        return value.some((region: string) => region.includes(filter));
    });

    const handleRowSelect = (e: DataTableSelectionSingleChangeEvent<Track[]>) => {
        const track = e.value;
        const trackId = track.id;
        updateSelectedTrackId(trackId);
        setSelectedTrack(track);

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

    const trackNameFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if ((e.key === 'Enter') && (e.currentTarget.value !== "")) {
                options.filterApplyCallback(e.currentTarget.value);
            }
        };

        return (
            <InputText
                onKeyDown={handleKeyDown}
                placeholder="(press enter to search)"
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
                <Column field="trackName" header="Track Name" filter filterElement={trackNameFilterTemplate} showFilterMenu={false} sortable />
                <Column field="region" header="Region" filter filterElement={regionFilterTemplate} body={regionBodyTemplate} showFilterMenu={false} sortable />
            </DataTable>
        </div>
    );
};

export default TrackSelect;