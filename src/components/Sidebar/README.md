# Sidebar

Use `tablist.tsx`to edit the tabs contained within the sidebar:

## Add a new tab

You can add a new tab to the sidebar in `tablist.tsx`. To add a tab, make a new `iconInfo` object with keys:

- `name` (string): The name that you want your tab to be called in the sidebar
- `pathname`(string): The router path to the tab. You can find and modify this in `src\App.tsx`
- `icon` (svg icon): The icon of that the tab will use

## Organize the Tab Group

In `tablist.tsx`, there is a list of `tabGroup` objects. Add your new tab in the `tabs` key in the corresponding group. The tabs in each group are rendered in the order of the list.

# Files

There are four files in the Sidebar directory.

1. `Sidebar.tsx`
2. `SidebarIcon.tsx`
3. `RenderTabs.tsx`
4. `Tablist.tsx`

## Sidebar.tsx

This file contains the main structure for how the sidebar is rendered. \
\
 It calls `renderTabs` from `renderTabs.tsx` for each of the groups found in `Tablist.tsx`

## SidebarIcon.tsx

This file contains the icons for each individual tabs, in both collapsed and expanded forms

## RenderTabs.tsx

This file contains a function to render a `tabGroup` from `Tablist.tsx`

## Tablist.tsx

This file contains a list of all individual tabs on the sidebar, as well as the `tabGroup`that they are organized in.

### Routing

The Tablist contains the routing between the sidebar and other pages. These are the routes currently (Feb. 6) set up:

- View Map: `"/"`
- Messaging: `"/messaging"`
- Application Settings: `"/settings"`

These are currently routed to `"/TODO"`:

- Manage Nodes
- Manage Waypoints
- Radio Configuration
- Module Configuration
- Channel Configuration
- Export Data
