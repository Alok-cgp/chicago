import { useState, useEffect, useRef, useMemo } from 'react';
import { DataTable, DataTableStateEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './App.css';

import { Checkbox } from 'primereact/checkbox';
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import SelectionToolbar from './components/SelectionToolbar';

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

interface ApiResponse {
  pagination: {
    total: number;
    limit: number;
    offset: number;
    total_pages: number;
    current_page: number;
  };
  data: Artwork[];
}

const App = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lazyState, setLazyState] = useState({
    first: 0,
    rows: 12,
    page: 1,
  });

  // search state
  const [searchTerm, setSearchTerm] = useState('');

  // selection state - stores IDs for persistence
  const [selectedIdMap, setSelectedIdMap] = useState<Record<number, boolean>>({});

  // selection for current page (objects) for PrimeReact DataTable
  const selectedArtworks = artworks.filter(art => selectedIdMap[art.id]);

  // bulk selection state
  const [targetSelectionCount, setTargetSelectionCount] = useState<number>(0);
  const [pagesWithAutoSelection, setPagesWithAutoSelection] = useState<Set<number>>(new Set());
  const [customSelectInput, setCustomSelectInput] = useState<number | null>(null);

  // filtered artworks based on search
  const filteredArtworks = useMemo(() => {
    if (!searchTerm) return artworks;
    return artworks.filter(artwork =>
      artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artwork.artist_display.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artwork.place_of_origin.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [artworks, searchTerm]);
  
  const op = useRef<OverlayPanel>(null);

  const fetchArtworks = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}`);
      const data: ApiResponse = await response.json();
      
      const newArtworks = data.data.map(item => ({
        id: item.id,
        title: item.title || 'Unknown',
        place_of_origin: item.place_of_origin || 'Unknown',
        artist_display: item.artist_display || 'Unknown',
        inscriptions: item.inscriptions || 'None',
        date_start: item.date_start || 0,
        date_end: item.date_end || 0
      }));

      setArtworks(newArtworks);
      setTotalRecords(data.pagination.total);

      // Handle custom selection logic when new page data is loaded
      if (targetSelectionCount > 0 && !pagesWithAutoSelection.has(page)) {
        const rowsPerPage = data.pagination.limit;
        const currentPageStart = (page - 1) * rowsPerPage;

        if (currentPageStart < targetSelectionCount) {
          const countToSelectOnThisPage = Math.min(
            targetSelectionCount - currentPageStart,
            newArtworks.length
          );
          
          const artworksToSelect = newArtworks.slice(0, countToSelectOnThisPage);
          
          setSelectedIdMap(prev => {
            const next = { ...prev };
            artworksToSelect.forEach(art => {
              next[art.id] = true;
            });
            return next;
          });

          setPagesWithAutoSelection(prev => new Set(prev).add(page));
        }
      }
    } catch (error) {
      console.error('Error fetching artworks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtworks(lazyState.page);
  }, [lazyState.page]);

  const onPage = (event: DataTableStateEvent) => {
    setLazyState({
      first: event.first,
      rows: event.rows,
      page: (event.page ?? 0) + 1,
    });
  };

  const handleCustomSelectSubmit = () => {
    if (customSelectInput !== null && customSelectInput > 0) {
      setTargetSelectionCount(customSelectInput);
      setPagesWithAutoSelection(new Set()); // Reset to allow auto-selection on already visited pages
      
      // Immediately apply to current page
      const page = lazyState.page;
      const rowsPerPage = lazyState.rows; 
      const currentPageStart = (page - 1) * rowsPerPage;
      
      if (currentPageStart < customSelectInput) {
        const countToSelectOnThisPage = Math.min(
          customSelectInput - currentPageStart,
          artworks.length
        );
        const artworksToSelect = artworks.slice(0, countToSelectOnThisPage);
        
        setSelectedIdMap(prev => {
          const next = { ...prev };
          artworksToSelect.forEach(art => {
            next[art.id] = true;
          });
          return next;
        });

        setPagesWithAutoSelection(new Set([page]));
      }
      
      op.current?.hide();
    }
  };

  const isAllSelected = artworks.length > 0 && artworks.every(art => selectedArtworks.some(s => s.id === art.id));
  
  const onSelectAllChange = (checked: boolean) => {
    setSelectedIdMap(prev => {
      const next = { ...prev };
      artworks.forEach(art => {
        if (checked) {
          next[art.id] = true;
        } else {
          delete next[art.id];
        }
      });
      return next;
    });
  };

  const selectionHeader = (
    <div className="flex items-center gap-2">
      <Checkbox
        onChange={(e) => onSelectAllChange(e.checked ?? false)}
        checked={isAllSelected}
      />
      <Button
        type="button"
        icon="pi pi-chevron-down"
        severity="secondary"
        text
        onClick={(e) => op.current?.toggle(e)}
        aria-haspopup
        aria-controls="overlay_panel"
        className="p-0 w-8 h-8"
      />
      <OverlayPanel ref={op} id="overlay_panel" className="shadow-glass border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 p-4" style={{ width: '280px' }}>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Custom Row Selection</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Select a specific number of rows across all pages</p>
          </div>

          <div className="space-y-3">
            <InputNumber
              value={customSelectInput}
              onValueChange={(e) => setCustomSelectInput(e.value ?? null)}
              placeholder="Enter number of rows"
              min={0}
              max={totalRecords}
              className="w-full"
              inputClassName="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            <Button
              label="Apply Selection"
              icon="pi pi-check"
              onClick={handleCustomSelectSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-soft"
            />
          </div>
        </div>
      </OverlayPanel>
    </div>
  );

  const onRowSelectionChange = (e: { value: Artwork[] }) => {
    const currentItemsInSelection = e.value;
    const currentItemIdsInSelection = new Set(currentItemsInSelection.map(art => art.id));

    setSelectedIdMap(prev => {
      const next = { ...prev };

      // For all items currently displayed on the page
      artworks.forEach(art => {
        if (currentItemIdsInSelection.has(art.id)) {
          // If it's in the new selection, mark as selected
          next[art.id] = true;
        } else {
          // If it's NOT in the new selection but IS on the current page, mark as deselected
          delete next[art.id];
        }
      });

      return next;
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleClearSelection = () => {
    setSelectedIdMap({});
    setTargetSelectionCount(0);
    setPagesWithAutoSelection(new Set());
  };

  const selectedCount = Object.keys(selectedIdMap).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {/* Page Header */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-all duration-300 hover:scale-105">
            Art Institute of Chicago Collection
          </h1>
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
            Explore and manage artworks from our extensive collection
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onClear={handleClearSearch}
          />
        </div>

        {/* Selection Toolbar */}
        <SelectionToolbar
          selectedCount={selectedCount}
          totalCount={totalRecords}
          onClearSelection={handleClearSelection}
        />

        {/* Data Table Card */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-glass border border-white/20 dark:border-gray-700/50 overflow-hidden animate-slide-up transition-all duration-500 hover:shadow-glass-lg" style={{ animationDelay: '0.2s' }}>
          <div className="p-6">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                  <p className="text-gray-600 dark:text-gray-400 animate-pulse">Loading artworks...</p>
                </div>
              </div>
            )}
            <DataTable
              value={filteredArtworks}
              lazy
              paginator
              first={lazyState.first}
              rows={lazyState.rows}
              totalRecords={totalRecords}
              onPage={onPage}
              loading={loading}
              dataKey="id"
              selectionMode="multiple"
              selection={selectedArtworks}
              onSelectionChange={onRowSelectionChange}
              tableStyle={{ minWidth: '60rem' }}
              className="p-datatable-sm"
              paginatorClassName="bg-transparent border-t border-gray-200 dark:border-gray-700"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
              rowsPerPageOptions={[6, 12, 24]}
              responsiveLayout="scroll"
              scrollHeight="600px"
              scrollable
            >
              <Column selectionMode="multiple" header={selectionHeader} headerStyle={{ width: '6rem' }} frozen></Column>
              <Column field="title" header="Title" style={{ minWidth: '200px' }} sortable></Column>
              <Column field="place_of_origin" header="Place of Origin" style={{ minWidth: '150px' }} sortable></Column>
              <Column field="artist_display" header="Artist Display" style={{ minWidth: '250px' }} sortable></Column>
              <Column field="inscriptions" header="Inscriptions" style={{ minWidth: '200px' }}></Column>
              <Column field="date_start" header="Date Start" style={{ minWidth: '100px' }} sortable></Column>
              <Column field="date_end" header="Date End" style={{ minWidth: '100px' }} sortable></Column>
            </DataTable>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
