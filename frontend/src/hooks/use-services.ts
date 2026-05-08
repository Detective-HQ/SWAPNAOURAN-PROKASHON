import { useApi } from "./use-api";

export function useBooksService() {
  const api = useApi();
  
  return {
    listBooks: (queryParams = "") => api.get(`/books${queryParams}`),
    getBookById: (id: string) => api.get(`/books/${id}`),
    createBook: (data: any) => api.post("/books", data),
    updateBook: (id: string, data: any) => api.put(`/books/${id}`, data),
    deleteBook: (id: string) => api.del(`/books/${id}`),
  };
}

export function useOrdersService() {
  const api = useApi();
  
  return {
    listOrders: (queryParams = "") => api.get(`/orders${queryParams}`),
    getOrderById: (id: string) => api.get(`/orders/${id}`),
    createOrder: (data: any) => api.post("/orders", data),
    updateOrder: (id: string, data: any) => api.put(`/orders/${id}`, data),
    deleteOrder: (id: string) => api.del(`/orders/${id}`),
    getMyOrders: () => api.get("/orders/my"),
  };
}

export function useGalleryService() {
  const api = useApi();
  
  return {
    listGallery: () => api.get("/gallery"),
    uploadImage: (data: any) => api.post("/gallery", data),
    deleteImage: (id: string) => api.del(`/gallery/${id}`),
  };
}

export function useEbookService() {
  const api = useApi();

  return {
    listMyEbooks: () => api.get("/ebooks"),
    readEbook: (id: string) => api.get(`/ebooks/${id}/read`),
    streamEbook: (id: string, token: string) => api.get(`/ebooks/${id}/stream?token=${token}`),
  };
}

export function useQRService() {
  const api = useApi();

  return {
    verifyQR: (id: string) => api.get(`/qr/verify/${id}`),
  };
}
