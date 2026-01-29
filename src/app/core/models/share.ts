export interface ShareLinkItem {
  memoryId: string;
  title: string;
}

export interface ShareLink {
  token: string;
  items: ShareLinkItem[];
  createdAt: string;
}
