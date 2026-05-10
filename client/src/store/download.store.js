import { create } from 'zustand';

/**
 * Store to manage platform-wide downloads
 * and professional report generation status.
 */
const useDownloadStore = create((set, get) => ({
  isDownloading: false,
  progress: 0,
  isMinimized: false,
  isCompleted: false,
  reportName: '',

  reports: [],

  startDownload: (name) => {
    set({ 
      isDownloading: true, 
      progress: 0, 
      isMinimized: false, 
      isCompleted: false, 
      reportName: name 
    });

    const interval = setInterval(() => {
      const currentProgress = get().progress;
      if (currentProgress < 100) {
        set({ progress: currentProgress + Math.floor(Math.random() * 15) + 5 });
      } else {
        const newReport = {
          id: Math.random().toString(36).substr(2, 9),
          name: get().reportName,
          timestamp: new Date().toISOString(),
          status: 'ready',
          size: '1.2 MB'
        };
        
        set({ 
          progress: 100, 
          isDownloading: false, 
          isCompleted: true,
          reports: [newReport, ...get().reports] 
        });
        clearInterval(interval);
      }
    }, 800);
  },

  minimize: () => set({ isMinimized: true }),
  maximize: () => set({ isMinimized: false }),
  reset: () => set({ isDownloading: false, progress: 0, isCompleted: false, reportName: '' }),
}));

export default useDownloadStore;
