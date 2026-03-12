import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CompareState {
  selectedListings: string[];
  addListing: (mlsNumber: string) => { success: boolean; message?: string };
  removeListing: (mlsNumber: string) => void;
  clearListings: () => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      selectedListings: [],

      addListing: (mlsNumber) => {
        const { selectedListings } = get();
        
        if (selectedListings.includes(mlsNumber)) {
           return { success: false, message: 'Listing is already in comparison.' };
        }

        if (selectedListings.length >= 4) {
          return { success: false, message: 'You can compare a maximum of 4 listings.' };
        }

        set({ selectedListings: [...selectedListings, mlsNumber] });
        return { success: true };
      },

      removeListing: (mlsNumber) => {
        set((state) => ({
          selectedListings: state.selectedListings.filter((id) => id !== mlsNumber),
        }));
      },

      clearListings: () => {
        set({ selectedListings: [] });
      },
    }),
    {
      name: 'property-compare-storage', // name of the item in the storage (must be unique)
    }
  )
);
