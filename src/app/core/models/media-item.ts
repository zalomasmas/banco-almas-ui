export type MediaType = 'image' | 'video' | 'audio' | 'file';

export interface MediaItem {
  id: string;
  type: MediaType;
  url: string;
  name?: string;
}
