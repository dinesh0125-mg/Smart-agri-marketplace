import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
} from "react";

import {
  getProducts,
  createProduct,
  updateProduct as updateProductApi,
  deleteProduct as deleteProductApi,
} from "../api/productService";

const ProductsContext = createContext();

const productsReducer = (state, action) => {
  switch (action.type) {
    case "SET_PRODUCTS":
      return {
        ...state,
        products: Array.isArray(action.payload)
          ? action.payload
          : [],
      };

    case "ADD_PRODUCT":
      return {
        ...state,
        products: [
          action.payload,
          ...state.products,
        ],
      };

    case "UPDATE_PRODUCT":
      return {
        ...state,
        products: state.products.map(
          (product) =>
            product.id === action.payload.id
              ? action.payload
              : product
        ),
      };

    case "DELETE_PRODUCT":
      return {
        ...state,
        products: state.products.filter(
          (product) =>
            product.id !== action.payload
        ),
      };

    default:
      return state;
  }
};

export const ProductsProvider = ({
  children,
}) => {
  const [state, dispatch] = useReducer(
    productsReducer,
    {
      products: [],
    }
  );

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response =
        await getProducts();

      // Backend returns: { success, message, data: Page<ProductResponse> }
      // Page shape: { content: [...], totalPages, totalElements, ... }
      const pageData = response?.data;
      const products =
        Array.isArray(pageData?.content)
          ? pageData.content
          : Array.isArray(pageData)
            ? pageData
            : [];

      dispatch({
        type: "SET_PRODUCTS",
        payload: products,
      });
    } catch (error) {
      console.error(
        "Failed to load products:",
        error
      );

      dispatch({
        type: "SET_PRODUCTS",
        payload: [],
      });
    }
  };

  const addProduct = async (
    productData
  ) => {
    try {
      const response =
        await createProduct(
          productData
        );

      const product =
        response?.data?.data ||
        response?.data ||
        response;

      dispatch({
        type: "ADD_PRODUCT",
        payload: product,
      });

      return product;
    } catch (error) {
      console.error(
        "Failed to add product:",
        error
      );
      throw error;
    }
  };

  const updateProduct = async (
    id,
    data
  ) => {
    try {
      const response =
        await updateProductApi(
          id,
          data
        );

      const updatedProduct =
        response?.data?.data ||
        response?.data ||
        response;

      dispatch({
        type: "UPDATE_PRODUCT",
        payload:
          updatedProduct,
      });

      return updatedProduct;
    } catch (error) {
      console.error(
        "Failed to update product:",
        error
      );
      throw error;
    }
  };

  const deleteProduct = async (
    id
  ) => {
    try {
      await deleteProductApi(id);

      dispatch({
        type: "DELETE_PRODUCT",
        payload: id,
      });
    } catch (error) {
      console.error(
        "Failed to delete product:",
        error
      );
      throw error;
    }
  };

  const getProductById = (
    id
  ) =>
    state.products.find(
      (product) =>
        product.id === Number(id)
    );

  return (
    <ProductsContext.Provider
      value={{
        products:
          state.products,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        reloadProducts:
          loadProducts,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () =>
  useContext(ProductsContext);