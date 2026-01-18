import { Button } from 'primereact/button';

interface SelectionToolbarProps {
  selectedCount: number;
  totalCount: number;
  onClearSelection: () => void;
}

const SelectionToolbar = ({ selectedCount, totalCount, onClearSelection }: SelectionToolbarProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4 mb-6 shadow-soft animate-slide-down">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 animate-bounce-subtle">
            <svg className="w-5 h-5 text-primary-600 dark:text-primary-400 transition-transform duration-300 hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300 transition-all duration-300">
              {selectedCount} of {totalCount} artworks selected
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            label="Clear Selection"
            icon="pi pi-times"
            severity="secondary"
            size="small"
            onClick={onClearSelection}
            className="px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
          />
        </div>
      </div>
    </div>
  );
};

export default SelectionToolbar;
