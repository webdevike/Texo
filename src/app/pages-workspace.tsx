import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BaseText } from '@texo/ui';

import { previewUrl, usePreview } from './preview';
import { PrototypePanel, PrototypeSurface, usePrototype } from './prototype';
import classes from './pages-workspace.module.css';

/** The inset frame showing the consumer app's page, with the requests column beside it. */
export function PagesWorkspace() {
  const { pageId = null } = useParams();
  const { pages, framePage, setFrame, show } = usePreview();
  const { panelOpen } = usePrototype();
  const [src] = useState(() => previewUrl(pages.find((page) => page.id === pageId)));

  // Admin route changed (sidebar click): steer the frame without reloading it.
  useEffect(() => {
    if (pageId && framePage && framePage !== pageId) show(pageId);
  }, [pageId, framePage, show]);

  return (
    <div className={classes.layout} data-panel={panelOpen || undefined}>
      <div className={classes.frame}>
        <PrototypeSurface onFrame={setFrame} page={pageId} src={src} />
      </div>
      {panelOpen && (
        <aside aria-label="Requests" className={classes.panel}>
          <div className={classes.panelHeader}>
            <BaseText fw={600} size="sm">
              Requests
            </BaseText>
            <BaseText c="dimmed" size="xs">
              Described interactions, not built ones
            </BaseText>
          </div>
          <div className={classes.panelBody}>
            <PrototypePanel />
          </div>
        </aside>
      )}
    </div>
  );
}
