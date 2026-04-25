import { serverApi } from "./api-server";

export const booksService = {
  listBooks: (queryParams = "") => serverApi(`/books${queryParams}`),
  getBookById: (id: string) => serverApi(`/books/${id}`),
  createBook: (data: any) => serverApi("/books", { method: "POST", data }),
  updateBook: (id: string, data: any) => serverApi(`/books/${id}`, { method: "PUT", data }),
  deleteBook: (id: string) => serverApi(`/books/${id}`, { method: "DELETE" }),
};

export const ordersService = {
  listOrders: (queryParams = "") => serverApi(`/orders${queryParams}`),
  getOrderById: (id: string) => serverApi(`/orders/${id}`),
  createOrder: (data: any) => serverApi("/orders", { method: "POST", data }),
  updateOrder: (id: string, data: any) => serverApi(`/orders/${id}`, { method: "PUT", data }),
  deleteOrder: (id: string) => serverApi(`/orders/${id}`, { method: "DELETE" }),
  getMyOrders: () => serverApi("/orders/my-orders"),
};

export const galleryService = {
  listGallery: () => serverApi("/gallery"),
  uploadImage: (data: any) => serverApi("/gallery/upload", { method: "POST", data }),
  deleteImage: (id: string) => serverApi(`/gallery/${id}`, { method: "DELETE" }),
};

export const ebookService = {
  listMyEbooks: () => serverApi("/ebooks/my-access"),
  checkAccess: (bookId: string) => serverApi(`/ebooks/access/${bookId}`),
  grantAccess: (data: any) => serverApi("/ebooks/grant", { method: "POST", data }),
};

export const qrService = {
  generateQR: (data: any) => serverApi("/qr/generate", { method: "POST", data }),
  scanQR: (id: string) => serverApi(`/qr/scan/${id}`, { method: "POST" }),
  getQRById: (id: string) => serverApi(`/qr/${id}`),
};
