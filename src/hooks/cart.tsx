import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import formatValue from '../utils/formatValue';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
  getTotalItemsCart(): number;
  getTotalCart(): string;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const productsStorage = await AsyncStorage.getItem(
        '@GoMarketPlace:products',
      );

      if (productsStorage) {
        setProducts([...JSON.parse(productsStorage)]);
      }
    }

    loadProducts();
  }, []);

  const saveProductsStorage = useCallback(async () => {
    await AsyncStorage.setItem(
      '@GoMarketPlace:products',
      JSON.stringify(products),
    );
  }, [products]);

  const increment = useCallback(
    async id => {
      setProducts([
        ...products.map(item => {
          if (item.id === id) {
            return { ...item, quantity: item.quantity + 1 };
          }
          return item;
        }),
      ]);

      saveProductsStorage();
    },
    [products, saveProductsStorage],
  );

  const decrement = useCallback(
    async id => {
      const findProduct = products.find(item => item.id === id);

      if (findProduct && findProduct.quantity === 1) {
        const findProductIndex = products.findIndex(item => item.id === id);

        products.splice(findProductIndex, 1);

        setProducts([...products]);
      } else {
        setProducts([
          ...products.map(item => {
            if (item.id === id) {
              return { ...item, quantity: item.quantity - 1 };
            }
            return item;
          }),
        ]);
      }

      saveProductsStorage();
    },
    [products, saveProductsStorage],
  );

  const addToCart = useCallback(
    async (product: Product) => {
      // TODO ADD A NEW ITEM TO THE CART

      const findProduct = products.find(item => item.id === product.id);

      if (findProduct) {
        increment(findProduct.id);
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }

      saveProductsStorage();
    },
    [products, saveProductsStorage, increment],
  );

  const value = React.useMemo(
    () => ({
      addToCart,
      increment,
      decrement,
      products,
    }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
