export interface KBItem {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export interface KBListResponse {
  items: KBItem[];
}
