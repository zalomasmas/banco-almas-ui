import { MediaItem } from './media-item';

export interface Memory {
  id: string;
  title: string;
  text: string;
  nodeId: string;
  date: string;
  isPublic: boolean;
  attachments: MediaItem[];
  createdAt: string;
}
