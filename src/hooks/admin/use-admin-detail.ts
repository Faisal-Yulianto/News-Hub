import { useQuery } from "@tanstack/react-query";

export interface AdminNewsDetailAuthor {
  id: string;           
  name: string;
  avatar: string | null;
}

export interface AdminNewsDetailCategory {
  id: string;           
  name: string;
  slug: string;         
  icon: string | null;  
}

export interface AdminNewsDetailContentImage {
  id: string;            
  url: string;
  caption: string | null;  
  imageHash: string | null;  
  createdAt: string;     
}

export interface AdminNewsDetail {
  id: string;
  title: string;
  slug: string;              
  excerpt: string | null;    
  content: string;
  thumbnailUrl: string | null;
  thumbnailHash: string | null;  
  status: string;
  isBreaking: boolean;
  source: string | null;      
  metaTitle: string | null;   
  metaDescription: string | null; 
  rejectionReason: string | null;
  reviewedAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  views: number;              
  likeCount: number;         
  commentCount: number;      
  author: AdminNewsDetailAuthor;
  category: AdminNewsDetailCategory;
  contentImages: AdminNewsDetailContentImage[];
}

export function useAdminNewsDetail(id: string) {
  return useQuery<AdminNewsDetail>({
    queryKey: ["admin-news-detail", id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/news/${id}`);
      if (!response.ok) throw new Error("Failed to fetch news detail");
      const data = await response.json();
      // Assuming API returns { data: AdminNewsDetail } structure
      // Sesuaikan dengan struktur response dari succesResponse() Anda
      return data.data || data;
    },
    enabled: !!id,
  });
}