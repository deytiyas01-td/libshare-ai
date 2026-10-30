import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('libshare_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('libshare_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (resource, days = 7) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => item.id === resource.id);
      if (exists) {
        return prev; // already in cart
      }
      return [...prev, { ...resource, days_requested: days }];
    });
  };

  const removeFromCart = (resourceId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== resourceId));
  };

  const updateItemDays = (resourceId, days) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === resourceId ? { ...item, days_requested: Number(days) } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const isInCart = (resourceId) => {
    return cartItems.some((item) => item.id === resourceId);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateItemDays,
        clearCart,
        isInCart,
        totalItems: cartItems.length,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
