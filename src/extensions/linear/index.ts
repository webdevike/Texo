// Linear-lite: issues list, board, projects. Routes, nav and the global keybindings the spec names.
import { IconLayoutKanban, IconList, IconRocket } from '@tabler/icons-react';
import { createElement } from 'react';

import { defineExtension } from '../../../experiments/contracts-spike/contracts/extension';
import { BoardPage, IssuesPage, ProjectPage, ProjectsPage } from './pages';

const nav = (label: string, path: string, icon: typeof IconList, order: number) => [
  { section: 'Linear', label, path, icon: createElement(icon, { size: 16 }), order },
  { section: 'Backend/Settings', label: `Linear: ${label}`, path, icon: createElement(icon, { size: 16 }), order: 100 + order },
];

export default defineExtension({
  id: 'linear',
  name: 'Linear',
  routes: [
    { path: '/issues', element: IssuesPage, title: 'Issues' },
    { path: '/issues/:id', element: IssuesPage, title: 'Issue' },
    { path: '/board', element: BoardPage, title: 'Board' },
    { path: '/projects', element: ProjectsPage, title: 'Projects' },
    { path: '/projects/:id', element: ProjectPage, title: 'Project' },
  ],
  nav: [...nav('Issues', '/issues', IconList, 1), ...nav('Board', '/board', IconLayoutKanban, 2), ...nav('Projects', '/projects', IconRocket, 3)],
  commands: [
    { id: 'linear.new', label: 'New issue', keys: 'c', group: 'Linear', run: ({ navigate, pathname }) => navigate(`${pathname.startsWith('/board') ? '/board' : '/issues'}?new=1`) },
    { id: 'linear.issues', label: 'Go to issues', keys: 'g i', group: 'Linear', run: ({ navigate }) => navigate('/issues') },
    { id: 'linear.board', label: 'Go to board', keys: 'g b', group: 'Linear', run: ({ navigate }) => navigate('/board') },
    { id: 'linear.projects', label: 'Go to projects', keys: 'g p', group: 'Linear', run: ({ navigate }) => navigate('/projects') },
    { id: 'linear.close', label: 'Close issue panel', keys: 'escape', group: 'Linear', when: ({ pathname }) => /^\/issues\/./.test(pathname), run: ({ navigate }) => navigate('/issues') },
    { id: 'linear.priority.help', label: 'Set priority on selected: 1 to 5', keys: ['1', '2', '3', '4', '5'], group: 'Linear', when: () => false, run: () => undefined },
    { id: 'linear.status.help', label: 'Set status on selected: s then b/t/i/d/c', keys: ['s b', 's t', 's i', 's d', 's c'], group: 'Linear', when: () => false, run: () => undefined },
    { id: 'linear.assign.help', label: 'Assign selected', keys: 'a', group: 'Linear', when: () => false, run: () => undefined },
    { id: 'linear.select.help', label: 'Move selection', keys: ['j', 'k'], group: 'Linear', when: () => false, run: () => undefined },
    { id: 'linear.open.help', label: 'Open selected issue', keys: 'enter', group: 'Linear', when: () => false, run: () => undefined },
    { id: 'linear.search.help', label: 'Focus search', keys: '/', group: 'Linear', when: () => false, run: () => undefined },
  ],
});
