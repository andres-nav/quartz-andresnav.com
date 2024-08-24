import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({
    links: {
      "GitHub": "https://github.com/andres-nav",
      "LinkedIn": "https://linkedin.com/in/andresnav",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
 beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.DesktopOnly(Component.Search()),
    Component.DesktopOnly(Component.Links()),
    Component.DesktopOnly(Component.RecentNotes()),
  ],
  right: [
    Component.Graph({
      localGraph: {
        fontSize: 0.4,
        repelForce: 1,
        centerForce: 0.3,
        linkDistance: 100,
      },
      globalGraph: {
        fontSize: 0.4,
        repelForce: 1,
        centerForce: 0.3,
        linkDistance: 100,
      },
    }),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
    Component.MobileOnly(Component.Links()),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.DesktopOnly(Component.Links()),
    Component.DesktopOnly(Component.RecentNotes()),
  ],
  right: [],
}
