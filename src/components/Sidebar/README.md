# Sidebar

[ INSERT PICTURE HERE ]

\
\
\
\
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
2. `Tablist.tsx`
3. `SidebarIcon.tsx`
4. `RenderTabs.tsx`

## Sidebar.tsx

This file contains the main structure for how the sidebar is rendered. \
\
 It calls `renderTabs` from `renderTabs.tsx` for each of the groups found in `Tablist.tsx`

## Tablist.tsx

This file contains a list of all individual tabs on the sidebar, as well as the `tabGroup`that they are organized in.

## SidebarIcon.tsx

This file contains the icons for each individual tabs, in both collapsed and expanded forms

## RenderTabs.tsx

This file contains a function to render a `tabGroup` from `Tablist.tsx`

# Me notes/ TODOs:

In order of priority (as of 2/4, 7:11 pm):

1.  Sidebar should be overlaid instead of on the side. On expansion, it should not scrunch the map over. This should(?) be edited in `App.tsx`
2.  Related: Settings and Messaging each overwrite the sidebar size. I'm guessing it's either because their sizes are also defined to fit the width, and that Sidebar takes a lower priority (Sidebar icons get made smaller). Should be fixed either by changing Messaging and Settings (and future files); or by changing Sidebar. I'm leaning towards the former.
3.  Propose new buttons: <ChevronDoubleLeftIcon\> and <ChevronDoubleRightIcon\> for collapse and expand sidebar respectively. The current icon looks a lot like logout to me.
4.  Clean up and leave comments/documentation on files.

- [ ] `Sidebar.tsx`
- [ ] `SidebarIcon.tsx`
- [x] `TabList.tsx`
- [ ] `RenderTabs.tsx`

5. Remove the #messaging and #settings from main menu, and clean up all references to them.
