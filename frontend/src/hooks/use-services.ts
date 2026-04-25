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
    getMyOrders: () => api.get("/orders/my-orders"),
  };
}

export function useGalleryService() {
  const api = useApi();
  
  return {
    listGallery: () => api.get("/gallery"),
    uploadImage: (data: any) => api.post("/gallery/upload", data),
    deleteImage: (id: string) => api.del(`/gallery/${id}`),
  };
}

export function useEbookService() {
  const api = useApi();

  return {
    listMyEbooks: () => api.get("/ebooks/my-access"),
    checkAccess: (bookId: string) => api.get(`/ebooks/access/${bookId}`),
    grantAccess: (data: any) => api.post("/ebooks/grant", data),
  };
}

export function useQRService() {
  const api = useApi();

  return {
    generateQR: (data: any) => api.post("/qr/generate", data),
    scanQR: (id: string) => api.post(`/qr/scan/${id}`, {}),
    getQRById: (id: string) => api.get(`/qr/${id}`),
  };
}
