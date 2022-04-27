import { css } from '@emotion/css';
import React from 'react';

import { useStyles2, WithContextMenu, MenuGroup, MenuItem, Icon } from '@grafana/ui';

import { SpanLinks } from '../types/links';

interface SpanLinksProps {
  links: SpanLinks;
}

const renderMenuItems = (links: SpanLinks, styles: ReturnType<typeof getStyles>) => {
  return (
    <>
      {!!links.logLinks?.length ? (
        <MenuGroup label="Logs">
          {links.logLinks.map((link, i) => (
            <MenuItem
              key={i}
              label="Logs for this span"
              onClick={link.onClick ? link.onClick : undefined}
              url={link.href}
              className={styles.menuItem}
            />
          ))}
        </MenuGroup>
      ) : null}
      {!!links.metricLinks?.length ? (
        <MenuGroup label="Metrics">
          {links.metricLinks.map((link, i) => (
            <MenuItem
              key={i}
              label="Metrics for this span"
              onClick={link.onClick ? link.onClick : undefined}
              url={link.href}
              className={styles.menuItem}
            />
          ))}
        </MenuGroup>
      ) : null}
      {!!links.traceLinks?.length ? (
        <MenuGroup label="Traces">
          {links.traceLinks.map((link, i) => (
            <MenuItem
              key={i}
              label={link.title ?? 'View linked span'}
              onClick={link.onClick ? link.onClick : undefined}
              url={link.href}
              className={styles.menuItem}
            />
          ))}
        </MenuGroup>
      ) : null}
    </>
  );
};

export const SpanLinksMenu = ({ links }: SpanLinksProps) => {
  const styles = useStyles2(getStyles);

  return (
    <WithContextMenu renderMenuItems={() => renderMenuItems(links, styles)}>
      {({ openMenu }) => (
        <button onClick={openMenu} className={styles.button}>
          <Icon name="link" className={styles.button} />
        </button>
      )}
    </WithContextMenu>
  );
};

const getStyles = () => {
  return {
    button: css`
      background: transparent;
      border: none;
      padding: 0;
      margin: 0 3px 0 0;
    `,
    menuItem: css`
      max-width: 60ch;
      overflow: hidden;
    `,
  };
};
