import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { previewUrl, usePreview } from './preview';
import { PrototypeSurface } from './prototype';
import classes from './pages-workspace.module.css';

/** The inset frame showing the consumer app's page for this route. */
export function PagesWorkspace() {
  const { pageId = null } = useParams();
  const { framePage, setFrame, show } = usePreview();
  const [src] = useState(() => previewUrl(pageId));

  // Admin route changed (tab click): steer the frame without reloading it.
  useEffect(() => {
    if (pageId && framePage && framePage !== pageId) show(pageId);
  }, [pageId, framePage, show]);

  // The frame keeps its own history once mounted; src only matters on first load.
  return (
    <div className={classes.frame}>
      <PrototypeSurface onFrame={setFrame} page={pageId} src={src} />
    </div>
  );
}
