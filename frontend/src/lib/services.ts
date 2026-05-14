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
  getMyOrders: () => serverApi("/orders/my"),
};

export const galleryService = {
  listGallery: () => serverApi("/gallery"),
  uploadImage: (data: any) => serverApi("/gallery", { method: "POST", data }),
  deleteImage: (id: string) => serverApi(`/gallery/${id}`, { method: "DELETE" }),
};

export const ebookService = {
  listMyEbooks: () => serverApi("/ebooks"),
  readEbook: (id: string) => serverApi(`/ebooks/${id}/read`),
  streamEbook: (id: string, token: string) => serverApi(`/ebooks/${id}/stream?token=${token}`),
};

export const qrService = {
  verifyQR: (id: string) => serverApi(`/qr/verify/${id}`),
};

export const reviewService = {
  getBookReviews: (bookId: string, params = "") => serverApi(`/reviews/book/${bookId}${params}`),
  createReview: (data: any) => serverApi("/reviews", { method: "POST", data }),
  deleteReview: (id: string) => serverApi(`/reviews/${id}`, { method: "DELETE" }),
};

export const wishlistService = {
  getMyWishlist: () => serverApi("/wishlist"),
  checkWishlist: (bookId: string) => serverApi(`/wishlist/check/${bookId}`),
  addToWishlist: (data: any) => serverApi("/wishlist", { method: "POST", data }),
  removeFromWishlist: (bookId: string) => serverApi(`/wishlist/${bookId}`, { method: "DELETE" }),
};

export const returnService = {
  getMyReturns: () => serverApi("/returns"),
  createReturn: (data: any) => serverApi("/returns", { method: "POST", data }),
};

export const newsletterService = {
  subscribe: (email: string) => serverApi("/newsletter/subscribe", { method: "POST", data: { email } }),
  unsubscribe: (email: string) => serverApi("/newsletter/unsubscribe", { method: "POST", data: { email } }),
};
