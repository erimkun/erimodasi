import { create } from 'zustand';

interface LoadingStore {
    isFluidPaused: boolean;
    bakingStatus: 'idle' | 'baking' | 'done';
    setFluidPaused: (val: boolean) => void;
    setBakingStatus: (status: 'idle' | 'baking' | 'done') => void;
}

export const useLoadingStore = create<LoadingStore>((set) => ({
    isFluidPaused: false,
    bakingStatus: 'idle',
    setFluidPaused: (val) => set({ isFluidPaused: val }),
    setBakingStatus: (status) => set({ bakingStatus: status }),
}));
