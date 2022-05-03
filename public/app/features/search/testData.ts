import { DashboardSearchItemType, DashboardSection, DashboardSectionItem } from './types';

function makeSection(sectionPartial: Partial<DashboardSection>): DashboardSection {
  return {
    title: 'Default title',
    score: -99,
    expanded: true,
    type: DashboardSearchItemType.DashFolder,
    items: [],
    url: '/default-url',
    ...sectionPartial,
  };
}

const makeSectionItem = (itemPartial: Partial<DashboardSectionItem>): DashboardSectionItem => {
  return {
    uid: 'default-uid',
    title: 'Default dashboard title',
    type: DashboardSearchItemType.DashDB,
    isStarred: false,
    tags: [],
    uri: 'db/default-slug',
    url: '/d/default-uid/default-slug',
    ...itemPartial,
  };
};

export const generalFolder: DashboardSection = {
  title: 'General',
  items: [
    {
      uid: 'lBdLINUWk',
      title: 'Test 1',
      uri: 'db/test1',
      url: '/d/lBdLINUWk/test1',
      type: DashboardSearchItemType.DashDB,
      tags: [],
      isStarred: false,
      checked: true,
    },
    {
      uid: '8DY63kQZk',
      title: 'Test 2',
      uri: 'db/test2',
      url: '/d/8DY63kQZk/test2',
      type: DashboardSearchItemType.DashDB,
      tags: [],
      isStarred: false,
      checked: true,
    },
  ],
  icon: 'folder-open',
  score: 1,
  expanded: true,
  checked: false,
  url: '',
  type: DashboardSearchItemType.DashFolder,
};

export const searchResults: DashboardSection[] = [
  {
    uid: 'JB_zdOUWk',
    title: 'gdev dashboards',
    expanded: false,
    items: [],
    url: '/dashboards/f/JB_zdOUWk/gdev-dashboards',
    icon: 'folder',
    score: 0,
    checked: true,
    type: DashboardSearchItemType.DashFolder,
  },
  generalFolder,
];

// Search results with more info
export const sections: DashboardSection[] = [
  makeSection({
    title: 'Starred',
    score: -2,
    expanded: true,
    items: [
      makeSectionItem({
        uid: 'lBdLINUWk',
        title: 'Prom dash',
        type: DashboardSearchItemType.DashDB,
      }),
    ],
  }),

  makeSection({
    title: 'Recent',
    icon: 'clock-o',
    score: -1,
    expanded: false,
    items: [
      makeSectionItem({
        uid: 'OzAIf_rWz',
        title: 'New dashboard Copy 3',

        type: DashboardSearchItemType.DashDB,
        isStarred: false,
      }),
      makeSectionItem({
        uid: '8DY63kQZk',
        title: 'Stocks',
        type: DashboardSearchItemType.DashDB,
        isStarred: false,
      }),
      makeSectionItem({
        uid: '7MeksYbmk',
        title: 'Alerting with TestData',
        type: DashboardSearchItemType.DashDB,
        isStarred: false,
        folderUid: '2',
      }),
      makeSectionItem({
        uid: 'j9SHflrWk',
        title: 'New dashboard Copy 4',
        type: DashboardSearchItemType.DashDB,
        isStarred: false,
        folderUid: '2',
      }),
    ],
  }),

  makeSection({
    uid: 'JB_zdOUWk',
    title: 'gdev dashboards',
    expanded: true,
    url: '/dashboards/f/JB_zdOUWk/gdev-dashboards',
    icon: 'folder',
    score: 2,
    items: [],
  }),

  makeSection({
    uid: 'search-test-data',
    title: 'Search test data folder',
    expanded: false,
    items: [],
    url: '/dashboards/f/search-test-data/search-test-data-folder',
    icon: 'folder',
    score: 3,
  }),

  makeSection({
    uid: 'iN5TFj9Zk',
    title: 'Test',
    expanded: false,
    items: [],
    url: '/dashboards/f/iN5TFj9Zk/test',
    icon: 'folder',
    score: 4,
  }),

  makeSection({
    title: 'General',
    icon: 'folder-open',
    score: 5,
    expanded: true,
    items: [
      makeSectionItem({
        uid: 'LCFWfl9Zz',
        title: 'New dashboard Copy',
        uri: 'db/new-dashboard-copy',
        url: '/d/LCFWfl9Zz/new-dashboard-copy',
        type: DashboardSearchItemType.DashDB,
        isStarred: false,
      }),
      makeSectionItem({
        uid: 'OzAIf_rWz',
        title: 'New dashboard Copy 3',
        type: DashboardSearchItemType.DashDB,
        isStarred: false,
      }),
      makeSectionItem({
        uid: 'lBdLINUWk',
        title: 'Prom dash',
        type: DashboardSearchItemType.DashDB,
        isStarred: true,
      }),
    ],
  }),
];

export const checkedGeneralFolder: DashboardSection[] = [
  makeSection({
    uid: 'other-folder-dash',
    title: 'Test',
    expanded: false,
    type: DashboardSearchItemType.DashFolder,
    items: [
      makeSectionItem({
        uid: 'other-folder-dash-abc',
        title: 'New dashboard Copy 3',
        type: DashboardSearchItemType.DashDB,
        isStarred: false,
      }),
      makeSectionItem({
        uid: 'other-folder-dash-def',
        title: 'Stocks',
        type: DashboardSearchItemType.DashDB,
        isStarred: false,
      }),
    ],
    url: '/dashboards/f/iN5TFj9Zk/test',
    icon: 'folder',
    score: 4,
  }),

  makeSection({
    title: 'General',
    uid: 'other-folder-abc',
    score: 5,
    expanded: true,
    checked: true,
    type: DashboardSearchItemType.DashFolder,
    items: [
      makeSectionItem({
        uid: 'general-abc',
        title: 'New dashboard Copy',
        uri: 'db/new-dashboard-copy',
        url: '/d/LCFWfl9Zz/new-dashboard-copy',
        type: DashboardSearchItemType.DashDB,
        isStarred: false,
        checked: true,
      }),
      makeSectionItem({
        uid: 'general-def',
        title: 'New dashboard Copy 3',
        type: DashboardSearchItemType.DashDB,
        isStarred: false,
        checked: true,
      }),
      makeSectionItem({
        uid: 'general-ghi',
        title: 'Prom dash',
        type: DashboardSearchItemType.DashDB,
        isStarred: true,
        checked: true,
      }),
    ],
  }),
];

export const checkedOtherFolder: DashboardSection[] = [
  makeSection({
    uid: 'other-folder-abc',
    title: 'Test',
    expanded: false,
    checked: true,
    type: DashboardSearchItemType.DashFolder,
    items: [
      makeSectionItem({
        uid: 'other-folder-dash-abc',
        title: 'New dashboard Copy 3',
        type: DashboardSearchItemType.DashDB,
        isStarred: false,
        checked: true,
      }),
      makeSectionItem({
        uid: 'other-folder-dash-def',
        title: 'Stocks',
        type: DashboardSearchItemType.DashDB,
        isStarred: false,
        checked: true,
      }),
    ],
    url: '/dashboards/f/iN5TFj9Zk/test',
    icon: 'folder',
    score: 4,
  }),

  makeSection({
    title: 'General',
    icon: 'folder-open',
    score: 5,
    expanded: true,
    type: DashboardSearchItemType.DashFolder,
    items: [
      makeSectionItem({
        uid: 'general-abc',
        title: 'New dashboard Copy',
        uri: 'db/new-dashboard-copy',
        url: '/d/LCFWfl9Zz/new-dashboard-copy',
        type: DashboardSearchItemType.DashDB,
        isStarred: false,
      }),
      makeSectionItem({
        uid: 'general-def',
        title: 'New dashboard Copy 3',
        type: DashboardSearchItemType.DashDB,
        isStarred: false,
      }),
      makeSectionItem({
        uid: 'general-ghi',
        title: 'Prom dash',
        type: DashboardSearchItemType.DashDB,
        isStarred: true,
      }),
    ],
  }),
];

export const folderViewAllChecked: DashboardSection[] = [
  makeSection({
    checked: true,
    selected: true,
    title: '',
    items: [
      makeSectionItem({
        uid: 'other-folder-dash-abc',
        title: 'New dashboard Copy 3',
        type: DashboardSearchItemType.DashDB,
        isStarred: false,
        checked: true,
      }),
      makeSectionItem({
        uid: 'other-folder-dash-def',
        title: 'Stocks',
        type: DashboardSearchItemType.DashDB,
        isStarred: false,
        checked: true,
      }),
    ],
  }),
];
