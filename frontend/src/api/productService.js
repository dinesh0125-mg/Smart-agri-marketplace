import api from "./axios";

export const getProducts =
  async () => {
    const response =
      await api.get(
        "/products"
      );

    return response.data;
  };

export const getProduct =
  async (id) => {
    const response =
      await api.get(
        `/products/${id}`
      );

    return response.data;
  };

/**
 * Build a FormData with individual form fields matching @ModelAttribute ProductRequest.
 * The backend expects:
 *   @ModelAttribute ProductRequest  (flat form fields)
 *   @RequestParam("image") MultipartFile (optional)
 */
const buildMultipartPayload = (data) => {
  const stockValue = typeof data.stock === 'boolean'
    ? (data.stock ? (data.stockQty ?? 1) : 0)
    : (data.stock ?? 0);

  const formData = new FormData();

  // Append each field individually — @ModelAttribute binds flat form fields, NOT a JSON blob
  formData.append("productName",      data.productName ?? data.name ?? '');
  formData.append("description",      data.description ?? '');
  formData.append("price",            data.price);
  formData.append("stock",            stockValue);
  formData.append("unit",             data.unit ?? 'kg');
  if (data.categoryId != null) {
    formData.append("categoryId",     data.categoryId);
  }
  formData.append("organicCertified", data.organicCertified ?? data.organic ?? false);
  formData.append("featured",         data.featured ?? false);
  formData.append("discount",         data.discount ?? 0);

  // Attach image file OR external URL — backend handles whichever is present
  if (data.image instanceof File) {
    formData.append("image", data.image);
  } else if (data.imageUrl) {
    formData.append("imageUrl", data.imageUrl);
  }

  return formData;
};

export const createProduct =
  async (productData) => {
    const formData = buildMultipartPayload(productData);

    const response =
      await api.post(
        "/farmer/products",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

    return response.data;
  };

export const updateProduct =
  async (
    id,
    productData
  ) => {
    const formData = buildMultipartPayload(productData);

    const response =
      await api.put(
        `/farmer/products/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

    return response.data;
  };

export const deleteProduct =
  async (id) => {
    const response =
      await api.delete(
        `/farmer/products/${id}`
      );

    return response.data;
  };