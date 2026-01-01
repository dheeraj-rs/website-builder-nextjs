import { WebContainer } from '@webcontainer/api';

export let webcontainer: Promise<WebContainer>;

// Boot WebContainer only on client-side
// Next.js: Use typeof window check instead of import.meta.env.SSR
if (typeof window !== 'undefined') {
  const WORK_DIR_NAME = 'project';

  console.log('[WebContainer] Starting boot process...');
  console.log(
    '[WebContainer] crossOriginIsolated:',
    window.crossOriginIsolated
  );
  console.log(
    '[WebContainer] SharedArrayBuffer available:',
    typeof SharedArrayBuffer !== 'undefined'
  );

  webcontainer = WebContainer.boot({ workdirName: WORK_DIR_NAME })
    .then((instance) => {
      console.log('[WebContainer] ✅ Boot successful!', instance);
      // Expose globally for debugging
      (window as any).webcontainerInstance = instance;
      return instance;
    })
    .catch((error) => {
      console.error('[WebContainer] ❌ Boot failed:', error);
      console.error('[WebContainer] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      throw error;
    });

  // Expose promise globally for debugging
  (window as any).webcontainerPromise = webcontainer;
}
